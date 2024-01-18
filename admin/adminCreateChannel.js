const sitePrefix = "https://site222326.tw.cs.unibo.it";
const editChannelPrefix = sitePrefix + "/admin/adminedit/channel/";

console.log(window.location.href);

document.getElementById('channel_creation_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let newChannelData = {};
    let newChannelName;

    if (data.name != null && data.name != "") {
        newChannelName = data.name;
    }
    else {
        alert("To create a channel you must specify its name");
        return;
    }

    if (data.channel_type != null && data.channel_type != "") {
        newChannelData.type = data.channel_type;
    }
    else {
        alert("To create a channel you must specify its type");
        return;
    }

    if(data.channel_type == "privileged" || data.channel_type == "required"){
        newChannelName = newChannelName.toUpperCase();
    }
    else {
        newChannelName = newChannelName.toLowerCase();
    }
    
    if (data.bio != null && data.bio != "") {
        newChannelData.bio = data.bio;
    }

    console.log(JSON.stringify(newChannelData));
    let res = await fetch(`${sitePrefix}/channels/${newChannelName}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newChannelData)
    });
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/channel/${newChannelName}`;
    } else {
        alert("an error creating the channel has occurred, please try again later");
    }

});

