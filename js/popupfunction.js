var list_mode= chrome.i18n.getMessage("list_mode");
var pic_mode = chrome.i18n.getMessage("pic_mode");
var remember = chrome.i18n.getMessage("remembered");
var bgPage = chrome.extension.getBackgroundPage();
console.log("bgPage" + bgPage);
var cards_num = 0;
var BOARD_NAME = bgPage.wordListName;
var modelchoice = "listmodel";
//var bgPage = chrome.extension.getBackgroundPage();
function titleSelect(choice){
	console.log(choice);
	if (choice == "trello") {
		$("#1").click(function () {
			loadingDataPic();
			isBoardExit(modelchoice);
		});
		//trello无rss
		$("#2").css("display", "none");
		$("#3").click(gdocs.openOption);
	}
	else if(choice == "spreadSheet"){
	$("#1").click(gwords.refreshWords);
	$("#2").click(gdocs.getAtom);
	$("#3").click(gdocs.openOption);
	//$("#4")为help，吕晓明准备内容
	}
}
/*
function openTrelloBoard() {
	console.log("https://trello.com/board/" + BOARD_NAME + "/" + localStorage["board_id"]);
    chrome.tabs.create({url: "https://trello.com/board/" + BOARD_NAME + "/" + localStorage["board_id"]}); 
};

function showTrelloAllWordMeaning(){
	$(".content").toggle(1000);
}
*/

	  
function SpreadSheetAuthorize() {
	bgPage.oauth.authorize(function () {
		$("#select_service").addClass("authorized");
		if (!bgPage.wordslistFeed) {
			gwords.queryVocabulary();
		} else {
			if (!bgPage.words.length) {
				gwords.getWordList();
			} else {
				gwords.renderWordList();
			}
			util.scheduleRequest();
		}
	});
	
}

function trelloAuthorize() {
	var trellourl = chrome.extension.getURL('connect.html');
	chrome.tabs.create({
		'url' : trellourl
	});
	Trello.authorize({
		interactive : false,
		success : trelloAuthorizeSuccess
	});
}
function connectStorageService() {
	if (localStorage["service"] == "Trello" || typeof localStorage["service"] == "undefined") {
		trelloAuthorize();
	} else {
    	//var bgPage = chrome.extension.getBackgroundPage();
		SpreadSheetAuthorize();
	}
}


function check(browser) {
	localStorage["service"] = browser;
}


function trelloAuthorizeSuccess() {
	localStorage['temp_wordlist'] = "";
	$("#select_service").addClass("authorized");
	util.displayMsg(wait_moment);
	Trello.members.get("me", function (member) {
		//console.log(isBoardExit());
		isBoardExit(modelchoice);
		
	});
}

//trello operation
function isBoardExit(modelchoice) {
	$("#output").html("");
	Trello.get("members/me/boards", function (boards) {
		for (var i = 0; i < boards.length; i++) {
			if (boards[i].name == BOARD_NAME) {
				//console.log("in each")
				localStorage["board_id"] = boards[i].id;
				break;
			}
		}
		if (typeof localStorage["board_id"] == "undefined") {
			util.displayMsg(creatvocabulary_displayMsg);
			//util.hideMsg();
			addBoard();
			if (localStorage["list_id"]) {
				if(0 == arguments.length || modelchoice == 'listmodel'){
					constructListModelContent();
				}
				else{
					constructPicModelContent();
				}
			}
		} else {
			console.log("have board");
			util.displayMsg(fetchwords_displayMsg);
			bgPage.setIcon({'text': '...'});
			getListCard(localStorage["board_id"], modelchoice);
			$('#butter').fadeOut(0);
		}
		
	});
	
}

function addBoard() {
	Trello.post("boards", {
		name : BOARD_NAME
	}, function (boards) {
		localStorage["board_id"] = boards.id;
		addList(boards.id);	
	});
}
function addList(idBoard) {
	Trello.post("lists", {
		name : "vaa word list",
		idBoard : idBoard
	}, function (list) {
		localStorage["list_id"] = list.id;
		util.displayMsg(no_newwords);
	});
}

