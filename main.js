goog.provide('europeana.main');

goog.require('goog.dom');
goog.require('goog.text.LoremIpsum');

europeana.main = function() {
  var newHeader = goog.dom.createDom('h1', {'style': 'background-color:#EEE'},
    'Hello world!');
  goog.dom.appendChild(document.body, newHeader);

  var generator = new goog.text.LoremIpsum();
  var newContent = goog.dom.createDom('div', {}, generator.generateParagraph(true));
  goog.dom.appendChild(document.body, newContent);
}

window['main'] = europeana.main;
