jQuery(function($) {

	var closeCurrentTab = function() {
        chrome.tabs.getCurrent(function (tab) {
            chrome.tabs.remove( tab.id );
        });
	}, onAuthorize = function() {
		$("#select_service").addClass("authorized");
		$("#auth").hide();
		setTimeout(closeCurrentTab, 2000);
		
	};
						  
	Trello.authorize({
		interactive: false,
		success: onAuthorize
	});

	if (!Trello.authorized()) {
		Trello.authorize({
			expiration: "never",
			name: "VAA for Chrome",
			success: onAuthorize
		});
	}
	
	var authorizationing_Key = chrome.i18n.getMessage("authorizationing");
 	var authsuccess_Key = chrome.i18n.getMessage("authorizationSuccess");
	$("#auth").html(authorizationing_Key);
	$("#success").html(authsuccess_Key);
});