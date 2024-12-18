import json
from collections import Counter
from datetime import datetime

def returnLanguages(json_path):
    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    language_counts = Counter(item['language'] for item in data if item.get('language'))

    sorted_languages = sorted(language_counts.items(), key=lambda x: x[0])

    for language, count in sorted_languages:
        print(f"{{label: '{language} ({count})', value: '{language}'}},")

        from datetime import datetime

def convert_publish_date_to_iso(file_path):
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

    # Write the updated data back to the same file
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

    print("File updated successfully.")


#returnLanguages("complete_archive_replaced1.json")
convert_publish_date_to_iso("complete_archive_replaced1.json")