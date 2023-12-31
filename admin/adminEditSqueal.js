const sitePrefix = "https://site222326.tw.cs.unibo.it";
const editSquealPrefix = sitePrefix + "/admin/adminedit/squeal/";

console.log(window.location.href);
if(window.location.href.startsWith(editSquealPrefix)){
    let squeal_id = window.location.href.slice(editSquealPrefix.length);
    console.log(squeal_id);
}