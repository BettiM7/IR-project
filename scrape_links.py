import requests
from bs4 import BeautifulSoup


def scrape_links(url, type, class_name):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    links = []

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            divs = soup.find_all(type, class_=class_name)
            for div in divs:
                link = div.find('a', href=True)
                if link:
                    links.append(link['href'])
        else:
            print(f"Failed to fetch {url}, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

    return links
