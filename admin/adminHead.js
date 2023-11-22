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
        mutations.forEach(mutation => {
            if(mutation.type != "a"){
                replaceAllAppLinks();
                console.log("DOM changed", mutations, observer);
                return;
            }
        })
        
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
    
    for(let i = 0; i < anchors.length; i++){
        let an = anchors[i];
        let parent = an.parentElement;
        parent.style = "background-color: aqua;";
        anchors[i].remove();
        let a = `<a href="${/*an.href*/ "https://google.com" + "/prova"}" class="${an.class}">` + an.innerHTML + `</a>`;
        parent.innerHTML += a;
    }
    
}