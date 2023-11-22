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
    let observer = new MutationObserver(function (mutations, observer) {
        replaceAllAppLinks();
        console.log("DOM changed", mutations, observer);
    });
    observer.observe(document, {
        subtree: true,
        attributes: true
    });
}



console.log("head done!");



// functions
function replaceAllAppLinks() {
    const anchors = document.getElementsByTagName("a");
    
    anchors.forEach(anc => {
        let an = anc;
        let parent = an.parentElement;
        parent.style = "background-color: aqua;";
        anc.remove();
        let a = `<a href="${an.href + "/prova"}" class="${an.class}">` + an.innerHTML + `</a>`;
        parent.innerHTML += a;
    });
    
}