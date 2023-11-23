const sitePrefix = "https://site222326.tw.cs.unibo.it";
const adminPrefix = sitePrefix + "/admin";
const appPrefix = sitePrefix + "/app";


let currentUrl = window.location.href;

if (currentUrl.startsWith(adminPrefix)) {
    let relativeUrl = currentUrl.slice(adminPrefix.length);
    window.history.pushState({}, "", appPrefix + relativeUrl);

    window.onload = function () {
        window.history.pushState({}, "", currentUrl);
    }


    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer = new MutationObserver(function (mutations, observer) {     // every time something changes in the DOM, this function is invoked
        replaceAllAppLinks();

        console.log("DOM changed", mutations, observer);
    });
    observer.observe(document, {
        subtree: true,
        attributes: true
    });
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

    for(let i = 0; i < anchorsArray.length; i++){
        if (anchorsArray[i].href.startsWith(appPrefix)){
            // we need to replace the entire <a> element (and not only the href) in order to make Vue ignore it
            anchorsArray[i].outerHTML = `<a href="${adminPrefix + anchorsArray[i].href.slice(appPrefix.length)}" class="${anchorsArray[i].getAttribute("class")}" id="${anchorsArray[i].id}"> ${anchorsArray[i].innerHTML} </a>`;
        }
    }
    
}