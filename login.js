function sub(){
  fetch("https://site222326.tw.cs.unibo.it/login", {
  //fetch("http://localhost:8000/login", {
    method: "POST",
    body: JSON.stringify({
      username: document.getElementById("usernameInput").value,
      password: document.getElementById("passwordInput").value
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                         Luizo's temp test fucntions                        */
/* -------------------------------------------------------------------------- */

//Squeals PUT request
function addSquealTest() {
  const body = {
    id: "test",
    cacca: "dsjdasjdsad",
    author: "Gigi",
    text: "I'm.",
    receiver: "Lana",
    date: 745675,
    positive_reactions: 2,
    positive_reactions_users: [
      "Luiso",
      "Matilde"
    ],
    negative_reactions: 1,
    negative_reactions_users: [
      "Alex",
    ],
    media: "URI...",
    reply_to: ["squeal1"],
    replies_num: 0,
    replies: ["id1", "id2"],
    keywords: ["sea", "mountain"],
    mentions: ["user1"],
    impressions: 34
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch("https://site222326.tw.cs.unibo.it/squeals/", {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}

// Squeals ID DELETE request
function deleteSquealTest() {
  fetch("https://site222326.tw.cs.unibo.it/squeals/testDelete", {
    method: "DELETE"
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}