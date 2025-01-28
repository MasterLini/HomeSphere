import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserView from '../views/UserView.vue'
import AboutView from "../views/AboutView.vue"
import ToDoView from "../views/ToDoView.vue"
import AuthView from "../views/AuthView.vue"
import ShoppingListView from '@/views/ShoppingListView.vue'
import { isAuthenticated } from './auth' // Import the isAuthenticated function

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
    component: HomeView,
    meta: { requiresAuth: false } // Add meta field for authentication
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { requiresAuth: true } // Add meta field for authentication
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
    meta: { requiresAuth: true } // Add meta field for authentication
  },
  {
    path: '/todo',
    name: 'todo',
    component: ToDoView,
    meta: { requiresAuth: true } // Add meta field for authentication
  },
  {
    path: '/shoppinglist',
    name: 'shoppinglist',
    component: ShoppingListView,
    meta: { requiresAuth: true } // Add meta field for authentication
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next({ name: 'auth' });
    } else {
      next();
    }
  } else {
    next();
  }
})

export default router