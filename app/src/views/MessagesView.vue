<script setup>
import ProfileCard from "@/components/ProfileCard.vue"

const props = defineProps(['id']);
</script>

<!------------------------------- HTML ---------------------------------->

<template>
  <div v-if="isValid" class="messagesViewContainer">
    <div class="searchArea">
      <RouterLink to="/messages" class="goBackBtn" aria-label="Go back to messages"> &lt Go back</RouterLink>
      <ProfileCard :id="id"></ProfileCard>
    </div>

    <!-- chat area -->
    <div class="chatBox container mx-0 mx-auto">
      <button v-if="!all_msgs_loaded" @click="loadMore" class="loadMoreBtn" aria-label="Load more messages"> Load more </button>
      <div class="chatInner">
        <div :class="getMessageClass(message.author)" v-for="(message, index) in chat" :key="index">
          {{ message.text }}
        </div>
      </div>
    </div>

    <!-- send message area -->
    <div class="messageInput d-flex justify-content-center">
      <input v-model="new_msg_text" type="text" placeholder="Write your message..." class="form-control" aria-label="Type your message"
        @keypress.enter="sendMessage" />
      <button @click="sendMessage" class="btn btn-primary" aria-label="Send message"> Send </button>
    </div>
  </div>
  <div v-else>
    <p>You are not logged in or this user does not exist</p>
    <RouterLink to="/messages" aria-label="Go back to messages">Go back</RouterLink>
  </div>
</template>


<!------------------------------- SCRIPT ---------------------------------->

<script>
import axios from "axios";

export default {
  data() {
    return {
      new_msg_text: '',
      chat: [],
      start_index: 0,
      end_index: 9,
      propic: null,

      isValid: false,
      updateInterval: undefined,
      all_msgs_loaded: false
    };
  },

  async mounted() {
    this.isValid = await this.checkForValidUsers();
    if(this.isValid){
      this.fetchChat();
      this.updateInterval = setInterval(this.newMsgAvailable, 1000);
    }
  },
  unmounted() {
    if (this.updateInterval != null) {
      clearInterval(this.updateInterval);
    }
  },

  methods: {
    async fetchChat() {

      // recupero utente e amico
      const usr = this.$user;
      const friend = this.id;

      // resetto indici
      this.start_index = 0;
      this.end_index = 9;
      this.all_msgs_loaded = false;

      // fetch della chat tra utente e amico
      this.chat = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${usr}&user2=${friend}&startindex=${this.start_index}&endindex=${this.end_index}`);
      this.chat = await this.chat.json();

      console.log("fetch iniziale: ", this.chat)
      // inverto messaggi fetchati
      this.chat = this.chat.reverse();

      // aggiorno gli indici e li preparo per il "load more"
      this.start_index += 10
      this.end_index += 10
    },

    async loadMore() {
      const usr = this.$user
      const friend = this.id

      // fetch della chat tra utente e amico
      let new_msgs = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${usr}&user2=${friend}&startindex=${this.start_index}&endindex=${this.end_index}`);
      new_msgs = await new_msgs.json();

      if (new_msgs.length === 0) {
        this.all_msgs_loaded = true;
      }

      // inverto messaggi fetchati
      new_msgs = new_msgs.reverse();

      // li metto in testa ai messaggi già presenti
      this.chat = [...new_msgs, ...this.chat];

      // aggiorno gli indici
      this.start_index += 10
      this.end_index += 10
    },

    async sendMessage() {

      const newMessage = {
        author: this.$user,
        text: this.new_msg_text,
        receiver: this.id,
        is_private: true,
      }

      const formData = new FormData();
      formData.append("json", JSON.stringify(newMessage));

      // invio il messaggio e poi lo recupero per metterlo in chat
      try {
        await axios.put(`https://site222326.tw.cs.unibo.it/squeals/`, formData);
        const response = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${this.$user}&user2=${this.id}&startindex=${0}&endindex=${0}`);

        if (response.ok) {
          const new_msg = await response.json();
          this.chat.push(new_msg[0]);
          this.new_msg_text = '';
        }
        else {
          console.error("Errore durante il recupero del nuovo messaggio:", response.statusText);
        }
      } catch (error) {
        console.error("Errore durante l'invio del messaggio:", error.message);
      }
    },

    async newMsgAvailable() {
      if (this.chat.length != 0) { // controllo extra altrimenti accedendo al campo .id va in errore

        const usr = this.$user
        const friend = this.id

        // recupero ultimo msg della chat nel db, se non corrisponde a quello presente nel frontend aggiorno la chat
        let last_msg_db = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${usr}&user2=${friend}&startindex=${0}&endindex=${0}`);
        last_msg_db = await last_msg_db.json();

        if (last_msg_db[0].id != this.chat[this.chat.length - 1].id) {
          this.chat.push(last_msg_db[0]);
        }
      }
    },

    getMessageClass(author) {
      return {
        'message': true,
        'sent-message': author === this.$user,
        'received-message': author === this.id,
      };
    },

    async checkForValidUsers() {
      let fetched = await fetch(
        `https://site222326.tw.cs.unibo.it/profiles/${this.id}`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return fetched.status == 200 && this.$user != null;
    },
  }
}
</script>


<!--------------------------------- CSS ----------------------------------->
<style scoped>
.messagesViewContainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.searchArea {
  background-color: #ccc;
  border-radius: 0 0 1em 1em;
}

.loadMoreBtn {
  background-color: #0d6efd;
  margin: 1em;
  padding: 0.2em;
  color: white;
  border-radius: 5px;
  border: none;
}

.loadMoreBtn:hover {
  background-color: #0066ff;
}

.goBackBtn {
  background-color: #ff8900ff;
  display: block;
  width: fit-content;
  margin: 1em;
  padding: 0.5em;
  color: white;
  border-radius: 5px;
  border: none;
  text-decoration: none;
}

.goBackBtn:hover {
  background-color: #c06700;
}

.center-button {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chatBox {
  flex-direction: column;
  display: flex;
  flex-grow: 1;
  overflow-y: scroll;
}

.message {
  max-width: 70%;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
  font-size: 14px;
}

.sent-message {
  background-color: #ff8900ff;
  color: white;
  align-self: flex-end;
  margin-left: auto;
}

.received-message {
  background-color: #ababab;
  color: #333;
  align-self: flex-start;
}

.messageInput {
  z-index: 100000;
  display: flex;
  justify-content: center;
  padding: 1.3em;
  margin: 0.2em;
  background-color: #fff;
  border-radius: 1em;
}

.messageInput input {
  margin-right: 0.7em;
}
</style>