# Europeana 3D Browser

The project for Europeana Hackaton in Vienna

## Queries:

This query retrieves records for a geo boundingbox

http://api.europeana.eu/api/opensearch.rss?wskey=<API-KEY>&startpage=1&searchTerms=enrichment_place_latitude%3A[42+TO+48]+AND+enrichment_place_longitude%3A[10+TO+15]

__Use with caution!__ This query uses the Europeana test API to do the same thing in JSONP!

http://acceptance.europeana.eu/api/opensearch.json?wskey=<API-KEY>&startpage=1&searchTerms=enrichment_place_latitude%3A[42+TO+48]+AND+enrichment_place_longitude%3A[10+TO+15]&callback=test