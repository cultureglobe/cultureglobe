# Europeana 3D Browser

The project for Europeana Hackaton in Vienna

## To start developing run plovr:

     java -jar plovr.jar serve main.json

and then open in the web browser *main.html* file 

## Queries:

This query retrieves records for a geo boundingbox

http://api.europeana.eu/api/opensearch.rss?wskey=<API-KEY>&startpage=1&searchTerms=enrichment_place_latitude%3A[42+TO+48]+AND+enrichment_place_longitude%3A[10+TO+15]
http://api.europeana.eu/api/opensearch.rss?wskey=<API-KEY>&startpage=1&searchTerms=enrichment_place_latitude%3A[42+TO+48]+AND+enrichment_place_longitude%3A[10+TO+15]

This query retrieves records for a particular time interval

http://api.europeana.eu/api/opensearch.rss?searchTerms=enrichment_period_begin%3A[814-01-01T00%3A00%3A00Z+TO+1453-01-01T23%3A59%3A59Z]+AND+enrichment_period_end%3A[814-01-01T00%3A00%3A00Z+TO+1453-01-01T23%3A59%3A59Z]&wskey=xxx

__Use with caution!__ This query uses the Europeana test API to do the same thing in JSONP!

http://acceptance.europeana.eu/api/opensearch.json?wskey=<API-KEY>&startpage=1&searchTerms=enrichment_place_latitude%3A[42+TO+48]+AND+enrichment_place_longitude%3A[10+TO+15]&callback=test
