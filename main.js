goog.provide('europeana.main');

goog.require('goog.ui.Component');
goog.require('goog.ui.TwoThumbSlider');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.Jsonp');

goog.require('europeana.weapp');

// var API_KEY = "IAVQBBDOQQ";
var API_KEY = "IZHBRKKFDW";

var timer;
var slider;
var searchField;

europeana.makeQuery = function() {
	// This function is called onChange events and while typing - it makes the throttling well
 
	// If the timer has a waiting query, then trash it - it is obsolute, because we have a new one
	if (timer) {
		goog.Timer.clear(timer);
		timer = null;
	}
 
	// Don't proceed with the JSONP query immediatelly, but wait for 500 ms if the user doesn't make a new one.
	var jsonp = new goog.net.Jsonp(europeana.query(searchField.value, slider.getValue(), (slider.getValue() + slider.getExtent()), 0, -20, 80, 110, 1));
		
	timer = goog.Timer.callOnce(function() {
		jsonp.send({}, function(data) { console.log(data); timer = null; });		
		/*
		if (!dragging) {
    
		// Remove old results
    	goog.dom.removeChildren( goog.dom.$('sidecanvas') );
    	activeRecord = null;
    
    	nextIndex = result['next_index'];

    	// Iterate on the JSON and add new results
    	goog.array.forEach(result['records'], addResult );
    
		
		// Stop the timer
		timer = null;
	}*/
	}, 500);
}

europeana.query = function(term, fromYear, toYear, fromLat, fromLon, toLat, toLon,
		startPage) {
	
	var q = "http://acceptance.europeana.eu/api/opensearch.json?" + "wskey="
			+ API_KEY + "&startPage=" + startPage + "&searchTerms=";
	
	if (term)
		q += term + "+AND+";
			
	q +=  "europeana_type:*IMAGE*+AND+"
			+ "enrichment_period_begin%3A[" + fromYear
			+ "-01-01T00%3A00%3A00Z+TO+" + toYear
			+ "-01-01T23%3A59%3A59Z]+AND+" + "enrichment_period_end%3A["
			+ fromYear + "-01-01T00%3A00%3A00Z+TO+" + toYear
			+ "-01-01T23%3A59%3A59Z]" + "enrichment_place_latitude%3A["
			+ fromLat + "+TO+" + toLat + "]+AND+"
			+ "enrichment_place_longitude%3A[" + fromLon + "+TO+" + toLon + "]";
	
	return q;
}

europeana.main = function() {
	var el = document.getElementById('s1');
	slider = new goog.ui.TwoThumbSlider;
	slider.decorate(el);
	slider.setMinimum(1750);
	slider.setMaximum(2010);
	slider.setExtent(260);
	slider.setStep(5);
	slider.addEventListener(goog.ui.Component.EventType.CHANGE, function() {
		document.getElementById('out1').innerHTML = 'start: ' + slider.getValue()
				+ ' end: ' + (slider.getValue() + slider.getExtent());
	});
	
	goog.events.listen(slider, goog.ui.Component.EventType.CHANGE, function() { 
		europeana.makeQuery();
	});
	
	searchField = document.getElementById('q');
	goog.events.listen(searchField, goog.ui.Component.EventType.CHANGE, function() {
		// var jsonp = new goog.net.Jsonp(europeana.query(searchField.value, s.getValue(), (s.getValue() + s.getExtent()), 0, -20, 80, 110, 1));
		// jsonp.send({}, function(data) { console.log(data); });
		europeana.makeQuery();
	});
	
 	goog.events.listen(goog.dom.getElement('period'), goog.ui.Component.EventType.CHANGE, function() {
		var period = goog.dom.getElement('period').value;
		var period_start = period.replace(/.*\(/g, '');
		period_start = period_start.replace(/-.*/g, '');
		var period_end = period.replace(/\)/g, '');
		period_end = period_end.replace(/.*-/g, '');
		if (parseInt(period_start) < 1750) {
			period_start = 1750;
		}
		if (parseInt(period_end) > 2010) {
			period_end = 2010;
		}
		slider.setValue(parseInt(period_start));
		slider.setExtent(parseInt(period_end)-parseInt(period_start));
	});
	// Initialize the WebGL Earth
	europeana.weapp.run();
}

window['main'] = europeana.main;
