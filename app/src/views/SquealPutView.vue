<template>
  <div class="container">
    <form @submit.prevent="submitForm" class="mt-5">
      <div class="form-group">
        <label for="author">Author:</label>
        <!-- TODO remove author field and use $user in scripts -->
        <input
          type="text"
          id="author"
          v-model="author"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <div>
          <p>Credits:</p>
          <div>
            <span v-for="credit in temp_credits" :key="credit.id">
              {{ credit }}&nbsp;&nbsp;
            </span>
          </div>
        </div>
        <label for="text">Text:</label>
        <textarea
          id="text"
          v-model="text"
          required
          class="form-control"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="receiver">Receiver:</label>
        <input
          type="text"
          id="receiver"
          v-model="receiver"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label for="media">Media:</label>
        <input
          type="file"
          id="media"
          @change="handleFileUpload"
          accept="image/*"
          class="form-control-file"
        />
      </div>
      <div v-if="media">
        <p>Uploaded file:</p>
        <img
          v-if="mediaUrl"
          :src="mediaUrl"
          alt="uploaded file"
          style="max-width: 512px; max-height: 512px"
        />
      </div>
      <div class="form-group">
        <label for="reply_to">Reply To:</label>
        <input
          type="text"
          id="reply_to"
          v-model="reply_to"
          class="form-control"
        />
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
      credits: [],
      temp_credits: [],
      charCount: 0
    };
  },
  // mounted: function that gets called when page loads
  mounted() {
    // retrieve credits
    const profile = "Luizo" // TODO replace with $user
    axios
      .get("/profiles/"+profile)
      .then((response) => {
        console.log("response: ", response.data)
        this.credits = response.data.credit;
        this.temp_credits = response.data.credit;
        console.log("credits: ", this.credits);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  computed: {
    mediaUrl() {
      return URL.createObjectURL(this.media);
    },
  },
  methods: {
    handleFileUpload(event) {
      console.log("file uploaded");
      this.media = event.target.files[0];
    },
    submitForm() {
      const jsonBody = {
        author: this.author,
        text: this.text,
        receiver: this.receiver,
        reply_to: this.reply_to,
        is_private: false,
      };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonBody));
      formData.append("file", this.media);

      console.log("sending body: ", formData);
      // Send formData to server using axios or fetch
      axios
        .put("/squeals/", formData)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
    // watch: listeners
    watch: {
    text(newText) {
      this.charCount = newText.length; // Update charCount when text changes
      const credit_fields = ["g","s","m"]
      for(const field of credit_fields) {
        this.temp_credit[field] = this.credit[field] - charCount;
      }
    },
  },
}
</script>