function getListCard(idBoard, modelchoice){
	Trello.get("boards/" + localStorage["board_id"] + "/lists", function (lists) {
		for(var i = 0; i < lists.length; i++){
			if(lists[i].name == "vaa word list"){
				localStorage["list_id"] = lists[i].id;
				break;
			}
		}
		$cardlist = $("<div>")
		.addClass("container")
		.appendTo("#output");
		if(modelchoice == 'listmodel'){
			constructListModelContent();	
		}
		else{
			constructPicModelContent();
		}
		});
}



function constructPicModelContent() {
	$cardlist.html(" ");
	loadingDataPic();
	Trello.get("boards/" + localStorage["board_id"] + "/cards", {
		attachments : true
	}, function (cards) {
		if (cards.length == 0) {
			util.displayMsg(no_newwords);
			//util.hideMsg();
		} else {
			$.each(cards, function (ix, card) {	
				loadingDataPic();
				/*if (card.labels.length > 0) {
					var duedate = getLastTime(card.desc);
					var now = new Date();
				}*/
				var d = card.desc.split("#");
				var time_id = d[d.length - 1].split("@");
				var degree = time_id[1];
				var duedate = new Date(Date.parse(time_id[0]));
				var now = new Date();
				if (degree == 0 || (duedate < now && degree < 8) ) {
					var $element = $("<div>")
						.addClass("element")
						.appendTo($cardlist)
						.click(function () {
							$(this).toggleClass('large');
							$container.isotope('reLayout');
							$(this).children('.name').toggleClass('namelarge'); 
							$(this).children('.name').children('.content').toggleClass('showcontent'); 
							$(this).children('.number').toggleClass('numberlarge');
						});
					var $remember = $("<p>")
						.addClass("number")
						.appendTo($element);
					var $remember_pic = $("<img>")
						.attr({
							src : "img/icons/default/16/remember.png",
							title : remember,
							alt : remember,
							width: "20px",
							height: "20px"
						})
						.css({"cursor": "pointer"})
						.appendTo($remember)
						.click(function(event){
							event.stopPropagation(); 
							$element.css("display", "none");
							remembereWord(degree, card);
						});
					var $name = $("<div>")
						.addClass("name")
						.text(card.name)
						.css({"cursor": "pointer"})
						.appendTo($element);
					var $content = $("<div>")
						.addClass("content")
						.html(constructPopupEWordContent(card))
						.appendTo($name);
					if (card.attachments.length > 0) {
						$element.css("background-image", "url(" + card.attachments[0].url + ")");
						
					}
				}
				
			});
		}
		$("#modelchoice").css('display', 'block');
		$('#butter1').fadeOut(0);
	});
}


function constructListModelContent() {	
	//console.log(getNeedRememberWordsNum());
	$cardlist.html(" ");
	loadingDataPic();
	var tempWordList = [];
	Trello.get("boards/" + localStorage["board_id"] + "/cards", function (cards) {
		
		if (cards.length == 0) {
			util.displayMsg(no_newwords);
			//util.hideMsg();
			bgPage.setIcon({'text': cards.length.toString()});
		} else {
			loadingDataPic();
			var word_num = 0;
			$.each(cards, function (ix, card) {
				var d = card.desc.split("#");
				var time_id = d[d.length - 1].split("@");
				var degree = time_id[1];
				var duedate = new Date(Date.parse(time_id[0]));
				var now = new Date();
				tempWordList.push(card.name);
				//if (card.labels.length > 0) {
					//var duedate = getLastTime(card.desc);
					//var now = new Date();
				//}
				if (degree == 0 || (duedate < now && degree < 8) ) {
					word_num++;
					var $word = $("<div>")
						.addClass("word1")
						.appendTo($cardlist);
					
					var $head = $("<div>")
						.addClass("head")
						.attr("id", card.id)
						.text(card.name)
						.appendTo($word)
						.click(function () {
							$content.toggle(1000);
						});
					
					var $content = $("<div>")
						.addClass("content")
						.html(constructPopupEWordContent(card))
						.appendTo($word);
					var $remembered = $("<a>")
						.addClass("remembered")
						.text(remember)
						.appendTo($head)
						.click(function () {
							$word.css("display", "none");
							remembereWord(degree, card);
							showNeedRememberWordsNum();
						});
				}
			});
		}
		$('#butter1').fadeOut(0);
		bgPage.setIcon({'text': word_num.toString()});
		localStorage['temp_wordlist']=JSON.stringify(tempWordList);
		$("#modelchoice").css('display', 'block');
		
	});
}

