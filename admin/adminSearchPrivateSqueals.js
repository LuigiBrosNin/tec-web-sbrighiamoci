const sitePrefix = "https://site222326.tw.cs.unibo.it";
const squealsUrl = sitePrefix + "/squeals";

let query = squealsUrl + "/?is_private=true&";

const numberOfSquealsToLoad = 10;
let numberOfSquealsLoaded = 0;

fetchPagedSqueals();


document.getElementById('private_squeals_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    query = squealsUrl + "/?is_private=true&";

    if (data.author != null && data.author != "") {
        query = query.concat("author=" + data.author + "&");
    }

    if (data.start_date != null && data.start_date != "") {
        let startdate = new Date(data.start_date);
        query = query.concat("start_date=" + startdate.getTime() + "&");
    }

    if (data.end_date != null && data.end_date != "") {
        let enddate = new Date(data.end_date);
        query = query.concat("end_date=" + enddate.getTime() + "&");
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
    numberOfSquealsLoaded = 0;
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
        for(let squeal of res){
            displayPrivateSqueal(squeal);
        }
    } else {
        alert("an error has occurred, please try again later");
    }
}

function displayPrivateSqueal(squeal) {
    if(squeal.is_private == true){
        document.getElementById("result_container").innerHTML += `
        <div class="squealContainer" id="${squeal.id}">
            <a class="author" href="${sitePrefix}/admin/profile/${squeal.author}">From: ${squeal.author}</a>
            <a class="receiver" href="${sitePrefix}/admin/profile/${squeal.receiver}">To: ${squeal.receiver}</a>
            <p class="text">${squeal.text}</p>
            <p class="date">${new Date(squeal.date)}</p>
            <button class="danger_button" onclick="deleteSqueal('${squeal.id}')">Delete</button>
        </div>
        `;
    }
}

async function deleteSqueal(squeal_id) {
    if (confirm("Are you sure you want to delete this squeal? This action can't be undone") === true) {
        let res = await fetch(
            sitePrefix + `/squeals/${squeal_id}`,
            {
                method: "DELETE",
            }
        );
        if (res.status == 200) {
            let squealNode = document.getElementById(squeal_id);
            squealNode.outerHTML = "";
        }
    } else {
        // do nothing
    }
}

window.fetchPagedSqueals = fetchPagedSqueals;
window.deleteSqueal = deleteSqueal;