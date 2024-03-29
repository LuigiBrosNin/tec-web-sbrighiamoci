const sitePrefix = "https://site222326.tw.cs.unibo.it";
const adminPrefix = sitePrefix + "/admin";
const appPrefix = sitePrefix + "/app";


let currentUrl = window.location.href;

if (currentUrl.startsWith(adminPrefix)) {
    let relativeUrl = currentUrl.slice(adminPrefix.length);
    window.history.replaceState({}, "", appPrefix + relativeUrl);

    window.onload = function () {
        window.history.replaceState({}, "", currentUrl);
    }



    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer = new MutationObserver(function (mutations, observer) {     // every time something changes in the DOM, this function is invoked
        replaceAllAppLinks();
        addSubtitleToLogo();
        removeSwitchArea();
        addEditAndDeleteButtonsToAllSqueals();
        addSettingsButtonToProfile();
        addSettingsButtonToChannel();
        addNewSquealButtonToChannel();
        addCreateButtonToMyChannelsView();
        addManageAutomaticSquealsToMyChannelsView();
        addPrivateSquealToSearchView();

        //console.log("DOM changed", mutations, observer);
    });
    observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true
    });



    window.history.pushState = function (state, title, url) {
        url = changeUrlFromAppToAdmin(url);
        History.prototype.pushState.apply(history, arguments);
    }

    window.history.popState = function (state, title, url) {
        url = changeUrlFromAppToAdmin(url);
        History.prototype.popState.apply(history, arguments);
    }

    window.history.replaceState = function (state, title, url) {
        url = changeUrlFromAppToAdmin(url);
        History.prototype.replaceState.apply(history, arguments);
    }
}




console.log("Admin loaded!");








/* -------------------------------------------------------------------------- */
/*                                 FUNCTIONS                                  */
/*                     to make /admin different from /app                     */
/* -------------------------------------------------------------------------- */
// replaces all links that refer to /app with the same link that refers to /admin
// e.g. https://site222326.tw.cs.unibo.it/app/foo -> https://site222326.tw.cs.unibo.it/admin/foo
function replaceAllAppLinks() {
    const anchors = document.getElementsByTagName("a");
    const anchorsArray = Array.from(anchors);

    for (let i = 0; i < anchorsArray.length; i++) {
        if (anchorsArray[i].href.startsWith(appPrefix)) {
            // we need to replace the entire <a> element (and not only the href) in order to make Vue ignore it
            anchorsArray[i].outerHTML = `<a href="${adminPrefix + anchorsArray[i].href.slice(appPrefix.length)}" class="${anchorsArray[i].getAttribute("class")}" id="${anchorsArray[i].id}"> ${anchorsArray[i].innerHTML} </a>`;
        }
    }

}

// if the provided url refers to /app, it is returned the same url that refers to /admin, otherwise the provided url is returned
function changeUrlFromAppToAdmin(url) {
    if (url != null && url.startsWith(appPrefix)) {
        let relativeUrl = url.slice(appPrefix.length);
        url = adminPrefix + relativeUrl;
    }
    return url;
}

function addSubtitleToLogo() {
    let logos = Array.from(document.getElementsByClassName("logo_container"));
    for (let logo of logos) {
        let titles = Array.from(logo.getElementsByClassName("title"));
        for(let title of titles){
            if(Array.from(title.getElementsByClassName("logo_sub")).length <= 0){
                title.innerHTML += `<h3 class="logo_sub">Admin</h3>`;
            }
        }
    }
}

function removeSwitchArea() {
    const areas = document.getElementsByClassName("switch_area_btn");
    if (areas.length > 0) {
        for (const index in areas) {
            areas[index].outerHTML = "";
        }
    }
}

function addEditAndDeleteButtonsToAllSqueals() {
    const squeals = Array.from(document.getElementsByClassName("squeal_container"));
    for (const index in squeals) {
        let buttonArea = Array.from(squeals[index].getElementsByClassName("btn_area"))[0];

        if (buttonArea != null) {
            const buttons = document.createElement("div");
            buttons.appendChild(generateEditButton(squeals[index].id));
            buttons.appendChild(generateDeleteButton(squeals[index].id));

            if (!buttonArea.hasChildNodes() || !buttonArea.childNodes[0].isEqualNode(buttons) || buttonArea.childNodes.length != 1) {
                buttonArea.innerHTML = "";
                buttonArea.appendChild(buttons);
            }
        }
    }
}

