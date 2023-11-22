<script setup>
    const props = defineProps(['id', 'squeal_json']);
</script>

<!------------------------------- HTML ---------------------------------->

<template>

  <!-- search area -->
  <div class="searchArea container d-flex justify-content-center">
    <div class="col-sm-6 mx-auto my-5">
      <div class="col-sm-6 mx-auto">
        <div class="form-group d-flex">
          <input v-model="search_user" type="text" placeholder="Search profiles..." class="form-control searchProfileTextbox"/>
          <button @click="fetchMsgs" class=" searchBtn"> Search </button>
        </div>
      </div>
    </div>
  </div>

  <!-- messages area -->
  <div class="chatBox container mx-0 mx-auto">
    <div class="chatInner">
      <div v-if="msgs.length > 0" class="center-button">
        <button @click="fetchMsgs" class="searchBtn"> Load More </button>
      </div>
      <div :class="getMessageClass(message.author)" v-for="(message, index) in msgs" :key="index">
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
      msgs: [],
      friend: '',
      msgs_start_index: 0,  // indice da cui parte la fetch
      newMsgText: '',
      msgs_shift: 50,        // quanti msg caricare ad ogni "load more"
    };
  },
  methods: {
    async fetchMsgs() {
      this.friend = this.search_user;

      // fetch delle conversazioni
      let conversation = await fetch(`https://site222326.tw.cs.unibo.it/squeals/?author=${this.$user}&is_private=true&reply_to=${this.friend}&startindex=${this.msgs_start_index}&endindex=${this.msgs_start_index + this.msgs_shift}`); 
      let conversation2 = await fetch(`https://site222326.tw.cs.unibo.it/squeals/?author=${this.friend}&is_private=true&reply_to=${this.$user}&startindex=${this.msgs_start_index}&endindex=${this.msgs_start_index + this.msgs_shift}`); 

      // trasformazione conversazioni in json e in un unico vettore ordinato cronologicamente
      conversation = await conversation.json();
      conversation2 = await conversation2.json();
      let mergedConversation = conversation.concat(conversation2);
      mergedConversation.sort((a, b) => a.date - b.date);

      // msg fetchati prima di quelli che erano già visualizzati, poi sposto
      this.msgs.unshift(...mergedConversation);  
      this.msgs_start_index += (this.msgs_shift + 1)
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
        this.msgs = [];
        this.msgs_start_index = 0;

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
    height: 20vh;
  }

  .searchProfileTextbox {
    width: 30vh;
  }

  .searchBtn {
    background-color: #ff8900ff;
    margin-left: 30px;
    color: white;
    border-radius: 5px;
    border: none;
  }
  .searchBtn:hover {
  background-color: rgb(231, 123, 0);
}

  .center-button {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .chatBox {
    max-height: auto; 
    flex-direction: column;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 120px;
  }

  .chatInner {
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

</style>