function showNeedRememberWordsNum() {
	Trello.get("boards/" + localStorage["board_id"] + "/cards", function (cards) {	
		if (cards.length == 0) {
			bgPage.setIcon({'text': ''});
			//return cards.length;
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
			//console.log("wordnum" + word_num);
			bgPage.setIcon({'text': word_num.toString()});
		}
		
	});
}

/*function getLastTime(desc){
	var d = desc.split("#");
	var time_id = d[d.length - 1].split("@");
	return new Date(Date.parse(time_id[0]));
}
*/

function remembereWord(degree, card) {
	if (degree == 0) {
		var time = setTime(5, 0, 0, card.desc, 1);
		setDue(card.id, time);
	} else if (degree == 1) {
		var time = setTime(30, 0, 0, card.desc, 2);
		setDue(card.id, time);
	} else if (degree == 2) {
		var time = setTime(0, 12, 0, card.desc, 3);
		setDue(card.id, time);
	} else if (degree == 3) {
		var time = setTime(0, 0, 1, card.desc, 4);
		setDue(card.id, time);
	} else if (degree == 4) {
		var time = setTime(0, 0, 2, card.desc, 5);
		setDue(card.id, time);
	} else if (degree == 5) {
		var time = setTime(0, 0, 4, card.desc, 6);
		setDue(card.id, time);
	} else if (degree == 6) {
		var time = setTime(0, 0, 7, card.desc, 7);
		setDue(card.id, time);
	} else if (degree == 7) {
		var time = setTime(0, 0, 15, card.desc, 8);
		setDue(card.id, time);
	}
}

function setDue(idCard, date) {
	  Trello.put("cards/" + idCard +"/desc", {
		  value : date
	  }, function(){
	  
	  });
}

/*function setFamiliarDegree(idCard, degree){
	Trello.post("cards/" + idCard +"/labels", {
		value : degree
	}, function () {
	
	});
}

function deleFamiliarDegree(idCard, degree){
	Trello.delete("cards/" + idCard +"/labels/" + degree);
}*/

function setTime(m, h, d, desc, degree) {
	//console.log(desc);
	var date = new Date();
	date.setMinutes(date.getMinutes() + m);
	date.setHours(date.getHours() + h);
	date.setDate(date.getDate() + d);
	console.log(date);
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var hour = date.getHours();
	var min = date.getMinutes();
	return desc + "\n# time:" + month + "/" + day + "/" + year + " " + hour + ":" + min + "@" + degree;	
}





function constructPopupEWordContent(card){
	var content = [];
	var mean = card.desc.split("#");
	content.push("<div style='color:#4E7DC2;'>" + mean[1] + "</div><br>")
	content.push("<div><b>" + mean[2] + "</b><br>");
	content.push(mean[3] + "</div>");
	return content.join('');
}

function loadingDataPic(){
	$('#butter1').css({'background-color':'transparent', 'background-image':'url("img/loader.gif")','background-repeat':'no-repeat','background-position':'center','width':'100px','margin-right':'115px','margin-top':'20px'}).show();
	$('#butter1').text("");
}
// google spreadsheet operation

var gwords = {};
var gdocs = {};

var dictServerUrl = new Array("http://www.google.com/dictionary?langpair=en|zh&q=", "http://dict.cn/search.php?q=");