function generateDeleteButton(squeal_id) {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("admin-squeal-button");
    deleteButton.setAttribute("onclick", `deleteSqueal("${squeal_id}")`);
    deleteButton.setAttribute("aria-label", "Delete squeal");
    const img = document.createElement("img");
    img.setAttribute("src", sitePrefix + "/icons/trash-svgrepo-com.svg");
    img.setAttribute("alt", "Delete squeal");
    img.classList.add("admin-squeal-button-img");
    deleteButton.appendChild(img);
    return deleteButton;
}

async function deleteSqueal(squeal_id) {
    if (confirm("Are you sure you want to delete this squeal? This action can't be undone") === true) {
        let res = await fetch(
            sitePrefix + `/squeals/${squeal_id}`,
            {
                method: "DELETE",
            }
        );
        if (res.status == 200) {
            let squealNode = document.getElementById(squeal_id);
            squealNode.outerHTML = "";
        }
    } else {
        // do nothing
    }
}

function generateEditButton(squeal_id) {
    const editButton = document.createElement("button");
    editButton.classList.add("admin-squeal-button");
    editButton.setAttribute("onclick", `window.location.href = "${sitePrefix}/admin/adminedit/squeal/${squeal_id}"`);
    editButton.setAttribute("aria-label", "Edit squeal");
    const img = document.createElement("img");
    img.setAttribute("src", sitePrefix + "/icons/pen-svgrepo-com.svg");
    img.setAttribute("alt", "Edit squeal");
    img.classList.add("admin-squeal-button-img");
    editButton.appendChild(img);
    return editButton;
}

function addSettingsButtonToProfile() {
    const profiles = Array.from(document.getElementsByClassName("profile_container")); // there should be only one per page, but who knows...
    for (const index in profiles) {
        let buttonArea = Array.from(profiles[index].getElementsByClassName("btn_area"))[0];

        if (buttonArea != null) {
            const button = document.createElement("div");
            button.appendChild(generateProfileSettingsButton(profiles[index].id));

            if (!buttonArea.hasChildNodes() || !buttonArea.childNodes[0].isEqualNode(button) || buttonArea.childNodes.length != 1) {
                buttonArea.innerHTML = "";
                buttonArea.appendChild(button);
            }
        }
    }
}

function addSettingsButtonToChannel() {
    const channels = Array.from(document.getElementsByClassName("channelInfoContainer")); // there should be only one per page, but who knows...
    for (const index in channels) {
        let buttonArea = Array.from(channels[index].getElementsByClassName("btn_area"))[0];

        if (buttonArea != null) {
            const button = document.createElement("div");
            button.appendChild(generateChannelSettingsButton(channels[index].id));

            if (!buttonArea.hasChildNodes() || !buttonArea.childNodes[0].isEqualNode(button) || buttonArea.childNodes.length != 1) {
                buttonArea.innerHTML = "";
                buttonArea.appendChild(button);
            }
        }
    }

    if(channels.length <= 0){
        let channelCards = Array.from(document.getElementsByClassName("channelCard"));
        for (card of channelCards){
            let buttonAreasToEmpty = Array.from(card.getElementsByClassName("btn_area"));
            for(area of buttonAreasToEmpty){
                if(area.innerHTML != ""){
                    area.innerHTML = "";
                }
            }
        }
    }
}

function generateProfileSettingsButton(profile_id) {
    return generateSettingsButton(profile_id, "profile");
}

function generateChannelSettingsButton(channel_id) {
    return generateSettingsButton(channel_id, "channel");
}

function generateSettingsButton(profile_id, typeOfSettings) {
    const settingsButton = document.createElement("button");
    settingsButton.classList.add("admin-squeal-button");
    settingsButton.setAttribute("onclick", `window.location.href = "${sitePrefix}/admin/adminedit/${typeOfSettings}/${profile_id}"`);
    settingsButton.setAttribute("aria-label", `${typeOfSettings} settings`);
    const img = document.createElement("img");
    img.setAttribute("src", sitePrefix + "/icons/gear-svgrepo-com.svg");
    img.setAttribute("alt", `${typeOfSettings} settings`);
    img.classList.add("admin-squeal-button-img");
    settingsButton.appendChild(img);
    return settingsButton;
}

function addNewSquealButtonToChannel() {
    const channels = Array.from(document.getElementsByClassName("channelInfoContainer")); // there should be only one per page, but who knows...
    for (const channel of channels) {
        let newSquealButton = Array.from(channel.getElementsByClassName("channel_new_squeal_button"))[0];

        if (newSquealButton == null) {
            const button = generateNewSquealButton(channel.id);
            channel.appendChild(button);
        }
    }
}

