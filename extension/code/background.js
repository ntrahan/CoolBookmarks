/*var boo = false;

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (!boo) {
			sendResponse({r: "false"});
			boo = true;
		}
	});
*/

/*------IF WE WANT TO SHOW BOOKMARKS AS A DIV------
// create the div for a folder and all its subfolders
function bookmarkDiv(bookmarkNode, level) {
	if ('children' in bookmarkNode) {
		// then the node is a folder
		nodeCode = '<div class="folderTitle">' + bookmarkNode.title + '</div>';
		nodeCode += '<div class="folder" style="margin-left:' + ((level + 1) * 20) + 'px">';
		for (i in bookmarkNode.children) {
			nodeCode += bookmarkDiv(bookmarkNode.children[i], level + 1);
		}
		nodeCode += '</div>';
		return nodeCode;
	} else {
		// then the node is a bookmark
		return '<div class="bookmark"><a href="' + bookmarkNode.url + '">' + bookmarkNode.title + '</a></div>';
	}
}

// construct bookmarks page
var bookmarksDiv;
chrome.bookmarks.getTree(function(bookmarks) {
	//bookmarksDiv = '<div>';
	divContents = '';
	for (i in bookmarks[0].children) {
		divContents = divContents + bookmarkDiv(bookmarks[0].children[i], 0);
		//alert(bookmarksDiv);
		//console.log(treeNodes[i]);
	}
	//bookmarksDiv += '</div>';
	
	bookmarksDiv = document.createElement('div');
	bookmarksDiv.innerHTML = divContents;
	bookmarksDiv.id = "bookmarksDiv_23876238766";
	bookmarksDiv.style.position = "absolute";
	bookmarksDiv.style.right = 0;
	bookmarksDiv.style.width = "20%";
	bookmarksDiv.style.heigth = "100%";
	bookmarksDiv.style.borderLeft = "1px black solid";
	bookmarksDiv.style.borderRight;

	// add click event for links
	$('a').on('click', function(e) {
		var href = e.currentTarget.href;
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.update(tab.id, {url: href});
		});
		window.close(); // To close the popup.
	});
	
	// add event to hide or show folders on click
	$('div.folderTitle').on('click', function(e) {
		$(e.currentTarget).next().hide();
	});
});
---------------------------------------------------*/


/*Send request to current tab when page action is clicked*/
/*
chrome.browserAction.onClicked.addListener(function(tab1) {
	chrome.windows.getCurrent(function(win) { chrome.tabs.query( {'windowId': win.id, 'active': true}, function(tabArray) {
		tab = tabArray[0];
		
		//chrome.tabs.sendMessage(
		chrome.tabs.sendRequest(
			tab.id,
			{
				"callFunction": "toggleSidebar",
				"url": tab.url,
				"html": "Hello <b>World</b>",
				"css": "\
					position:fixed;\
					top:0px;\
					left:0px;\
					width:30%;\
					height:100%;\
					background:white;\
					box-shadow:inset 0 0 1em black;\
					z-index:999999;",
				"bookmarks": bookmarksDiv
			},
			function(response) {
				//alert("got back");
			});
	  });});
});
*/

/*// send the bookmarks to the content scripts for all the open tabs of the current window
chrome.windows.getCurrent( function(win) {
	chrome.tabs.query( {'windowId': win.id}, function(tabArray) {
		for (i in tabArray) {
			chrome.tabs.sendRequest(
				tabArray[i],
				{
					'callFunction': 'bookmarks',
					'bookmarksDiv': bookmarksDiv
				});
		}
	});
});


// whenever a tab is created, send it the bookmarks div
chrome.tabs.onUpdated.addListener(function(tabId, info) {
    if (info.status == "complete") {
    	chrome.tabs.sendRequest(
    		tabId,
    		{'callFunction': 'bookmarks', 'bookmarksDiv': bookmarksDiv},
    		function(response) {}
    	);
    }
});
*/