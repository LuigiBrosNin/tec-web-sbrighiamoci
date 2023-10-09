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
    id: "EmanueleDiSante1",
    author: "EmanueleDiSante",
    text: "Test squeal 1",
    receiver: "MainChannel",
    date: 82653375,
    positive_reactions: 0,
    positive_reactions_list: [],
    negative_reactions: 0,
    negative_reactions_list: [],
    media: "",
    reply_to: [],
    replies_num: 0,
    replies_list: [],
    keywords: ["papere"],
    mentions: [],
    impressions: 1,
    pos_popularity_ratio: 0,
    neg_popularity_ratio: 0,
    abs_popularity: 0,
    is_private: false
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

// Squeals ID POST request
function updateSquealTest(){
  const body = {
    id: "EmanueleDiSante99",
    author: "EmanueleDiSante",
    text: "HO CAMBIATO IL TESTO AAAAAAA",
    receiver: "MainChannel",
    date: 8375,
    positive_reactions: 4,
    positive_reactions_list: [],
    negative_reactions: 1,
    negative_reactions_list: [],
    media: "",
    reply_to: [],
    replies_num: 0,
    replies_list: [],
    keywords: ["squali"],
    mentions: ["MatildeMariano"],
    impressions: 10,
    pos_popularity_ratio: 0,
    neg_popularity_ratio: 0,
    is_private: false
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch("https://site222326.tw.cs.unibo.it/squeals/EmanueleDiSante1", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}

// Squeals ID reaction list PUT request
function addReactionListTest(){
  const body = {
    author: "EmanueleDiSante"
  };
  fetch("https://site222326.tw.cs.unibo.it/squeals/AlexLorenzato0/positive_reactions_list", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}