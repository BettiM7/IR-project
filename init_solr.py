import requests
import json

# Solr setup
SOLR_URL = "http://localhost:8983/solr"
CORE_NAME = "textbooks"
JSON_FILE_PATH = "./utils/complete_archive_replaced1.json"

# Schema definition
SCHEMA = {
    "add-field": [
        {"name": "title", "type": "text_general", "stored": True, "indexed": True},
        {"name": "subtitle", "type": "text_general", "stored": True, "indexed": False},
        {"name": "publish_date", "type": "string", "stored": True, "indexed": True},
        {"name": "authors", "type": "text_general", "stored": True, "indexed": True, "multiValued": True},
        {"name": "subjects", "type": "text_general", "stored": True, "indexed": True, "multiValued": True, "default": "[]"},
        {"name": "image", "type": "string", "stored": True, "indexed": False},
        {"name": "description", "type": "text_general", "stored": True, "indexed": True},
        {"name": "publisher", "type": "text_general", "stored": True, "indexed": True},
        {"name": "language", "type": "string", "stored": True, "indexed": True},
        {"name": "isbn10", "type": "string", "stored": True, "indexed": True},
        {"name": "isbn13", "type": "string", "stored": True, "indexed": True},
        {"name": "source", "type": "string", "stored": True, "indexed": True},
    ]
}

def create_core(solr_url, core_name):
    create_url = f"{solr_url}/admin/cores?action=CREATE"
    params = {
        "name": core_name,
        "instanceDir": core_name,
        "configSet": "_default"  # Use default config set
    }
    response = requests.get(create_url, params=params)
    if response.status_code == 200:
        print(f"Core '{core_name}' created successfully.")
    else:
        print(f"Failed to create core '{core_name}': {response.text}")

def update_schema(solr_url, core_name, schema):
    schema_url = f"{solr_url}/{core_name}/schema"
    response = requests.post(schema_url, json=schema)
    if response.status_code == 200:
        print(f"Schema updated successfully for core '{core_name}'.")
    else:
        print(f"Failed to update schema for core '{core_name}': {response.text}")

def post_documents(solr_url, core_name, json_file_path):
    update_url = f"{solr_url}/{core_name}/update?commit=true"
    try:
        with open(json_file_path, "r") as file:
            documents = json.load(file)
        response = requests.post(update_url, json=documents)
        if response.status_code == 200:
            print(f"Documents uploaded successfully to core '{core_name}'.")
        else:
            print(f"Failed to upload documents to core '{core_name}': {response.text}")
    except FileNotFoundError:
        print(f"JSON file not found: {json_file_path}")
    except json.JSONDecodeError:
        print(f"Error decoding JSON file: {json_file_path}")

def activate_mlt(solr_url, core_name):
    config_url = f"{solr_url}/{core_name}/config"
    mlt_handler = {
        "add-requesthandler": {
            "name": "/mlt",
            "class": "solr.MoreLikeThisHandler",
            "defaults": {
                "mlt.fl": "title",
                "mlt.mindf": 1,
                "mlt.mintf": 1,
            }
        }
    }
    response = requests.post(config_url, json=mlt_handler)
    if response.status_code == 200:
        print(f"MLT handler activated successfully for core '{core_name}'.")
    else:
        print(f"Failed to activate MLT handler for core '{core_name}': {response.text}")

if __name__ == "__main__":
    # Step 1: Create the core
    create_core(SOLR_URL, CORE_NAME)

    # Step 2: Update schema
    update_schema(SOLR_URL, CORE_NAME, SCHEMA)

    # Step 3: Post documents from JSON file
    post_documents(SOLR_URL, CORE_NAME, JSON_FILE_PATH)

    # Step 4: Activate MLT
    activate_mlt(SOLR_URL, CORE_NAME)