from selenium import webdriver
import time
from bs4 import BeautifulSoup

def scrape_links_with_scroll(url, type, class_name, scroll_pause=5):
    links = set()

    driver = webdriver.Chrome()
    driver.get(url)

    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(scroll_pause)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

    soup = BeautifulSoup(driver.page_source, 'html.parser')

    try:
        divs = soup.find_all(type, class_=class_name)
        for div in divs:
            link = div.find('a', href=True)
            if link:
                full_link = "https://open.umn.edu" + link['href']
                links.add(full_link)
    except Exception as e:
        print(f"An error occurred while parsing: {e}")

    # Close the browser
    driver.quit()

    return links
