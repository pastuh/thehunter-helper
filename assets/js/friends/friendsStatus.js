import {checkElementLoaded, initAuth} from '../utilities/extension/helpers';

export function addFriendsStatus() {
	if (!$('#friends-info').length) {

		$('#statusbar-container .friends.hasTooltip').append(
			`<div id="friends-info"></div>`
		);
		getFriends()
			.then(data => countFriends(data))
			.then(data => listFriends(data));
	}
}

async function getFriends() {
	let id = initAuth();
	let response = await fetch(
		`https://api.thehunter.com/v1/Me/friends?oauth_access_token=${id}`
	);
	return await response.json();
}

async function countFriends(data) {
	let friends = 0;

	$.each(data.friends, function (i, item) {
		if(item.online) {
			friends += 1;
		}
	});

	return friends;
}

async function listFriends(onlineFriendsCount) {
	let friendsCounter = $('#friends-info');

	if(onlineFriendsCount > 0) {
		friendsCounter.text(onlineFriendsCount);
	}
}

export function showOnlineFriends() {
	checkElementLoaded('#friends-dropdown .friends-list .mCSB_container', function () {
		if (!$('.online-friends-info').length) {
			//console.log('Adjusting friends list');

			let listZone = $('#friends-dropdown .friends-list .mCSB_container')

			$('#friends-dropdown .friends-list .friend').each((i, friend) => {
				let friendEl = $(friend);
				let indicator = friendEl.find('.online-indicator');

				if (indicator.length > 0){
					friendEl.detach();
					listZone.prepend(friend);
					friendEl.find('.buttons a.friend-send-message').addClass('send-msg-online online-friends-info');
				}

			});

		}
	});
}