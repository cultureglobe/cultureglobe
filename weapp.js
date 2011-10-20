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
 * Global variable for the WebGL Earth application
 */
var app = null;


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

/**
 * flyToFitBounds
 * @param {number} minlat
 * @param {number} maxlat
 * @param {number} minlon
 * @param {number} maxlon
 */
europeana.weapp.flyToFitBounds = function(minlat, 
                                          maxlat,
                                          minlon,
                                          maxlon) {
      minlat = goog.math.toRadians(minlat);
      maxlat = goog.math.toRadians(maxlat);
      minlon = goog.math.toRadians(minlon);
      maxlon = goog.math.toRadians(maxlon);

      var altitude = we.math.geo.calcDistanceToViewBounds(minlat, maxlat,
          minlon, maxlon,
          app.context.aspectRatio,
          app.context.fov);

      var center = we.math.geo.calcBoundsCenter(minlat, maxlat, minlon, maxlon);

      var minalt = app.context.scene.earth.calcAltitudeForZoom(
          app.context.scene.getMaxZoom() + 0.1, center[0]);


      app.animator_.flyTo(center[0], center[1], Math.max(altitude*2.0, minalt));
      // For the purpose of this Europeana demo we multiply the altitude by 2.0
};


/**
 * Run the europeana app.
 */
europeana.weapp.run = function() {
	app = new weapi.App('earth', {'altitude':4209543, 'center':[31.38518,15.18749]});
	
	// 'zoom':1.5, 'center':[20.0,6.0]
	// app.animator_.flyTo(goog.math.toRadians(40.0),
	// 	goog.math.toRadians(6.0),
	//	1800000, 0.0, 0.6);

	app.context.scene.camera.setTilt(0.5);
	
	// window.setTimeout('alert(app.context.scene.camera.getPositionDegrees())',2000);
	// window.setTimeout('alert(app.context.scene.earth.getZoom();)',2000);
		
	// onResize: app.context.resize()
};