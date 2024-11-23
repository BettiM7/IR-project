import os
import json
import time
from datetime import timedelta


def scrape_book_details(url, subjects, read_timeout=10):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=read_timeout)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            title = None

            img_header = soup.find('h1', class_='image-heading')
            if img_header:
                img = img_header.find('img')
                if img and img.has_attr('alt'):
                    title = img['alt']

            publish_date = None
            last_update = None
            isbn_13 = None
            publisher = None
            language = None
            authors = []
            description = None

            pub_div = soup.find('div', class_='loc-pub-date')
            if pub_div:
                h4 = pub_div.find('h4')
                if h4:
                    publish_date = h4.text.replace('Publish date:', '').strip()

            upd_div = soup.find('div', class_='loc-web-update-date')
            if upd_div:
                h4 = upd_div.find('h4')
                if h4:
                    publish_date = h4.text.replace('Web Version Last Updated:', '').strip()

            book_details = {
                "title": title,
                "publish_date": publish_date,
                "last_update": last_update,
                "authors": authors,
                "subjects": subjects,
                "image": None,
                "description": description,
                "publisher": publisher,
                "language": language,
                "isbn13": isbn_13,
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


import requests
from bs4 import BeautifulSoup


def scrape_links(url, read_timeout=10):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    links = {}

    try:
        response = requests.get(url, headers=headers, timeout=read_timeout)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            h1 = None
            intro_section = soup.find('section', class_='subject-intro')
            if intro_section:
                h1 = intro_section.find('h1')
            else:
                print(f"No intro section found for {url}")
            categories = soup.find('div', id='category')
            for category in categories:
                category_id = category.get('id')
                books = category.find_all('div', class_="book_tile")
                for book in books:
                    link = "https://openstax.org " + book.find('a', href=True)
                    if link and link not in links:
                        links[link] = [h1, category_id]
        else:
            print(f"Failed to fetch {url}, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return links


if __name__ == "__main__":
    # Step 1: Scrape all links
    
    os.makedirs(os.path.join("scraped urls", "openstax"), exist_ok=True)
    os.makedirs(os.path.join("scraped data", "openstax"), exist_ok=True)

    all_links = {}

    url = "https://openstax.org/subjects/"
    extensions = ["business", "college-success",
                       "computer-science", "humanities",
                       "math", "nursing",
                       "science", "social-sciences"]

    for page in extensions:
        filename_prefix = f"openstax_{page}"


        links_filename = f"{filename_prefix}.txt"
        links_directory = os.path.join("scraped urls", "openstax")
        links_filepath = os.path.join(links_directory, links_filename)

        for index, extension in enumerate(extensions):
            composed_url = f"{url}{extension}"
            links = scrape_links(composed_url)
            all_links.update(links)

    # Step 2: Save links to a file in the subdirectory
    with open(links_filepath, "w") as file:
        for link in sorted(all_links.keys()):
            file.write(link + "\n")
    print(f"All scraped links saved to {links_filepath}")

    # Step 3: Scrape details for each link and save to JSON
    json_filename = f"{filename_prefix}.json"
    book_data = []
    failed_links = []

    json_filepath = os.path.join("scraped data", "openstax", json_filename)
    try:
        with open(json_filepath, "r", encoding="utf-8") as json_file:
            book_data = json.load(json_file)
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    start_time = time.time()
    total_links = len(all_links)
    for i, (link, subjects) in enumerate(all_links.items(), start=1):
        book_details = scrape_book_details(link, subjects, read_timeout=10)
        if book_details:
            book_data.append(book_details)
            with open(json_filepath, "w", encoding="utf-8") as json_file:
                json.dump(book_data, json_file, ensure_ascii=False, indent=4)
        else:
            failed_links.append([link, subjects])
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
            book_details = scrape_book_details(link[0], link[1], read_timeout=30)
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
