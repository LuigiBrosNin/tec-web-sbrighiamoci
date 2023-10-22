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

function signin(){
  fetch("https://site222326.tw.cs.unibo.it/signin", {
  //fetch("http://localhost:8000/signin", {
    method: "PUT",
    body: JSON.stringify({
      username: document.getElementById("usernameInputSignIn").value,
      email: document.getElementById("emailInputSignIn").value,
      password: document.getElementById("passwordInputSignIn").value
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                         Luizo's temp test fucntions                        */
/* -------------------------------------------------------------------------- */
// channel PUT request
function addChannelTest(param_name) {
  const body = {
    name: "AAAAAA",
    bio: "This is the luizo channel",
    propic: "some uri",
    rules: ["getBunnyPics()", "getCatPics()", "getDogPics()"],
    type: "priviledged",


    // useless fields
    is_private: false,
    followers: [],
    squeals: []
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_id}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}


// profile propic DELETE request
function deletePropicTest(param_id) {
  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_id}/propic`, {
    method: "DELETE"
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}

// Profile follower PUT request
function addFollowerTest(param_id) {
  const body = {
    follower_name: "EmanueleDiSante"
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_id}/followers`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}

// Profile PUT request
function addProfileTest(param_id) {
  const body = {
    email: "sussy",
    password: "baka",
    bio: "I'm a sussy baka",
    account_type: "admin",
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_id}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}

// Profile POST request
function updateProfileTest(param_id) {
  const body = {
    email: "sussy",
    password: "baka",
    bio: "I'm a sussy baka",
    account_type: "normal",
    propic: "some other uri",
    credit: [0, 0, 0],
    credit_limit: [999, 999, 999],
    is_banned: false,
    banned_until: null
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_id}`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}

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

// Profile DELETE request
function deleteProfileTest(param_id) {
  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_id}`, {
    method: "DELETE"
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}

// Squeals ID DELETE request
function deleteSquealTest(param_id) {
  fetch(`https://site222326.tw.cs.unibo.it/squeals/${param_id}`, {
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

// Squeals ID reaction list/impressions PUT request
function addReactionListTest(){
  const body = {
    author: "EmanueleDiSante"
  };
  fetch("https://site222326.tw.cs.unibo.it/squeals/EmanueleDiSante0/impressions", {
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

function testChannel(param_name) {
  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}/followers`, {
    method: "GET"
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}