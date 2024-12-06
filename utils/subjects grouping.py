import json
from nltk.stem import PorterStemmer
from pathlib import Path


from nltk.stem import PorterStemmer
import json

def process_subjects(json_path, output_path):
    connectors = {"and", "&", "the", "or", "of", "a", "an"}
    stemmer = PorterStemmer()

    def count_meaningful_words(subject):
        return len([word for word in subject.split() if word.lower() not in connectors])

    def stem_subject(subject):
        return ' '.join([stemmer.stem(word.lower()) for word in subject.split() if word.lower() not in connectors])

    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    subject_set = set()
    for item in data:
        subject_set.update(item.get('subjects', []))

    print(len(subject_set))

    # Map original subjects to their stemmed versions
    stemmed_subjects = {stem_subject(subject): subject for subject in subject_set}

    # Identify broad categories
    broad_categories = [stem for stem in stemmed_subjects if count_meaningful_words(stemmed_subjects[stem]) <= 2]
    unused_categories = set(broad_categories)

    # Initialize subject dictionary with non-broad categories
    subject_dict = {stem: [] for stem in stemmed_subjects if stem not in broad_categories}

    # Label subjects with broad categories
    for key in subject_dict.keys():
        for broad_category in broad_categories:
            if count_meaningful_words(broad_category) == 2:
                if broad_category in key:
                    subject_dict[key].append(broad_category)
                    unused_categories.discard(broad_category)
            else:
                if broad_category in key:
                    subject_dict[key].append(broad_category)
                    unused_categories.discard(broad_category)

    # Filter out unused broad categories
    broad_categories = [subj for subj in broad_categories if subj not in unused_categories]

    # Create a second dictionary for unused categories
    subject_dict1 = {subj: [] for subj in unused_categories}

    # Label unused categories with remaining broad categories
    for key in subject_dict1.keys():
        for broad_category in broad_categories:
            if count_meaningful_words(broad_category) == 2:
                if broad_category in key:
                    subject_dict1[key].append(broad_category)
            else:
                if broad_category in key:
                    subject_dict1[key].append(broad_category)

    # Combine the two dictionaries
    subject_dict.update(subject_dict1)

    print(len(broad_categories))
    print(len(subject_dict))

    empty_array_count = sum(1 for key, values in subject_dict.items() if not values)
    print("total number of subjects: " + str(len(broad_categories) + empty_array_count))

    # Map back to original strings for the final output
    final_subject_dict = {
        stemmed_subjects[key]: [stemmed_subjects[cat] for cat in value] for key, value in subject_dict.items()
    }

    # Process each subject's broad categories to remove substrings and "General"
    for key, values in final_subject_dict.items():
        if "General" in values:
            values.remove("General")
        unique_values = set(values)
        for value in values:
            for other_value in values:
                if value != other_value and value in other_value:
                    unique_values.discard(value)
        final_subject_dict[key] = list(unique_values)

    with open(output_path, 'w', encoding='utf-8') as output_file:
        json.dump(final_subject_dict, output_file, ensure_ascii=False, indent=4)



data_file = Path(Path(__file__).parent.parent / "complete_archive.json")
output_file = "groupings.json"

process_subjects(data_file, output_file)
# 586
