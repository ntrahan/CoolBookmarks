// mode: what's currently going on with the user interface - possible values
	// regular: the bookmarks are simply displayed, nothing special
	// title: the title of a bookmark node is being edited
	// contextMenu: the context menu is open
var mode = 'regular';

var targetId; // holds the id of the bookmarks node that was right-clicked on
var targetIsFolder; // true is the node that was right-clicked on is a folder
	// otherwise it's a bookmark
var editingId; // if the mode is 'title', this holds the id of the node
	// currently being edited

// Get the title of the bookmark node with the given id
// (get it from the DOM for speed)
function getTitle(id) {
	return $('#node_' + id + ' .title')[0].innerHTML;
}

// Set the title for the bookmark node with the given id,
// both on the UI and in the backend.
function setTitle(id, newTitle) {
	$('#node_' + id + ' .title')[0].innerHTML = newTitle;
	chrome.bookmarks.update(id, {title: newTitle});
}

function startEditingTitle(id) {
	$('.node').removeClass('selected');

	var link = $('#node_' + id + ' .link');

	link.hide();
	$('#menu').hide();
	$('#inputEdit')[0].value = getTitle(id);

	// add input box to edit the title
	link.before($('#inputEdit'));
	$('#inputEdit').show();
	$('#inputEdit')[0].select();
	$('#inputEdit')[0].focus();

	mode = 'title';
}

function finishEditingTitle(id) {
	var newTitle = $('#inputEdit')[0].value;
	setTitle(id, newTitle);

	$('#inputEdit').hide();
	$('#node_' + id + ' .link').show();
}

// Assuming a string has the format "[a-zA-Z]*_(.*)",
// return the part after the underscore.
function getIdNum(id) {
	pattern = /^[a-zA-Z]*_(.*)$/;
	return id.match(pattern)[1];
}

// Close the context menu
function closeContextMenu() {
	$('#menu').hide();
	$('.node').removeClass('selected');
}

// Returns the html code for the div tag to display the given bookmarkNode
// bookmarkNode: BookmarkTreeNode
var nodeHtml = '';
function nodeDiv(bookmarkNode) {
	var start = new Date().getTime();
	nodeHtml = '';
	nodeDiv1(bookmarkNode);

	return nodeHtml;
}

function nodeDiv1(bookmarkNode) {
	if ('children' in bookmarkNode) { // then the node is a folder
		var visible = (localStorage['node_' + bookmarkNode.id] == 'true');
		var extraClass = visible ? 'visible' : 'hidden';
		var folderImg = visible ? 'folder_opened.gif' : 'folder_closed.gif';
		
		nodeHtml += '<div id="node_' + bookmarkNode.id + '" class="folder">';
		nodeHtml += '<div id="folderTitle_' + bookmarkNode.id + '" class="folderTitle node"><img class="icon" src="../media/' + folderImg + '" /><span class="title">' + bookmarkNode.title + '</span></div>';
		nodeHtml += '<div id="folderContents_' + bookmarkNode.id + '" class="folderContents ' + extraClass + '">';
		for (i in bookmarkNode.children) {
			nodeDiv1(bookmarkNode.children[i]);
		}
		nodeHtml += '</div></div>';
	} else { // then the node is a bookmark
		var favicon = 'chrome://favicon/' + escapeHtml(bookmarkNode.url);
		var lastVisitedClass = '';
		if (localStorage['lastVisited'] == bookmarkNode.id) {
			lastVisitedClass = ' lastVisited';
		}

		//nodeHtml += '<div id="node_' + bookmarkNode.id + '" class="bookmark node"><img class="icon" src="' + favicon + '" width="16" height="16" /><a class="link' + lastVisitedClass + '" href="' + bookmarkNode.url + '"><span class="title">' + bookmarkNode.title + '</span></a></div>';
		nodeHtml += '<div id="node_' + bookmarkNode.id + '" class="bookmark node"><img class="icon" src="' + favicon + '" width="16" height="16" /><a class="link' + lastVisitedClass + '" href="' + bookmarkNode.url + '"><span class="title">' + bookmarkNode.title + '</span></a></div>';
	}
}

