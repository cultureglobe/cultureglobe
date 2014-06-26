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
 * @define {number} Number of records to load per each request.
 */
cultureglobe.DATA_PAGE_LENGTH = 12;



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

  this.we = new WebGLEarth('earth', {
    //'proxyHost': 'http://srtm.webglearth.com/cgi-bin/corsproxy.fcgi?url=',
    'sky': false
  });

  var mapM = this.we['initMap'](WebGLEarth['Maps']['MAPQUEST']);
  this.we['setBaseMap'](mapM);
  this.we['setPosition'](36, 15, undefined, 4000000, undefined, 27);

  this.startPage = 0;
  this.timer = null;
  this.payload = '';

  this.markers = [];

  this.initListeners_();
};


/**
 * @private
 */
cultureglobe.Main.prototype.initListeners_ = function() {
  goog.events.listen(this.slider, goog.events.EventType.CHANGE,
      function(e) {
        this.out1El.innerHTML = 'start: ' + this.slider.getValue() + ' end: ' +
            (this.slider.getValue() + this.slider.getExtent());
        this.makeQuery();
      }, false, this);

  goog.events.listen(this.inputEl, goog.events.EventType.CHANGE, function(e) {
    this.makeQuery();
  }, false, this);

  goog.events.listen(this.periodEl, goog.events.EventType.CHANGE, function(e) {
    var p = this.periodEl.value;
    var period_start = parseInt(p.replace(/.*\(/g, '').replace(/-.*/g, ''), 10);
    period_start = goog.math.clamp(period_start, 1750, 2010);
    var period_end = parseInt(p.replace(/\)/g, '').replace(/.*-/g, ''), 10);
    period_end = goog.math.clamp(period_end, 1750, 2010);

    this.slider.setValue(period_start);
    this.slider.setExtent(period_end - period_start);
  }, false, this);

  goog.events.listen(this.results1El, goog.events.EventType.CLICK, function(e) {
    this.startPage++;
    this.makeQuery(true);
    e.preventDefault();
    e.stopPropagation();
  }, false, this);
};


/**
 * @param {boolean=} opt_merge
 */
cultureglobe.Main.prototype.makeQuery = function(opt_merge) {
  if (opt_merge !== true) this.startPage = 0;

  goog.style.setElementShown(this.loadingEl, true);

  // This function is called often (while typing) - throttling is needed
  // If the timer has a waiting query, then trash it and create new one

  if (this.timer) {
    goog.Timer.clear(this.timer);
    this.timer = null;
  }

  var doQuery = goog.bind(function() {
    var jsonp = new goog.net.Jsonp(
        cultureglobe.EUROPEANA_API_URL + this.payload);
    jsonp.send({}, goog.bind(this.displayResults, this));
  }, this);

  var minYear = this.slider.getValue(),
      maxYear = minYear + this.slider.getExtent(),
      minLat = 0, minLon = -20, maxLat = 80, maxLon = 110;

  var q = '&rows=' + cultureglobe.DATA_PAGE_LENGTH +
          '&query=europeana_type:*IMAGE*';
  if (this.inputEl.value) q += '+AND+' + this.inputEl.value;
  q += '&qf=YEAR:[' + minYear + '+TO+' + maxYear + ']' +
       '&qf=pl_wgs84_pos_lat:[' + minLat + '+TO+' + maxLat + ']' +
       '&qf=pl_wgs84_pos_long:[' + minLon + '+TO+' + maxLon + ']';

  this.payload = '?wskey=' + cultureglobe.EUROPEANA_API_KEY + q +
      '&start=' + (this.startPage * cultureglobe.DATA_PAGE_LENGTH + 1);
  //window['console']['log'](this.payload);

  if (this.startPage == 0) {
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
  //window['console']['log'](data);

  var items = /** @type {?Array.<Object>} */(data['items']);

  if (this.startPage == 0 && items) {
    var minlat = 90, minlon = 180, maxlat = -90, maxlon = -180;
    goog.array.forEach(items, function(item) {
      var lat = item['edmPlaceLatitude'], lon = item['edmPlaceLongitude'];
      if (lat && lon) {
        lat = parseFloat(lat[lat.length - 1]);
        lon = parseFloat(lon[lon.length - 1]);
        minlat = Math.min(minlat, lat);
        maxlat = Math.max(maxlat, lat);
        minlon = Math.min(minlon, lon);
        maxlon = Math.max(maxlon, lon);
      }
    });
    //window['console']['log'](minlat, maxlat, minlon, maxlon);
    this.we['flyToFitBounds'](minlat, maxlat, minlon, maxlon);
  }

  this.addMarkers(items, (this.startPage > 0));

  this.timer = null;
  goog.style.setElementShown(this.loadingEl, false);
  if (/** @type {number} */(data['totalResults']) -
      (this.startPage + 1) * cultureglobe.DATA_PAGE_LENGTH > 0) {
    goog.style.setElementShown(this.results1El, true);
    goog.style.setElementShown(this.results2El, false);
    this.results1El.innerHTML =
        'Load more from ' + data['totalResults'] + ' results...';
  } else {
    goog.style.setElementShown(this.results1El, false);
    goog.style.setElementShown(this.results2El, true);
    if (data['totalResults'] == 0)
      this.results2El.innerHTML = 'No records found.';
    else
      this.results2El.innerHTML =
          'All ' + data['totalResults'] + ' records loaded.';
  }
};


/**
 * @param {?Array.<Object>} items The items.
 * @param {boolean} merge Merge the new results with existing results?
 */
cultureglobe.Main.prototype.addMarkers = function(items, merge) {
  if (merge !== true) {
    goog.array.forEach(this.markers, function(el, i, arr) {
      this.we['removeMarker'](el);
    }, this);
    this.markers = [];
  }

  if (!items) return;

  // Iterate on the JSON and add new results
  goog.array.forEach(items, function(item) {
    if (!item['edmPreview']) return; // skip items without thumbnail

    var lat = item['edmPlaceLatitude'], lon = item['edmPlaceLongitude'];
    if (!lat || !lon) return; // skip items without geotags (should not happen)

    lat = parseFloat(lat[lat.length - 1]);
    lon = parseFloat(lon[lon.length - 1]);

    var m = this.createMarker(lat, lon, item['edmPreview'], item['guid'],
        goog.string.unescapeEntities((item['title'] || [''])[0]),
        goog.string.unescapeEntities((item['dcCreator'] || [''])[0] +
        ' (' + item['provider'] + ')'));
    this.markers.push(m);
    this.we['initMarker'](m);
  }, this);

};



/**
 * @param {number} lat
 * @param {number} lon
 * @param {string} image
 * @param {string} url
 * @param {string} title
 * @param {string} institution
 * @return {!Object}
 * @constructor
 */
cultureglobe.Main.prototype.createMarker =
    function(lat, lon, image, url, title, institution) {
  var content = goog.dom.createDom('div', {'class': 'makertitle'},
                    goog.dom.createTextNode(title),
                    goog.dom.createDom('div', {'style': 'color:#ccc'},
                        goog.dom.createTextNode(institution)
                    )
                );
  var el = goog.dom.createDom('a',
      {'class': 'marker', 'href': url, 'target': '_blank'},
      goog.dom.createDom('img', {'src': image}),
      content);

  return new WebGLEarth['CustomMarker'](
      goog.math.toRadians(lat),
      goog.math.toRadians(lon),
      el);
};

goog.exportSymbol('Main', cultureglobe.Main);