var fetchwords_displayMsg = chrome.i18n.getMessage("fetchwords_displayMsg");
var fetchwords_error_displayMsg = chrome.i18n.getMessage("fetchwords_error_displayMsg");
var initvocabulary_displayMsg = chrome.i18n.getMessage("initvocabulary_displayMsg");
var creatvocabulary_displayMsg = chrome.i18n.getMessage("creatvocabulary_displayMsg");
var vocabularycreated_displayMsg = chrome.i18n.getMessage("vocabularycreated_displayMsg");
var worddeleted_displayMsg = chrome.i18n.getMessage("worddeleted_displayMsg");
var wordlowerlevel_displayMsg = chrome.i18n.getMessage("wordlowerlevel_displayMsg");
var wait_moment = chrome.i18n.getMessage("wait_moment");
var no_newwords = chrome.i18n.getMessage("no_newwords");


var pollIntervalMax = 1000 * 60 * 60;  // 1 hour
var requestFailureCount = 0;  // used for exponential backoff
var requestTimeout = 1000 * 2;  // 5 seconds

var viewServer = (localStorage.getItem("vdic") == "Dict") ? 1 : 0;

var DEFAULT_MIMETYPES = {
  'atom': 'application/atom+xml',
  'document': 'text/plain',
  'spreadsheet': 'text/csv',
  'presentation': 'text/plain',
  'pdf': 'application/pdf'
};

var titleArray = [chrome.i18n.getMessage("refresh"), chrome.i18n.getMessage("RSS"), chrome.i18n.getMessage("option"), chrome.i18n.getMessage("help")];
for(var i = 0; i < $("img").length; i++){
	console.log(titleArray[i]);
	$("img")[i].setAttribute("title", titleArray[i]);
}

gdocs.openVocabulary = function() {
    chrome.tabs.create({url: bgPage.vocabularyLink}); 
};
gdocs.getAtom = function() {
    chrome.tabs.create({url: bgPage.wordslistAtom});
};
gdocs.openOption = function() {
    chrome.tabs.create({url: "options.html"});
};

/**
 * Class to compartmentalize properties of a Google document.
 * @param {Object} entry A JSON representation of a DocList atom entry.
 * @constructor
 */
gwords.GoogleWord = function(entry) {
  this.entry = entry;
  this.title = entry.title.$t;
  this.link = {
    'edit': gwords.getLink(entry.link, 'edit').href
  };
  this.type = entry.gsx$levels.$t;
  this.phonetics = entry.gsx$phonetics.$t;
  this.translations = entry.gsx$translations.$t;
};



/**
 * Returns the correct atom link corresponding to the 'rel' value passed in.
 * @param {Array<Object>} links A list of atom link objects.
 * @param {string} rel The rel value of the link to return. For example: 'next'.
 * @return {string|null} The appropriate link for the 'rel' passed in, or null
 *     if one is not found.
 */
gwords.getLink = function(links, rel) {
  for (var i = 0, link; link = links[i]; ++i) {
    if (link.rel === rel) {
      return link;
    }
  }
  return null;
};

/**
 * A generic error handler for failed XHR requests.
 * @param {XMLHttpRequest} xhr The xhr request that failed.
 * @param {string} textStatus The server's returned status.
 */
gwords.handleError = function(xhr, textStatus) {
  util.displayError(fetchwords_error_displayMsg);
  ++requestFailureCount;
};

/**
 * A helper for constructing the raw Atom xml send in the body of an HTTP post.
 * @param {XMLHttpRequest} xhr The xhr request that failed.
 * @param {string} docTitle A title for the document.
 * @param {string} docType The type of document to create.
 *     (eg. 'document', 'spreadsheet', etc.)
 * @return {string} The Atom xml as a string.
 */
gwords.constructAtomXml_ = function(wordTitle, wordLevels) {

  var atom = ['<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">',
              '<gsx:words>',wordTitle,'</gsx:words>',
              '<gsx:levels>',wordLevels,'</gsx:levels>',
              '</entry>'].join('');
  return atom;
};

