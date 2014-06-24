/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 * @author petr.pridal@klokantech.com (Petr Pridal)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('cultureglobe.Main');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.Jsonp');
goog.require('goog.style');
goog.require('goog.ui.TwoThumbSlider');


/**
 * @define {string} Europeana API key
 */
cultureglobe.EUROPEANA_API_URL = 'http://www.europeana.eu/api/v2/search.json';


/**
 * @define {string} Europeana API key
 */
cultureglobe.EUROPEANA_API_KEY = 'ymDLchp8i';



/**
 * @constructor
 */
cultureglobe.Main = function() {
  this.loadingEl = goog.dom.getElement('loading');
  this.results1El = goog.dom.getElement('results1');
  this.results2El = goog.dom.getElement('results2');
  this.sliderEl = goog.dom.getElement('s1');
  this.out1El = goog.dom.getElement('out1');
  this.inputEl = goog.dom.getElement('q');
  this.periodEl = goog.dom.getElement('period');

  goog.style.setElementShown(this.loadingEl, false);
  goog.style.setElementShown(this.results1El, false);
  goog.style.setElementShown(this.results2El, false);

  this.slider = new goog.ui.TwoThumbSlider();
  this.slider.decorate(this.sliderEl);
  this.slider.setMinimum(1750);
  this.slider.setMaximum(2010);
  this.slider.setExtent(260);
  this.slider.setStep(5);
  this.slider.setMoveToPointEnabled(true);

  this.we = new window['WebGLEarth']('earth', {
    //'proxyHost': 'http://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url=',
    'sky': false,
    'position': [47.2, 8.5],
    'altitude': 7000000
  });

  var mapM = this.we['initMap'](window['WebGLEarth']['Maps']['MAPQUEST']);
  this.we['setBaseMap'](mapM);

  this.startPage = 1;
  this.timer = null;
  this.payload = {};

  this.initListeners_();
};


/**
 * @private
 */
cultureglobe.Main.prototype.initListeners_ = function() {
  /*
  slider.addEventListener(goog.ui.Component.EventType.CHANGE, function() {
    document.getElementById('out1').innerHTML = 'start: ' + slider.getValue()
        + ' end: ' + (slider.getValue() + slider.getExtent());
  });

  goog.events.listen(slider, goog.ui.Component.EventType.CHANGE, function() {
    this.makeQuery();
  });
  */

  goog.events.listen(this.inputEl, goog.events.EventType.CHANGE, function(e) {
    this.makeQuery();
  }, false, this);


  //goog.events.listen(this.periodEl, goog.ui.Component.EventType.CHANGE,
  //    function() {
  //  var period = goog.dom.getElement('period').value;
  //  var period_start = period.replace(/.*\(/g, '');
  //  period_start = period_start.replace(/-.*/g, '');
  //  var period_end = period.replace(/\)/g, '');
  //  period_end = period_end.replace(/.*-/g, '');
  //  if (parseInt(period_start) < 1750) {
  //    period_start = 1750;
  //  }
  //  if (parseInt(period_end) > 2010) {
  //    period_end = 2010;
  //  }
  //  slider.setValue(parseInt(period_start));
  //  slider.setExtent(parseInt(period_end)-parseInt(period_start));
  //});

  /*
  goog.events.listen(goog.dom.getElement('results1'),
      goog.events.EventType.CLICK, function(e) {
    e.preventDefault();
    startPage++;
    this.makeQuery(true);
  });
  */
};


/**
 * @param {boolean=} opt_merge
 */
cultureglobe.Main.prototype.makeQuery = function(opt_merge) {
  if (opt_merge !== true) this.startPage = 1;

  goog.style.setElementShown(this.loadingEl, true);

  // This function is called often (while typing) - throttling is needed
  // If the timer has a waiting query, then trash it and create new one

  if (this.timer) {
    goog.Timer.clear(this.timer);
    this.timer = null;
  }

  var doQuery = goog.bind(function() {
    var jsonp = new goog.net.Jsonp(cultureglobe.EUROPEANA_API_URL);
    jsonp.send(this.payload, goog.bind(this.displayResults, this));
  }, this);

  var minYear = this.slider.getValue(),
      maxYear = minYear + this.slider.getExtent(),
      minLat = 0, minLon = -20, maxLat = 80, maxLon = 110;

  var pl = {};
  pl['wskey'] = cultureglobe.EUROPEANA_API_KEY;
  pl['startPage'] = this.startPage;
  var q = 'europeana_type:*IMAGE*+AND+';
  if (this.inputEl.value) q += this.inputEl.value + '+AND+';
  q += 'enrichment_period_begin:[' +
       minYear + '-01-01T00:00:00Z+TO+' + maxYear + '-01-01T23:59:59Z]+AND+' +
       'enrichment_period_end:[' +
       minYear + '-01-01T00:00:00Z+TO+' + maxYear + '-01-01T23:59:59Z]+AND+' +
       'pl_wgs84_pos_lat:[' + minLat + '+TO+' + maxLat + ']+AND+' +
       'pl_wgs84_pos_long:[' + minLon + '+TO+' + maxLon + ']';
  pl['query'] = q;
  this.payload = pl;

  if (this.startPage == 1) {
    // Don't proceed with the JSONP query immediatelly,
    // but wait for 500 ms if the user doesn't make a new one.
    this.timer = goog.Timer.callOnce(doQuery, 500, this);
  } else {
    // consequent results are immediate
    doQuery();
  }
};


/**
 * @param {!Object.<string, *>} data
 */
cultureglobe.Main.prototype.displayResults = function(data) {
  window['console']['log'](data);
  /*
  if (this.startPage == 1) {
    var minlat = 90;
    var minlon = 180;
    var maxlat = -90;
    var maxlon = -180;
    goog.array.forEach(data['items'], function(item) {
      minlat = Math.min(minlat, item['enrichment:place_latitude']);
      maxlat = Math.max(maxlat, item['enrichment:place_latitude']);
      minlon = Math.min(minlon, item['enrichment:place_longitude']);
      maxlon = Math.max(maxlon, item['enrichment:place_longitude']);
    });
    europeana.weapp.flyToFitBounds(minlat, maxlat, minlon, maxlon);
  }

  europeana.weapp.addMarkers(data, (startPage !== 1));
  timer = null;
  goog.style.showElement( goog.dom.getElement('loading'), false );
  if (data['totalResults'] - data['startIndex'] - data['itemsPerPage'] > 0) {
    goog.style.showElement( goog.dom.getElement('results1'), true );
    goog.style.showElement( goog.dom.getElement('results2'), false );
    goog.dom.getElement('results1').innerHTML =
        "Load more from " + data['totalResults'] + " results...";
  } else {
    goog.style.showElement( goog.dom.getElement('results1'), false );
    goog.style.showElement( goog.dom.getElement('results2'), true );
    if (data['totalResults'] == 0)
      goog.dom.getElement('results2').innerHTML = "No records found.";
    else
      goog.dom.getElement('results2').innerHTML =
          "All " + data['totalResults'] + " records loaded.";
  }
  */
};


goog.exportSymbol('Main', cultureglobe.Main);
