let intervalListener;

export function setMessageStatus() {
    chrome.storage.local.get('messageResult', function (helper) {
        if (!helper.messageResult) {
            chrome.storage.local.set({ messageResult: false });
        }
    });
}

export function autoReadMessages() {
    let button = $('#btnMessage');
    button.toggleClass('btnActive');

    chrome.storage.local.get('messageResult', function (helper) {
        if (helper.messageResult) {
            chrome.storage.local.set({ messageResult: false });
            disableReadMessages();
        } else {
            $('#btnMessage').text('Checking every 5 minutes');
            chrome.storage.local.set({ messageResult: true });
            enableReadMessages();
        }
    });
}

function enableReadMessages() {
    if ($('#pending-friend-requests').length) {
        chrome.storage.local.get('messageResult', function (helper) {
            if (helper.messageResult) {
                if (!intervalListener) {
                    intervalListener = self.setInterval(function () {
                        checkMessageVisibility();
                    }, 300000);
                }
            }
        });
    }
}

function disableReadMessages() {
    clearInterval(intervalListener);
    intervalListener = null;
    $('#btnMessage').text('Read new messages');
}

// Check if message exist
function checkMessageVisibility() {
    //console.log('checking message visibility...');
    let messageNumber = $('.section.messages .count-number').text();
    if (messageNumber !== '' && messageNumber > 0) {
        initMessageChecker();
    }
}

// Initiate set interval and assign it to intervalListener
function initMessageChecker() {
    let auth_id = document.documentElement.innerHTML.match(
        /\"access_token\":\"(\w+)\"/
    );
    checkMessageStatus(auth_id[1]);
}

function checkMessageStatus(auth_id) {
    getMessage(auth_id)
        .then((data) => checkMsgTime(data))
        .then((message) => readMsg(message));
}

async function getMessage(auth_id) {
    let response = await fetch(
        `https://api.thehunter.com/v1/Chat/conversations?oauth_access_token=${auth_id}`
    );
    return await response.json();
}

async function checkMsgTime(data) {
    return data.filter(function (msg) {
        let timeNow = Math.ceil(new Date().getTime() / 1000);
        let diffTime = Math.abs(msg.ts - timeNow);
        //console.log(`TimeNow: ${timeNow} MsgTime: ${msg.ts} Last message difference in sec: ${diffTime}`);
        // / Check if exist 5 min old messages + only unread (300)
        if (msg.handle !== 'Doc') {
            if (msg.read === 0) {
                return msg;
            }
        }
    });
}

async function readMsg(data) {
    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            /*console.log(
					`MSG number: ${i + 1} , Author: ${
							data[i].handle
					} Server time: ${new Date((data[i].ts + 3 * 3600) * 1000)
							.toISOString()
							.slice(0, 19)
							.replace('T', ' ')}`
			);*/ // server time +3H ?
            let realMessage = `${
                data.length > 1
                    ? `Attention! ... Message ID: ${i + 1}...`
                    : `Alert! ... `
            } New message from: ${data[i].handle} The message is... ${
                data[i].preview
            }`;
            chrome.runtime.sendMessage({
                from: 'foreground',
                subject: 'userCommand',
                todo: 'readMessage',
                message: realMessage,
            });
        }
    }
}
