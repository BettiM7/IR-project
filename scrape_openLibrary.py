import os
import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import timedelta
import re

from utils.scrape_links import scrape_links


def scrape_book_details(url, read_timeout=10):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=read_timeout)
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
                "subjects": genres,
                "image": img_src,
                "description": description,
                "publisher": publisher,
                "language": language,
                "isbn10": isbn10,
                "isbn13": isbn13,
                "source": url
            }

            for key, value in book_details.items():
                if isinstance(value, str):
                    book_details[key] = value.encode("utf-8", "replace").decode("utf-8")
                    book_details[key] = value.replace('"', "'")

            return book_details
        else:
            print(f"Failed to fetch {url}, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return None


if __name__ == "__main__":
    # Step 1: Scrape all links
    start_page = 2
    end_page = 50
    #
    urls = ["https://openlibrary.org/search?q=subject%3ATextbooks&subject_facet=Textbooks&subject_facet=English+language"] + [
        f"https://openlibrary.org/search?q=subject%3ATextbooks&subject_facet=Textbooks&subject_facet=English+language&page={x}" for x in
        range(start_page, end_page + 1)
    ]
    all_links = set()

    base_url = urls[0]
    domain = base_url.split("//")[1].split("/")[0].split(".")[0]
    result = re.search(r'Textbooks&subject_facet=Textbooks&subject_facet=([^&]+)', base_url)
    if result:
        subject = result.group(1)
    filename_prefix = f"{domain}_{subject}_{start_page - 1}_{end_page}"

    os.makedirs(os.path.join("scraped urls", "openlibrary"), exist_ok=True)
    os.makedirs(os.path.join("scraped data", "openlibrary"), exist_ok=True)

    links_filename = f"{filename_prefix}.txt"
    links_directory = os.path.join("scraped urls", "openlibrary")
    links_filepath = os.path.join(links_directory, links_filename)
    if os.path.exists(links_filepath):
        user_choice = input(f"{links_filepath} already exists. Do you want to continue? (y/n): ").strip().lower()
        if user_choice != 'y':
            print("Exiting program.")
            exit()

    already_scraped_links = set()
    for filename in os.listdir(links_directory):
        if filename.endswith(".txt"):
            with open(os.path.join(links_directory, filename), 'r') as file:
                already_scraped_links.update(line.strip() for line in file)

    for url in urls:
        retry_attempted = False
        try:
            links = {f"https://openlibrary.org{link}" for link in scrape_links(url, 'h3', 'booktitle')}
            if not links:
                print(f"No links found for {url}. Retrying with higher timeout...")
                links = {f"https://openlibrary.org{link}" for link in
                         scrape_links(url, 'div', 'preview-name', read_timeout=30)}
                retry_attempted = True
            if links:
                new_links = links - already_scraped_links
                if new_links:
                    all_links.update(new_links)
                    print(f"New links from {url}: scraped{' after retry' if retry_attempted else ''}")
                else:
                    print(f"No new links found for {url}.")
            else:
                print(f"Failed to scrape links from {url} even after retry.")
        except Exception as e:
            print(f"Error while scraping {url}: {e}")
        time.sleep(1)

    # Step 2: Save links to a file in the subdirectory
    with open(links_filepath, "w") as file:
        for link in sorted(all_links):
            file.write(link + "\n")
    print(f"All scraped links saved to {links_filepath}")

    # Step 3: Scrape details for each link and save to JSON
    json_filename = f"{filename_prefix}.json"
    book_data = []
    failed_links = []

    json_filepath = os.path.join("scraped data", "openlibrary", json_filename)
    try:
        with open(json_filepath, "r", encoding="utf-8") as json_file:
            book_data = json.load(json_file)
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    start_time = time.time()
    total_links = len(all_links)
    for i, link in enumerate(all_links, start=1):
        book_details = scrape_book_details(link)
        if book_details:
            book_data.append(book_details)
            with open(json_filepath, "w", encoding="utf-8") as json_file:
                json_file.write(json.dumps(book_data, ensure_ascii=False, indent=4))
        else:
            failed_links.append(link)
            print(f"Failed to scrape {link}")
        completion_percentage = (i / total_links) * 100
        elapsed_time = time.time() - start_time
        eta = elapsed_time / i * (total_links - i)
        print(f"Progress: {completion_percentage:.2f}% completed, ETA: {timedelta(seconds=int(eta))}")
        time.sleep(1)

    # Step 3.5: Retry failed links
    if failed_links:
        print(f"Retrying {len(failed_links)} failed links...")
        for link in failed_links[:]:
            book_details = scrape_book_details(link, read_timeout=30)
            if book_details:
                book_data.append(book_details)
                failed_links.remove(link)
                with open(json_filepath, "w", encoding="utf-8") as json_file:
                    json_file.write(json.dumps(book_data, ensure_ascii=False, indent=4))
            else:
                print(f"Retry failed for {link}")
            time.sleep(1)

    if failed_links:
        failed_links_filename = f"{filename_prefix}_failed_links.json"
        with open(failed_links_filename, "w", encoding="utf-8") as failed_file:
            json.dump(failed_links, failed_file, ensure_ascii=False, indent=4)
        print(f"Failed links saved to {failed_links_filename}")
