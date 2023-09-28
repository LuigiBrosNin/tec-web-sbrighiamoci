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
  });
}

function addSquealTest(){
  fetch("https://site222326.tw.cs.unibo.it/squeals", {
    method: "PUT",
    body: JSON.stringify({
        id: "test",
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
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
  }