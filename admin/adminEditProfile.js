const sitePrefix = "https://site222326.tw.cs.unibo.it";
const editProfilePrefix = sitePrefix + "/admin/adminedit/profile/";

let profile;

console.log(window.location.href);
if (window.location.href.startsWith(editProfilePrefix)) {
    let profile_id = window.location.href.slice(editProfilePrefix.length);
    console.log(profile_id);


    
    profile = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile_id}`, {
        method: "GET"
    });
    if (profile.status == 200) {
        profile = await profile.json();
        populate(profile);
    }
}


document.getElementById('profile_form').addEventListener('submit', async (e) => {
    e.preventDefault()
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    //SQUEAL FUNCTION, adapt this part to profiles
    /*
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
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/squeal/${squeal.id}`;
    } else {
        alert("an error has occurred, please try again later");
    }
    */
});









function populate(profile_json){
    document.getElementById("name").setAttribute("value", profile_json.name);
    document.getElementById("account_" + profile_json.account_type).setAttribute("checked", "checked");

    //PROPIC

    document.getElementById("credit_daily").setAttribute("value", profile_json.credit[0]);
    document.getElementById("credit_daily_limit").setAttribute("value", profile_json.credit_limits[0]);

    document.getElementById("credit_weekly").setAttribute("value", profile_json.credit[1]);
    document.getElementById("credit_weekly_limit").setAttribute("value", profile_json.credit_limits[1]);

    document.getElementById("credit_monthly").setAttribute("value", profile_json.credit[2]);
    document.getElementById("credit_monthly_limit").setAttribute("value", profile_json.credit_limits[2]);
    

    
    if(profile_json.media != null && profile_json.media != ""){
        document.getElementById("oldMedia").innerHTML = `<img src="https://${profile_json.media}">`;
    }
    
    if(profile_json.location.latitude != null){
        document.getElementById("locationLat").setAttribute("value", profile_json.location.latitude);
    }
    if(profile_json.location.longitude != null){
        document.getElementById("locationLng").setAttribute("value", profile_json.location.longitude);
    }
}
