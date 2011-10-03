goog.provide('europeana.main');

goog.require('goog.ui.Component');
goog.require('goog.ui.TwoThumbSlider');
goog.require('goog.dom');
goog.require('goog.net.Jsonp');

goog.require('europeana.weapp');

// var API_KEY = "IAVQBBDOQQ";
var API_KEY = "IZHBRKKFDW";

europeana.query = function(fromYear, toYear, fromLat, fromLon, toLat, toLon,
		startPage) {
	return "http://acceptance.europeana.eu/api/opensearch.json?" + "wskey="
			+ API_KEY + "&startPage=" + startPage + "&searchTerms="
			+ "enrichment_period_begin%3A[" + fromYear
			+ "-01-01T00%3A00%3A00Z+TO+" + toYear
			+ "-01-01T23%3A59%3A59Z]+AND+" + "enrichment_period_end%3A["
			+ fromYear + "-01-01T00%3A00%3A00Z+TO+" + toYear
			+ "-01-01T23%3A59%3A59Z]" + "enrichment_place_latitude%3A["
			+ fromLat + "+TO+" + toLat + "]+AND+"
			+ "enrichment_place_longitude%3A[" + fromLon + "+TO+" + toLon + "]";
}

europeana.main = function() {
	var el = document.getElementById('s1');
	var s = new goog.ui.TwoThumbSlider;
	s.decorate(el);
	s.addEventListener(goog.ui.Component.EventType.CHANGE, function() {
		document.getElementById('out1').innerHTML = 'start: ' + s.getValue()
				+ ' end: ' + (s.getValue() + s.getExtent());
	});
	
	// Initialize the WebGL Earth
	europeana.weapp.run();

	// JSONP Europeana query codes sample
	// var jsonp = new goog.net.Jsonp(europeana.query(0, 2010, 0, -20, 80, 110, 1));
	// jsonp.send({}, function(data) { alert(data); });
}

window['main'] = europeana.main;
