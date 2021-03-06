﻿var util = {};
/**
 * Sets up a future poll for the user's document list.
 */
util.scheduleRequest = function() {
  var exponent = Math.pow(2, requestFailureCount);
  var delay = Math.min(bgPage.pollIntervalMin * exponent,
                       pollIntervalMax);
  delay = Math.round(delay);
  console.log("delay" + delay);
  if (bgPage.oauth.hasToken()) {
    var req = bgPage.window.setTimeout(function() {
      gwords.getWordList();
      util.scheduleRequest();
    }, delay);
    bgPage.requests.push(req);
  }
  
};

/**
 * Urlencodes a JSON object of key/value query parameters.
 * @param {Object} parameters Key value pairs representing URL parameters.
 * @return {string} query parameters concatenated together.
 */
util.stringify = function(parameters) {
  var params = [];
  for(var p in parameters) {
    params.push(encodeURIComponent(p) + '=' +
                encodeURIComponent(parameters[p]));
  }
  return params.join('&');
};

/**
 * Creates a JSON object of key/value pairs
 * @param {string} paramStr A string of Url query parmeters.
 *    For example: max-results=5&startindex=2&showfolders=true
 * @return {Object} The query parameters as key/value pairs.
 */
util.unstringify = function(paramStr) {
  var parts = paramStr.split('&');

  var params = {};
  for (var i = 0, pair; pair = parts[i]; ++i) {
    var param = pair.split('=');
    params[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
  }
  return params;
};

/**
 * Utility for displaying a message to the user.
 * @param {string} msg The message.
 */
util.displayMsg = function(msg) {
  $('#butter').removeClass('error').text(msg);
  $('#butter').show();
};

/**
 * Utility for removing any messages currently showing to the user.
 */
util.hideMsg = function() {
  $('#butter1').hide(0);
};

/**
 * Utility for displaying an error to the user.
 * @param {string} msg The message.
 */
util.displayError = function(msg) {
  util.displayMsg(msg);
  $('#butter').addClass('error');
};

//加载数据滚动条
util.loadingDataPic = function(){
	$('#butter1').css({
		'background-color' : 'transparent',
		'background-image' : 'url("img/loader.gif")',
		'background-repeat' : 'no-repeat',
		'background-position' : 'center',
		'width' : '100px',
		'margin-right' : '115px',
		'margin-top' : '20px',
		'margin-bottom' : '20px'
	}).show();
	$('#butter1').text("");
}


util.array_diff = function(array1, array2) {
	var o = {}; //转成hash可以减少运算量，数据量越大，优势越明显。
	for (var i = 0, len = array2.length; i < len; i++) {
		o[array2[i]] = true;
	}

	var result = [];
	for (i = 0, len = array1.length; i < len; i++) {
		var v = array1[i];
		if (o[v])
			continue;
		result.push(v);
	}
	return result;
}