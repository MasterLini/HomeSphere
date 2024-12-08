import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserView from '../views/UserView.vue'
import AboutView from "../views/AboutView.vue"
import ToDoView from "../views/ToDoView.vue"
import AuthView from "../views/AuthView.vue"

const routes = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/user',
    name: 'user',
    component: UserView
  },
  {
    path: '/todo',
    name: 'todo',
    component: ToDoView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
