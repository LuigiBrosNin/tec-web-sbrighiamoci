function sub(){
  fetch("https://site222326.tw.cs.unibo.it/login", {
    method: "POST",
    body: JSON.stringify({
      username: document.getElementById("usernameInput").value,
      password: document.getElementById("passwordInput").value
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then(res => {
    console.log(res.status);
    if (res.status === 200) {
      res.json().then(data => {
        console.log(data.message);
        window.location.href = data.message;
      });

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
      alert("Sign in successful, you can now log in");
    } else {
      alert("Username or email already taken");
    }
  });
}
