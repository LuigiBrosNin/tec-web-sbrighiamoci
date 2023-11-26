<script setup>
    const props = defineProps(['id', 'squeal_json']);
</script>

<!------------------------------- HTML ---------------------------------->

<template>

  <!-- search area -->
  <div class="searchArea container d-flex justify-content-center">
    <div class="col-sm-6 mx-auto my-2">
      <div class="col-sm-6 mx-auto">
        <div class="form-group d-flex">
          <img v-if="propic" :src="propic" alt="Profile Pic" class="profile-pic" />
          <input v-model="search_user" type="text" placeholder="Search profiles..." class="form-control searchProfileTextbox"/>
          <button @click="fetchMsgs" class="searchBtn "> Search </button>
          <button  v-if="merged_msgs.length > 0" @click="fetchMsgs" class="searchBtn "> Load more </button>
        </div>
      </div>
    </div>
  </div>

  <!-- messages area -->
  <div class="chatBox container mx-0 mx-auto">
    <div class="chatInner">
      <div :class="getMessageClass(message.author)" v-for="(message, index) in merged_msgs" :key="index">
        {{ message.text }}  
      </div>
    </div>
  </div>

  <!-- Invio nuovo messaggio -->
  <div class="messageInput container d-flex justify-content-center">
    <input v-model="newMsgText" type="text" placeholder="Scrivi il tuo messaggio..." class="form-control" />
    <button @click="sendMessage" class="btn btn-primary"> Invia </button>
  </div>

</template>


<!------------------------------- SCRIPT ---------------------------------->

<script>
import axios from "axios";

export default {
  data() {   
    return {
      search_user: "", 
      friend: '',
      newMsgText: '',
      propic: null,

      merged_msgs: [],
      user_date : 0,     // data ultimo msg utente
      friend_date : 0,
      user_index : 0,    // indici da usare nella query
      friend_index : 0,
      msgs_to_fetch : 5,   // numero di messaggi da fetchare ad ogni "load more" e al caricamento iniziale
    };
  },
  methods: {
    async fetchMsgs() {
      this.friend = this.search_user;

      let fetched_msgs = 0  // contatore dei messaggi già fetchati 
      let no_more_msgs = false
      
      // recupero ultimo msg di ciascuno 
      let user_msgs   = await fetch(`https://site222326.tw.cs.unibo.it/squeals/?author=${this.$user}&is_private=true&reply_to=${this.friend}&startindex=${this.user_index}&endindex=${this.user_index}`); 
      let friend_msgs = await fetch(`https://site222326.tw.cs.unibo.it/squeals/?author=${this.friend}&is_private=true&reply_to=${this.$user}&startindex=${this.friend_index}&endindex=${this.friend_index}`); 
      user_msgs   = await user_msgs.json()
      friend_msgs = await friend_msgs.json()
      let tmp_msgs = user_msgs.concat(friend_msgs)

      // capisco se ci sono messaggi rimanenti da entrambe, una o nessuna delle due parti
      if (user_msgs.length === 1 && friend_msgs.length === 1) {
        this.user_date = user_msgs[0].date
        this.friend_date = friend_msgs[0].date
        fetched_msgs = 2
        this.user_index += 1
        this.friend_index += 1
      }
      else if (user_msgs.length === 1) {
        this.user_date = -1
        fetched_msgs = 1
        this.friend_index += 1
      }
      else if (friend_msgs.length === 1) {
        this.friend_date = -1
        fetched_msgs = 1
        this.user_index += 1
      }
      else {
        no_more_msgs = true
      }

      // se ci sono ancora messaggi, vado a recuperarli
      if (no_more_msgs == false) {
        this.merged_msgs = this.merged_msgs.concat(tmp_msgs);
        let new_msg = []
        let counter = 0

        while ((fetched_msgs < this.msgs_to_fetch || this.user_date > this.friend_date) && (this.friend_date !== -1 && this.user_date !== -1)) {

          if (this.user_date > this.friend_date) {
            new_msg = await fetch(`https://site222326.tw.cs.unibo.it/squeals/?author=${this.$user}&is_private=true&reply_to=${this.friend}&startindex=${this.user_index}&endindex=${this.user_index}`);
            new_msg = await new_msg.json()

            if (new_msg.length === 0) { this.user_date = -1 }
            else {
              this.user_date = new_msg[0].date
              fetched_msgs += 1
              this.user_index += 1
              this.merged_msgs = this.merged_msgs.concat(new_msg)
            }
          }
          else {
            new_msg = await fetch(`https://site222326.tw.cs.unibo.it/squeals/?author=${this.friend}&is_private=true&reply_to=${this.$user}&startindex=${this.friend_index}&endindex=${this.friend_index}`);
            new_msg = await new_msg.json()

            if (new_msg.length === 0) { this.friend_date = -1 }
            else {
              this.friend_date = new_msg[0].date
              fetched_msgs += 1
              this.friend_index += 1
              this.merged_msgs = this.merged_msgs.concat(new_msg)
            }

            while (this.user_date < this.friend_date) {
              new_msg = await fetch(`https://site222326.tw.cs.unibo.it/squeals/?author=${this.friend}&is_private=true&reply_to=${this.$user}&startindex=${this.friend_index}&endindex=${this.friend_index}`);
              new_msg = await new_msg.json()

              if (new_msg.length === 0) { this.friend_date = -1 }
              else {
                this.friend_date = new_msg[0].date
                fetched_msgs += 1
                this.friend_index += 1
                this.merged_msgs = this.merged_msgs.concat(new_msg)
              }
            }
          }
        }
        this.merged_msgs.sort((a, b) => a.date - b.date);
      }
    },

    async sendMessage() {
      const newMessage = {
        author: this.$user,
        text: this.newMsgText,
        receiver: this.friend,
        is_private: true,
      }

      const formData = new FormData()
      formData.append("json", JSON.stringify(newMessage))
      
      try {
        // all'invio del msg "azzero" chat e rifaccio fetch in modo da avere anche ultimo msg

        this.user_date = 0;     
        this.friend_date = 0;
        this.user_index = 0;   
        this.friend_index = 0;
        this.merged_msgs = [];

        await axios
          .put(`https://site222326.tw.cs.unibo.it/squeals/`, formData);
          await this.fetchMsgs();  // dopo l'invio ricarica la chat
      } catch (error) {
        console.error("Error during sending the message:", error.message);
      }
    },
    getMessageClass(author) {
      return {
        'message': true,
        'sent-message': author === this.$user,
        'received-message': author === this.friend,
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
    margin-left: 30px;
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
  
  .chatBox {
    max-height: 60vh; 
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
    width: 100%;
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