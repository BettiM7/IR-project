import os
import json


def replace_key_in_json_files(directory):
    # Iterate through all files in the given directory
    for filename in os.listdir(directory):
        if filename.endswith(".json"):  # Process only JSON files
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            # Ensure the data is a list of strings
            updated_data = []
            for item in data:
                if isinstance(item, str):
                    # Replace "genres" with "subjects" in the string if it exists
                    updated_string = item.replace("genres", "subjects")
                    # Ensure the string is properly encoded
                    updated_data.append(
                        updated_string.encode("utf-8", "replace").decode("utf-8")
                    )
                else:
                    print(f"Skipping non-string item in file {filename}")

            # Write the updated data back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(updated_data, file, indent=4, ensure_ascii=False)


replace_key_in_json_files(os.path.join("../scraped data", "openlibrary"))