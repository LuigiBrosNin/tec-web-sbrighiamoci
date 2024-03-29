const sitePrefix = "https://site222326.tw.cs.unibo.it";
const editSquealPrefix = sitePrefix + "/admin/adminedit/squeal/";

let squeal;

console.log(window.location.href);
if (window.location.href.startsWith(editSquealPrefix)) {
    let squeal_id = window.location.href.slice(editSquealPrefix.length);
    console.log(squeal_id);



    squeal = await fetch(`${sitePrefix}/squeals/${squeal_id}`, {
        method: "GET"
    });
    if (squeal.status == 200) {
        squeal = await squeal.json();
        populate(squeal);
    }
}


document.getElementById('squeal_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);


    let changes = {};

    // id and author cannot be modified
    if (data.receiver != null && data.receiver != "" && data.receiver != squeal.receiver) {
        changes.receiver = data.receiver;
    }

    if (data.replyTo != null && data.replyTo != "" && data.replyTo != squeal.reply_to) {
        changes.reply_to = data.replyTo;
    }

    if (data.squealText != null && data.squealText != "" && data.squealText != squeal.text) {
        changes.text = data.squealText;
    }

    if (data.squealDate != null && data.squealDate != "" && data.squealDate != squeal.date) {
        changes.date = new Date(data.squealDate).getTime();
    }

    if (data.positiveReactions != null && data.positiveReactions != "" && data.positiveReactions != squeal.positive_reactions) {
        changes.positive_reactions = data.positiveReactions;
    }

    if (data.negativeReactions != null && data.negativeReactions != "" && data.negativeReactions != squeal.negative_reactions) {
        changes.negative_reactions = data.negativeReactions;
    }

    if (data.replies != null && data.replies != "" && data.replies != squeal.replies_num) {
        changes.replies_num = data.replies;
    }

    if (data.impressions != null && data.impressions != "" && data.impressions != squeal.impressions) {
        changes.impressions = data.impressions;
    }

    if (data.deleteMedia != null && data.deleteMedia != "") {
        changes.media = "";
    }

    if (data.locationLat != null && data.locationLat != "" && data.locationLng != null && data.locationLng != "" && !(data.locationLng == squeal.location.longitude && data.locationLat == squeal.location.latitude)) {
        if (changes.location == null) {
            changes.location = {};
        }
        changes.location.latitude = data.locationLat;
        changes.location.longitude = data.locationLng;
    }

    console.log(JSON.stringify(changes));
    let res = await fetch(`${sitePrefix}/squeals/${squeal.id}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    if (res.status == 201) {
        window.location.href = `${sitePrefix}/admin/squeal/${squeal.id}`;
    } else {
        alert("an error has occurred, please try again later");
    }
});








function populate(squeal_json) {
    document.getElementById("squeal_id").setAttribute("value", squeal_json.id);
    document.getElementById("author").setAttribute("value", squeal_json.author);
    document.getElementById("receiver").setAttribute("value", squeal_json.receiver);
    document.getElementById("replyTo").setAttribute("value", squeal_json.reply_to);
    document.getElementById("squealText").innerHTML = squeal_json.text;
    let date = new Date(squeal_json.date);
    document.getElementById("squealDate").setAttribute("value", new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -5));
    document.getElementById("positiveReactions").setAttribute("value", squeal_json.positive_reactions);
    document.getElementById("negativeReactions").setAttribute("value", squeal_json.negative_reactions);
    document.getElementById("replies").setAttribute("value", squeal_json.replies_num);
    document.getElementById("impressions").setAttribute("value", squeal_json.impressions);

    if (squeal_json.media != null && squeal_json.media != "") {
        document.getElementById("media").innerHTML = `<img src="https://${squeal_json.media}">`;
    }
    else {
        document.getElementById("media").innerHTML = `<p>This squeal has no media</p>`;
    }

    if (squeal_json.location.latitude != null) {
        document.getElementById("locationLat").setAttribute("value", squeal_json.location.latitude);
    }
    if (squeal_json.location.longitude != null) {
        document.getElementById("locationLng").setAttribute("value", squeal_json.location.longitude);
    }
}


// ugly export
//window.postChanges = postChanges;