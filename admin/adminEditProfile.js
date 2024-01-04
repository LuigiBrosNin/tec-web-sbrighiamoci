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

    let changes = {};

    /*
    document.getElementById("name").setAttribute("value", profile_json.name);
    document.getElementById("account_" + profile_json.account_type).setAttribute("checked", "checked");

    //PROPIC

    document.getElementById("credit_daily").setAttribute("value", profile_json.credit[0]);
    document.getElementById("credit_daily_limit").setAttribute("value", profile_json.credit_limits[0]);

    document.getElementById("credit_weekly").setAttribute("value", profile_json.credit[1]);
    document.getElementById("credit_weekly_limit").setAttribute("value", profile_json.credit_limits[1]);

    document.getElementById("credit_monthly").setAttribute("value", profile_json.credit[2]);
    document.getElementById("credit_monthly_limit").setAttribute("value", profile_json.credit_limits[2]);
    */



    // name cannot be modified
    if(data.account_type != null && data.account_type != "" && data.account_type != profile.account_type){
        changes.account_type = data.account_type;
    }
    if(data.bio != null && data.bio != "" && data.bio != profile.bio){
        changes.bio = data.bio;
    }

    //PROPIC

    let creditTmp = [];
    creditTmp[0] = data.credit_daily; 
    creditTmp[1] = data.credit_weekly; 
    creditTmp[2] = data.credit_monthly;
    if(creditTmp[0] != profile.credit[0] || creditTmp[1] != profile.credit[1] || creditTmp[2] != profile.credit[2]){
        changes.credit = creditTmp;
    }
    
    let creditLimitsTmp = [];
    creditLimitsTmp[0] = data.credit_daily_limit; 
    creditLimitsTmp[1] = data.credit_weekly_limit; 
    creditLimitsTmp[2] = data.credit_monthly_limit;
    if(creditLimitsTmp[0] != profile.credit_limits[0] || creditLimitsTmp[1] != profile.credit_limits[1] || creditLimitsTmp[2] != profile.credit_limits[2]){
        changes.credit_limits = creditLimitsTmp;
    }


    console.log(JSON.stringify(changes));
    let res = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${profile.name}`, {
        method: "POST",
        body: JSON.stringify(changes)
    });
    if (res.status == 201) {
        window.location.href = `${sitePrefix}/admin/profile/${profile.name}`;
    } else {
        alert("an error has occurred, please try again later");
    }
});









function populate(profile_json){
    document.getElementById("name").setAttribute("value", profile_json.name);
    document.getElementById("account_" + profile_json.account_type).setAttribute("checked", "checked");
    document.getElementById("bio").setAttribute("value", profile_json.bio);

    //PROPIC

    document.getElementById("credit_daily").setAttribute("value", profile_json.credit[0]);
    document.getElementById("credit_daily_limit").setAttribute("value", profile_json.credit_limits[0]);

    document.getElementById("credit_weekly").setAttribute("value", profile_json.credit[1]);
    document.getElementById("credit_weekly_limit").setAttribute("value", profile_json.credit_limits[1]);

    document.getElementById("credit_monthly").setAttribute("value", profile_json.credit[2]);
    document.getElementById("credit_monthly_limit").setAttribute("value", profile_json.credit_limits[2]);
}
