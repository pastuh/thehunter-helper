import {
	checkElementLoaded,
	checkPageLoaded, hideInfoMessage,
} from '../utilities/extension/helpers';

export function addLeaderboardGameType() {
	checkPageLoaded(function () {
		// If content exist
		if (!$('#leaderboard-game-info').length && !$('.leaderboard-section-end').length) {
			console.log('Checking leaderboard..');

			$('#leaderboard-header .leaderboard-content').prepend(
				`<div id="leaderboard-game-info" class="leaderboard-alert"><span class="leaderboard-info-message">Checking status..</span></div>`
			);
			activateLeaderboards();
		}
	});
}

function activateLeaderboards() {
	checkElementLoaded('#leaderboard-container #leaderboard-content', function () {
		getGameInfoFromUsers()
			.then(data => checkSheets(data))
			.then(data => showGameType(data))
	});
}

async function getGameInfoFromUsers() {
	let sheetLinks = [];

	$('#leaderboard-content tr').each(function (i, line) {

		let scorePage = $(this).find('.score a').attr('href');
		let name = /profile\/(\w+)\//gi.exec(scorePage)[1];
		let sheetId = /score\/(\d+)$/gi.exec(scorePage)[1];

		// Data from first 10 lines
		if(i < 10) {
			sheetLinks.push({name, sheetId, line});
		} else {
			$(this).addClass('leaderboard-section-end');
			return false;
		}

	});

	return sheetLinks;
}

async function checkSheets(players) {

	if (players.length) {
		try {
			let data = await Promise.all(
				players.map((player) => {
					return $.ajax({
						type: 'GET',
						url: `https://www.thehunter.com/user/${player.name}/score/?id=${player.sheetId}&tab=true`,
						success: function (data) {
							return data;
						},
						statusCode: {
							500: function() {
								$('#leaderboard-game-info').html('<span class="leaderboard-info-message error">Error.. page reload required</span>');
							}
						}
					});

				})
			);
			return {data, players};
		} catch (error) {
			//console.log(error);
			throw error;
		}
	}
}

async function showGameType(info) {

	if (typeof info.data !== 'undefined' && info.data.length) {
		info.data.forEach((page, index) => {
			let gameStatus = /"singleplayer":(\d+),/gi.exec(page)[1];

			//console.log(`Multiplayer? ${gameStatus}`, info.players[index].name);

			if(parseInt(gameStatus) === 0) {
				let htmlElement = info.players[index].line;
				let infoElement = $(htmlElement).find('.score-game-type');

				infoElement.addClass('leaderboard-status');
				infoElement.text('MP');
			}

		});
	}
	hideInfoMessage('#leaderboard-game-info');
}