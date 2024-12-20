from pathlib import Path
from urllib.parse import urlparse
from collections import defaultdict
import json
import copy


def clean_and_format_subjects(json_path: Path):
    """
    Cleans and formats the 'subjects' field in a JSON dataset by standardizing subject names
     and removing duplicates or irrelevant entries.

    Parameters:
        json_path (Path): Path object representing the JSON file containing data with a 'subjects' field.

    Output:
        - The input JSON file is updated in-place with cleaned and formatted subjects.

    Description:
        - Reads and parses the JSON dataset.
        - Iterates through each object and processes the 'subjects' field if it exists and is a list.
        - Removes subjects that match or contain the word "Textbooks."
        - Standardizes subject names by converting them to title case.
        - Ensures no duplicate subjects exist, ignoring case sensitivity.
        - Updates the 'subjects' field in the JSON data and writes the cleaned data back to the same file.
    """

    with json_path.open('r', encoding='utf-8') as file:
        data = json.load(file)

    for obj in data:
        if 'subjects' in obj and isinstance(obj['subjects'], list):
            cleaned_subjects = []
            seen_subjects = set()

            for subject in obj['subjects']:
                if subject.lower() == "textbooks":
                    continue
                elif "textbooks" in subject.lower():
                    subject = subject.lower().replace("textbooks", "").strip()

                formatted_subject = subject.title()

                if formatted_subject.lower() not in seen_subjects:
                    seen_subjects.add(formatted_subject.lower())
                    cleaned_subjects.append(formatted_subject)

            obj['subjects'] = cleaned_subjects

    with json_path.open('w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)


# clean_and_format_subjects(Path(Path(__file__).parent.parent / "merged_archive.json"))


def find_duplicate_titles(json_path):
    """
    Identifies duplicate titles in a JSON dataset based on their source and groups them by domain for analysis.

    Parameters:
        json_path (str): Path to the JSON file containing data with 'title' and 'source' fields.

    Output:
        - Prints details of duplicate titles grouped by the domain of their source.
        - Displays the number of unique duplicate titles per domain and the total number of duplicated objects.

    Description:
        - Reads and parses the JSON dataset.
        - Groups objects by their 'title' and 'source' to identify duplicates.
        - Creates a dictionary of duplicates, where each key is a tuple of (title, source), and the value
            is a list of objects with the same title and source.
        - Groups duplicates further by the domain extracted from the 'source' field using URL parsing.
        - Prints the domain, the number of unique duplicate titles in that domain, and the details of each
            duplicate title along with its associated objects.
        - Outputs the total count of duplicated objects, accounting for each pair only once.
    """

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


find_duplicate_titles(str(Path(Path(__file__).parent.parent / "merged_archive.json")))


def handle_duplicates_by_source(json_path):
    """
    Handles duplicate entries in a JSON dataset by their 'source,' applying specific rules for different domains.

    Parameters:
        json_path (str): Path to the JSON file containing data with 'source' and other relevant fields.

    Output:
        - The input JSON file is updated in-place, removing or merging duplicate entries based on the source domain.

    Description:
        - Reads and parses the JSON dataset.
        - Groups objects by their 'source' field to identify duplicates.
        - Applies domain-specific rules to handle duplicates:
            - For "openstax.org": Removes one of the duplicate entries.
            - For "open.umn.edu": Merges the 'subjects' fields of duplicates, ensuring no data loss,
                and keeps the object with the larger set of subjects.
        - Updates the dataset to reflect the changes and saves it back to the original file.
        - Prints a confirmation message once the updated data is saved.
    """


    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    source_groups = defaultdict(list)

    for obj in data:
        if 'source' in obj:
            source_groups[obj['source']].append(obj)

    updated_data = copy.deepcopy(data)

    for source, objs in source_groups.items():
        if len(objs) > 1:
            domain = urlparse(source).netloc

            if domain == "openstax.org":
                updated_data.remove(objs[0])

            elif domain == "open.umn.edu":
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


#handle_duplicates_by_source(Path(Path(__file__).parent.parent / "merged_archive.json"))
