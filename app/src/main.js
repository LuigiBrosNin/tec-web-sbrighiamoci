import { createApp } from 'vue'
import { h } from 'vue'
import App from './App.vue'
import router from './router'
import '../../node_modules/bootstrap/dist/css/bootstrap.css'
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js'
import "@/assets/removeDefaultMargin.css"
import "@/assets/globalStyle.css"

/*
const app = createApp({
    render() {
        return h(App, {
            props: {
                "user": "dio"
            }
        })
    },
});
*/

const app = createApp(App);

app.use(router);


// vue does not support await at top level
/*
let user = await fetch("https://site222326.tw.cs.unibo.it/user-check", { method: "GET"});
user = await user.json();
app.config.globalProperties.$user = user.user;

app.mount('#app');
*/
fetch("https://site222326.tw.cs.unibo.it/user-check", { method: "GET"})
    .then(res => res.json())
    .then(res => app.config.globalProperties.$user = (res.user || null))
    .then(app.mount('#app')); // this have to be always the last action