originalIndex = 0; // original index, within its parent div.folderContents, 
	// of the node that's currently being moved
originalParentId = 0; // id of the parent of the bookmark before it was moved

// Use jQuery to make the given div sortable.
// contentsDiv: jQuery object representing a div
function makeSortable(contentsDiv) {
	// nodeDiv: jQuery object representing a div
	function bookmarkNodeIdOfParent(nodeDiv) {
		idOfParent = getIdNum($(nodeDiv).parent()[0].id);
		return idOfParent;
	}

	contentsDiv.sortable({
		appendTo: "body",
		zIndex: 100,
		placeholder: "dropTarget",
		connectWith: ".folderContents",
		distance: 5,
		start: function(event, ui) {
			node = ui.item[0];
			siblings = $(node).parent().children().toArray();
			originalIndex = Array.prototype.indexOf.call(siblings, node);
			originalParentId = bookmarkNodeIdOfParent(node);
		},
		stop: function(event, ui) {
			setTimeout(function() {
				node = ui.item[0];

				// find the id of the node being moved
				idOfNode = getIdNum(node.id);
				idOfParent = bookmarkNodeIdOfParent(node);

				siblings = $(node).parent().children().toArray();
				newIndex = Array.prototype.indexOf.call(siblings, node);
				if ((idOfParent == originalParentId) && (newIndex > originalIndex)) {
					newIndex++;
				}

				chrome.bookmarks.move(idOfNode, {parentId: idOfParent, index: newIndex});
			}, 50);
		}
	});
}

