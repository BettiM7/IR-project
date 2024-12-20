import pysolr

# Define your Solr core or collection URL
SOLR_URL = "http://localhost:8983/solr/textbooks"

# Initialize the Solr client
solr = pysolr.Solr(SOLR_URL, timeout=10)

try:
    # Delete documents by query
    query = "*:*"  # Change this to a specific query if needed
    solr.delete(q=query)
    print(f"Deleted documents matching query: {query}")

    # Or delete documents by IDs
    # ids_to_delete = ["id1", "id2", "id3"]
    # solr.delete(id=ids_to_delete)
    # print(f"Deleted documents with IDs: {ids_to_delete}")

    # Commit changes to ensure deletion is applied
    solr.commit()
    print("Deletion committed successfully.")
except Exception as e:
    print(f"An error occurred: {e}")
