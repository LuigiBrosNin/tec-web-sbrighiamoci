const sitePrefix = "https://site222326.tw.cs.unibo.it";
const editChannelPrefix = sitePrefix + "/admin/adminedit/channel/";

let channel;

console.log(window.location.href);
if (window.location.href.startsWith(editChannelPrefix)) {
    let channel_id = window.location.href.slice(editChannelPrefix.length);
    console.log(channel_id);



    channel = await fetch(`${sitePrefix}/channels/${channel_id}`, {
        method: "GET"
    });
    if (channel.status == 200) {
        channel = await channel.json();
        populate(channel);
    }
}


let newPropic;

document.getElementById('propic').addEventListener('change', (event) => {
    newPropic = event.target.files[0];
});


document.getElementById('channel_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let changes = {};

    // name cannot be modified

    //TODO: add type control
    if (data.bio != null && data.bio != "" && data.bio != channel.bio) {
        changes.bio = data.bio;
    }

    /*
    let resPropic;
    if (data.deletePropic != null && data.deletePropic != "") {
        resPropic = await fetch(`${sitePrefix}/profiles/${channel.name}/propic`, {
            method: "DELETE"
        });
    }
    else if (newPropic != null) {
        let propicData = new FormData();
        propicData.append("file", newPropic);
        console.log(newPropic);
        resPropic = await fetch(`${sitePrefix}/profiles/${channel.name}/propic`, {
            method: "PUT",
            body: propicData
        });
    }
    if (resPropic != null && resPropic.status != 200) {
        alert("an error uploading the new propic has occurred, please try again later");
    }
    */

    console.log(JSON.stringify(changes));
    let res = await fetch(`${sitePrefix}/channels/${channel.name}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    if (res.status == 201) {
        window.location.href = `${sitePrefix}/admin/channel/${channel.name}`;
    } else {
        alert("an error has occurred, please try again later");
    }

});
/*
document.getElementById('account_type_radio').addEventListener('change', async (e) => {
    let selectedAccountType = e.target.value;

    if (selectedAccountType == "premium") {
        document.getElementById("smm").removeAttribute("disabled");
    }
    else {
        document.getElementById("smm").setAttribute("disabled", "disabled");
    }
});

document.getElementById('delete_form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let res = await fetch(`${sitePrefix}/profiles/${channel.name}`, {
        method: "DELETE",
    });
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/`;
    } else {
        alert("an error deleting this profile has occurred, please try again later");
    }
});
*/





function populate(channel_json) {
    document.getElementById("name").setAttribute("value", channel_json.name);
    document.getElementById("channel_" + channel_json.type).setAttribute("checked", "checked");
    document.getElementById("bio").setAttribute("value", channel_json.bio);

    if (channel_json.propic != null && channel_json.propic != "") {
        document.getElementById("oldPropic").innerHTML = `<img src="https://${channel_json.propic}">`;
    }
    else {
        document.getElementById("oldPropic").innerHTML = `<img src="${sitePrefix}/images/logoSquealer.svg">`;
    }

    document.getElementById("owner").setAttribute("value", channel_json.owner);
    
    for (index in channel_json.mod_list){
        document.getElementById("modList").innerHTML += `<div><p>${channel_json.mod_list[index]}</p><button onclick="console.log('removed')">Remove</button></div>`;
    }
    
}

