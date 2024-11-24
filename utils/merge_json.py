import os
import json


def process_json_files(subdirectories):
    book_template = {
        "title": "",
        "subtitle": "",
        "publish_date": "",
        "last_update": "",
        "authors": [],
        "subjects": [],
        "image": "",
        "description": "",
        "publisher": "",
        "language": "",
        "isbn10": "",
        "isbn13": "",
        "source": ""
    }

    complete_archive = []

    for subdirectory in subdirectories:
        for root, _, files in os.walk(subdirectory):
            for file in files:
                if file.endswith(".json"):
                    file_path = os.path.join(root, file)

                    with open(file_path, 'r', encoding='utf-8') as f:
                        try:
                            data = json.load(f)
                            for obj in data:
                                mapped_obj = book_template.copy()
                                mapped_obj["title"] = obj.get("title", None)
                                mapped_obj["subtitle"] = obj.get("subtitle", None)
                                mapped_obj["publish_date"] = obj.get("publish_date", None)
                                mapped_obj["last_update"] = obj.get("last_update", None)
                                mapped_obj["authors"] = obj.get("authors", [])
                                mapped_obj["subjects"] = obj.get("subjects", [])
                                mapped_obj["image"] = obj.get("image", None)
                                mapped_obj["description"] = obj.get("description", None)
                                mapped_obj["publisher"] = obj.get("publisher", None)
                                mapped_obj["language"] = obj.get("language", None)
                                mapped_obj["isbn10"] = obj.get("isbn10", None)
                                mapped_obj["isbn13"] = obj.get("isbn13", None)
                                mapped_obj["source"] = obj.get("source", None)

                                if "copyright_year" in obj:
                                    mapped_obj["publish_date"] = obj.get("copyright_year", None)

                                complete_archive.append(mapped_obj)
                        except json.JSONDecodeError:
                            print(f"Failed to decode JSON in file: {file_path}")

    with open('../complete_archive.json', 'w', encoding='utf-8') as output_file:
        json.dump(complete_archive, output_file, ensure_ascii=False, indent=4)


process_json_files([os.path.join("..", "scraped data", "opentextbooks"),
                    os.path.join("..", "scraped data", "openlibrary"),
                    os.path.join("..", "scraped data", "openstax")])
