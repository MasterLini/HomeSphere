import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import '@mdi/font/css/materialdesignicons.css'
import './assets/style.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

createApp(App).use(router).mount('#app')
