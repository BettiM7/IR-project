import json
from collections import Counter

def returnLanguages(json_path):
    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    language_counts = Counter(item['language'] for item in data if item.get('language'))

    sorted_languages = sorted(language_counts.items(), key=lambda x: x[0])

    for language, count in sorted_languages:
        print(f"{{label: '{language} ({count})', value: '{language}'}},")


returnLanguages("complete_archive_replaced1.json")