$(function() {
	// create the UI to display the tree of bookmarks
	chrome.bookmarks.getTree(function(bookmarks) {

		mainContainer = $('div.mainContainer');
		otherBookmarksNode = bookmarks[0].children[1];
		for (i in otherBookmarksNode.children) {
			mainContainer.append(nodeDiv(otherBookmarksNode.children[i]));
			mainContainer[0].id = 'folderContents_' + otherBookmarksNode.id;
		}
		
		$('div.folderContents:visible').each(function() {
			makeSortable($(this));
		});

		// action when clicking on a link
		$('div.mainContainer').on('click', 'a', function(e) {
			if (e.which != 1) { return; }


			if (mode != 'regular') { return; }
			href = e.currentTarget.href;
			node = ($(this).parent())[0];
			localStorage['lastVisited'] = getIdNum(node.id);

			// highlight the node, remove highlight from all other nodes
			/*$('a.link').each(function(i) {
				$(this).removeClass('lastVisited');
			});
			$(this).addClass('lastVisited');*/

			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.update(tab.id, {url: href});
			});

			// close the popup
			setTimeout(function() { window.close(); },	50);
		});
		
		// hide or show folders on click
		$('div.mainContainer').on('click', 'div.folderTitle', function(e) {
			if (mode != 'regular') { return; }

			var folderContents = $(e.currentTarget).next()[0];
			$(folderContents).toggle();
			var folderIsVisible = (folderContents.style.display != 'none');
			var index = 'node_' + getIdNum(folderContents.id);
			
			localStorage[index] = folderIsVisible;

			if (!folderIsVisible) {
				$(folderContents).sortable('destroy');
				$(e.currentTarget).find('img')[0].src = "../media/folder_closed.gif";
			} else {
				makeSortable($(folderContents));
				$(e.currentTarget).find('img')[0].src = "../media/folder_opened.gif";
			}
		});

		// on context menu when right clicking on a node
		$('body').on('contextmenu', 'div.node', function(e) {
			mode = 'contextMenu';

			var pattern = /^folderTitle_(.*)$/;
			var menu = $('#menu')[0];
			var node = this;

			// display the context menu
			menu.style.left = (e.clientX + 5) + 'px';
			menu.style.top = (e.clientY + document.body.scrollTop + 5) + 'px';
			menu.style.display = 'block';
			
			// highlight the targetted node, remove highlight from all other nodes
			$('.node').each(function(i) {
				if (this.id == node.id) {
					$(this).addClass('selected');
				} else {
					$(this).removeClass('selected');
				}
			});

			targetId = getIdNum(this.id);
			targetIsFolder = pattern.test(this.id);
			mode = 'contextMenu';

			return false;
		});
		
		// delete
		$('#menu_delete').on('click', function(e) {
			if (targetIsFolder) {
				chrome.bookmarks.removeTree(targetId);
			} else {
				chrome.bookmarks.remove(targetId);
			}

			$('#node_' + targetId).remove();
		});
		
		// add link here
		$('#menu_add_bookmark').on('click', function(e) {
			// get the currently selected tab
			chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
				currentTab = tabs[0];

				// get the BookmarkTreeNode object for the bookmark we right-clicked on
				chrome.bookmarks.get(targetId, function(results) {
					targetBookmarkNode = results[0];

					chrome.bookmarks.create({
						parentId: results[0].parentId,
						index: targetBookmarkNode.index,
						title: currentTab.title,
						url: currentTab.url},
						function(newTreeNode) {
							
							$('#node_' + targetId).before(nodeDiv(newTreeNode));
						}
					);
				});
			});
		});

		// action on "add new folder"
		$('#menu_add_folder').on('click', function(e) {
			$( "#dialogCreateFolder" ).dialog("open");
		});

		// action on "edit title"
		$('#menu_edit_title').on('click', function(e) {
			editingId = targetId;
			startEditingTitle(editingId);
			return false;
		});

		$('html').on('mousedown keyup', function(e) {
			if (e.type == 'keyup' && e.keyCode != 13) { // (key 13 is 'enter')
				return false;
			}

			if (mode == 'contextMenu') {
				closeContextMenu();
				mode = 'regular';
			} else if (mode == 'title') {
				finishEditingTitle(editingId);
				mode = 'regular';
			}
		});
		
		$('.menu').on('mousedown', function(e) {
			e.stopPropagation();
		});

		// always close the context menu after clicking on one of its links
		$('.menu').on('click', function(e) {
			closeContextMenu();
		});

		// clicking on the input box shouldn't cancel editing
		$('#inputEdit').on('mousedown', function(e) {
			e.stopPropagation();
		});

		// make the enter key accept the "create folder" dialog
		$('#dialogCreateFolder').keypress(function(e) {
			if (e.keyCode == $.ui.keyCode.ENTER) {
				$(this).parent().find('button').eq(0).trigger('click');
    		}
		});
	});

	// save the scroll position of the popup (we'll restore it when it's reopened)
	addEventListener('scroll', function() {
		localStorage.scrollTop = document.body.scrollTop;
	});

	// create the dialog menu to create a new folder	
	$("#dialogCreateFolder" ).dialog({
        autoOpen: false,
        height: 220,
        width: 300,
        modal: true,
        buttons: {
            "Create folder": function() {
            	// get the BookmarkTreeNode object for the bookmark we right-clicked on
				chrome.bookmarks.get(targetId, function(results) {
					targetBookmarkNode = results[0];

					chrome.bookmarks.create({
						parentId: results[0].parentId,
						index: targetBookmarkNode.index,
						title: $('#folderName')[0].value},
						function(newTreeNode) {
							newTreeNode.children = [];
							$('#node_' + targetId).before(nodeDiv(newTreeNode));
							$('#folderTitle_' + newTreeNode.id).trigger('click');
						}
					);
				});
				$(this).dialog('close');
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        },
        close: function() {}
    });

	setTimeout(
		function() { document.body.scrollTop = localStorage.scrollTop; },
		50);
});