import os
import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import timedelta
from scrape_links_openTextbook import scrape_links_with_scroll

def scrape_book_details(url, subjects, read_timeout=10):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=read_timeout)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            title = None
            img_src = None

            div_cover = soup.find('div', id='cover')
            if div_cover:
                img = div_cover.find('img')
                img_src = img['src']

            div_info = soup.find('div', id='info')
            if div_info:
                h1 = div_info.find('h1')
                if h1:
                    title = h1.get_text(strip=True)

            paragraphs = div_info.find_all('p')

            copyright_year = None
            last_update = None
            isbn_13 = None
            publisher = None
            language = None
            authors = []
            description = None

            for p in paragraphs[3:]:
                text = p.get_text(strip=True)

                if not text:
                    continue

                normalized_text = text.lower().strip()

                if "copyright year:" in normalized_text:
                    time_tag = p.find('time')
                    if time_tag:
                        copyright_year = time_tag.get_text(strip=True)

                elif "last update:" in normalized_text:
                    last_update = normalized_text.replace("last update:", "").strip()

                elif "isbn 13:" in normalized_text:
                    isbn_13 = text.replace("ISBN 13:", "").strip()

                elif "publisher:" in normalized_text:
                    link = p.find('a')
                    if link:
                        publisher = link.get_text(strip=True)

                elif "language:" in normalized_text:
                    language = text.replace("Language:", "").strip()

                elif copyright_year is None:  # Before copyright year
                    authors.append(text)

            about_section = soup.find('section', id='AboutBook')
            if about_section:
                span = about_section.find('span')
                if span:
                    description = span.get_text(strip=True)



            book_details = {
                "title": title,
                "copyright_year": copyright_year,
                "last_update": last_update,
                "authors": authors,
                "subjects": subjects,
                "image": img_src,
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


if __name__ == "__main__":
    # Step 1: Scrape all links
    start_page = 2
    end_page = 100
    #
    extensions = ["education", "curriculum-instruction", "distance-education", "early-childhood", "elementary-education", "higher-education", "secondary-education"]
    subjects = ["Education", "Curriculum and Instruction", "Distance Education", "Early Childhood", "Elementary Education", "Higher Education", "Secondary Education"]
    url = "https://open.umn.edu/opentextbooks/subjects/"

    all_links = {}

    parts = url.split('/')
    filename_prefix = f"{parts[3]}_{extensions[0]}"

    os.makedirs(os.path.join("scraped urls", "opentextbooks"), exist_ok=True)
    os.makedirs(os.path.join("scraped data", "opentextbooks"), exist_ok=True)

    links_filename = f"{filename_prefix}.txt"
    links_directory = os.path.join("scraped urls", "opentextbooks")
    links_filepath = os.path.join(links_directory, links_filename)
    # if os.path.exists(links_filepath):
    #     user_choice = input(f"{links_filepath} already exists. Do you want to continue? (y/n): ").strip().lower()
    #     if user_choice != 'y':
    #         print("Exiting program.")
    #         exit()
    #
    # already_scraped_links = set()
    # for filename in os.listdir(links_directory):
    #     if filename.endswith(".txt"):
    #         with open(os.path.join(links_directory, filename), 'r') as file:
    #             already_scraped_links.update(line.strip() for line in file)

    for index, extension in enumerate(extensions):
        composed_url = f"{url}{extension}"
        links = scrape_links_with_scroll(composed_url, "div", "col-sm-3 cover center px-0", scroll_pause=2)

        for link in links:
            if link not in all_links:
                # If the link is not in the dictionary, initialize with the default subject
                all_links[link] = [subjects[0]]

            # Add the current subject based on the index if not already added
            if subjects[index] not in all_links[link]:
                all_links[link].append(subjects[index])

    # Step 2: Save links to a file in the subdirectory
    with open(links_filepath, "w") as file:
        for link in sorted(all_links.keys()):
            file.write(link + "\n")
    print(f"All scraped links saved to {links_filepath}")

    # Step 3: Scrape details for each link and save to JSON
    json_filename = f"{filename_prefix}.json"
    book_data = []
    failed_links = []

    json_filepath = os.path.join("scraped data", "opentextbooks", json_filename)
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
