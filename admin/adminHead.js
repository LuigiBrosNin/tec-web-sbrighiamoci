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


    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    let observer = new MutationObserver(function (mutations, observer) {
        mutations.forEach(mutation => {
            if(mutation.target != "a"){
                //replaceAllAppLinks();
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
    const anchorsArray = Array.from(anchors);
    for(let i = 0; i < anchorsArray.length; i++){
        anchorsArray[i].outerHTML = "<a href='https://google.com' class="+ anchorsArray[i].getAttribute("class") + ">" +anchorsArray[i].innerHTML + "</a>";
    }
    
}