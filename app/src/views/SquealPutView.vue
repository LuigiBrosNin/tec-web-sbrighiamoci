<template>
    <div class="container">
        <form @submit.prevent="submitForm" class="mt-5">
            <div class="form-group">
                <label for="author">Author:</label>
                <input type="text" id="author" v-model="author" required class="form-control" />
            </div>
            <div class="form-group">
                <label for="text">Text:</label>
                <textarea id="text" v-model="text" required class="form-control"></textarea>
            </div>
            <div class="form-group">
                <label for="receiver">Receiver:</label>
                <input type="text" id="receiver" v-model="receiver" required class="form-control" />
            </div>
            <div class="form-group">
                <label for="media">Media:</label>
                <input type="file" id="media" @change="handleFileUpload" accept="image/*" class="form-control-file" />
            </div>
            <div class="form-group">
                <label for="reply_to">Reply To:</label>
                <input type="text" id="reply_to" v-model="reply_to" class="form-control" />
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      author: "",
      text: "",
      receiver: "",
      media: null,
      reply_to: "",
    };
  },
  methods: {
    handleFileUpload(event) {
      this.media = event.target.files[0];
    },
    submitForm() {
      const formData = new FormData();
      formData.append("author", this.author);
      formData.append("text", this.text);
      formData.append("receiver", this.receiver);
      //formData.append("media", this.media);
      formData.append("reply_to", this.reply_to);

      console.log("sending body: ", formData);
      // Send formData to server using axios or fetch
      axios
        .put("/squeals/", formData,{
        headers: {
                    'Content-Type': 'application/json'
                }
                })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
