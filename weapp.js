goog.provide('europeana.weapp');

goog.require('goog.dom');
goog.require('goog.math');


goog.require('we.scene.Scene');
goog.require('weapi.App');
goog.require('we.texturing.OSMTileProvider');

goog.require('we.ui.markers.PrettyMarker');

/**
 * Global variable for the WebGL Earth application
 */
var app = null;

/**
 * Run the europeana app.
 */
europeana.weapp.run = function() {
	app = new weapi.App('earth', {'zoom':4.0, 'center':[40.0,6.0]});
	
	// 'zoom':1.5, 'center':[20.0,6.0]
	// app.animator_.flyTo(goog.math.toRadians(40.0),
	// 	goog.math.toRadians(6.0),
	//	1800000, 0.0, 0.6);

	app.context.scene.camera.setTilt(0.6);
	var osm = new we.texturing.OSMTileProvider();
	app.context.scene.earth.changeTileProvider(osm);
	
	// window.setTimeout('alert(app.context.scene.camera.getPositionDegrees())',2000);
	// window.setTimeout('alert(app.context.scene.earth.getZoom();)',2000);
	
	var m1 = new we.ui.markers.PrettyMarker(45.0,6.0,'http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fwww.peoplesnetwork.gov.uk%2Fdpp%2Fresource%2F2387615%2Fstream%2Fthumbnail_image_jpeg&size=FULL_DOC&type=IMAGE');
	var m1key = app.markerManager_.addMarker(null, m1);
	// app.markerManager_.removeMarker(m1key);
	
	// onResize: app.context.resize()
	
	// 
};