/**
 * A helper for constructing the body of a mime-mutlipart HTTP request.
 * @param {string} title A title for the new document.
 * @param {string} docType The type of document to create.
 *     (eg. 'document', 'spreadsheet', etc.)
 * @param {string} body The body of the HTTP request.
 * @return {string} The Atom xml as a string.
 */
gwords.constructContentBody_ = function(title, wordLevels) {
  var body = [
              gwords.constructAtomXml_(title, wordLevels), '\r\n',
              ].join('');
  return body;
};

/**
 * Update level of a word from the user's word list.
 * @param {integer} index An index intro the background page's docs array.
 */
gwords.updateLevel = function(index) {
word = bgPage.words[index];
if (word.type == 1) {
gwords.deleteWord(index);
} else {
gwords.lowerLevel(index);
}
}
/**
 * Lower level of a word from the user's word list.
 * @param {integer} index An index intro the background page's docs array.
 */
gwords.lowerLevel = function(index) {
  var handleSuccess = function(resp, xhr) {
    util.displayMsg(wordlowerlevel_displayMsg);
    util.hideMsg();
    requestFailureCount = 0;
    bgPage.setIcon({'text': bgPage.words.length.toString()});
  }
  
  var word = bgPage.words[index];
  var wordLevel = word.type - 1;
  var wordTitle = word.title;
  var wordPhonetic = word.phonetics;
  var wordTranslation = word.translations;
  
  var params = {
    'method': 'PUT',
    'headers': {
      'GData-Version': '3.0',
      'Content-Type': 'application/atom+xml',
      'If-Match': '*'
    },
    'body': [ '<entry xmlns="http://www.w3.org/2005/Atom"', 
			  ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">',
              '<gsx:levels>',wordLevel,'</gsx:levels>',
              '<gsx:words>',wordTitle,'</gsx:words>',
              '<gsx:phonetics>',wordPhonetic,'</gsx:phonetics>',
              '<gsx:translations>',wordTranslation,'</gsx:translations>',
              '</entry>'].join('')
  };

  $('#output li').eq(index).fadeOut('slow');

  var url = word.link['edit'];
  bgPage.oauth.sendSignedRequest(url, handleSuccess, params);
};

/**
 * Deletes a document from the user's document list.
 * @param {integer} index An index intro the background page's docs array.
 */
gwords.deleteWord = function(index) {
  var handleSuccess = function(resp, xhr) {
    util.displayMsg(worddeleted_displayMsg);
    util.hideMsg();
    requestFailureCount = 0;
    bgPage.words.splice(index, 1);
    bgPage.setIcon({'text': bgPage.words.length.toString()});
  }

  var params = {
    'method': 'DELETE',
    'headers': {
      'GData-Version': '3.0',
      'If-Match': '*'
    }
  };

  $('#output li').eq(index).fadeOut('slow');

  var word = bgPage.words[index];
  var url = word.link['edit'];
  bgPage.oauth.sendSignedRequest(url, handleSuccess, params);
};

/**
 * Callback for processing the JSON feed returned by the DocList API.
 * @param {string} response The server's response.
 * @param {XMLHttpRequest} xhr The xhr request that was made.
 */
gwords.processDocListResults = function(response, xhr) {
  if (xhr.status != 200) {
    gwords.handleError(xhr, response);
    return;
  } else {
    requestFailureCount = 0;
  }

  var data = JSON.parse(response);
  for (var i = 0, entry; entry = data.feed.entry[i]; ++i) {
    bgPage.words.push(new gwords.GoogleWord(entry));
  }

  var nextLink = gwords.getLink(data.feed.link, 'next');
  if (nextLink) {
    gwords.getWordList(nextLink.href); // Fetch next page of results.
  } else {
    gwords.renderWordList();
  }
};

/**
 * Show the word meanning.
 * @param {integer} index An index intro the background page's docs array.
 */
gwords.showWordMeaning = function(index) {
	$('.translation:eq('+ index +')').toggle();
}

/**
 * Show all word meanning.
 * @param {integer} index An index intro the background page's docs array.
 */
gwords.showAllWordMeaning = function() {
	$('.translation').toggle();
}

