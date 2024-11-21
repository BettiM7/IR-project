import os
import time
import random
import requests
from bs4 import BeautifulSoup
import json
import re

from scrape_links import scrape_links


def scrape_book_details(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            title = None
            subtitle = None

            h1 = soup.find('h1', class_='work-title')
            if h1:
                title = h1.get_text(strip=True)
            h2 = soup.find('h2', class_='work-subtitle')
            if h2:
                subtitle = h2.get_text(strip=True)

            edition_byline = soup.find('h2', class_='edition-byline')

            if edition_byline:
                author_links = edition_byline.find_all('a', itemprop='author')
                authors = [link.get_text(strip=True) for link in author_links]
            else:
                authors = []

            read_more_content = soup.find('div', class_='read-more__content')

            if read_more_content:
                paragraphs = read_more_content.find_all('p')
                description = ' '.join(p.get_text(strip=True) for p in paragraphs)
            else:
                description = ""

            publish_date = None
            publisher = None
            language = None

            publish_date_div = soup.find('span', itemprop='datePublished')
            if publish_date_div:
                publish_date = publish_date_div.get_text(strip=True)

            publisher_a = soup.find('a', itemprop='publisher')
            if publisher_a:
                publisher = publisher_a.get_text(strip=True)

            language_div = soup.find('span', itemprop='inLanguage')
            if language_div:
                language = language_div.get_text(strip=True)

            isbn_dds = soup.find_all('dd', itemprop='isbn')

            isbn10 = None
            isbn13 = None

            for dd in isbn_dds:
                isbn_value = dd.get_text(strip=True)
                if len(isbn_value) == 10:
                    isbn10 = isbn_value
                elif len(isbn_value) == 13:
                    isbn13 = isbn_value

            clamp_span = soup.find('span', class_='clamp')

            genres = [a.get_text(strip=True) for a in clamp_span.find_all('a')] if clamp_span else []

            img = soup.find('img', itemprop='image')
            img_src = img['src'] if img else None

            book_details = {
                "title": title,
                "subtitle": subtitle,
                "publish_date": publish_date,
                "authors": authors,
                "genres": genres,
                "image": img_src,
                "description": description,
                "publisher": publisher,
                "language": language,
                "isbn10": isbn10,
                "isbn13": isbn13,
            }

            for key, value in book_details.items():
                if isinstance(value, str):
                    book_details[key] = value.encode("utf-8", "replace").decode("utf-8")

            return json.dumps(book_details, ensure_ascii=False, indent=4)
        else:
            print(f"Failed to fetch {url}, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return None


if __name__ == "__main__":
    # Step 1: Scrape all links
    start_page = 1
    end_page = 100
    urls = ["https://openlibrary.org/search?subject=Literature"] + [
        f"https://openlibrary.org/search?subject=Literature&page={x}" for x in range(start_page + 1, end_page + 1)
    ]
    all_links = set()

    base_url = urls[0]
    domain = base_url.split("//")[1].split("/")[0].split(".")[0]
    subject = base_url.split("subject=")[1].split("&")[0]
    filename_prefix = f"{domain}_{subject}_{start_page}_{end_page}"

    links_filename = f"{filename_prefix}.txt"
    if os.path.exists(links_filename):
        user_choice = input(f"{links_filename} already exists. Do you want to continue? (y/n): ").strip().lower()
        if user_choice != 'y':
            print("Exiting program.")
            exit()

    for url in urls:
        links = {f"https://openlibrary.org/{link}" for link in scrape_links(url, 'h3', 'booktitle')}
        all_links.update(links)
        print(f"Links from {url}: scraped")
        time.sleep(1)

    # Step 2: Save links to a file
    with open(links_filename, "w") as file:
        for link in sorted(all_links):
            file.write(link + "\n")
    print(f"All scraped links saved to {links_filename}")

    # Step 3: Scrape details for each link and save to JSON
    book_data = []
    total_links = len(all_links)
    for i, link in enumerate(all_links, start=1):
        book_details = scrape_book_details(link)
        if book_details:
            book_data.append(book_details)
        else:
            print(f"Failed to scrape {link}")
        completion_percentage = (i / total_links) * 100
        print(f"Progress: {completion_percentage:.2f}% completed")
        time.sleep(1)

    # Step 4: Save scraped data to data.json
    json_filename = f"{filename_prefix}.json"
    with open(json_filename, "w", encoding="utf-8") as json_file:
        json.dump(book_data, json_file, ensure_ascii=False, indent=4)
    print(f"All book details saved to {json_filename}")
