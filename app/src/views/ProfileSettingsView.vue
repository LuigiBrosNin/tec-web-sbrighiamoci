<template>
<div class="input-group mb-3">
  <div class="custom-file">
    <input type="file" class="custom-file-input" id="inputGroupFile01" @change="handleFileUpload" accept="image/*">
    <label class="custom-file-label" for="inputGroupFile01">Choose file</label>
  </div>
  <div class="input-group-append">
    <button class="btn btn-outline-secondary" type="button" @click="uploadFile">Upload</button>
  </div>
</div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            file: null,
        };
    },
    methods: {
        handleFileUpload(event) {
            this.file = event.target.files[0];
        },
        uploadFile() {
            const formData = new FormData();
            const name_of_profile = $user;
            formData.append("file", this.file);
            axios.put(`/profiles/${name_of_profile}/propic`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    console.log("Upload progress:" + Math.round(progressEvent.loaded / progressEvent.total * 100) + "%");
                }
            }).then((response) => {
                console.log(response.data);
            });
        },
    },
};
</script>
