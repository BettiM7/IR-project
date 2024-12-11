import json
from collections import defaultdict
from nltk.stem import PorterStemmer
from pathlib import Path

from sklearn.decomposition import PCA
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans, DBSCAN
from collections import defaultdict
# import tensorflow_hub as hub

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


def replace_subjects(complete_archive_path, replacements_path, output_path):
    with open(complete_archive_path, 'r', encoding='utf-8') as archive_file:
        complete_archive = json.load(archive_file)

    with open(replacements_path, 'r', encoding='utf-8') as replacements_file:
        replacements = json.load(replacements_file)

    replacements_dict = {key: value for key, value in replacements.items() if value}

    for obj in complete_archive:
        if 'subjects' in obj and isinstance(obj['subjects'], list):
            updated_subjects = set(obj['subjects'])
            for subject in obj['subjects']:
                if subject in replacements_dict:
                    updated_subjects.update(replacements_dict[subject])
                    updated_subjects.discard(subject)
            obj['subjects'] = list(updated_subjects)

    with open(output_path, 'w', encoding='utf-8') as output_file:
        json.dump(complete_archive, output_file, ensure_ascii=False, indent=4)


def compare_archives_grouped(original_path, modified_path, output_path):
    with open(original_path, 'r', encoding='utf-8') as original_file:
        original_archive = json.load(original_file)

    with open(modified_path, 'r', encoding='utf-8') as modified_file:
        modified_archive = json.load(modified_file)

    changes_dict = defaultdict(list)

    for orig_obj, mod_obj in zip(original_archive, modified_archive):
        if 'title' in orig_obj and 'subjects' in orig_obj and 'subjects' in mod_obj:
            original_subjects = set(orig_obj['subjects'])
            modified_subjects = set(mod_obj['subjects'])

            removed_subjects = original_subjects - modified_subjects
            added_subjects = modified_subjects - original_subjects

            if removed_subjects or added_subjects:
                change_key = (tuple(sorted(removed_subjects)), tuple(sorted(added_subjects)))
                changes_dict[change_key].append(orig_obj.get('title', 'Unknown Title'))

    differences = []
    for (removed, added), titles in changes_dict.items():
        differences.append("Objects with the following change:")
        differences.append(", ".join(titles))
        differences.append("Original subjects -> New subjects")

        all_unique_subjects = list(set(removed) | set(added))
        max_width = max(len(subject) for subject in all_unique_subjects) + 5

        removed_list = sorted(list(removed)) + [""] * (len(added) - len(removed))
        added_list = sorted(list(added)) + [""] * (len(removed) - len(added))

        for r, a in zip(removed_list, added_list):
            differences.append(f"{r:<{max_width}}{a}")
        differences.append("")

    with open(output_path, 'w', encoding='utf-8') as output_file:
        output_file.write("\n".join(differences))


def count_unique_subjects(json_path):
    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    unique_subjects = set()

    for obj in data:
        if 'subjects' in obj and isinstance(obj['subjects'], list):
            unique_subjects.update(obj['subjects'])

    print(f"Number of unique subjects: {len(unique_subjects)}")
    with open("subjects_list.txt", 'w', encoding='utf-8') as txt_file:
        txt_file.write("\n".join(sorted(unique_subjects)))

# def subject_hierarchy_for_frontend(json_path,output_path):
#     with open(json_path, 'r', encoding='utf-8') as file:
#         books_subjects = json.load(file)
#
#     n_clusters = 30
#
#     subjects = set(subject for subjects_list in books_subjects.values() for subject in subjects_list)
#     subjects = list(subjects)  # Ensure consistent order
#
#     # Convert subjects into TF-IDF features
#     model = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")
#     X = model(subjects).numpy()
#
#     # Step 1: Apply PCA for dimensionality reduction
#     pca = PCA(n_components=50, random_state=42)
#     X_reduced = pca.fit_transform(X)
#
#     # Step 2: Perform KMeans clustering on the reduced data
#     kmeans = KMeans(n_clusters, random_state=42)  # Adjust n_clusters as needed
#     kmeans.fit(X_reduced)
#
#     # Step 3: Map items to their clusters based on the labels
#     clusters = defaultdict(list)
#     for subject, label in zip(subjects, kmeans.labels_):
#         clusters[label].append(subject)
#
#     sorted_clusters = {int(key): clusters[key] for key in sorted(clusters)}
#
#     with open(output_path, 'w', encoding='utf-8') as outfile:
#         json.dump(sorted_clusters, outfile, indent=4, ensure_ascii=False)


