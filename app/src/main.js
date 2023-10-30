import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSession from 'vue-session'
import "@/assets/removeDefaultMargin.css"
import "@/assets/globalStyle.css"

const app = createApp(App);

app.use(router);
app.use(VueSession);

app.mount('#app');
