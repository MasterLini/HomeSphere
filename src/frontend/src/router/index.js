import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserView from '../views/UserView.vue'
import AboutView from "../views/AboutView.vue"
import ToDoView from "../views/ToDoView.vue"
import AuthView from "../views/AuthView.vue"
import ShoppingListView from '@/views/ShoppingListView.vue'
import { isAuthenticated } from '@/api/auth'

const routes = [
  {
    path: '/',
    redirect: to => {
      return isAuthenticated() ? '/home' : '/auth'
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { requiresAuth: false, redirectIfAuth: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
    meta: { requiresAuth: true }
  },
  {
    path: '/todo',
    name: 'todo',
    component: ToDoView,
    meta: { requiresAuth: true }
  },
  {
    path: '/shoppinglist',
    name: 'shoppinglist',
    component: ShoppingListView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = isAuthenticated();

  // Handle routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth) {
      next({ 
        name: 'auth',
        query: { redirect: to.fullPath }  // Save intended destination
      });
    } else {
      next();
    }
    return;
  }

  // Handle auth page when already authenticated
  if (to.matched.some(record => record.meta.redirectIfAuth) && auth) {
    next({ name: 'home' });
    return;
  }

  next();
})

export default router
