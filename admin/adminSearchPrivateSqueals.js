const sitePrefix = "https://site222326.tw.cs.unibo.it";
const squealsUrl = sitePrefix + "/squeals";

let query = squealsUrl + "/?";

const numberOfSquealsToLoad = 10;
let numberOfSquealsLoaded = 0;

fetchPagedSqueals();


document.getElementById('private_squeals_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    query = squealsUrl + "/?";

    if (data.author != null && data.author != "") {
        query = query.concat("author=" + data.author + "&");
    }

    if (data.popularity != null && data.popularity != "") {
        query = query.concat("popularity=" + data.popularity + "&");
    }

    if (data.start_date != null && data.start_date != "") {
        query = query.concat("start_date=" + data.start_date + "&");
    }

    if (data.end_date != null && data.end_date != "") {
        query = query.concat("end_date=" + data.end_date + "&");
    }

    if (data.positiveReactions != null && data.positiveReactions != "") {
        query = query.concat("positive_reactions=" + data.positiveReactions + "&");
    }

    if (data.negativeReactions != null && data.negativeReactions != "") {
        query = query.concat("negative_reactions=" + data.negativeReactions + "&");
    }

    if (data.impressions != null && data.impressions != "") {
        query = query.concat("impressions=" + data.impressions + "&");
    }

    if (data.receiver != null && data.receiver != "") {
        query = query.concat("receiver=" + data.receiver + "&");
    }

    if (data.keyword != null && data.keyword != "") {
        query = query.concat("keywords=%23" + data.keyword + "&");
    }

    if (data.mentions != null && data.mentions != "") {
        query = query.concat("mentions=@" + data.mentions + "&");
    }

    console.log(JSON.stringify(query));

    document.getElementById("result_container").innerHTML = "";
    fetchPagedSqueals();
});

async function fetchPagedSqueals(){
    let pagedQuery = query.concat("&startindex=" + numberOfSquealsLoaded + "&endindex=" + (numberOfSquealsLoaded + numberOfSquealsToLoad));
    let res = await fetch(pagedQuery, {
        method: "GET",
    });
    if (res.status == 200) {
        res = await res.json();
        numberOfSquealsLoaded = numberOfSquealsLoaded + numberOfSquealsToLoad;
        document.getElementById("result_container").innerHTML += res;
    } else {
        alert("an error has occurred, please try again later");
    }
}

window.fetchPagedSqueals = fetchPagedSqueals;