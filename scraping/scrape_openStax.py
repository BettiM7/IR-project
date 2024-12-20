import os
import json
import time
from datetime import timedelta
from selenium import webdriver


def scrape_book_details(url, subjects, read_timeout=10):
    try:
        driver = webdriver.Chrome()
        driver.get(url)
        time.sleep(2)
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        title = None

        img_header = soup.find('h1', class_='image-heading')
        if img_header:
            img = img_header.find('img')
            if img and img.has_attr('alt'):
                title = str(img['alt'])

        publish_date = None
        last_update = None
        isbn_13 = None
        authors = []
        description = None

        pub_div = soup.find('div', class_='loc-pub-date')
        if pub_div:
            publish_date = pub_div.text.replace('Publish Date:', '').strip()

        upd_div = soup.find('div', class_='loc-web-update-date')
        if upd_div:
            last_update = upd_div.text.replace('Web Version Last Updated:', '').strip()

        isbn_div = soup.find('div', class_='loc-digital-isbn')
        if isbn_div:
            isbn_13 = isbn_div.text.replace('Digital:', '').strip()
            isbn_13 = isbn_13.replace('ISBN-13: ', '').strip()
        else:
            print("no isbn found")

        author_divs = soup.find_all('div', class_=['loc-senior-author', 'loc-nonsenior-author'])
        for author_div in author_divs:
            author_name = author_div.text.strip()
            if author_name:
                authors.append(author_name)

        summary_div = soup.find('div', class_='loc-summary-text')
        if summary_div:
            paragraphs = summary_div.find_all('p')
            description = ' '.join(p.text.strip() for p in paragraphs if p.text.strip())

        book_details = {
            "title": title,
            "publish_date": publish_date,
            "last_update": last_update,
            "authors": authors,
            "subjects": subjects,
            "image": None,
            "description": description,
            "publisher": "OpenStax",
            "language": "English",
            "isbn13": isbn_13,
            "source": url
        }

        for key, value in book_details.items():
            if isinstance(value, str):
                book_details[key] = value.encode("utf-8", "replace").decode("utf-8")
                book_details[key] = value.replace('"', "'")

        driver.quit()

        return book_details
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return None


import requests
from bs4 import BeautifulSoup


def scrape_links(url):
    links = {}

    try:
        driver = webdriver.Chrome()
        driver.get(url)
        time.sleep(2)
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        h1 = None
        intro_section = soup.find('section', class_='subject-intro')
        if intro_section:
            h1 = intro_section.find('h1')
            h1 = h1.text.strip()
        else:
            print(f"No intro section found for {url}")
        categories = soup.find_all('div', class_='category')
        for category in categories:
            category_id = category.get('id')
            books = category.find_all('div', class_="book-tile")
            for book in books:
                link = "https://openstax.org" + book.find('a', href=True)['href']
                if link and link not in links:
                    links[link] = [h1, category_id]
        driver.quit()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
    return links


if __name__ == "__main__":
    """
    This script automates the scraping of book links and details from the OpenStax website for
     specified subject categories.

    Description:
        - Creates directories for storing scraped URLs and book data if they do not already exist.
        - Defines a base URL (`https://openstax.org/subjects/`) and a list of subject extensions to scrape.
        - Iterates through each subject extension, constructing the complete URL and scraping links from the page.
        - Organizes the scraped links into a `.txt` file for each subject and saves it in the 
            `scraped urls/openstax` directory.

        Data Extraction:
        - Reads previously scraped book data from a JSON file, if available, to avoid duplicating efforts.
        - Iterates through the scraped links, extracting detailed book information along with associated subjects.
        - Saves the scraped book data incrementally to a JSON file in the `scraped data/openstax` directory.
        - Tracks and displays progress, including completion percentage and estimated time of arrival (ETA).

        Retry Logic:
        - Logs links that fail to scrape during the first attempt.
        - Retries scraping failed links with a higher timeout.
        - Logs and saves any links that still fail to scrape after retries to a separate 
            JSON file for future debugging.

    Output:
        - A `.txt` file for each subject containing all successfully scraped links.
        - A `.json` file for each subject containing detailed data for each scraped book, 
            incrementally updated during the scraping process.
        - A `.json` file containing links that failed to scrape even after retries.
    """

    os.makedirs(os.path.join("scraped urls", "openstax"), exist_ok=True)
    os.makedirs(os.path.join("scraped data", "openstax"), exist_ok=True)

    url = "https://openstax.org/subjects/"
    extensions = ["business", "college-success",
                       "computer-science", "humanities",
                       "math", "nursing",
                       "science", "social-sciences"]

    for page in extensions:
        filename_prefix = f"openstax_{page}"
        all_links = {}


        links_filename = f"{filename_prefix}.txt"
        links_directory = os.path.join("scraped urls", "openstax")
        links_filepath = os.path.join(links_directory, links_filename)

        composed_url = f"{url}{page}"
        links = scrape_links(composed_url)
        all_links.update(links)

        with open(links_filepath, "w") as file:
            for link in sorted(all_links.keys()):
                file.write(link + "\n")
        print(f"All scraped links saved to {links_filepath}")

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
                    json_file.write(json.dumps(book_data, ensure_ascii=False, indent=4))
            else:
                failed_links.append([link, subjects])
                print(f"Failed to scrape {link}")
            completion_percentage = (i / total_links) * 100
            elapsed_time = time.time() - start_time
            eta = elapsed_time / i * (total_links - i)
            print(f"Progress: {completion_percentage:.2f}% completed, ETA: {timedelta(seconds=int(eta))}")
            time.sleep(1)

        if failed_links:
            print(f"Retrying {len(failed_links)} failed links...")
            for link in failed_links[:]:
                book_details = scrape_book_details(link[0], link[1], read_timeout=30)
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