/**
 * Presents the in-memory documents that were fetched from the server as HTML.
 */
gwords.renderWordList = function() {
  util.hideMsg();
  // Construct the iframe's HTML.
  var html = [];
  for (var i = 0, word; word = bgPage.words[i]; ++i) {
  	var type = word.type;
  	var phonetics = word.phonetics;
  	var translations = word.translations;
  	html.push(
  		'<li data-index="', i, '">',
  		'<div class="word"><img src="img/icons/default/16/', type, '.png">',
  		'<span contenteditable="false" class="word_title"></span>',
  		'<span class="phonetic">', phonetics, '</span><span style="float:right; margin-right:20px"><a href="javascript:void(0);" ',
  		'onclick="gwords.showWordMeaning(', i,
  		');return false;"><img src="img/icons/default/16/view.png" alt="view" title="', chrome.i18n.getMessage("showPopupWordMeaning"), '"/></a><a href="javascript:void(0);" ',
  		'onclick="gwords.updateLevel(', i,
  		');return false;"><img src="img/icons/default/16/delete.png" alt="Delete" title="', chrome.i18n.getMessage("remembered"), '"/></a></span></div>',
  		'<div class="translation" style="display: none">', translations, '</div>',
  		'</li>');
  }
  $('#output').html('<ul>' + html.join('') + '</ul>');
  
  // Set each span's innerText to be the doc title. We're filling this after
  // the html has been rendered to the page prevent XSS attacks when using
  // innerHTML.
  $('#output li span.word_title').each(function (i, ul) {
  	$(ul).text(bgPage.words[i].title);
  });
  bgPage.setIcon({
  	'text' : bgPage.words.length.toString()
  });
};



/**
 * Fetches the user's document list.
 * @param {string?} opt_url A url to query the doclist API with. If omitted,
 *     the main doclist feed uri is used.
 */
gwords.getWordList = function(opt_url) {
  var url = opt_url || null;

  var params = {
    'headers': {
      'GData-Version': '3.0'
    }
  };

  if (!url) {
    util.displayMsg(fetchwords_displayMsg);
    bgPage.setIcon({'text': '...'});

    bgPage.words = []; // Clear document list. We're doing a refresh.
    url = bgPage.wordslistFeed;
    params['parameters'] = {
      'alt': 'json',
    };
  } else {
    util.displayMsg($('#butter').text() + '.');

    var parts = url.split('?');
    if (parts.length > 1) {
      url = parts[0]; // Extract base URI. Params are passed in separately.
      params['parameters'] = util.unstringify(parts[1]);
    }
  }
  bgPage.oauth.sendSignedRequest(url, gwords.processDocListResults, params);
};

/**
 * Refreshes the user's document list.
 */
gwords.refreshWords = function() {
  bgPage.clearPendingRequests();
  gwords.getWordList();
  util.scheduleRequest();
};

/**
 * Update Sheet Name.
 */
gwords.updateSheetName = function() {
  var sheetTitle = bgPage.spreadsheetName;
  var rowCount = 2;
  var colCount = 4;
  
  var handleSuccess = function(resp, xhr) {
	if (xhr.status != 200) {
		gwords.handleError(xhr, resp);
		return;
	} else {
		util.displayMsg(vocabularycreated_displayMsg);
		gwords.getVocabularyListFeed();
	}
  };
  
  var params = {
    'method': 'PUT',
    'headers': {
      'GData-Version': '3.0',
      'Content-Type': 'application/atom+xml',
      'If-Match': '*'
    },
    'body': [ '<entry xmlns="http://www.w3.org/2005/Atom"', 
			  ' xmlns:gs="http://schemas.google.com/spreadsheets/2006">',
              '<title>', sheetTitle, '</title>',
              '<gs:rowCount>', rowCount, '</gs:rowCount>',
              '<gs:colCount>', colCount, '</gs:colCount>',
              '</entry>'].join('')
  };
  
  bgPage.oauth.sendSignedRequest(localStorage.vocabularySheetEditFeed, handleSuccess, params);

}
/**
 * Get worksheet's edit feed link.
 */
