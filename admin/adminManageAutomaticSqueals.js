const sitePrefix = "https://site222326.tw.cs.unibo.it";
const automaticSquealsUrl = sitePrefix + "/automaticposts";

let rules;

rules = await fetch(automaticSquealsUrl, {
    method: "GET"
});
if (rules.status == 200) {
    rules = await rules.json();
    displayRules(rules);
}




document.getElementById('add_rule_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    console.log(data);

    let changes = {};

    if (data.uri != null && data.uri != "") {
        changes.uri = data.uri;
    }

    if (data.json_fields != null && data.json_fields != "") {
        changes.json_fields = [];
        let splittedFields = text.split(",");
        for(let field of splittedFields){
            field = field.replaceAll(" ", "");
            changes.json_fields.push(field);
        }
    }

    if (data.media_field != null && data.media_field != "") {
        changes.media_field = data.media_field;
    }

    if((data.json_fields == null || data.json_fields == "") && (data.media_field == null || data.media_field == "")){
        alert("To create a rule you must specify at least one text json field or a media json field");
        return;
    }

    if (data.channel != null && data.channel != "") {
        changes.channel = data.channel;
    }

    console.log(JSON.stringify(changes));
    let res = await fetch(automaticSquealsUrl, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    if (res.status == 200) {
        window.location.reload();
    } else {
        alert("an error creating the rule has occurred, please try again later");
    }

});




function displayRules(rules) {
    let container = document.getElementById(automaticRulesContainer);
    container.innerHTML = "";
    if(rules.length > 0){
        for(let rule of rules){
            container.innerHTML += `
                <div id="${rule.uri}">
                    <p>Url: <a href="${rule.uri}">${rule.uri}</a></p>
                    <p>Text fields: ${rule.json_fields}</p>
                    <p>Media field: ${rule.media_field}</p>
                    <p>Channel: §${rule.channel}</p>
                    <button class="modBtn" type="button" onclick="removeRule('${rule.uri}')">Remove</button>
                </div>
            `;
        }
    }
    else {
        container.innerHTML = `<p>There are no active rules</p>`
    }
    

}

async function removeRule(ruleUrl) {
    let res = await fetch(automaticSquealsUrl, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uri: ruleUrl })
    });
    if (res.status == 200) {
        document.getElementById(ruleUrl).outerHTML = "";
    } else {
        alert("an error removing a rule has occurred, please try again later");
    }
}

// ugly export
window.removeRule = removeRule;