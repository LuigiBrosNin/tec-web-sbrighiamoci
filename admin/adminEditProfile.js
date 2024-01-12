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


let newPropic;

document.getElementById('propic').addEventListener('change', (event) => {
    newPropic = event.target.files[0];
});


document.getElementById('profile_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let changes = {};

    // name cannot be modified
    if (data.bio != null && data.bio != "" && data.bio != profile.bio) {
        changes.bio = data.bio;
    }

    let creditTmp = [];
    creditTmp[0] = data.credit_daily;
    creditTmp[1] = data.credit_weekly;
    creditTmp[2] = data.credit_monthly;
    if (creditTmp[0] != profile.credit[0] || creditTmp[1] != profile.credit[1] || creditTmp[2] != profile.credit[2]) {
        changes.credit = creditTmp;
    }

    let creditLimitsTmp = [];
    creditLimitsTmp[0] = data.credit_daily_limit;
    creditLimitsTmp[1] = data.credit_weekly_limit;
    creditLimitsTmp[2] = data.credit_monthly_limit;
    if (creditLimitsTmp[0] != profile.credit_limits[0] || creditLimitsTmp[1] != profile.credit_limits[1] || creditLimitsTmp[2] != profile.credit_limits[2]) {
        changes.credit_limits = creditLimitsTmp;
    }

    let resPropic;
    if (data.deletePropic != null && data.deletePropic != "") {
        resPropic = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}/propic`, {
            method: "DELETE"
        });
    }
    else if (newPropic != null) {
        let propicData = new FormData();
        propicData.append("file", newPropic);
        console.log(newPropic);
        resPropic = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}/propic`, {
            method: "PUT",
            body: propicData
        });
    }
    if (resPropic != null && resPropic.status != 200) {
        alert("an error uploading the new propic has occurred, please try again later");
    }


    console.log(JSON.stringify(changes));
    let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    if (res.status == 201) {
        window.location.href = `${sitePrefix}/admin/profile/${profile.name}`;
    } else {
        alert("an error has occurred, please try again later");
    }

});

document.getElementById('change_email_pw_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let changes = {};

    if (data.email != null && data.email != "") {
        changes.email = data.email;
    }

    if (data.password != null && data.password != "") {
        changes.password = data.password;
    }

    console.log(JSON.stringify(changes));
    let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    if (res.status == 201) {
        window.location.href = `${sitePrefix}/admin/profile/${profile.name}`;
    } else {
        alert("an error has occurred, please try again later");
    }

});

document.getElementById('account_type_form').addEventListener('change', async (e) => {
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    if (data.account_type == "smm") {

    }
});

document.getElementById('account_type_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let done = false;
    let changes = {};

    if (data.account_type != null && data.account_type != "" && data.account_type != profile.account_type) {
        changes.account_type = data.account_type;
    }

    console.log(JSON.stringify(changes));
    let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}/account_type`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    if (res.status == 200) {
        done = true;
    } else {
        alert("an error changing the account type has occurred, please try again later");
    }


    if (data.account_type != null && data.account_type == "smm") {
        if (data.smm === "" && data.smm != profile.smm && profile.smm != null) {
            let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}/smm`, {
                method: "DELETE",
            });
            if (res.status == 200) {
                window.location.href = `${sitePrefix}/admin/profile/${profile.name}`;
            } else {
                alert("an error changing the account smm has occurred, please try again later");
            }
        } else {
            let smmChanges;

            if (data.smm != null && data.smm != "" && data.smm != profile.smm) {
                smmChanges.smm = data.smm;
            }

            console.log(JSON.stringify(smmChanges));
            let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}/smm`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(smmChanges)
            });
            if (res.status == 200) {
                done = true;
            } else {
                alert("an error deleting the account smm has occurred, please try again later");
            }
        }
    }

    if(done){
        window.location.href = `${sitePrefix}/admin/profile/${profile.name}`;
    }
});

document.getElementById('ban_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let changes = {};

    if (data.banned_until != null && data.banned_until != "" && data.banned_until != profile.banned_until) {
        changes.banned_until = data.banned_until;

        changes.is_banned = true;

        let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changes)
        });
        if (res.status == 201) {
            window.location.href = `${sitePrefix}/admin/profile/${profile.name}`;
        } else {
            alert("an error banning the user has occurred, please try again later");
        }
    }
    else {
        alert("to ban a user, you must insert for how much time it will be banned");
    }
});

document.getElementById('delete_form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}`, {
        method: "DELETE",
    });
    if (res.status == 200) {
        window.location.href = `${sitePrefix}/admin/`;
    } else {
        alert("an error deleting this profile has occurred, please try again later");
    }
});





function populate(profile_json) {
    document.getElementById("name").setAttribute("value", profile_json.name);
    document.getElementById("bio").setAttribute("value", profile_json.bio);

    if (profile_json.propic != null && profile_json.propic != "") {
        document.getElementById("oldPropic").innerHTML = `<img src="https://${profile_json.propic}">`;
    }
    else {
        document.getElementById("oldPropic").innerHTML = `<img src="${sitePrefix}/images/user-default.svg">`;
    }

    document.getElementById("credit_daily").setAttribute("value", profile_json.credit[0]);
    document.getElementById("credit_daily_limit").setAttribute("value", profile_json.credit_limits[0]);

    document.getElementById("credit_weekly").setAttribute("value", profile_json.credit[1]);
    document.getElementById("credit_weekly_limit").setAttribute("value", profile_json.credit_limits[1]);

    document.getElementById("credit_monthly").setAttribute("value", profile_json.credit[2]);
    document.getElementById("credit_monthly_limit").setAttribute("value", profile_json.credit_limits[2]);

    document.getElementById("account_" + profile_json.account_type).setAttribute("checked", "checked");
    if (profile_json.smm != null) {
        document.getElementById("smm").setAttribute("value", profile_json.smm);
    }


    if (profile_json.is_banned == true || profile_json.is_banned == "true") {
        document.getElementById("banned_until").setAttribute("value", profile_json.banned_until);
    }
}
