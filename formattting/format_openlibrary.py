import os
import json


def replace_key_in_json_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            updated_data = []
            for item in data:
                if isinstance(item, str):
                    updated_string = item.replace("genres", "subjects")
                    updated_data.append(
                        updated_string.encode("utf-8", "replace").decode("utf-8")
                    )
                else:
                    print(f"Skipping non-string item in file {filename}")

            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(updated_data, file, indent=4, ensure_ascii=False)


replace_key_in_json_files(os.path.join("../scraping/scraped data", "openlibrary"))