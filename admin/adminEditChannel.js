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




document.getElementById('channel_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let changes = {};

    // name and type cannot be modified
    if (data.bio != null && data.bio != "" && data.bio != channel.bio) {
        changes.bio = data.bio;
    }

    console.log(JSON.stringify(changes));
    let res = await fetch(`${sitePrefix}/channels/${channel.name}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/channel/${channel.name}`;
    } else {
        alert("an error has occurred, please try again later");
    }

});

let newPropic;

document.getElementById('propic').addEventListener('change', (event) => {
    newPropic = event.target.files[0];
});

document.getElementById('propic_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let resPropic;
    if (data.deletePropic != null && data.deletePropic != "") {
        resPropic = await fetch(`${sitePrefix}/channels/${channel.name}/propic`, {
            method: "DELETE"
        });
    }
    else if (newPropic != null) {
        let propicData = new FormData();
        propicData.append("file", newPropic);
        console.log(newPropic);
        resPropic = await fetch(`${sitePrefix}/channels/${channel.name}/propic`, {
            method: "PUT",
            body: propicData
        });
    }
    if (resPropic.status == 200) {
        window.location.href = `${sitePrefix}/admin/channel/${channel.name}`;
    } else {
        alert("an error uploading the new propic has occurred, please try again later");
    }
});

document.getElementById('owner_mods_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let done = false;

    if (data.owner != null && data.owner != "" && data.owner != channel.owner) {
        console.log(JSON.stringify(data.owner));
        let res = await fetch(`${sitePrefix}/channels/${channel.name}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({owner: data.owner})
        });
        if (res.status == 200) {
            done = true;
        } else {
            alert("an error setting the new owner has occurred, please try again later");
        }
    }

    if (data.newMod != null && data.newMod != "") {
        let res = await fetch(`${sitePrefix}/channels/${channel.name}/mod_list`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({mod_name: data.newMod})
        });
        if (res.status == 200) {
            done = true;
        } else {
            alert("an error setting the new owner has occurred, please try again later");
        }
    }

    if(done){
        window.location.href = `${sitePrefix}/admin/channel/${channel.name}`;
    }

});

document.getElementById('delete_form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let res = await fetch(`${sitePrefix}/channels/${channel.name}`, {
        method: "DELETE",
    });
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/`;
    } else {
        alert("an error deleting this channel has occurred, please try again later");
    }
});




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

    for (let index in channel_json.mod_list) {
        document.getElementById("modList").innerHTML += `<div class="modCard" id="mod_${index}"><p>${channel_json.mod_list[index]}</p><button class="modBtn" onclick="event.preventDefalult; removeMod('${channel_json.mod_list[index]}', ${index})">Remove</button></div>`;
    }

}

async function removeMod(modName, modIndex) {
    let res = await fetch(`${sitePrefix}/channels/${channel.name}/mod_list`, {
        method: "DELETE",
        body: JSON.stringify({mod_name: modName})
    });
    if (res.status == 200) {
        document.getElementById(`mod_${modIndex}`).outerHTML = "";
    } else {
        alert("an error removing a moderator has occurred, please try again later");
    }
}

// ugly export
window.removeMod = removeMod;