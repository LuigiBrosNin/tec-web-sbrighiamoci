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
        removeSwitchArea();
        addEditAndDeleteButtonsToAllSqueals();
        addSettingsButtonToProfile();

        console.log("DOM changed", mutations, observer);
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
    if (url.startsWith(appPrefix)) {
        let relativeUrl = url.slice(appPrefix.length);
        url = adminPrefix + relativeUrl;
    }
    return url;
}

function removeSwitchArea() {
    const areas = document.getElementsByClassName("switch_area_btn");
    if(areas.length > 0){
        for(const index in areas){
            areas[index].outerHTML = "";
        }
    }
}

function addEditAndDeleteButtonsToAllSqueals() {
    const squeals = Array.from(document.getElementsByClassName("squeal_container"));
    for (const index in squeals) {
        let buttonArea = Array.from(squeals[index].getElementsByClassName("btn_area"))[0];
        
        if(buttonArea != null){
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
    const img = document.createElement("img");
    img.setAttribute("src", sitePrefix + "/icons/trash-svgrepo-com.svg");
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
    const img = document.createElement("img");
    img.setAttribute("src", sitePrefix + "/icons/pen-svgrepo-com.svg");
    img.classList.add("admin-squeal-button-img");
    editButton.appendChild(img);
    return editButton;
}

function addSettingsButtonToProfile() {
    const profiles = Array.from(document.getElementsByClassName("profile_container")); // there should be only one per page, but who knows...
    for (const index in profiles) {
        let buttonArea = Array.from(profiles[index].getElementsByClassName("btn_area"))[0];
        
        if(buttonArea != null){
            const button = document.createElement("div");
            button.appendChild(generateProfileSettingsButton(profiles[index].id));
    
            if (!buttonArea.hasChildNodes() || !buttonArea.childNodes[0].isEqualNode(button) || buttonArea.childNodes.length != 1) {
                buttonArea.innerHTML = "";
                buttonArea.appendChild(button);
            }
        }
    }
}

function generateProfileSettingsButton(profile_id) {
    const settingsButton = document.createElement("button");
    settingsButton.classList.add("admin-squeal-button");
    settingsButton.setAttribute("onclick", `window.location.href = "${sitePrefix}/admin/adminedit/profile/${profile_id}"`);
    const img = document.createElement("img");
    img.setAttribute("src", sitePrefix + "/icons/gear-svgrepo-com.svg");
    img.classList.add("admin-squeal-button-img");
    settingsButton.appendChild(img);
    return settingsButton;
}