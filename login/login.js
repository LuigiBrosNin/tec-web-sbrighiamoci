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
  }).then(res => {
    if (res.status == 200) {
      window.location.href = "https://site222326.tw.cs.unibo.it/app";
    } else {
      alert("Wrong Username or Password");
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
  }).then(res => {
    if (res.status == 200) {
      window.location.href = "https://site222326.tw.cs.unibo.it/app";
    } else {
      alert("Username or email already taken");
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                         Luizo's temp test fucntions                        */
/* -------------------------------------------------------------------------- */

// profile account_type PUT requestù
function addAccountTypeTest(param_id) {
  const body = {
    account_type: "smm"
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_id}/account_type`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(data => console.log(data));
}

// profiles following_channels PUT request
function addFollowingChannelTest(param_id, group_name) {
  const body = {
    channel_name: group_name
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_id}/following_channels`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}


// squeals list POST request
function addSquealListTest() {
  const body = {
    squealList: [
      "EmanueleDiSante1",
      "EmanueleDiSante2",
      "AlexLorenzato1" 
    ]
  };
  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/squeals_list`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  }).then(response => response.json())
  .then(data => console.log(data));
}


// channel squeals_list DELETE request
function deleteSquealListTest(param_name) {
  const body = {
    squeal_id: "EmanueleDiSante1"
  };
  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}/squeals_list`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}


// channel squeals_list PUT request
function addSquealListTest(param_name) {
  const body = {
    squeal_id: "EmanueleDiSante1"
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}/squeals_list`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}

// channel mod list PUT request
function addModListTest(param_name) {
  const body = {
    mod_name: "EmanueleDiSante"
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}/mod_list`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}

// channel mod list DELETE request
function deleteModListTest(param_name) {
  const body = {
    mod_name: "EmanueleDiSante"
  };
  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}/mod_list`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}


// channel rules DELETE request
function deleteRulesTest(param_name) {
  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}/rules`, {
    method: "DELETE"
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}


// channel rules PUT request
function addRulesTest(param_name) {
  const body = {
    rules: ["getBunnyPics()", "getCatPics()", "getDogPics()"]
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}/rules`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(body)
  });
}


// channel DELETE request
function deleteChannelTest(param_name) {
  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}`, {
    method: "DELETE"
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}

// channel PUT request
function addChannelTest(param_name) {
  const body = {
    name: "AAAAA",
    bio: "This is the luizo channel",
    propic: "some uri",
    rules: ["getBunnyPics()", "getCatPics()", "getDogPics()"],
    type: "required",


    // useless fields
    is_private: false,
    followers: [],
    squeals: []
  };

  console.log("Sending body: " + JSON.stringify(body));

  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}`, {
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

/*******************************************************************/
//                  FUNZIONI POPOLAZIONE DATABASE                  //
/*******************************************************************/

function populateProfile(param_name, email, password) {
  const body = {
    email: email,
    password: password
  }
  console.log("Inviati:", JSON.stringify(body))

  fetch(`https://site222326.tw.cs.unibo.it/profiles/${param_name}`, {
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


function populateChannel(param_name, user, bio) {
  const body = {
    user: user,
    propic: "",
    bio: bio
  }
  console.log("Inviati:", JSON.stringify(body))

  fetch(`https://site222326.tw.cs.unibo.it/channels/${param_name}`, {
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


function populateSqueal(author, text, receiver) {
  const body = {
    author: author,
    text: text,
    receiver: receiver
  }
  console.log("Inviati:", JSON.stringify(body))

  fetch(`https://site222326.tw.cs.unibo.it/squeals/`, {
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