function generateNewSquealButton(profile_id) {
    const newSquealButton = document.createElement("a");
    newSquealButton.classList.add("channel_new_squeal_button");
    newSquealButton.setAttribute("href", `${sitePrefix}/admin/squealPut?receiver=${profile_id}`);

    const container = document.createElement("div");
    container.classList.add("channel_new_squeal_button_content");
    container.classList.add("admin-bg-button");
    container.setAttribute("aria-label", "Create a new Squeal in this channel");
    const img = document.createElement("img");
    img.setAttribute("src", sitePrefix + "/icons/plus-svgrepo-com.svg");
    img.classList.add("channel_new_squeal_button_image");
    img.setAttribute("alt", "Create a new Squeal in this channel");
    container.appendChild(img);
    const text = document.createElement("p");
    text.classList.add("channel_new_squeal_button_text");
    text.append("Create a new Squeal in this channel");
    container.appendChild(text);

    newSquealButton.appendChild(container);
    return newSquealButton;
}

function addCreateButtonToMyChannelsView() {
    const buttonsAreas = Array.from(document.getElementsByClassName("myChannelsButtonsContainer")); // there should be only one per page, but who knows...
    if (buttonsAreas.length > 0) {
        let oldCreateButton = document.getElementById("createChannelsButton");
        if (oldCreateButton != null) {
            oldCreateButton.outerHTML = "";
        }

        let newCreateButton = document.getElementById("adminCreateChannelsButton");
        if (newCreateButton == null) {
            const button = generateCreateChannelButton();
            buttonsAreas[0].appendChild(button);
        }
    }
}

function generateCreateChannelButton() {
    const newChannelButton = document.createElement("a");
    newChannelButton.id = "adminCreateChannelsButton";
    newChannelButton.setAttribute("href", `${sitePrefix}/admin/admincreate/channel`);
    newChannelButton.setAttribute("aria-label", "Create new channel");
    newChannelButton.classList.add("admin-pill");
    newChannelButton.append("Create");
    return newChannelButton;
}

function addManageAutomaticSquealsToMyChannelsView() {
    const buttonsAreas = Array.from(document.getElementsByClassName("myChannelsButtonsContainer")); // there should be only one per page, but who knows...
    if (buttonsAreas.length > 0) {
        let manageButton = document.getElementById("adminManageAutomaticSquealsButton");
        if (manageButton == null) {
            const button = generateManageAutomaticSquealsButton();
            buttonsAreas[0].appendChild(button);
        }
    }
}

function generateManageAutomaticSquealsButton() {
    const manageAutomaticSquealsButton = document.createElement("a");
    manageAutomaticSquealsButton.id = "adminManageAutomaticSquealsButton";
    manageAutomaticSquealsButton.setAttribute("href", `${sitePrefix}/admin/adminedit/automaticsqueals`);
    manageAutomaticSquealsButton.classList.add("admin-pill");
    manageAutomaticSquealsButton.append("Manage automatic squeals");
    return manageAutomaticSquealsButton;
}

function addPrivateSquealToSearchView() {
    const pillsArea = document.getElementById("pills-tab-search");
    if (pillsArea != null) {
        let privateSquealsButton = document.getElementById("adminSearchPrivateSquealsPill");
        if (privateSquealsButton == null) {
            const button = generateSearchPrivateSquealsButton();
            pillsArea.appendChild(button);
        }
    }
}

function generateSearchPrivateSquealsButton() {
    const privateSquealsArea = document.createElement("li");
    privateSquealsArea.classList.add("nav-item");
    privateSquealsArea.classList.add("flex-sm-fill");
    privateSquealsArea.classList.add("text-sm-center");
    privateSquealsArea.setAttribute("role", "presentation");

    const privateSquealsButton = document.createElement("a");
    privateSquealsButton.setAttribute("href", `${sitePrefix}/admin/adminsearch/privatesqueals`);
    privateSquealsButton.setAttribute("arial-label", "Search in private squeals");
    privateSquealsButton.id = "adminSearchPrivateSquealsPill";
    privateSquealsButton.classList.add("admin-pill");
    privateSquealsButton.append("Private squeals");

    privateSquealsArea.appendChild(privateSquealsButton);
    return privateSquealsArea;
}