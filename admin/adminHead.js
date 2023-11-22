let currentUrl = window.location.href;

const adminPrefix = "https://site222326.tw.cs.unibo.it/admin";
if(currentUrl.startsWith(adminPrefix)) {
    let relativeUrl = currentUrl.slice(adminPrefix.length);
    window.history.pushState({}, "", `https://site222326.tw.cs.unibo.it/app${relativeUrl}`);

    window.onload = function() {
        window.history.pushState({}, "", currentUrl);
    }
}



console.log("head done!");
