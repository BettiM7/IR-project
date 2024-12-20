import json
from collections import Counter
from datetime import datetime

def return_languages(json_path):
    """
    Extracts and counts the languages present in a JSON dataset and prints them in a formatted structure.

    Parameters:
        json_path (str): Path to the JSON file containing data with a 'language' field.

    Output:
        - Prints a list of languages along with their counts in the format:
          {label: 'LanguageName (Count)', value: 'LanguageName'}, sorted alphabetically by language name.

    Description:
        - Reads and parses the JSON dataset.
        - Counts occurrences of each unique language in the 'language' field.
        - Sorts the languages alphabetically.
        - Prints each language with its count in a specific formatted structure suitable
         for dropdowns.
    """

    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    language_counts = Counter(item['language'] for item in data if item.get('language'))

    sorted_languages = sorted(language_counts.items(), key=lambda x: x[0])

    for language, count in sorted_languages:
        print(f"{{label: '{language} ({count})', value: '{language}'}},")

def convert_publish_date_to_iso(file_path):
    """
    Converts 'publish_date' fields in a JSON dataset to ISO 8601 format.

    Parameters:
        file_path (str): Path to the JSON file containing data with 'publish_date' fields.

    Output:
        - The input JSON file is updated in-place with 'publish_date' values converted to ISO 8601 format.

    Description:
        - Reads and parses the JSON dataset.
        - Iterates through each object, checking if the 'publish_date' field exists and is a string.
        - Attempts to parse the 'publish_date' string using a list of predefined date formats:
            - "%Y" (e.g., "2020")
            - "%B %d, %Y" (e.g., "January 15, 2020")
            - "%B %Y" (e.g., "January 2020")
            - "%b %d, %Y" (e.g., "Jan 15, 2020")
        - If a format matches, converts the date to ISO 8601 format and updates the field.
        - If none of the formats match, logs the unparsed date to the console.
        - Saves the updated dataset back to the original file in a human-readable format.
        - Prints a confirmation message when the file is successfully updated.
    """

    date_formats = [
        "%Y",
        "%B %d, %Y",
        "%B %Y",
        "%b %d, %Y"
    ]

    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    for item in data:
        if 'publish_date' in item and isinstance(item['publish_date'], str):
            for fmt in date_formats:
                try:
                    date_obj = datetime.strptime(item['publish_date'], fmt)
                    item['publish_date'] = date_obj.isoformat()
                    break
                except ValueError:
                    continue
            else:
                print(f"Could not parse date: {item['publish_date']}")

    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

    print("File updated successfully.")


#returnLanguages("complete_archive_replaced.json")
convert_publish_date_to_iso("data files/complete_archive_replaced.json")