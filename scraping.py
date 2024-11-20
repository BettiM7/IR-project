import requests
from bs4 import BeautifulSoup
import time
import random
import json
import re

def scrape_links(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    links = []

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            divs = soup.find_all('div', class_='preview-name')
            for div in divs:
                link = div.find('a', href=True)
                if link:
                    links.append(link['href'])
        else:
            print(f"Failed to fetch {url}, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return links


import requests
from bs4 import BeautifulSoup
import json


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

            description = ""
            description_span = soup.find('span', class_='visible-text')

            if description_span:

                description += description_span.get_text(strip=True)

                toggle_text = soup.find('span', class_='toggle-text')
                if toggle_text:
                    description += toggle_text.get_text(strip=True)

            description = description.replace('\u2019', "'")

            description = re.sub(r'\.(?=[^\s])', '. ', description)  # Add space after dots if missing

            description = re.sub(r'\s+', ' ', description).strip()

            book_details = {
                "title": title,
                "year": year,
                "authors": authors,
                "genres": genres,
                "description": description
            }

            return json.dumps(book_details, indent=4)
        else:
            print(f"Failed to fetch {url}, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return None


if __name__ == "__main__":
    urls = ["https://www.readanybook.com/genre/fiction-17"] + [
        f"https://www.readanybook.com/genre/fiction-17/page-{x}" for x in range(2, 11)
    ]
    all_links = set()

    for url in urls:
        links = scrape_links(url)
        all_links.update(links)
        print(f"Links from {url}: scraped")
        time.sleep(random.uniform(1, 3))

    with open("scraped_links.txt", "w") as file:
        for link in sorted(all_links):
            file.write(link + "\n")
    print("All scraped links:", all_links)

    url = "https://www.readanybook.com/ebook/folly-764672"
    print(scrape_book_details(url))
