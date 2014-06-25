goog.provide('europeana.weapp');
goog.provide('europeana.weapp.Marker');

goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.string');

goog.require('we.scene.Scene');
goog.require('we.math.geo');
goog.require('weapi.App');

goog.require('we.ui.markers.AbstractMarker');


/**
 * @inheritDoc
 * @extends {we.ui.markers.AbstractMarker}
 * @constructor
 */
europeana.weapp.Marker = function(lat, lon, image, url, title, institution) {

  var el = goog.dom.createDom('a', {'class':'marker', 'href':url, 'target':'_blank'}, 
    goog.dom.createDom('img', {'src': image}),
    goog.dom.createDom('div', {'class': 'makertitle'},
      goog.dom.createTextNode(title),
      goog.dom.createDom('div', {'style': 'color:#ccc'},
        goog.dom.createTextNode(institution)
      )
    )
  );

  goog.base(this, lat, lon, /** @type {!HTMLElement} */ (el));

  this.show(false);
};
goog.inherits(europeana.weapp.Marker, we.ui.markers.AbstractMarker);

/**
 * Display markers from the provided jsondata
 * @param {!Object} jsondata The Europeana OpenSearch API JSON data
 * @param {?boolean} merge Merge the new results with existing results?
 */
europeana.weapp.addMarkers = function(jsondata, merge) {
	
	if (merge !== true)
		app.markerManager_.removeMarkers();

	// Iterate on the JSON and add new results
	goog.array.forEach(jsondata['items'], function(item) {
		
		// Skip items without thumbnail
		if (!item['enclosure']) return;

		var m1 = new europeana.weapp.Marker(
			item['enrichment:place_latitude'],
			item['enrichment:place_longitude'],
			item['enclosure'],
			item['guid'],
			goog.string.unescapeEntities(item['title']),
			goog.string.unescapeEntities(item['dc:creator'] + ' (' + item['europeana:provider'] + ')' ));
		var m1key = app.markerManager_.addMarker(null, m1);
	});
	
	/*
	var m1 = new europeana.weapp.Marker(45.0,6.0,
		'http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fwww.peoplesnetwork.gov.uk%2Fdpp%2Fresource%2F2387615%2Fstream%2Fthumbnail_image_jpeg&size=FULL_DOC&type=IMAGE',
		'http://www.europeana.eu/',
		'Quite a long description of the title of the Marker',
		'Institution');
	var m1key = app.markerManager_.addMarker(null, m1);
	*/
}
