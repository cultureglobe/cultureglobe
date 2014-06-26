PLOVR = ../plovr-81ed862.jar

all: serve
serve:
	java -jar $(PLOVR) serve main-debug.json
build:
	java -jar $(PLOVR) build main.json > deploy/index.js
lint:
	fixjsstyle --strict -r ./src
	gjslint --strict -r ./src
soyweb:
	java -jar $(PLOVR) soyweb --dir .
