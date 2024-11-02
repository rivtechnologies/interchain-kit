import './style.css';
import { createApp } from 'vue';
import router from './router'
import "@interchain-ui/vue/style.css";

import App from './App.vue';

const app = createApp(App);

app.use(router)
app.mount('#app');
