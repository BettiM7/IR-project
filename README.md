Run the following script to configure solr's MoreLikeThis component for recommendation (default similarity field is title, specify on call for custom field combinations):

```
curl -X POST -H 'Content-type:application/json' -d {
  "add-requesthandler": {
    "name": "/mlt",
    "class": "solr.MoreLikeThisHandler",
    "defaults": {"mlt.fl": "title"}
  }
} http://localhost:8983/solr/textbooks/config
```
