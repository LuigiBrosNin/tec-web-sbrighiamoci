<script setup>
    import router from '@/router/index.js'
</script>

<template>

    <!-- search user area -->
    <div class="searchArea container d-flex justify-content-center">
        <div class="col-sm-6 mx-auto my-2">
            <div class="col-sm-6 mx-auto">
                <div class="form-group d-flex align-items-center">

                    <div class="d-block">
                        <img v-if="propic" :src="propic" alt="Profile Pic" class="profilePic" />
                    </div>

                    <input v-model="search_user" type="text" placeholder="Search profiles..."
                        class="form-control searchProfileTextbox" @keypress.enter="searchChat" />
                    <button @click="searchChat" class="searchBtn "> Search </button>
                    
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
  data() {  
    return{
        search_user: ""
    }
  },
  methods: {
    async searchChat(){
        let fetched = await fetch(
        `https://site222326.tw.cs.unibo.it/profiles/${this.search_user}`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (fetched.status == 200) {
          router.push({ path: `/messages/${this.search_user}` });
      }
    }
  }
}
</script>