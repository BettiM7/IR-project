import requests
import json

# Solr configuration
SOLR_URL = "http://localhost:8983/solr"
COLLECTION_NAME = "textbooks"
SCHEMA_URL = f"{SOLR_URL}/{COLLECTION_NAME}/schema"

# Define fields
fields = [
    {"name": "title", "type": "text_general", "stored": True, "indexed": True},
    {"name": "subtitle", "type": "text_general", "stored": True, "indexed": False},
    {"name": "publish_date", "type": "string", "stored": True, "indexed": True},
    {"name": "authors", "type": "text_general", "stored": True, "indexed": True, "multiValued": True},
    {"name": "subjects", "type": "text_general", "stored": True, "indexed": True, "multiValued": True},
    {"name": "image", "type": "string", "stored": True, "indexed": False},
    {"name": "description", "type": "text_general", "stored": True, "indexed": True},
    {"name": "publisher", "type": "text_general", "stored": True, "indexed": True},
    {"name": "language", "type": "string", "stored": True, "indexed": True},
    {"name": "isbn10", "type": "string", "stored": True, "indexed": True},
    {"name": "isbn13", "type": "string", "stored": True, "indexed": True},
    {"name": "source", "type": "string", "stored": True, "indexed": True},
]

# Send schema update request
payload = {"add-field": fields}
headers = {"Content-Type": "application/json"}

response = requests.post(SCHEMA_URL, data=json.dumps(payload), headers=headers)

# Check response
if response.status_code == 200:
    print("Schema updated successfully!")
else:
    print(f"Failed to update schema: {response.status_code}")
    print(response.json())