gwords.getVocabularySheetEditFeed = function(opt_url) {
  var url = opt_url || null;
  var params = {
    'method': 'GET',
    'headers': {
      'GData-Version': '3.0'
    }
  };

  if (!url) {
    url = localStorage.vocabularyFeed;
    params['parameters'] = {
      'alt': 'json',
    };
  } else {
    var parts = url.split('?');
    if (parts.length > 1) {
      url = parts[0]; // Extract base URI. Params are passed in separately.
      params['parameters'] = util.unstringify(parts[1]);
    }
  }
  
  var handleSuccess = function(response, xhr) {
	if (xhr.status != 200) {
		gwords.handleError(xhr, response);
		return;
	} else {
		var data = JSON.parse(response);
		for (var i = 0, entry; entry = data.feed.entry[i]; ++i) {
			if (entry.title.$t == 'Sheet1' || 'Sheet 1') {
				localStorage.vocabularySheetEditFeed = gwords.getLink(entry.link, 'edit').href;
				gwords.updateSheetName();
			}
		}
	};
  };

  bgPage.oauth.sendSignedRequest(url, handleSuccess, params);
};

/**
 * A helper for constructing the raw Atom xml send in the body of an HTTP post.
 * @param {XMLHttpRequest} xhr The xhr request that failed.
 * @param {string} docTitle A title for the document.
 * @param {string} docType The type of document to create.
 *     (eg. 'document', 'spreadsheet', etc.)
 * @return {string} The Atom xml as a string.
 */
gdocs.constructAtomXml_ = function(docTitle, docType) {


  var atom = ["<?xml version='1.0' encoding='UTF-8'?>", 
              '<entry xmlns="http://www.w3.org/2005/Atom">',
              '<category scheme="http://schemas.google.com/g/2005#kind"', 
              ' term="http://schemas.google.com/docs/2007#', docType, '"/>',
              '<title>', docTitle, '</title>',
              '</entry>'].join('');
  return atom;
};

/**
 * A helper for constructing the body of a mime-mutlipart HTTP request.
 * @param {string} title A title for the new document.
 * @param {string} docType The type of document to create.
 *     (eg. 'document', 'spreadsheet', etc.)
 * @param {string} body The body of the HTTP request.
 * @param {string} contentType The Content-Type of the (non-Atom) portion of the
 *     http body.
 * @param {boolean?} opt_starred Whether the document should be starred.
 * @return {string} The Atom xml as a string.
 */
gdocs.constructContentBody_ = function(title, docType, body, contentType) {
  var body = ['--END_OF_PART\r\n',
              'Content-Type: application/atom+xml;\r\n\r\n',
              gdocs.constructAtomXml_(title, docType), '\r\n',
              '--END_OF_PART\r\n',
              'Content-Type: ', contentType, '\r\n\r\n',
              body, '\r\n',
              '--END_OF_PART--\r\n'].join('');
  return body;
};

/**
 * Creat Vocabulary.
 */
gwords.creatVocabulary = function() {
  var title = bgPage.spreadsheetName;
  var content = 'words,phonetics,translations,levels';
  var docType = 'spreadsheet';
  
  util.displayMsg(creatvocabulary_displayMsg);
  var handleSuccess = function(resp, xhr) {
	if (xhr.status != 201) {
		gwords.handleError(xhr, resp);
		return;
	} else {
		var data = JSON.parse(resp);
		var links = data.entry.link;
		localStorage.vocabularyFeed = gwords.getLink(links, 'http://schemas.google.com/spreadsheets/2006#worksheetsfeed').href;
		localStorage.vocabularyLink = gwords.getLink(links, 'alternate').href;
		bgPage.vocabularyLink = localStorage.vocabularyLink;
		gwords.getVocabularySheetEditFeed();
	}
  };
  
  var params = {
    'method': 'POST',
    'headers': {
      'GData-Version': '3.0',
      'Content-Type': 'multipart/related; boundary=END_OF_PART',
    },
    'parameters': {'alt': 'json'},
    'body': gdocs.constructContentBody_(title, docType, content,
                                        DEFAULT_MIMETYPES[docType])
  };
  
  bgPage.oauth.sendSignedRequest(bgPage.DOCLIST_FEED, handleSuccess, params);
};

