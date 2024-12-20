import copy
import json


def clean_subjects(strings_file, data_file, output_file):
    """
        Cleans the 'subjects' field in a JSON dataset by removing specified strings.

        Parameters:
            strings_file (str): Path to a JSON file containing a list of strings to be removed from the 'subjects' field.
            data_file (str): Path to a JSON file containing the dataset to be cleaned.
            output_file (str): Path to save the cleaned dataset.

        Returns:
            None: The function saves the cleaned data to the specified output file.
        """

    with open(strings_file, 'r', encoding='utf-8') as file:
        strings_to_remove = json.load(file)

    with open(data_file, 'r', encoding='utf-8') as file:
        entries = json.load(file)

    for entry in entries:
        if "subjects" in entry:
            cp = copy.deepcopy(entry["subjects"])
            entry["subjects"] = [subject for subject in entry["subjects"] if subject not in strings_to_remove]
            if len(cp) != len(entry["subjects"]):
                print(entry)
        else:
            entry["subjects"] = []
    
    # Save the cleaned data back to a new file
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(entries, file, indent=4, ensure_ascii=False)
    print(f"Cleaned data saved to {output_file}")

strings_file = "data files/subjects_that_have_less_than_10_books.json"  # File containing strings to remove
data_file = "data files/merged_archive.json"
output_file = "data files/merged_archive.json"

clean_subjects(strings_file, data_file, output_file)
