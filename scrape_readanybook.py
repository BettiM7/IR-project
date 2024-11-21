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

            h1 = soup.find('h1')
            if h1:
                span = h1.find('span')
                year = span.get_text(strip=True).strip("()") if span else None
                if span:
                    span.extract()
                title = h1.get_text(strip=True)
            else:
                title = None
                year = None

            author_span = soup.find('span', class_='authors-list details-info')
            if author_span:
                authors = [author.strip() for author in author_span.get_text(strip=True).split('\n') if author.strip()]
            else:
                authors = []

            genre_span = soup.find('span', class_='categories-list details-info')
            if genre_span:
                genres = [genre.strip() for genre in genre_span.get_text(strip=True).split('\u00bb') if genre.strip()]
            else:
                genres = []

            img = soup.find('img', class_='shadow-lg')
            img_src = img['src'] if img else None

            description = ""
            description_span = soup.find('span', class_='visible-text')

            if description_span:

                description += description_span.get_text(strip=True)

                toggle_text = soup.find('span', class_='toggle-text')
                if toggle_text:
                    description += toggle_text.get_text(strip=True)

            description = description.replace('\u2019', "'")
            description = description.replace('\u201c', "")
            description = re.sub(r'\.(?=[^\s])', '. ', description)
            description = re.sub(r'\s+', ' ', description).strip()

            book_details = {
                "title": title,
                "year": year,
                "authors": authors,
                "genres": genres,
                "image": img_src,
                "description": description
            }

            return json.dumps(book_details, indent=4)
        else:
            print(f"Failed to fetch {url}, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return None


if __name__ == "__main__":
    # Step 1: Scrape all links
    start_page = 1
    end_page = 10
    urls = ["https://www.readanybook.com/genre/nonfiction-16"] + [
        f"https://www.readanybook.com/genre/nonfiction-16/page-{x}" for x in range(start_page + 1, end_page + 1)
    ]
    all_links = set()

    base_url = urls[0]
    domain = base_url.split("//")[1].split("/")[0].split(".")[0]
    genre = base_url.split("genre/")[1].split("/")[0]
    filename_prefix = f"{domain}_{genre}_{start_page}_{end_page}"

    links_filename = f"{filename_prefix}.txt"
    if os.path.exists(links_filename):
        user_choice = input(f"{links_filename} already exists. Do you want to continue? (y/n): ").strip().lower()
        if user_choice != 'y':
            print("Exiting program.")
            exit()

    for url in urls:
        links = scrape_links(url, 'div', 'preview-name')
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
    for link in all_links:
        book_details = scrape_book_details(link)
        if book_details:
            book_data.append(book_details)
            print(f"Scraped details for {link}")
        time.sleep(1)

    # Step 4: Save scraped data to data.json
    json_filename = f"{filename_prefix}.json"
    with open(json_filename, "w") as json_file:
        json.dump(book_data, json_file, indent=4)
    print(f"All book details saved to {json_filename}")