/**
 * Get Vocabulary List Feed.
 */
gwords.getVocabularyListFeed = function(opt_url) {
  var url = opt_url || null;
  var params = {
    'method': 'GET',
    'headers': {
      'GData-Version': '3.0'
    }
  };

  if (!url) {
    url = localStorage.vocabularyFeed;
    params['parameters'] = {
      'alt': 'json',
    };
  } else {
    var parts = url.split('?');
    if (parts.length > 1) {
      url = parts[0]; // Extract base URI. Params are passed in separately.
      params['parameters'] = util.unstringify(parts[1]);
    }
  }
  
  var handleSuccess = function(response, xhr) {
	if (xhr.status != 200) {
		gwords.handleError(xhr, response);
		return;
	} else {
		var data = JSON.parse(response);
		for (var i = 0, entry; entry = data.feed.entry[i]; ++i) {
			if (entry.title.$t == bgPage.spreadsheetName) {
			    var parts1 = entry.content.src.split(':');
			    localStorage.vocabularyListFeed = 'https:' + parts1[1];
			    bgPage.wordslistFeed = localStorage.vocabularyListFeed;
			    var parts2 = localStorage.vocabularyListFeed.split('private');
			    localStorage.wordslistAtom = parts2[0] + 'public/basic';
			    bgPage.wordslistAtom = localStorage.wordslistAtom;
			    if (!bgPage.words.length) {
				gwords.getWordList();
			    } else {
				gwords.renderWordList();
			    }
			    return;
			} else if (entry.title.$t == 'Sheet 1') {
			gwords.getVocabularySheetEditFeed();
			}
		}
	};
  };

  bgPage.oauth.sendSignedRequest(url, handleSuccess, params);
};


/**
 * Query the user's spreadsheet list.
 * @param {string?} opt_url A url to query the doclist API with. If omitted,
 *     the main doclist feed uri is used.
 */
gwords.queryVocabulary = function(opt_url) {
  var url = opt_url || null;

  var params = {
    'method': 'GET',
    'headers': {
      'GData-Version': '3.0'
    }
  };

  if (!url) {
    util.displayMsg(initvocabulary_displayMsg);

    url = bgPage.DOCLIST_FEED;
    params['parameters'] = {
      'alt': 'json',
	  'title': bgPage.spreadsheetName,
	  'title-exact': 'true'
    };
  } else {
    var parts = url.split('?');
    if (parts.length > 1) {
      url = parts[0]; // Extract base URI. Params are passed in separately.
      params['parameters'] = util.unstringify(parts[1]);
    }
  }
  
  var handleSuccess = function(response, xhr) {
	if (xhr.status != 200) {
	gwords.handleError(xhr, response);
	return;
	} else {
		var data = JSON.parse(response);
		if (!data.feed.entry) {
			gwords.creatVocabulary();
		} else {
			for (var i = 0, entry; entry = data.feed.entry[i]; ++i) {
			localStorage.vocabularyFeed = gwords.getLink(entry.link, 'http://schemas.google.com/spreadsheets/2006#worksheetsfeed').href;
			localStorage.vocabularyLink = gwords.getLink(entry.link, 'alternate').href;
			bgPage.vocabularyLink = localStorage.vocabularyLink;
			}
			gwords.getVocabularyListFeed();
		}
	}
  };

  bgPage.oauth.sendSignedRequest(url, handleSuccess, params);
};
/*
bgPage.oauth.authorize(function() {
  if (!bgPage.wordslistFeed) {
	gwords.queryVocabulary();
  } else {
  if (!bgPage.words.length) {
    gwords.getWordList();
  } else {
    gwords.renderWordList();
  }
  util.scheduleRequest();
}});
*/