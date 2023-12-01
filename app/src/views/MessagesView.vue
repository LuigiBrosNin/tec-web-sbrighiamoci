<script setup>
  const props = defineProps(['id', 'squeal_json']);
</script>

<!------------------------------- HTML ---------------------------------->

<template>

  <!-- search area -->
  <div class="searchArea container d-flex justify-content-center">
      <div class="col-sm-6 mx-auto my-2">
        <div class="col-sm-6 mx-auto">
          <div class="form-group d-flex align-items-center">

            <div class="d-block">
              <img v-if="propic" :src="propic" alt="Profile Pic" class="profilePic"/>
            </div>

            <input v-model="search_user" type="text" placeholder="Search profiles..." class="form-control searchProfileTextbox" @keypress.enter="fetchChat"/>
            <button @click="fetchChat" class="searchBtn "> Search </button>
            <button  v-if="chat.length > 0" @click="loadMore" class="searchBtn "> More </button>
          </div>
        </div>
      </div>
  </div>

  <!-- messages area -->
  <div class="chatBox container mx-0 mx-auto">
    <div class="chatInner">
      <div :class="getMessageClass(message.author)" v-for="(message, index) in chat" :key="index">
        {{ message.text }}  
      </div>
    </div>
  </div>

  <!-- Invio nuovo messaggio -->
  <div class="messageInput container d-flex justify-content-center">
    <input v-model="new_msg_text" type="text" placeholder="Scrivi il tuo messaggio..." class="form-control" @keypress.enter="sendMessage"/>
    <button @click="sendMessage" class="btn btn-primary"> Invia </button>
  </div>

</template>


<!------------------------------- SCRIPT ---------------------------------->

<script>
import axios from "axios";

export default {
  data() {   
    return {
      search_user: '', 
      prev_search_user: '', 
      new_msg_text: '',
      chat: [],
      start_index: 0,
      end_index: 9,
      propic: null,
    };
  },

  mounted() {
    setInterval(this.msgAvailable2, 1000);
  },

  methods: {
    async fetchChat() {

      // casi in cui devo ricaricare chat: 
      // chat vuota, nuovi msg disponibili, ho cercato una nuova persona
      //if (this.chat.length == 0  || this.newUserSearched() || this.newMsgAvailable()){
        
        // recupero utente e amico
        const usr = this.$user
        const friend = this.search_user

        this.prev_search_user = this.search_user

        // recupero profile pic
        let tmp_propic = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${friend}/propic`);

        if (tmp_propic.ok) {   // risposta 200
          this.propic = tmp_propic.url;
        }
        else if (tmp_propic.status === 404) {
          this.propic = "https://site222326.tw.cs.unibo.it/images/user-default.svg";
        }
        else {
          console.error("Errore durante il recupero della propic:", tmp_propic.status);
        }

        // resetto indici
        this.start_index = 0
        this.end_index = 9

        // fetch della chat tra utente e amico
        this.chat = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${usr}&user2=${friend}&startindex=${this.start_index}&endindex=${this.end_index}`);
        this.chat = await this.chat.json();

        // inverto messaggi fetchati
        this.chat = this.chat.reverse();

        // aggiorno gli indici e li preparo per il "load more"
        this.start_index += 10
        this.end_index += 10
      //}
      //else {
      //  console.log("suca la mink");
      //}
      
      
    },

    async loadMore() {
      const usr = this.$user
      const friend = this.search_user

      // fetch della chat tra utente e amico
      let new_msgs = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${usr}&user2=${friend}&startindex=${this.start_index}&endindex=${this.end_index}`);
      new_msgs = await new_msgs.json();

      // inverto messaggi fetchati
      new_msgs = new_msgs.reverse();

      // li metto in testa ai messaggi già presenti
      this.chat = [...new_msgs, ...this.chat];

      // aggiorno gli indici
      this.start_index += 10
      this.end_index += 10
    },

    async sendMessage() {

      // RIMETTERE RIGA 228 DI SQUEAL.JS, E ANCHE IL CONTROLLO A RIGA 678
      // RIMETTERE RIGA 228 DI SQUEAL.JS, E ANCHE IL CONTROLLO A RIGA 678
      // RIMETTERE RIGA 228 DI SQUEAL.JS, E ANCHE IL CONTROLLO A RIGA 678
      // RIMETTERE RIGA 228 DI SQUEAL.JS, E ANCHE IL CONTROLLO A RIGA 678

      const newMessage = {
        author: this.$user,
        text: this.new_msg_text,
        receiver: this.search_user,
        is_private: true,
      }

      const formData = new FormData();
      formData.append("json", JSON.stringify(newMessage));

      // invio il messaggio e poi lo recupero per metterlo in chat
      try {
        await axios.put(`https://site222326.tw.cs.unibo.it/squeals/`, formData); 
        const response = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${this.$user}&user2=${this.search_user}&startindex=${0}&endindex=${0}`);
        
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
        const friend = this.search_user

        // recupero ultimo msg della chat nel db, se non corrisponde a quello presente nel frontend aggiorno la chat
        let last_msg_db = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${usr}&user2=${friend}&startindex=${0}&endindex=${0}`);
        last_msg_db = await last_msg_db.json();

        if (last_msg_db[0].id != this.chat[this.chat.length - 1].id) {
          return true;
        }
        else { return false; }
      }
      else { return true; }
    },

    async newUserSearched() {
      console.log(this.prev_search_user, ", ", this.search_user);
      if (this.prev_search_user != this.search_user) {
        console.log("newUserSearched: TRUE");
        return true;
      }
      console.log("newUserSearched: FALSE");
      return false;
    },

    async msgAvailable2() {
      if (this.chat.length != 0) { // controllo extra altrimenti accedendo al campo .id va in errore

        const usr = this.$user
        const friend = this.prev_search_user

        // recupero ultimo msg della chat nel db, se non corrisponde a quello presente nel frontend aggiorno la chat
        let last_msg_db = await fetch(`https://site222326.tw.cs.unibo.it/chat/?user1=${usr}&user2=${friend}&startindex=${0}&endindex=${0}`);
        last_msg_db = await last_msg_db.json();

        if (last_msg_db[0].id != this.chat[this.chat.length - 1].id) {
          this.fetchChat();
        }
      }
    },

    getMessageClass(author) {
      return {
        'message': true,
        'sent-message': author === this.$user,
        'received-message': author === this.search_user,
      };
    }

  }
}
</script>


<!--------------------------------- CSS ----------------------------------->
<style scoped>
  .searchArea {
    height: 15vh;
    position: fixed;
  }

  .searchProfileTextbox {
    width: 25vh;
  }

  .searchBtn {
    background-color: #0d6efd;
    margin-left: 10px;
    color: white;
    border-radius: 5px;
    border: none;
  }
  .searchBtn:hover {
  background-color: #0066ff;
}

  .center-button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .profilePic {
    width: 50px;
    height: 50px;
  }
  
  .chatBox {
    max-height: 65vh; 
    flex-direction: column;
    display: flex;
    justify-content: flex-end;
    margin-top: 10vh;
    margin-bottom: 10vh;
  }

  .chatInner {
    overflow-y: scroll; 
    max-height: 60vh; 
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
    display: flex;
    position: fixed;
    justify-content: center; 
    bottom: 5vh;
    width: 80%;
    padding: 10px;    
    margin-bottom: 10px;
  }

  .messageInput input {
    margin-right: 10px; 
  }

  .profile-pic {
    width: 50px; 
    height: 50px;   
    border-radius: 50%; 
    object-fit: cover; 
  }

</style>