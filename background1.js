﻿      //google.load("language", "1");
      //var g_stress_mark = String.fromCharCode(712);
      //var d_stress_mark = String.fromCharCode(39);

      var DOCLIST_SCOPE = 'https://docs.google.com/feeds';
      var DOCLIST_FEED = DOCLIST_SCOPE + '/default/private/full/';
      var SPRLIST_SCOPE = 'https://spreadsheets.google.com/feeds';
      var SPRLIST_FEED = SPRLIST_SCOPE + '/spreadsheets/private/full/';

      var words = []; // In memory cache for the user's entire wordlist.
      var refreshRate = localStorage.refreshRate || 300; // 5 min default.
      var pollIntervalMin = 1000 * refreshRate;
      var requests = [];

      var wordListName = localStorage.spreadsheetName || 'MyWordtest6';
      var wordslistFeed = localStorage.vocabularyListFeed;
      var vocabularyLink = localStorage.vocabularyLink;
      var wordslistAtom = localStorage.wordslistAtom;

      /* if (localStorage["service"] == "Google SpreadSheet") {

      var oauth = ChromeExOAuth.initBackgroundPage({
      'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
      'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
      'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
      'consumer_key': 'anonymous',
      'consumer_secret': 'anonymous',
      'scope': DOCLIST_SCOPE + ' ' + SPRLIST_SCOPE,
      'app_name': 'VAA'
      });
      }*/

      var bingAppId = 'E31EE8C8CFD0CD0D618059BFC90E17AB4464CE44';
      var flickrAppKey = '329f9136f1d1d0cdfdd3e476b2824fe2';

      function setIcon(opt_badgeObj) {
      	if (opt_badgeObj) {
      		var badgeOpts = {};
      		if (opt_badgeObj && opt_badgeObj.text != undefined) {
      			badgeOpts['text'] = opt_badgeObj.text;
      		}
      		if (opt_badgeObj && opt_badgeObj.tabId) {
      			badgeOpts['tabId'] = opt_badgeObj.tabId;
      		}
      		chrome.browserAction.setBadgeText(badgeOpts);
      	}
      };

      function clearPendingRequests() {
      	for (var i = 0, req; req = requests[i]; ++i) {
      		window.clearTimeout(req);
      	}
      	requests = [];
      };

      function logout() {
      	words = [];
      	setIcon({
      		'text' : ''
      	});
      	oauth.clearTokens();
      	clearPendingRequests();
      };

      chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
      
      	if (request.type == 'currentstate') {
      		sendResponse({
      			result : localStorage["board_id"]
      		});
      	}
      });

      var gwords = {};
      gwords.constructAtomXml_ = function (wordTitle, phonetic, translation, wordLevels) {
      	var atom = ['<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">',
      		'<gsx:words>', wordTitle, '</gsx:words>',
      		'<gsx:levels>', wordLevels, '</gsx:levels>',
      		'<gsx:phonetics>[', phonetic, ']</gsx:phonetics>',
      		'<gsx:translations>', translation, '</gsx:translations>',
      		'</entry>'].join('');
      	return atom;
      };

      gwords.constructContentBody_ = function (title, phonetic, translation, wordLevels) {
      	var body = [
      		gwords.constructAtomXml_(title, phonetic, translation, wordLevels), '\r\n',
      	].join('');
      	return body;
      };

      function addCard(idList, word, result) {
      	//var body = constructTrelloBody(word, phonetic, translation, example, mp3);
      	$.post("https://api.trello.com/1/cards/", {
      		name : word,
      		desc : result,
      		idList : idList,
      		key : "d8b28623f3171a9dbc870738cd5f6926",
      		token : localStorage["trello_token"]
      	}, function (card) {
		//图片模式暂时去掉
      		/*$.post("https://api.trello.com/1/cards/" + card.id + "/attachments", {
      			url : picurl,
      			name : word,
      			key : "d8b28623f3171a9dbc870738cd5f6926",
      			token : localStorage["trello_token"],
      		});
      	*/
		});
      }

      function addWord(word, result) {
      	//var wordLevels = 3; // set wordValue to the defalt value,     phonetic, translation, example
      	/*if (localStorage["service"] == "Google SpreadSheet") {
      	var handleSuccess = function (resp, xhr) {};
      	var params = {
      	'method' : 'POST',
      	'headers' : {
      	'GData-Version' : '3.0',
      	'Content-Type' : 'application/atom+xml',
      	},
      	'parameters' : {
      	'alt' : 'json'
      	},
      	'body' : gwords.constructContentBody_(word, phonetic, translation, wordLevels)
      	};
      	oauth.sendSignedRequest(wordslistFeed, handleSuccess, params);
      	}*/
      	//if (localStorage["service"] == "Trello") {
      	/*$.ajax({

      	url: 'http://api.bing.net/json.aspx',
      	data: {
      	AppId : 'E31EE8C8CFD0CD0D618059BFC90E17AB4464CE44',
      	Query : word,
      	Sources : 'Image',
      	Version : '2.0',
      	Market : 'en-us',
      	Adult : 'Moderate',
      	JsonType : 'callback'
      	},
      	dataType: 'jsonp',
      	jsonp: 'jsoncallback',
      	jsonpCallback: 'success_jsonpCallback',
      	success : function (response) {
      	alert("sun");
      	var picurl;
      	var results = response.SearchResponse.Image.Results;
      	if (results.length > 0) {
      	picurl = results[5].MediaUrl;
      	}
      	addCard(localStorage["list_id"], word, phonetic, translation, example, picurl);
      	},
      	error:function(){
      	alert('fail');
      	}
      	});*/

      	//}
		//暂时去掉图片模式
		
      	//var xhr = new XMLHttpRequest();
      	//xhr.open("GET", "http://api.bing.net/json.aspx?jsoncallback=vaajsonpCallback&AppId=E31EE8C8CFD0CD0D618059BFC90E17AB4464CE44&Query=" + word + "&Sources=Image&Version=2.0&Market=en-us&Adult=Moderate&JsonType=callback", true);
      	//xhr.onreadystatechange = function () {
      		//if (xhr.readyState == 4) {
      			
      			//var temp = xhr.responseText.split('vaajsonpCallback(');
      			
      			//var temp1 = temp[1].split('/* pageview_candidate */');
      			//var picurl;
      			//var results = JSON.parse(temp1[0]).SearchResponse.Image.Results;
      			//if (results.length > 0) {
      				//picurl = results[5].MediaUrl;
      			//}
				
      			
      			//addCard(localStorage["list_id"], word, phonetic, translation, example, picurl);
				
				addCard(localStorage["list_id"], word, result);
      		//}
      	//}
      	//xhr.send();
      }

      function constructTrelloBody(word, phonetic, translation, example, mp3) {
      	var trelloBody = new Array();
      	//trelloBody.push("#" + word + " ");
      	trelloBody.push("#" + phonetic + "  \n");
      	trelloBody.push("#" + chrome.i18n.getMessage("showWordMeaning") + "#\n");
      	trelloBody.push(translation + "\n");
      	trelloBody.push("#" + chrome.i18n.getMessage("showWordExample") + "#\n");
      	trelloBody.push(example + "\n");
		trelloBody.push("#" + mp3 + "\n");
		//alert(trelloBody.join(''));
      	return getInsertTime(trelloBody.join(''));

      }

      function getInsertTime(desc) {
      	//console.log(desc);
      	var date = new Date();
      	var day = date.getDate();
      	var month = date.getMonth() + 1;
      	var year = date.getFullYear();
      	var hour = date.getHours();
      	var min = date.getMinutes();
      	return desc + "\n# time:" + month + "/" + day + "/" + year + " " + hour + ":" + min + "@0";
      }

      var myport;
      var skTemp = false;
      var ckTemp = true; ;
      var akTemp = false;
      var qckTemp = true; ;
      var qakTemp = false;
	  var lg = "zh";
      if (localStorage.getItem("sk") == "true") {
      	skTemp = true;
      }
      if (localStorage.getItem("ck") == "false") {
      	ckTemp = false;
      }
      if (localStorage.getItem("ak") == "true") {
      	akTemp = true;
      }
      if (localStorage.getItem("qck") == "false") {
      	qckTemp = false;
      }
      if (localStorage.getItem("qak") == "true") {
      	qakTemp = true;
      }
	  if (localStorage.getItem("lg")) {
      	lg = localStorage.getItem("lg");
      }
      var dictionary = "Dict";
      if (localStorage.getItem("dic") == "Google") {
      	dictionary = "Google";
      }
      var txt = "";
      chrome.extension.onConnect.addListener(onPortConnect);
      function onPortConnect(a) {
      	console.log("backgroud onportconnect" + a.name);
      	if (a.name != "wordterminate") {
      		return false;
      	} else {
      		myport = a;
      		a.onMessage.addListener(onMessageRecieved);
      	}
      }
      function onMessageRecieved(a) {
      	if (a.message == "translate") {
      		txt = a.txt;
      		goTrasnlate();
      	} else if (a.message == "select")
      		txt = a.txt;
      	else if (a.message == "options") {
      		skTemp = a.Shift;
      		ckTemp = a.Ctrl;
      		akTemp = a.Alt;
			lg = a.Lg;
      		qckTemp = a.QkCtrl;
      		qakTemp = a.QkAlt;
      		dictionary = a.Dic;
      		localStorage.setItem("sk", a.Shift);
      		localStorage.setItem("ck", a.Ctrl);
      		localStorage.setItem("ak", a.Alt);
      		localStorage.setItem("dic", a.Dic);
      		localStorage.setItem("lg", a.Lg);
      		
			localStorage.setItem("qkck", a.QkCtrl);
			localStorage.setItem("qkak", a.QkAlt);
      		localStorage.setItem("allNone", a.AllNone);
      	} else if (a.message == "currentsc") {
      		myport.postMessage({
      			message : "currentsc",
      			sk : skTemp,
      			ck : ckTemp,
      			ak : akTemp,
      			qck : qckTemp,
      			qak : qakTemp
      		});
      	} else if (a.message == "close") {
      		chrome.tabs.getSelected(null, function (tab) {
      			chrome.tabs.remove(tab.id);
      			return true;
      		});
      	}
      }
      /*
      function name:goTrasnlate
      function use :if the text is an english word,send a xmlHttpRequest to dict and deal with it;else do others
       */
      function goTrasnlate() {
      	if (txt == "")
      		return false;
      	var oneLineTxt = txt.replace(/[\r\n]/g, " ");
      	oneLineTxt = oneLineTxt.replace(/(^\s+)|(\s+$)/g, "");
      	if (oneLineTxt == "")
      		return false;
      	if (/^[a-zA-Z]+$/.test(oneLineTxt)) {
      		if (lg == "zh") {
      			translateEnglishWordByIciba(oneLineTxt.toLowerCase());
				//translateEnglishWordByVaa(oneLineTxt.toLowerCase());
      		} else
      			translateEnglishWordByWordreference(oneLineTxt.toLowerCase(), lg);
      	} else {
      		detectSentence(txt);
      	}
      	txt = "";
      }
	  
	  
      function detectSentence(txt) {
      	$.ajax({
      		url : "http://api.microsofttranslator.com/V2/Ajax.svc/Detect",
      		dataType : "text",
      		data : {
      			appId : bingAppId,
      			text : txt
      		},
      		success : function (response) {
      			var languageFrom = (response == '"en"' ? 'en' : 'zh-CHS');
      			var languageTo = (response == '"en"' ? 'zh-CHS' : 'en');
      			translateSentence(languageFrom, languageTo, txt);

      		}
      	});

      }

      function translateSentence(languageFrom, languageTo, txt) {
      	$.ajax({
      		url : "http://api.microsofttranslator.com/V2/Ajax.svc/Translate",
      		dataType : "text",
      		data : {
      			appId : bingAppId,
      			from : languageFrom,
      			to : languageTo,
      			text : txt
      		},
      		success : function (result) {
      			var buffer = [];
      			buffer.push('<div class="vaa_word">');
      			buffer.push('<div class="vaa_head">' + chrome.i18n.getMessage("showSentenceMeaning") + '</div>');
      			buffer.push('<div class="vaa_content"><div class="vaa_innercontent">');
      			buffer.push('<div class="vaa_meaning"><b>' + chrome.i18n.getMessage("showOriginalText") + '</b><br>' + txt.chunk(60) + '</div><br>');
      			buffer.push('<div class="vaa_example"><b>' + chrome.i18n.getMessage("showTranslationResults") + '</b><br>' + result + '</div>');
      			buffer.push('</div></div></div>');
      			myport.postMessage({
      				message : "translate",
      				txt : "" + buffer.join('')
      			});

      		}
      	});

      }

      function StringtoXML(text) {
      	if (window.ActiveXObject) {
      		var doc = new ActiveXObject('Microsoft.XMLDOM');
      		doc.async = 'false';
      		doc.loadXML(text);
      	} else {
      		var parser = new DOMParser();
      		var doc = parser.parseFromString(text, 'text/xml');
      	}
      	return doc;
      }

      function translateEnglishWordByIciba(txt) {
      	$.ajax({
      		url : "http://dict-co.iciba.com/api/dictionary.php",
      		dataType : "text",
      		data : {
      			w : txt
      		},
      		success : function (result) {
      			icibaTranslate(result, txt);
      		}
      	});
      }
	  
	  function translateEnglishWordByVaa(txt) {
      	$.ajax({
      		url : "http://mili.cfapps.io/words/" + txt,
      		dataType : "json",
      		success : function (result) {
      			//vaaTranslate(result, txt);
				//alert(result);
				//alert(result.pron[0].type);
				if (result) {
					var def = [];
					var example = [];
					var len = result.accettation.length;
					if (len > 0) {
						var defbuffer = result.accettation;
						for (var j = 0; j < len; j++) {
							def.push('<div style="padding-top:6px;"><strong style="padding-right:10px;">');
							def.push(defbuffer[j].pos);
							def.push('&nbsp</strong>');
							def.push(defbuffer[j].accep);
							def.push('</div>');
						}
					}
					//<span class="pron">' + showpron + '</span>&nbsp&nbsp<span class="audio" data-src="' + mp3 + '"><img id="speaker"/></span>
					var pron = [];
					var plen = result.pron.length;
					var mp3;
					if(plen > 0){
						var pronbuffer = result.pron;
						for(var i = 0; i < plen; i++){
							pron.push('<span class="pron">');
							pron.push(pronbuffer[i].ps);
							pron.push('</span>&nbsp&nbsp<span class="audio" data-src="');
							pron.push(pronbuffer[i].link);
							pron.push('"><img id="speaker'+ i +'"/></span>');
							mp3.push(pronbuffer[i].link);
							
						}
					}
					alert(mp3.join(","));
					var showContent = consturctShow(txt, pron.join(''), def.join(''), example.join(''));
					//isSaveWord(txt, result);
      				myport.postMessage({
      					message : "translate",
      					txt : "" + showContent,
      					mp3url : pronbuffer[1].link;
      				});
					
				} else {
					var buffer = [];
      				buffer.push('<div class="vaa_word">');
      				buffer.push('<div class="vaa_head"></div>');
      				buffer.push('<div class="vaa_content"><div class="vaa_innercontent">');
      				buffer.push('<div class="vaa_meaning" style="text-align:left; font-weight:bold;">word is not found</div><br>');
      				buffer.push('<div class="vaa_example"></div>');
      				buffer.push('</div></div></div>');

      				myport.postMessage({
      					message : "translate",
      					txt : "" + buffer.join(''),
      					mp3url : ""
      				});
				}
				
      		}
      	});
      }

	  function icibaTranslate(result, txt){
		//alert("result" + result);
      			var xmlresult = result.split('<?xml version="1.0" encoding="UTF-8"?>');
      			var data = StringtoXML(xmlresult[1]);
      			var word = $(data).find("key").text();
      			var read = $(data).find("pron");
      			var mp3url = $(data).find("ps");
      			var mp3 = read.eq(0).text();
      			var pron = mp3url.eq(0).text();
      			var showpron = pron ? "[" + pron + "]" : pron;
      			var def = [];
      			var defSave = [];
      			var pos = $(data).find("pos");
      			var acceptation = $(data).find("acceptation");
      			for (var j = 0; j < pos.length; j++) {
      				def.push('<div style="padding-top:6px;"><strong style="padding-right:10px;">');
      				def.push(pos.eq(j).text());
      				defSave.push(pos.eq(j).text() + "\n");
      				def.push('&nbsp</strong>');
      				def.push(acceptation.eq(j).text());
      				defSave.push(acceptation.eq(j).text() + "\n");
      				def.push('</div>');
      			}
      			var definit = defSave.join('');
      			if (word) {
      				var example = [];
      				var ex = [];
      				$(data).find("sent").each(function (i) {
      					example.push($(this).text());
      					ex.push($(this).text());
      					example.push('<br /><br />');
      				});
      				var exampleString = ex.join('');
      				var showContent = consturctShow(txt, showpron, mp3, def.join(''), example.join(''));
					isSaveWord(txt, result);
      				myport.postMessage({
      					message : "translate",
      					txt : "" + showContent,
      					mp3url : mp3
      				});
      			} else {
      				var buffer = [];
      				buffer.push('<div class="vaa_word">');
      				buffer.push('<div class="vaa_head"></div>');
      				buffer.push('<div class="vaa_content"><div class="vaa_innercontent">');
      				buffer.push('<div class="vaa_meaning" style="text-align:left; font-weight:bold;">word is not found</div><br>');
      				buffer.push('<div class="vaa_example"></div>');
      				buffer.push('</div></div></div>');

      				myport.postMessage({
      					message : "translate",
      					txt : "" + buffer.join(''),
      					mp3url : "" + mp3
      				});
      			}
	  
	  }
	  
	  function translateEnglishWordByWordreference(txt, lg){
		var url = "http://api.wordreference.com/0.8/af990/json/en"+ lg +"/"+ txt;
		$.ajax({
      		url : url,
      		dataType : "json",
      		success : function (result) {
      			//alert(result.term0.PrincipalTranslations[0].FirstTranslation.term);
				var def = [];
				if(result.term0.PrincipalTranslations){
					for(var i in result.term0.PrincipalTranslations){
						def.push(i.OriginalTerm.POS);
						def.push(i.FirstTranslation.term);
					}
				}
				alert(def.join(','));
				
      		}
      	});
	  }
	  
	  
	  
	  function consturctShow(txt, showpron, def, example) {
	  	var buffer = [];
	  	buffer.push('<div class="vaa_word">');
	  	buffer.push('<div class="vaa_head">' + txt + '&nbsp&nbsp'+ showpron +'</div>');
	  	buffer.push('<div class="vaa_content"><div class="vaa_innercontent">');
	  	//def.length == 0?"":buffer.push('<div class="vaa_meaning"><b>' + chrome.i18n.getMessage("showWordMeaning") + '</b><br>' + def + '</div><br>');
	  	//example.length == 0? "":buffer.push('<div class="vaa_example"><b>' + chrome.i18n.getMessage("showWordExample") + '</b><br>' + example + '</div>');
	  	def.length == 0?buffer.push('<div class="vaa_meaning">暂无解释</div><br>'):buffer.push('<div class="vaa_meaning"><b>' + chrome.i18n.getMessage("showWordMeaning") + '</b><br>' + def + '</div><br>');
	  	example.length == 0? buffer.push('<div class="vaa_meaning">暂无例句</div><br>'):buffer.push('<div class="vaa_example"><b>' + chrome.i18n.getMessage("showWordExample") + '</b><br>' + example + '</div>');
		buffer.push('</div></div></div>');
		return buffer.join('');
	  }
	  
	  
      String.prototype.chunk = function (n) {
      	if (n < 0 || this.length < n) {
      		return this;
      	} else if (n > 0) {
      		return this.substring(0, n) + '...';
      	}
      }
	  
	  function isSaveWord(word, result) {
		
	  	if (localStorage['temp_wordlist'].length > 0) {
	  		var tempWordList = JSON.parse(localStorage['temp_wordlist']);
	  		
	  		for (var i = 0; i < tempWordList.length; i++) {
	  			if (tempWordList[i] == word) {
					
					return true;

	  			}
	  		}
	  		tempWordList[tempWordList.length] = word;
	  		//alert(tempWordList);
	  		localStorage['temp_wordlist'] = JSON.stringify(tempWordList);
	  		addWord(word, result);
	  		return false;
	  	} else {
	  		var newTempWordList = [];
	  		newTempWordList.push(word);
	  		localStorage['temp_wordlist'] = JSON.stringify(newTempWordList);
	  		addWord(word, result);
	  	}
	  }
	  
     setInterval(function () {
      	if (localStorage["service"] == "Trello") {
			//alert("setinterval");
      		$.get("https://api.trello.com/1/lists/" + localStorage["list_id"] + "/cards", {
      			key : "d8b28623f3171a9dbc870738cd5f6926",
      			token : localStorage["trello_token"]
      		}, function (cards) {
      			if (cards.length == 0) {
      				setIcon({
      					'text' : ''
      				});
      			} else {
      				var word_num = 0;
      				$.each(cards, function (ix, card) {
      					var d = card.desc.split("#");
      					var time_id = d[d.length - 1].split("@");
      					var degree = time_id[1];
      					var duedate = new Date(Date.parse(time_id[0]));
      					var now = new Date();
      					if (degree == 0 || (duedate < now && degree < 8)) {
      						word_num++;
      					}
      				});
      				console.log("wordnum" + word_num);
      				setIcon({
      					'text' : word_num.toString()
      				});
      			}
      		});
      	}
      }, pollIntervalMin);