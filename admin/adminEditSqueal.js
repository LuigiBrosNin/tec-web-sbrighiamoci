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


document.getElementById('squeal_form').addEventListener('submit', async (e) => {
    e.preventDefault()
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);


    let changes = {};

    // id and author cannot be modified
    if(data.receiver != null && data.receiver != "" && data.receiver != squeal.receiver){
        changes.receiver = data.receiver;
    }

    if(data.isPrivate != null && data.isPrivate != "" && data.isPrivate != squeal.is_private){
        changes.is_private = data.isPrivate;
    }

    if(data.replyTo != null && data.replyTo != "" && squeal.reply_to != true){
        changes.reply_to = true;
    }
    else if((data.replyTo == null || data.replyTo == "") && squeal.reply_to != false){
        changes.reply_to = false;
    }

    if(data.squealText != null && data.squealText != "" && data.squealText != squeal.text){
        changes.text = data.squealText;
    }

    if(data.squealDate != null && data.squealDate != "" && data.squealDate != squeal.date){
        changes.date = data.squealDate;
    }

    if(data.positiveReactions != null && data.positiveReactions != "" && data.positiveReactions != squeal.positive_reactions){
        changes.positive_reactions = data.positiveReactions;
    }

    if(data.negativeReactions != null && data.negativeReactions != "" && data.negativeReactions != squeal.negative_reactions){
        changes.negative_reactions = data.negativeReactions;
    }

    if(data.replies != null && data.replies != "" && data.replies != squeal.replies_num){
        changes.replies_num = data.replies;
    }

    if(data.impressions != null && data.impressions != "" && data.impressions != squeal.impressions){
        changes.impressions = data.impressions;
    }




    // MEDIA
    



    if(data.locationLat != null && data.locationLat != "" && data.locationLat != squeal.location.latitude){
        if(changes.location == null){
            changes.location = {};
        }
        changes.location.latitude = data.locationLat;
    }

    if(data.locationLng != null && data.locationLng != "" && data.locationLng != squeal.location.longitude){
        if(changes.location == null){
            changes.location = {};
        }
        changes.location.longitude = data.locationLng;
    }

    console.log(JSON.stringify(changes));
    let res = await fetch(`https://site222326.tw.cs.unibo.it/squeals/${squeal.id}`, {
        method: "POST",
        body: JSON.stringify(changes)
    });
    if (res.status == 201) {
        console.log("Updated!");
        //window.location.href = `${sitePrefix}/admin/squeal/${squeal.id}`;
    } else {
        alert("an error has occurred, please try again later");
    }
});








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


// ugly export
//window.postChanges = postChanges;