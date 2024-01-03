const sitePrefix = "https://site222326.tw.cs.unibo.it";
const editSquealPrefix = sitePrefix + "/admin/adminedit/squeal/";

let squeal;

console.log(window.location.href);
if (window.location.href.startsWith(editSquealPrefix)) {
    let squeal_id = window.location.href.slice(editSquealPrefix.length);
    console.log(squeal_id);


    
    squeal = await fetch(`https://site222326.tw.cs.unibo.it/squeals/${squeal_id}`, {
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
        document.getElementById("oldMedia").innerHTML = `<img src="https://${squeal_json.media}">`;
    }
    
    if(squeal_json.location.latitude != null){
        document.getElementById("locationLat").setAttribute("value", squeal_json.location.latitude);
    }
    if(squeal_json.location.longitude != null){
        document.getElementById("locationLng").setAttribute("value", squeal_json.location.longitude);
    }
}

async function postChanges(originalSqueal = squeal){
    let changes = {};

    // id and author cannot be modified
    let receiver = document.getElementById("receiver").getAttribute("value");
    if(receiver != null && receiver != "" && receiver != originalSqueal.receiver){
        changes.receiver = receiver;
    }
    let isPrivate = document.getElementById("isPrivate").getAttribute("value");
    if(isPrivate != null && isPrivate != "" && isPrivate != originalSqueal.is_private){
        changes.is_private = isPrivate;
    }
    let replyTo = document.getElementById("replyTo").getAttribute("value");
    if(replyTo != null && replyTo != "" && replyTo != originalSqueal.reply_to){
        changes.reply_to = replyTo;
    }
    let text = document.getElementById("squealText").getAttribute("value");
    if(text != null && text != "" && text != originalSqueal.text){
        changes.text = text;
    }
    let date = document.getElementById("squealDate").getAttribute("value");
    if(date != null && date != "" && date != originalSqueal.date){
        changes.date = date;
    }
    let positiveReactions = document.getElementById("positiveReactions").getAttribute("value");
    if(positiveReactions != null && positiveReactions != "" && positiveReactions != originalSqueal.positive_reactions){
        changes.positive_reactions = positiveReactions;
    }
    let negativeReactions = document.getElementById("negativeReactions").getAttribute("value");
    if(negativeReactions != null && negativeReactions != "" && negativeReactions != originalSqueal.negative_reactions){
        changes.negative_reactions = negativeReactions;
    }
    let replies = document.getElementById("replies").getAttribute("value");
    if(replies != null && replies != "" && replies != originalSqueal.replies_num){
        changes.replies_num = replies;
    }
    let impressions = document.getElementById("impressions").getAttribute("value");
    if(impressions != null && impressions != "" && impressions != originalSqueal.impressions){
        changes.impressions = impressions;
    }




    // MEDIA
    



    let latitude = document.getElementById("locationLat").getAttribute("value");
    if(latitude != null && latitude != "" && latitude != originalSqueal.location.latitude){
        if(changes.location == null){
            changes.location = {};
        }
        changes.location.latitude = latitude;
    }
    let longitude = document.getElementById("locationLng").getAttribute("value");
    if(longitude != null && longitude != "" && longitude != originalSqueal.location.longitude){
        if(changes.location == null){
            changes.location = {};
        }
        changes.location.longitude = longitude;
    }

    console.log(JSON.stringify(changes));
    let res = await fetch(`https://site222326.tw.cs.unibo.it/squeals/${originalSqueal.id}`, {
        method: "POST",
        body: JSON.stringify(changes)
    });
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/squeal/${originalSqueal.id}`;
    } else {
        alert("an error has occurred, please try again later");
    }
}


// ugly export
window.postChanges = postChanges;