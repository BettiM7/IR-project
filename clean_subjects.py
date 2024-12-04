import json

def clean_subjects(strings_file, data_file, output_file):
    # Read the array of strings to remove
    with open(strings_file, 'r', encoding='utf-8') as file:
        strings_to_remove = json.load(file)
    
    # Read the data file containing objects
    with open(data_file, 'r', encoding='utf-8') as file:
        entries = json.load(file)
    
    # Process each object
    for entry in entries:
        if "subjects" in entry:
            # Ensure the subjects field is preserved, even if it becomes empty
            entry["subjects"] = [subject for subject in entry["subjects"] if subject not in strings_to_remove]
        else:
            # If the subjects field is missing, add an empty list
            entry["subjects"] = []
    
    # Save the cleaned data back to a new file
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(entries, file, indent=4, ensure_ascii=False)
    print(f"Cleaned data saved to {output_file}")

# File paths
strings_file = "subjects_that_have_less_than_10_books.json"  # File containing strings to remove
data_file = "complete_archive.json"      # File containing objects to clean
output_file = "complete_archive_no_less_than_10_books_subjects.json"     # Output file to save the result

# Run the script
clean_subjects(strings_file, data_file, output_file)
