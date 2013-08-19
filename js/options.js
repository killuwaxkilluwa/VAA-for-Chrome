 var bgPage = chrome.extension.getBackgroundPage();
 jQuery(function ($) {
 	initUI();
 	set();
 	$("#apply").on("click", function (event) {
 		save();
 	});
 	$("#close").on("click", function (event) {
 		closeOptionsPage();
 	});
 	$("#revoke").on("click", function (event) {
 		logout();
 	});

 	$('#refresh_rate').change(function () {
 		console.log($(this).val());
 		localStorage.refreshRate = $(this).val();
 		bgPage.refreshRate = localStorage.refreshRate;
 		bgPage.pollIntervalMin = bgPage.refreshRate * 1000;
 	});

 	$('#Dic').change(function () {
 		var lang = $.trim($('#Dic').val());
 		if (lang == "Dict")
 			document.getElementById("lg").disabled = true;
 		else
 			document.getElementById("lg").disabled = false;
 	});

 });

 getMessage = function () {
 	if (localStorage["service"] == "Google SpreadSheet" && localStorage["oauth_tokenhttps://docs.google.com/feeds%20https://spreadsheets.google.com/feeds"]) {
 		var revokeOAuth_Key = chrome.i18n.getMessage("revokeOAuthKey");
 	} else if (localStorage["trello_token"]) {
 		var revokeOAuth_Key = chrome.i18n.getMessage("TrelloRevokeOAuthKey");
 	} else {
 		var revokeOAuth_Key = chrome.i18n.getMessage("UndefinedRevokeOAuthKey");
 		$('#revoke').get(0).disabled = true;
 	}
 	var refreshRate_Key = chrome.i18n.getMessage("refreshRateKey");
 	var mouseModifier_Key = chrome.i18n.getMessage("mouseModifierKey");
 	var captureDictServer_Key = chrome.i18n.getMessage("captureDictServerKey");
 	var quickSearch_Key = chrome.i18n.getMessage("quickSearchKey");
 	var targetLanguage_Key = chrome.i18n.getMessage("targetLanguageKey");
 	var applyButton_Key = chrome.i18n.getMessage("applyButtonKey");
 	var closeButton_Key = chrome.i18n.getMessage("closeButtonKey");

 	document.getElementById("revokeOAuthKey").innerHTML = revokeOAuth_Key;
 	document.getElementById("refreshRateKey").innerHTML = refreshRate_Key;
 	document.getElementById("mouseModifierKey").innerHTML = mouseModifier_Key;
 	document.getElementById("captureDictServerKey").innerHTML = captureDictServer_Key;
 	document.getElementById("QuickSearchKey").innerHTML = quickSearch_Key;
 	document.getElementById("targetLanguageKey").innerHTML = targetLanguage_Key;
 	document.getElementById("applyButtonKey").innerHTML = applyButton_Key;
 	document.getElementById("closeButtonKey").innerHTML = closeButton_Key;
 }

 function logout() {
 	if (localStorage["service"] == "Google SpreadSheet") {
 		bgPage.logout();
 		localStorage.clear();
 		$('#revoke').get(0).disabled = true;

 	}
 	if (localStorage["service"] == "Trello") {
 		bgPage.setIcon({
 			'text' : ''
 		});
 		localStorage.clear();
 		$('#revoke').get(0).disabled = true;
 		var revokeOAuth_Key = chrome.i18n.getMessage("UndefinedRevokeOAuthKey");
 	}
 }

 function initUI() {
 	getMessage();
 	console.log(bgPage.refreshRate);
 	if (localStorage.refreshRate) {
 		$('#refresh_rate').val(localStorage.refreshRate);
 	} else {
 		$('#refresh_rate').val(bgPage.refreshRate);
 	}

 }

 function save() {
 	var b = $.trim($('#sc1').val());
 	var e = $.trim($('#sc2').val());
 	var dic = $.trim($('#Dic').val());
 	var language = $.trim($('#lg').val());
 	var qks = $.trim($('#qks').val());
 	var h = (b == "Shift" || e == "Shift") ? true : false;
 	var i = (b == "Ctrl" || e == "Ctrl") ? true : false;
 	var a = (b == "Alt" || e == "Alt") ? true : false;
 	var qki = (qks == "Ctrl") ? true : false;
 	var qka = (qks == "Alt") ? true : false;

 	var allNone = false;
 	if ((b == "none") && (e == "none"))
 		allNone = true;
 	myport = chrome.extension.connect({
 			name : "wordterminate"
 		});
 	myport.postMessage({
 		message : "options",
 		Shift : h,
 		Ctrl : i,
 		Alt : a,
 		Dic : dic,
 		Lg : language,
 		QkCtrl : qki,
 		QkAlt : qka,
 		AllNone : allNone
 	});
 }
 function set() {
 	var a = localStorage.getItem("sk"),
 	d = localStorage.getItem("ck"),
 	b = localStorage.getItem("ak"),
 	dic = localStorage.getItem("dic"),
 	lg = localStorage.getItem("lg"),
 	qkd = localStorage.getItem("qkck"),
 	qkb = localStorage.getItem("qkak"),
 	allNone = localStorage.getItem("allNone");
 	var i;
 	if ((a == "true") && (d == "false") && (b == "false")) {
 		document.options.sc2[1].selected = true;
 	} else if ((d == "true") && (a == "false") && (b == "false")) {
 		document.options.sc2[0].selected = true;
 	} else if ((b == "true") && (a == "false") && (d == "false")) {
 		document.options.sc2[2].selected = true;
 	} else if ((a == "true") && (d == "true")) {
 		document.options.sc1[1].selected = true;
 		document.options.sc2[0].selected = true
 	} else if ((a == "true") && (b == "true")) {
 		document.options.sc1[1].selected = true;
 		document.options.sc2[2].selected = true
 	} else if ((d == "true") && (b == "true")) {
 		document.options.sc1[2].selected = true;
 		document.options.sc2[2].selected = true
 	} else if (allNone == "true") {
 		document.options.sc2[3].selected = true;
 	}
 	if (qkd == "true") {
 		document.options.qks[0].selected = true;
 	} else if (qkb == "true") {
 		document.options.qks[1].selected = true;
 	}

 	document.options.Dic[0].selected = true;
 	//document.getElementById("lg").disabled = true;
 	for (i = 0; i < document.options.lg.length; i++)
 		if (document.options.lg[i].value == lg)
 			document.options.lg[i].selected = true;
 }

 function closeOptionsPage() {
 	myport = chrome.extension.connect({
 			name : "wordterminate"
 		});
 	myport.postMessage({
 		message : "close"
 	});
 }