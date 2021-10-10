export function showInGameFriends() {
    // If user active
    if ($('#pending-friend-requests').length) {
        removeElement('#', 'fmodule');
        appendInfoBlock();
        // Check my friends
        let my_id = document.documentElement.innerHTML.match(
            /user_id\s?:\s?\"(\d+)\"/
        );
        if (my_id[1]) {
            $('#btnFriends').text('List updating..');

            checkFriendsStatus(my_id[1]);

            // Module position
            let position = $('#page_body').offset();
            let $module = $('#fmodule');
            $module.css({ top: position.top });
            // Fix width if small width
            if (position.left > 300) {
                $module.css({ width: position.left });
            } else {
                $module.css({ width: '300px' });
            }

            $module.on('click', function (e) {
                if (
                    $(e.target).hasClass('fstatus') ||
                    $(e.target).hasClass('fname') ||
                    $(e.target).hasClass('fscore')
                ) {
                    $module
                        .find('.fblock')
                        .removeClass('ffocus')
                        .find('.finfo')
                        .hide();
                    $(e.target)
                        .closest('.fblock')
                        .addClass('ffocus')
                        .find('.finfo')
                        .show();
                }
            });

            $('#ftitle').on('click', function () {
                checkFriendsStatus(my_id[1]);
            });

            $('#fclose').click(function () {
                $module.animate(
                    {
                        width: 'toggle',
                    },
                    300
                );
            });
        } else {
            $('#ftitle').text('No friends?');
            $('#btnFriends').text('Error: user not exist');
        }
    } else {
        $('#btnFriends').text('Please log in');
    }
}

export function addFriendsModule() {
    // For future testing foreground -> background
    chrome.runtime.sendMessage(
        {
            from: 'foreground',
            subject: 'DOMInfo',
            todo: 'showFriends',
        },
        (response) => {
            if (response.message === 'success') {
                showInGameFriends();
            }
        }
    );
}

function checkFriendsStatus(id) {
    $('#ftitle').text('Loading...');
    removeElement('.', 'fblock');

    getFriends(id)
        .then((data) => listFriends(data))
        .then((data) => listServers(data))
        .then((data) => adjustFriendsList(data))
        .then(checkGlobalStatus);
}

function appendInfoBlock() {
    let $main = $('body');
    // Default layout
    $main.prepend(`
        <div id="fmodule">
            <div id="ftitle"></div><div id="fclose">X</div>
            <div id="fcontent"></div>
        </div>
    `);
}

async function getFriends(id) {
    let response = await fetch(
        `https://api.thehunter.com/v1/User/friendslist?user_id=${id}`
    );
    return await response.json();
}

async function listFriends(data) {
    let friends = [];

    $.each(data.friends, function (i, item) {
        friends.push(item.handle);
    });

    return friends;
}

async function listServers(data) {
    let friendsData = [];

    let response = await fetch(`https://api.thehunter.com/v1/Network/list`);
    let server = await response.json();
    //  Scan each server
    $.each(server, function (i, item) {
        // Scan each client
        $.each(item.clients, function (key, client) {
            // Find friend and show
            for (let i = 0; i < data.length; i++) {
                let name = data[i];
                if (name == client.handle) {
                    // If no slots in server
                    let falert;
                    falert =
                        item.clients_len === item.max_players ? 'falert' : '';
                    // If server protected with password
                    let secure;
                    secure = item.password === true ? '&#128274;' : '';

                    friendsData.push({
                        name: client.handle,
                        photo: client.avatar,
                        score: client.hunterscore,
                        server: item.name,
                        reserve: item.reserve.name,
                        min: item.clients_len,
                        max: item.max_players,
                        secure: secure,
                        status: falert,
                    });
                }
            }
        });
    });

    friendsData.sort(function (a, b) {
        return a.server.localeCompare(b.server);
    });
    return friendsData;
}

async function adjustFriendsList(data) {
    let allServers = data.map(function (item) {
        return item.server;
    });
    let groupServers = allServers.filter(
        (a, i, aa) => aa.indexOf(a) === i && aa.lastIndexOf(a) !== i
    );

    let groupPositions = [];
    data.forEach((friend) => {
        let withGroup = false;
        groupServers.forEach((server, i) => {
            if (server === friend.server) {
                friend.groupId = i;
                withGroup = true;
            }
            return false;
        });

        if (withGroup) {
            groupPositions.unshift(friend);
        } else {
            groupPositions.push(friend);
        }
    });

    groupPositions.sort(function (a, b) {
        return a.groupId - b.groupId;
    });

    groupPositions.forEach((friend) => {
        showOnlineFriend(friend);
    });
}

function showOnlineFriend(friend) {
    let statusTemplate = `<span class="show-sstatus"><span class="show-pass">${friend.secure}</span> <span class="show-fstatus ${friend.status}">&#9679;</span></span>
`;
    let friendTemplate = `
    <div class="fblock">
        <div class="fstatus">
        <a href="https://www.thehunter.com/#profile/${friend.name}">
            <img class="fimage" src="${friend.photo}" />
        </a>
        <span class="fname">${friend.name}</span>
        <span class="fscore">(${friend.score})</span> 
        
        ${typeof friend.groupId === 'undefined' ? statusTemplate : ''}
        </div>
        <div class="finfo">
            <div class="fgame">${friend.server}</div>
            <div class="fmap">${friend.reserve}</div> <div class="fplayers">${
        friend.min
    }/${friend.max}</div>
        </div>
        <div style="clear:both"></div>
    </div>
    `;

    let groupTemplate = `
        <div class="fstatus gsstatus">
            <span class="show-sstatus"><span class="gname">Team-${
                friend.groupId + 1
            }: ${friend.name
        .charAt(0)
        .toUpperCase()}</span><span class="gstatus"><span class="show-pass">${
        friend.secure
    }</span> <span class="show-fstatus ${
        friend.status
    }">&#9679;</span></span></span>
        </div>
    `;

    if (typeof friend.groupId === 'undefined') {
        $('#fcontent').append(friendTemplate);
    } else {
        if (!$(`.group-${friend.groupId}`).length) {
            $('#fcontent').append(
                `<div class="fgroup group-${friend.groupId}">${groupTemplate}</div>`
            );
            $(`.group-${friend.groupId}`).append(friendTemplate);
        } else {
            $(`.group-${friend.groupId}`).append(friendTemplate);
            let currentGroupName = $(`.group-${friend.groupId} .gname`).text();
            $(`.group-${friend.groupId} .gname`).text(
                currentGroupName + friend.name.charAt(0).toUpperCase()
            );
        }
    }
}

async function checkGlobalStatus() {
    if ($('.fblock').length > 0) {
        $('#ftitle').text('Online friends');
        let number = $('.fblock').length;
        $('#btnFriends').text(`In-game friends: ${number}`);
    } else {
        $('#btnFriends').css({ visibility: 'hidden' });
        $('#ftitle').text('All friends Offline');
    }
}

function removeElement(el, name) {
    let elementName = `${el}${name}`;
    if ($(elementName).length > 0) {
        $(elementName).remove();
    }
}
