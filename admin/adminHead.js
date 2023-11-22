const sitePrefix = "https://site222326.tw.cs.unibo.it";
const adminPrefix = sitePrefix + "/admin";
const appPrefix = sitePrefix + "/app";


let currentUrl = window.location.href;

if (currentUrl.startsWith(adminPrefix)) {
    let relativeUrl = currentUrl.slice(adminPrefix.length);
    window.history.pushState({}, "", appPrefix + relativeUrl);

    window.onload = function () {
        window.history.pushState({}, "", currentUrl);
        replaceAllAppLinks();
    }
}



console.log("head done!");


function replaceAllAppLinks() {
    var anchors = document.getElementsByTagName("a");

    for (var i = 0; i < anchors.length; i++) {
        if (anchors[i].href.startsWith(appPrefix) || anchors[i].href.startsWith("/app")){
            if(anchors[i].href.startsWith(sitePrefix)){
                anchors[i].href = currentUrl.slice(sitePrefix.length);
            }
            
            let relativeUrl = currentUrl.slice("/app".length);
            anchors[i].href = adminPrefix + relativeUrl;
            console.log(adminPrefix + relativeUrl);
        }
    }
}