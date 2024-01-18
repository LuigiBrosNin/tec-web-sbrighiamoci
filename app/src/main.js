import { createApp, reactive } from 'vue'
import App from './App.vue'
import router from './router'
import '../../node_modules/bootstrap/dist/css/bootstrap.css'
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js'
import "@/assets/removeDefaultMargin.css"
import "@/assets/globalStyle.css"


const app = createApp(App);

app.use(router);



let user = await fetch("https://site222326.tw.cs.unibo.it/user-check", { method: "GET"});
user = await user.json();
//app.config.globalProperties.$user = (user.user || null);
app.config.globalProperties.$user = "Matilde";

if(app.config.globalProperties.$user != null){
    let userProfile = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${app.config.globalProperties.$user}`, { method: "GET"});
    userProfile = await userProfile.json();
    app.config.globalProperties.$typeOfUser = (userProfile.account_type || null);
}

app.config.globalProperties.$global = reactive({ is_looping: false, timeout_id: null });



app.mount('#app');