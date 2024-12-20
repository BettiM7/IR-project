### Setup Solr
With the Solr instance active, run `init_solr.py`.  
This code will create the `textbooks` core, create the schema,
upload the data and activate the MoreLikeThis feature.  
The frontend communicates to Solr on `http://localhost:8983` so make sure it is running on that port.
