jQuery(function ($) {
	
	$container = $('#container');
	$container.isotope({
		itemSelector : '.element',
		masonry : {
			columnWidth : 110
		}
	});
	if (localStorage["trello_token"]) {
		Trello.authorize({
			interactive : false,
			success : VAAOperation.trelloAuthorizeSuccess
		});
		titleSelect("trello");
	}

	/*$('#output').perfectScrollbar({
          wheelSpeed: 20,
          wheelPropagation: false
        });*/
	
	function titleSelect(choice) {
	if (choice == "trello") {
		$("#1").attr("title", VAAOperation.refresh);
		//$("#2").attr("title", rss);
		$("#3").attr("title", VAAOperation.option);
		$("#1").click(function () {
			util.loadingDataPic();
			VAAOperation.getListCard(localStorage["board_id"]);
		});
		//trello无rss
		$("#2").css("display", "none");
		$("#3").click(VAAOperation.openOption);
	}
}
	//去掉图片模式
	/*var $listModel = $("<span>")
	.addClass("listmodel")
	.text(list_mode)
	.appendTo("#modelchoice")
	.click(function(){
	util.loadingDataPic();
	$(".listmodel").css("background-color" ,"#99CCFF");
	$(".picmodel").css("background-color" ,"white");
	constructListModelContent();
	modelchoice = "listmodel";
	});
	var $piclistModel = $("<span>")
	.addClass("picmodel")
	.text(pic_mode)
	.appendTo("#modelchoice")
	.click(function(){
	util.loadingDataPic();
	$(".picmodel").css("background-color", "#99CCFF");
	$(".listmodel").css("background-color", "white");
	modelchoice = "picmodel";
	constructPicModelContent();
	});*/
	
	if (!localStorage["trello_token"]) {
		
		localStorage["service"] = "Trello";
		
		if (localStorage["service"] == "Trello" || typeof localStorage["service"] == "undefined") {
			VAAOperation.trelloAuthorize();
		}
	}
	
	//$("#trellotest").attr("href", chrome.extension.getURL('connect.html'));
	
	var Init_Title = chrome.i18n.getMessage("init_title");
	$("#init_title").html(Init_Title);

	document.addEventListener("mouseup", function (a) {
		if (a.target.id == "speaker") {
			(new Audio($(a.target).attr('class'))).play();
		}
	});
});

