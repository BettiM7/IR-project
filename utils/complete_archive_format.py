from pathlib import Path
import json


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


clean_and_format_subjects(Path(Path(__file__).parent.parent / "complete_archive.json"))
