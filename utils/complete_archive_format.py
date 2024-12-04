from pathlib import Path
from urllib.parse import urlparse
from collections import defaultdict
import json
import copy


def clean_and_format_subjects(json_path: Path):
    with json_path.open('r', encoding='utf-8') as file:
        data = json.load(file)

    for obj in data:
        if 'subjects' in obj and isinstance(obj['subjects'], list):
            cleaned_subjects = []
            seen_subjects = set()

            for subject in obj['subjects']:
                if subject.lower() == "textbooks":
                    continue  # Skip "Textbooks"
                elif "textbooks" in subject.lower():
                    subject = subject.lower().replace("textbooks", "").strip()  # Format "xyz textbooks" to "xyz"

                formatted_subject = subject.title()

                if formatted_subject.lower() not in seen_subjects:
                    seen_subjects.add(formatted_subject.lower())
                    cleaned_subjects.append(formatted_subject)

            obj['subjects'] = cleaned_subjects

    with json_path.open('w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)


# clean_and_format_subjects(Path(Path(__file__).parent.parent / "complete_archive.json"))


def find_duplicate_titles_with_source_and_category(json_path):
    with open(json_path, 'r') as file:
        data = json.load(file)

    title_groups = defaultdict(list)

    for obj in data:
        if 'title' in obj and 'source' in obj:
            title_groups[(obj['title'], obj['source'])].append(obj)

    duplicates = {key: objs for key, objs in title_groups.items() if len(objs) > 1}
    duplicate_count = sum(len(objs) for objs in duplicates.values()) // 2

    domain_groups = defaultdict(list)

    for (title, source), objs in duplicates.items():
        domain = urlparse(source).netloc
        domain_groups[domain].append((title, objs))

    for domain, entries in domain_groups.items():
        print(f"Domain: {domain}")
        unique_count = len(entries)
        print(f"  Number of unique duplicate titles: {unique_count}")
        for title, objs in entries:
            print(f"  Duplicate title: {title}")
            for obj in objs:
                print(f"    {obj}")
        print()

    print(f"Total number of duplicated objects: {duplicate_count}")


find_duplicate_titles_with_source_and_category(Path(Path(__file__).parent.parent / "complete_archive.json"))


def handle_duplicates_by_source(json_path):
    # Load the data from the JSON file
    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    source_groups = defaultdict(list)

    # Group objects by their 'source'
    for obj in data:
        if 'source' in obj:
            source_groups[obj['source']].append(obj)

    updated_data = copy.deepcopy(data)

    for source, objs in source_groups.items():
        if len(objs) > 1:
            domain = urlparse(source).netloc

            if domain == "openstax.org":
                # Remove one of the duplicates
                updated_data.remove(objs[0])

            elif domain == "open.umn.edu":
                # Handle duplicates by merging 'subjects'
                obj1, obj2 = objs[:2]
                subjects1 = set(obj1.get('subjects', []))
                subjects2 = set(obj2.get('subjects', []))

                if len(subjects1) < len(subjects2):
                    updated_data.remove(next(obj for obj in updated_data if obj == obj1))
                    for obj in updated_data:
                        if obj == obj2:
                            obj['subjects'] = list(subjects2.union(subjects1))
                else:
                    updated_data.remove(next(obj for obj in updated_data if obj == obj2))
                    for obj in updated_data:
                        if obj == obj1:
                            obj['subjects'] = list(subjects1.union(subjects2))

    with  json_path.open('w', encoding='utf-8') as file:
        json.dump(updated_data, file, indent=4)

    print(f"Updated data saved")


#handle_duplicates_by_source(Path(Path(__file__).parent.parent / "complete_archive.json"))
