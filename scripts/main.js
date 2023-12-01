// Get steamID
const steamid = getSteamID();
loadFaceITProfile(steamid);

// Create global variables
let id,
    level,
    levelImg,
    username,
    country,
    banned,
    banReason,
    coverImage = '',
    membership = '',
    elo = '',
    avgHS = '-',
    avgKD = '-',
    matches = '-',
    winrate = '-',
    avgKR = '-',
    avgKills = '-',
    registred = '',
    lastGames = '',
    res1 = '',
    res2 = '',
    res3 = '',
    res4 = '',
    res5 = '';


function loadFaceITProfile(steamid) {
    // Check if steamID was recieved successfully
    if (steamid === null) {
        return;
    }

    // Get FaceIT profile
    chrome.runtime.sendMessage('https://api.faceit.com/search/v1/?limit=3&query=' + steamid,
        result => onFaceITProfileLoaded(result)
    );
}

async function onFaceITProfileLoaded(result) {
    const profile = await getMainProfile(result);

    if (profile !== null) {

        //Fill in start data
        id = profile.guid;
        username = profile.nickname;
        country = profile.country;
        level = getLevel(profile.games, 'cs2');
        levelImg = chrome.runtime.getURL(`./img/levels/${level}.svg`);

        updateDOM();

        // Check for bans
        chrome.runtime.sendMessage('https://api.faceit.com/sheriff/v1/bans/' + id,
            result => {
                if (result[0]) {
                    banned = true;
                    banReason = result[0].reason;
                    updateDOM();
                }
            }
        );

        // Get additional data
        chrome.runtime.sendMessage('https://api.faceit.com/users/v1/nicknames/' + username,
            result => {
                membership = ((result.memberships.includes('csgo') || result.memberships.includes('premium')) ? 'Premium' : 'Free')
                elo = result.games.csgo.faceit_elo;
                coverImage = result.cover_image_url
                registred = new Date(result.created_at)
                    .toLocaleString('en-us', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                updateDOM();
            }
        );

        // Get lifetime CS:GO stats
        chrome.runtime.sendMessage('https://api.faceit.com/stats/v1/stats/users/' + id + '/games/cs2',
            result => {
                avgHS = result.lifetime.k8;
                avgKD = result.lifetime.k5;
                matches = result.lifetime.m1;
                lastGames = result.lifetime.s0;
                winrate = result.lifetime.m2

                res1 = lastGames[0]
                res2 = lastGames[1]
                res3 = lastGames[2]
                res4 = lastGames[3]
                res5 = lastGames[4]


                if (res1 == "0") {
                    res1 = `<span style="color:red; padding: 0 4px;">L</span>`
                } else if(res1 == "1"){
                    res1 = `<span style="color:green; padding: 0 4px;">W</span>`
                } else {
                    res1 = ''
                }

                if (res2 == "0") {
                    res2 = `<span style="color:red; padding: 0 4px;">L</span>`
                } else if(res2 == "1"){
                    res2 = `<span style="color:green; padding: 0 4px;">W</span>`
                } else {
                    res2 = ''
                }

                if (res3 == "0") {
                    res3 = `<span style="color:red; padding: 0 4px;">L</span>`
                } else if(res3 == "1"){
                    res3 = `<span style="color:green; padding: 0 4px;">W</span>`
                } else {
                    res3 = ''
                }

                if (res4 == "0") {
                    res4 = `<span style="color:red; padding: 0 4px;">L</span>`
                } else if(res4 == "1"){
                    res4 = `<span style="color:green; padding: 0 4px;">W</span>`
                } else {
                    res4 = ''
                }

                if (res5 == "0") {
                    res5 = `<span style="color:red; padding: 0 4px;">L</span>`
                } else if(res5 == "1"){
                    res5 = `<span style="color:green; padding: 0 4px;">W</span>`
                } else {
                    res5 = ''
                }

                // winrate = result.lifetime.k6;
                updateDOM();
            }
        );

    }

}




function updateDOM() {
    
    //Select the element where to show faceit profile data
    const customize = (document.querySelector('.profile_customization_area') ?? document.querySelector('.profile_leftcol'));

    //Add the box with the data
    let textNode = document.createElement("div");
    textNode.id = 'facex';
    textNode.innerHTML = `
    <div class="scanner-main">
        <div class="scanner-header">
            <p>Easy Faceit stats <span>by <a href="https://github.com/MakotoPD" target="_blank">MakotoPD</a></span></p>
        </div>
        <div class="scanner-bottombox">
            <div class="scanner-profile">
                <img
                    class="coverImage"
                    src="${coverImage}"
                    alt=""
                >
                <div style="flex:1; position: relative;">
                    <div style="display:flex">
                        <div><img id="avatar" src="${levelImg}" alt="avatar"></div>
                        <div style="padding-left: 8px;">
                            <a href="https://www.faceit.com/en/players/${username}" target="_blank" id="nick"><img style="width:1.5rem; padding-right:.5rem;" title="${country}" src="https://cdn-frontend.faceit.com/web/112-1536332382/src/app/assets/images-compress/flags/${country}.png">${username}</a>
                            <p>
                                ` + ((banned) ? `<span alt="${banReason}" class="faceit-banned">${banReason}</span> ` : `<p style="font-size:10px;">Membership <span id="membership">${membership}</span></p>
                                <p style="font-size:10px;">Registered: <span id="registered">${registred}</span> </p>`) + ` 
                            </p>
                        </div>
                    </div>
                    <p style="margin-left:1rem; margin-top:.5rem; background-color:#00000040; padding: 0 4px; border-radius: 4px; width:fit-content;"> ${ res1 } ${ res2 } ${ res3 } ${ res4 } ${ res5 } </p>
                    
                </div>
    
    
                <div style="flex:1; display:flex; justify-content: space-between; position: relative;">
                    <div style="display:flex; flex-direction:column; align-items: center; margin: 0 4px; background-color: #000000aa; height: min-content; padding: 8px; border-radius: 6px">
                        <p id="elo">${elo}</p>
                        <p style="font-size:10px; color: #189AB4;">ELO</p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items: center; margin: 0 4px; background-color: #000000aa; height: min-content; padding: 8px; border-radius: 6px">
                        <p id="matches">${matches}</p>
                        <p style="font-size:10px; color: #189AB4;">MATCHES</p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items: center; margin: 0 4px; background-color: #000000aa; height: min-content; padding: 8px; border-radius: 6px">
                        <p id="wins">${winrate}</p>
                        <p style="font-size:10px; color: #189AB4;">Wins</p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items: center; margin: 0 4px; background-color: #000000aa; height: min-content; padding: 8px; border-radius: 6px">
                        <p id="kd">${avgKD}</p>
                        <p style="font-size:10px; color: #189AB4;">K/D</p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items: center; margin: 0 4px; background-color: #000000aa; height: min-content; padding: 8px; border-radius: 6px">
                        <p id="hs">${avgHS}%</p>
                        <p style="font-size:10px; color: #189AB4;">HS</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    if (document.getElementById('facex')) {
        document.getElementById('facex')
            .innerHTML = textNode.innerHTML;
    } else {
        customize.prepend(textNode);
    }
}

function getLevel(games, searchGame) {
    let level = 1;
    games.map((game) => {
        if (game.name === searchGame) {
            level = game.skill_level;
        }
    });

    return level;
}

/**
 * Gets last profile with CS:GO
 * @param {*} result 
 * @returns 
 */
async function getMainProfile(result) {
    let profile = null;
    const allPlayers = result.players.results;
    if (allPlayers.length > 1) {
        allPlayers.map(async (user, index) => {
            if (user.games.length > 0) {
                user.games.map(async (game) => {
                    if (game.name == 'csgo') {
                        profile = allPlayers[index];
                    }
                });
            }
        });
    } else {
        profile = allPlayers[0];
    }

    return profile;
}


/**
 * Gets steamID from page report popup
 * @returns string
 */
function getSteamID() {
    //Getting steamID from report popup
    if (document.getElementsByName("abuseID") && document.getElementsByName("abuseID")[0]) {
        return document.getElementsByName("abuseID")[0].value
    }

    //If steamID somehow is not found, then try second method to get it (user is not logged in)
    else {
        return document.querySelector('.responsive_page_template_content')
            .innerHTML.split('script')[2].split('"')[8] ?? null;
    }
}

console.log(
    "%cEFS%cis running on this page.",
    "color: black; background:orange; padding: 2px 5px; border-radius:4px; margin-right: 10px;",
    "color: orange;"
    )