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
cultureglobe.DATA_PAGE_LENGTH = 16;



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
  this.byAreaEl = goog.dom.getElement('byareacheckbox');

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

  this.areaQueryingTimer = new goog.Timer(750);
  this.lastQueriedArea = [0, 0, 0, 0];
  this.lastQueriedAreaStableFor = 0;

  this.initListeners_();
  this.handleHash_();
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

  goog.events.listen(this.byAreaEl, goog.events.EventType.CHANGE,
                     this.handleByAreaChange_, false, this);

  goog.events.listen(this.areaQueryingTimer, goog.Timer.TICK, function(e) {
    if (this.checkBounds()) {
      this.makeQuery();
    }
  }, false, this);
};


/**
 * @private
 */
cultureglobe.Main.prototype.handleByAreaChange_ = function() {
  if (this.byAreaEl.checked) {
    this.checkBounds();
    this.areaQueryingTimer.start();
  } else {
    this.areaQueryingTimer.stop();
  }
  this.makeQuery();
};


/**
 * @private
 */
cultureglobe.Main.prototype.handleHash_ = function() {
  /**
   * @type {string}
   * @private
   */
  this.lastCreatedHash_ = '';

  var updateHash = goog.bind(function() {
    var pos = this.we['getPosition']();
    var newhash = '#q=' + this.inputEl.value +
        ';from=' + this.slider.getValue() +
        ';to=' + (this.slider.getValue() + this.slider.getExtent()) +
        ';byarea=' + (this.byAreaEl.checked ? '1' : '0') +
        ';ll=' + pos[0].toFixed(5) + ',' + pos[1].toFixed(5) +
        ';alt=' + this.we['getAltitude']().toFixed(0);
    var head = this.we['getHeading'](), tilt = this.we['getTilt']();
    if (Math.abs(head) > 0.001) newhash += ';h=' + head.toFixed(3);
    if (Math.abs(tilt) > 0.001) newhash += ';t=' + tilt.toFixed(3);
    if (window.location.hash.toString() != newhash) {
      this.lastCreatedHash_ = newhash;
      window.location.hash = newhash;
    }
  }, this);

  var parseHash = goog.bind(function() {
    if (window.location.hash == this.lastCreatedHash_) return;
    var params = window.location.hash.substr(1).split(';');
    var getValue = function(name) {
      name += '=';
      var pair = goog.array.find(params, function(el, i, a) {
        return el.indexOf(name) === 0;});

      if (goog.isDefAndNotNull(pair)) {
        var value = pair.substr(name.length);
        if (value.length > 0)
          return value;
      }
      return undefined;
    };

    var q = getValue('q'), from = getValue('from'),
        to = getValue('to'), byarea = getValue('byarea');
    if (goog.isDefAndNotNull(q)) this.inputEl.value = q;
    if (goog.isDefAndNotNull(from)) {
      this.slider.setValue(parseFloat(from));
      if (goog.isDefAndNotNull(to))
        this.slider.setExtent(parseFloat(to) - parseFloat(from));
    }
    if (goog.isDefAndNotNull(byarea)) {
      this.byAreaEl.checked = byarea == '1' ? true : false;
      this.handleByAreaChange_();
    }

    var ll = getValue('ll'), altitude = getValue('alt');
    var heading = getValue('h'), tilt = getValue('t');
    if (goog.isDefAndNotNull(ll)) {
      var llsplit = ll.split(',');
      if (llsplit.length > 1 && !isNaN(llsplit[0]) && !isNaN(llsplit[1])) {
        if (!altitude || isNaN(altitude)) altitude = 4000000;
        if (!tilt || isNaN(tilt)) tilt = 0;
        if (!heading || isNaN(heading)) heading = 0;
        this.we['setPosition'](parseFloat(llsplit[0]), parseFloat(llsplit[1]),
                               undefined, parseFloat(altitude),
                               parseFloat(heading), parseFloat(tilt));
      }
    }

    this.checkBounds();
    this.makeQuery();
  }, this);

  /**
   * @type {!goog.Timer}
   */
  this.hashUpdateTimer = new goog.Timer(2000);
  goog.events.listen(this.hashUpdateTimer, goog.Timer.TICK, updateHash);
  this.hashUpdateTimer.start();

  goog.events.listen(window, goog.events.EventType.HASHCHANGE, parseHash);

  parseHash();
};


/**
 * @return {boolean} Did the bounds change?
 */
cultureglobe.Main.prototype.checkBounds = function() {
  var bnds = this.we['getBounds'](undefined, 7);
  var stable = false;
  if (bnds && this.lastQueriedArea) {
    stable = goog.math.nearlyEquals(this.lastQueriedArea[0], bnds[0], 0.0001) &&
             goog.math.nearlyEquals(this.lastQueriedArea[1], bnds[1], 0.0001) &&
             goog.math.nearlyEquals(this.lastQueriedArea[2], bnds[2], 0.0001) &&
             goog.math.nearlyEquals(this.lastQueriedArea[3], bnds[3], 0.0001);
  }
  this.lastQueriedArea = bnds;
  return !stable;
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
      minLat = 10, minLon = -20, maxLat = 80, maxLon = 110;

  if (this.byAreaEl.checked) {
    if (!this.lastQueriedArea) {
      return;
    }
    minLat = Math.max(minLat, this.lastQueriedArea[0]);
    maxLat = Math.min(maxLat, this.lastQueriedArea[1]);
    minLon = Math.max(minLon, this.lastQueriedArea[2]);
    maxLon = Math.min(maxLon, this.lastQueriedArea[3]);
  }
  //window['console']['log'](minLat, minLon, maxLat, maxLon);

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

  if (this.startPage == 0 && items && !this.byAreaEl.checked) {
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