def save_titles_with_subjects(json_path, output_json_path):
    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    title_subjects_mapping = {}

    for obj in data:
        if 'title' in obj and 'subjects' in obj and isinstance(obj['subjects'], list):
            title_subjects_mapping[obj['title']] = obj['subjects']

    with open(output_json_path, 'w', encoding='utf-8') as output_file:
        json.dump(title_subjects_mapping, output_file, ensure_ascii=False, indent=4)


def sort_json(input_path):
    def sort_object(obj):
        if isinstance(obj, dict):
            sorted_obj = {k: sort_object(v) for k, v in sorted(obj.items(), key=lambda item: (item[0] != "reference_subject", item[0]))}
            return sorted_obj
        elif isinstance(obj, list):
            return sorted([sort_object(item) for item in obj])
        return obj

    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sorted_data = sort_object(data)

    output_path = input_path.replace('.json', '_sorted.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_data, f, indent=4, ensure_ascii=False)


def reverse_json_structure(json_path, output_path):

    with open(json_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    reversed_dict = {}

    def process_group(value, path):
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str):
                    reversed_dict.setdefault(item, []).extend(path)
        elif isinstance(value, dict):
            for key, sub_value in value.items():
                if key == "reference_subjects":
                    for subject in sub_value:
                        reversed_dict.setdefault(subject, []).extend(path)
                elif key != "subgroups":
                    process_group(sub_value, [key] + path)
                elif key == "subgroups":
                    if isinstance(sub_value, list):
                        for item in sub_value:
                            reversed_dict.setdefault(item, []).extend(path)
                    elif isinstance(sub_value, dict):
                        for subgroup_key, subgroup_value in sub_value.items():
                            process_group(subgroup_value, path + [subgroup_key])

    for top_level_key, top_level_value in data.items():
        if isinstance(top_level_value, dict):
            if "reference_subjects" in top_level_value:
                for subject in top_level_value["reference_subjects"]:
                    reversed_dict.setdefault(subject, []).extend([top_level_key])
            if "subgroups" in top_level_value:
                subgroups = top_level_value["subgroups"]
                if isinstance(subgroups, dict):
                    for subgroup_key, subgroup_value in subgroups.items():
                        process_group(subgroup_value, [subgroup_key, top_level_key])
                elif isinstance(subgroups, list):
                    for subgroup in subgroups:
                        reversed_dict.setdefault(subgroup, []).extend([top_level_key])
        elif isinstance(top_level_value, list):
            for item in top_level_value:
                reversed_dict.setdefault(item, []).extend([top_level_key])

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(reversed_dict, f, indent=4, ensure_ascii=False)



archive_file = Path(Path(__file__).parent.parent / "complete_archive.json")
output_file = "groupings.json"
replacements_file = Path("replacements.json")

# process_subjects(archive_file, output_file)
replace_subjects(archive_file, replacements_file, "complete_archive_replaced1.json")
# compare_archives_grouped("complete_archive_replaced.json", "complete_archive_replaced1.json", 'differences.txt')
# count_unique_subjects('complete_archive_replaced1.json')

#save_titles_with_subjects('complete_archive_replaced1.json', 'titles_with_subjects.json')
#subject_hierarchy_for_frontend("titles_with_subjects.json", "subjects_hierarchy.json")
#sort_json("subjects_hierarchy.json")

#reverse_json_structure("subjects_hierarchy_sorted.json", "reverse_dict.json")