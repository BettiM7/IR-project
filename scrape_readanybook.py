import os
import time
from datetime import timedelta
import requests
from bs4 import BeautifulSoup
import json
import re

from scrape_links import scrape_links


def scrape_book_details(url, read_timeout=10):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=read_timeout)
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
                "description": description,
                "source": url
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
    start_page = 2
    end_page = 50
    #
    urls = ["https://www.readanybook.com/genre/fiction-17"] + [
        f"https://www.readanybook.com/genre/fiction-17/page-{x}" for x in range(start_page, end_page + 1)
    ]
    all_links = set()

    base_url = urls[0]
    domain_name = base_url.split("//")[1].split(".")[1]
    genre = base_url.split("genre/")[1].split("/")[0]
    filename_prefix = f"{domain_name}_{genre}_{start_page}_{end_page}"

    os.makedirs(os.path.join("scraped urls", "readanybook"), exist_ok=True)
    os.makedirs(os.path.join("scraped data", "readanybook"), exist_ok=True)

    links_filename = os.path.join(f"{filename_prefix}.txt")
    links_directory = os.path.join("scraped urls", "readanybook")
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
            links = scrape_links(url, 'div', 'preview-name')
            if not links:
                print(f"No links found for {url}. Retrying with higher timeout...")
                links = scrape_links(url, 'div', 'preview-name', read_timeout=30)
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

    # Step 2: Save links to a file
    with open(links_filepath, "w") as file:
        for link in sorted(all_links):
            file.write(link + "\n")
    print(f"All scraped links saved to {links_filepath}")

    # Step 3: Scrape details for each link and save to JSON
    json_filename = f"{filename_prefix}.json"
    book_data = []
    failed_links = []

    json_filepath = os.path.join("scraped data", "readanybook", json_filename)
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
                json.dump(book_data, json_file, ensure_ascii=False, indent=4)
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
                    json.dump(book_data, json_file, ensure_ascii=False, indent=4)
            else:
                print(f"Retry failed for {link}")
            time.sleep(1)

    if failed_links:
        failed_links_filename = f"{filename_prefix}_failed_links.json"
        with open(failed_links_filename, "w", encoding="utf-8") as failed_file:
            json.dump(failed_links, failed_file, ensure_ascii=False, indent=4)
        print(f"Failed links saved to {failed_links_filename}")
