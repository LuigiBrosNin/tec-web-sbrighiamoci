const sitePrefix = "https://site222326.tw.cs.unibo.it";
const squealsUrl = sitePrefix + "/squeals";


document.getElementById('private_squeals_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let query = squealsUrl + "/?";

    // name and type cannot be modified
    if (data.author != null && data.author != "") {
        query = query.concat("author=" + data.author + "&");
    }

    /*
    console.log(JSON.stringify(query));
    let res = await fetch(`${sitePrefix}/channels/${channel.name}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    });
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/channel/${channel.name}`;
    } else {
        alert("an error has occurred, please try again later");
    }
    */

});
