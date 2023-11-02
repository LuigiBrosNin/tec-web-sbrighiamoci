<template>
    <div>
        <input type="file" @change="handleFileUpload" />
        <button @click="uploadFile">Upload</button>
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
            const name_of_profile = "luizo"; //! TEMP, CHANGE TO CURRENT USER
            formData.append("file", this.file);
            axios.put(`/squeal/${name_of_profile}/propic`, this.file, {
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
