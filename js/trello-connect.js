jQuery(function($) {
    
	var closeCurrentTab = function() {
        chrome.tabs.getCurrent(function (tab) {
            
			chrome.tabs.remove( tab.id );
        });
	}
	var onAuthorize = function() {
		
		$("#select_service").addClass("authorized");
		$("#auth").hide();
		setTimeout(closeCurrentTab, 5000);
		
	};
	
	
						  
	Trello.authorize({
		interactive: false,
		success: onAuthorize
	});

	if (!Trello.authorized()) {
		Trello.authorize({
			expiration: "never",
			name: "VAA for Chrome",
			scope: { write: true, read: true },
			success: onAuthorize
		});
	}
	
	var authorizationing_Key = chrome.i18n.getMessage("authorizationing");
 	var authsuccess_Key = chrome.i18n.getMessage("authorizationSuccess");
	$("#auth").html(authorizationing_Key);
	$("#success").html(authsuccess_Key);
});