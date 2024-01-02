const sitePrefix = "https://site222326.tw.cs.unibo.it";
const editSquealPrefix = sitePrefix + "/admin/adminedit/squeal/";

console.log(window.location.href);
if (window.location.href.startsWith(editSquealPrefix)) {
    let squeal_id = window.location.href.slice(editSquealPrefix.length);
    console.log(squeal_id);


    
    let squeal = await fetch(`https://site222326.tw.cs.unibo.it/squeals/${squeal_id}`, {
        method: "GET"
    });
    if (squeal.status == 200) {
        squeal = await squeal.json();
        populate(squeal);
    }
}











function populate(squeal_json){
    document.getElementById("squeal_id").setAttribute("value", squeal_json.id);
    document.getElementById("author").setAttribute("value", squeal_json.author);
    document.getElementById("receiver").setAttribute("value", squeal_json.receiver);
    document.getElementById("isPrivate").setAttribute("value", squeal_json.is_private);
    document.getElementById("replyTo").setAttribute("value", squeal_json.reply_to);
    document.getElementById("squealText").setAttribute("value", squeal_json.text);
    document.getElementById("squealDate").setAttribute("value", squeal_json.date);
    document.getElementById("positiveReactions").setAttribute("value", squeal_json.positive_reactions);
    document.getElementById("negativeReactions").setAttribute("value", squeal_json.negative_reactions);
    document.getElementById("replies").setAttribute("value", squeal_json.replies_num);
    document.getElementById("impressions").setAttribute("value", squeal_json.impressions);
    
    if(squeal_json.media != null && squeal_json.media != ""){
        document.getElementById("oldMedia").innerHTML = `<img src="${media}">`;
    }
    
    document.getElementById("locationLat").setAttribute("value", squeal_json.location.latitude);
    document.getElementById("locationLng").setAttribute("value", squeal_json.location.longitude);
}