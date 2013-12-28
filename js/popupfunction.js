var bgPage = chrome.extension.getBackgroundPage();
var VAAOperation = {
	list_mode : chrome.i18n.getMessage("list_mode"),
	pic_mode : chrome.i18n.getMessage("pic_mode"),
	remember : chrome.i18n.getMessage("remembered"),
	showmeaning : chrome.i18n.getMessage("showmeaning"),
	refresh : chrome.i18n.getMessage("refresh"),
	rss : chrome.i18n.getMessage("RSS"),
	option : chrome.i18n.getMessage("option"),
	nowordremember : chrome.i18n.getMessage("nowordremember"),
	greatjob : chrome.i18n.getMessage("greatjob"),
    //creatvocabulary_displayMsg : chrome.i18n.getMessage("creatvocabulary_displayMsg"),
	no_newwords : chrome.i18n.getMessage("no_newwords"),

	//bgPage : chrome.extension.getBackgroundPage(),
	//pollIntervalMax : 1000 * 60 * 60, // 1 hour
	cards_num : 0,
	BOARD_NAME : bgPage.wordListName,
	modelchoice : "listmodel",

	
	
	listsName : ["new", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
	listsLevel : {
		"new" : 0,
		"1st" : 1,
		"2nd" : 2,
		"3rd" : 3,
		"4th" : 4,
		"5th" : 5,
		"6th" : 6,
		"7th" : 7,
		"8th" : 8
	},
	
	//trello Authorize operation
	
	trelloAuthorizeSuccess : function () {
		//if (bgPage.updateFlag) {
			//util.displayMsg("update.....");
		//} else {
			localStorage['temp_wordlist'] = "";
			util.loadingDataPic(); //util.displayMsg(wait_moment);
			$cardlist = $("<div>")
					.addClass("container")
					.appendTo("#output");
			if (localStorage["board_id"] && localStorage["1st"] && localStorage["2nd"] && localStorage["3rd"] && localStorage["4th"] && localStorage["5th"] && localStorage["6th"] && localStorage["7th"] && localStorage["8th"] && localStorage["new"]) {
				
				if (VAAOperation.modelchoice == 'listmodel') {
					VAAOperation.constructListModelContent();
				} else {
					VAAOperation.constructPicModelContent();
				}

			} else {
				VAAOperation.isBoardExit();
			}
		//}
	},
	
	trelloAuthorize : function () {
		var trellourl = chrome.extension.getURL('connect.html');
		chrome.tabs.create({
			'url' : trellourl
		});
		Trello.authorize({
			interactive : false,
			success : VAAOperation.trelloAuthorizeSuccess
		});
	},
	
	//trello operation
	changeBoardClosedStatus : function (board_id, status, type) {
		Trello.put("boards/" + board_id + "/closed", {
			value : status
		}, function (board) {
			//console.log("changeboardclosed: " + board);
			//console.log(type + "change board status")
			if (type == "addBoard") {
				for (var i = 0; i < VAAOperation.listsName.length; i++) {
					VAAOperation.addList(board.id, VAAOperation.listsName[i], VAAOperation.listsLevel[VAAOperation.listsName[i]]);
				}
				$('#butter1').fadeOut(0);
				util.displayMsg(VAAOperation.no_newwords);
			} else if (type == "changeStatus") {
				VAAOperation.getListCard(board.id);
			}
		}, function (error) {
			console.log("error:" + error);
			if (type == "changeStatus") {
				VAAOperation.getListCard(board_id);
			}

		});
	},
	
	changeListClosedStatus : function (list_id, status) {
		Trello.put("lists/" + list_id + "/closed", {
			value : status
		}, function (list) {

		});
	},
	
	addBoard : function () {
		Trello.post("boards", {
			name : VAAOperation.BOARD_NAME,
			desc : "TrelloDB"
		}, function (boards) {
			//console.log(BOARD_NAME + "board add");
			localStorage["board_id"] = boards.id;
			VAAOperation.changeBoardClosedStatus(boards.id, true, "addBoard");
		});
	},
	
	addList : function (idBoard, name, levelnum) {
		Trello.post("lists", {
			name : name,
			idBoard : idBoard
		}, function (list) {
			//console.log(name + "added");
			localStorage[name] = list.id;
			localStorage[list.id] = levelnum;
			//changeListClosedStatus(list.id, true);
		});
	},
	
	getListCard : function (board_id) {
		Trello.get("boards/" + board_id + "/lists", {
			filter : "all"
		}, function (lists) {
			var listName = [];
			var listsNameString = VAAOperation.listsName.toString();
			var needChangeStatuesList = [];
			for (var i = 0; i < lists.length; i++) {
				listName.push(lists[i].name);
				if (listsNameString.indexOf(lists[i].name) !== -1) {
					if (lists[i].closed) {
						needChangeStatuesList.push(lists[i].id);
					}
					localStorage[lists[i].name] = lists[i].id;
					localStorage[lists[i].id] = VAAOperation.listsLevel[lists[i].name];
				}
			}
			var needCreateListName = util.array_diff(VAAOperation.listsName, listName);
			if (needChangeStatuesList.length > 0) {
				for (var i = 0; i < needChangeStatuesList.length; i++) {
					VAAOperation.changeListClosedStatus(needChangeStatuesList[i], false);
				}
			}
			if (needCreateListName.length <= VAAOperation.listsName.length) {
				for (var i = 0; i < needCreateListName.length; i++) {
					VAAOperation.addList(board_id, needCreateListName[i]);

				}
			}
			
			if (VAAOperation.modelchoice == 'listmodel') {
				VAAOperation.constructListModelContent();
			} else {
				VAAOperation.constructPicModelContent();
			}
		});
	},
	
	closedCard : function (card_id, status) {
		Trello.put("cards/" + card_id + "/closed", {
			value : status
		}, function (data) {});
	},
	
	changeCardList : function (card_id, list_id, time) {
		//console.log("card_id" + card_id);
		//console.log("list_id" + list_id);
		//console.log("time" + time);
		Trello.put("cards/" + card_id, {
			idList : list_id,
			pos : "top",
			due : time
		}, function (data) {
			//console.log("finishe");
		});
	},
	
	isBoardExit : function () {
		
		Trello.get("members/me/boards", function (boards) {
			for (var i = 0; i < boards.length; i++) {
				if (boards[i].name == VAAOperation.BOARD_NAME && boards[i].desc == "TrelloDB") {
					localStorage["board_id"] = boards[i].id;
					boards[i].closed ? VAAOperation.getListCard(boards[i].id) : VAAOperation.changeBoardClosedStatus(boards[i].id, true, "changeStatus");
					return;
				}
			}
			VAAOperation.addBoard();

		});
	},
	
	constructFamiliarityImage : function (name, level) {
		var degree = parseInt(level);
		var img = [];
		for (var j = 0; j < 9 - degree; j++) {
			//console.log(name + ": unlevel");
			img.push('<img src="img/icons/default/16/unlevel.png" alt="Rememered" width="15px" height="15px" class="level" style="cursor: pointer;">');
		}
		for (var i = 0; i < degree; i++) {
			//console.log(name + ": level");
			img.push('<img src="img/icons/default/16/level.png" alt="Rememered" width="15px" height="15px" class="level" style="cursor: pointer;">');
		}
		return img.join('');
	},
	
	constructPopupEWordContent : function (card, modle) {
		var content = [];
		var desc = JSON.parse(card);

		if (modle == "listview") {
			if (desc.pron.length > 0) {
				content.push("<div style='color:#4E7DC2; width:100%; border-top:1px solid #ddd;padding-top:5px;font-weight:normal;font-size:15px;'>");
				for (var i = 0; i < desc.pron.length; i++) {
					if (desc.pron[i].ps) {
						content.push("<span>")
						content.push(desc.pron[i].type == "en" ? "英 " : "美 ");
						content.push('[' + desc.pron[i].ps + ']');
						content.push('&nbsp&nbsp<span class="audio" data-src="');
						content.push(desc.pron[i].link);
						content.push('"><img id="speaker" src="img/speaker.png" class="' + desc.pron[i].link + '"/></span></span>&nbsp&nbsp');

					}
				}
				content.push("</div>");
			}
			if (desc.accettation.length > 0) {
				content.push('<div>');
				for (var j = 0; j < desc.accettation.length; j++) {
					content.push('<div style="padding-top:6px; line-height:1.5;"><strong style="padding-right:10px;">');
					content.push(desc.accettation[j].pos + ".");
					content.push('&nbsp</strong>');
					content.push(desc.accettation[j].accep + '</div>');
				}
				content.push('</div>');
			}

		} else {
			content.push("<div style='color:#4E7DC2; width:90%'><MARQUEE direction=left behavior=alternate scrollamount=1 scrolldelay=100>" + mean[1] + "</MARQUEE></div><br>")
			content.push("<div><b>" + mean[2] + "</b><br>");
			content.push(mean[3].chunk(80) + "</div>");
		}
		return content.join('');
	},
	
	constructListModelContent : function () {
		
		util.loadingDataPic();
		var word_num;
		var tempWordList = [];
		Trello.get("boards/" + localStorage["board_id"] + "/cards", {
			filter : "open"
		}, function (cards) {
			$cardlist.html(" ");
			if (cards.length == 0) {
				util.displayMsg(VAAOperation.no_newwords);
				bgPage.setIcon({
					'text' : cards.length.toString()
				});
				$('#butter1').fadeOut(0);

			} else {
				//util.loadingDataPic();
				word_num = 0;
				$.each(cards, function (ix, card) {
					//console.log(card.desc);
					if (card.desc !== "null") {
						//console.log("card: " + card.name);
						//tempWordList.push(card.name);
						tempWordList.push(card.name);
						var due = new Date(card.due);
						var now = new Date();
						
						if (now >= due) {
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
									//$content.toggle(1000);
								});
							//card = card.replace('\n','');
							var $content = $("<div>")
								.addClass("content")
								.html(VAAOperation.constructPopupEWordContent(card.desc.replace(/\\n/g, ""), "listview"))
								.appendTo($word);

							var $remembered = $("<img>")
								.attr({
									src : "img/icons/default/16/select.png",
									title : VAAOperation.remember,
									alt : VAAOperation.remember,
									width : "30px",
									height : "30px"
								})
								.addClass("remembered")
								.css({
									"cursor" : "pointer"
								})
								.appendTo($head)
								.click(function (event) {
									$word.fadeOut(1000);
									word_num = word_num - 1;
									bgPage.setIcon({
										'text' : word_num.toString()
									});
									VAAOperation.remembereWord(card.idList, card.id);
									//showNeedRememberWordsNum(word_num);

									event.stopPropagation();
								});

							var $showmeaning = $("<img>")
								.attr({
									src : "img/icons/default/16/search.png",
									title : VAAOperation.showmeaning,
									alt : VAAOperation.showmeaning,
									width : "30px",
									height : "30px"
								})
								.addClass("remembered")
								.css({
									"cursor" : "pointer"
								})
								.appendTo($head)
								.click(function (event) {
									$content.toggle();
									$remembered.attr({
										src : "img/icons/default/16/select_invalid.png",
										title : VAAOperation.remember,
										alt : VAAOperation.remember,
										width : "30px",
										height : "30px"
									}).unbind("click");
								});

							var $familiarity = $("<div>")
								.addClass("vaalevel")
								.html(VAAOperation.constructFamiliarityImage(card.name, localStorage[card.idList]))
								.appendTo($head);

						}
					}
				});
				$('#butter1').fadeOut(0);
				bgPage.setIcon({
					'text' : word_num.toString()
				});
				localStorage['temp_wordlist']=JSON.stringify(tempWordList);
				if (word_num == 0) {
					var $noword = $("<div>")
						.addClass("nowordcontainer")
						.html('<div class="nowordtoremember">' + VAAOperation.nowordremember + '</div><div class="great">' + VAAOperation.greatjob + '</div>')
						.appendTo($cardlist);
				}
			}
		});
	},
	
	
	
	timeArray : [5, 30, 720, 1440, 2880, 5760, 10082, 21600, -1],
	setTime : function (level) {
		var date = new Date();
		date.setMinutes(date.getMinutes() + VAAOperation.timeArray[level]);
		console.log("date2 :" + date);
		console.log("ISO " + date.toISOString());
		console.log("date3 " + new Date(date.toISOString()));
		return date.toISOString();
	},
	
	remembereWord : function (list_id, card_id) {
		if (parseInt(localStorage[list_id]) == 8) {
			VAAOperation.closedCard(card_id, true);
		} else {
			for (var key in localStorage) {
				//console.log("key: " + key + " value:" + localStorage[key] + " type: " + typeof(localStorage[key]));
				if (parseInt(localStorage[key]) == parseInt(localStorage[list_id]) + 1) {
					//console.log()
					var time = VAAOperation.setTime(parseInt(localStorage[list_id]) + 1);
					VAAOperation.changeCardList(card_id, key, time);
					return;
				}
			}

		}
	},

	openOption : function () {
		chrome.tabs.create({
			url : "options.html"
		});
	}
}

String.prototype.chunk = function (n) {
	if (n < 0 || this.length < n) {
		return this;
	} else if (n > 0) {
		return this.substring(0, n) + '...';
	}
}



