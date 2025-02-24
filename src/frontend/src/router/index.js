import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserView from '../views/UserView.vue'
import AboutView from '../views/AboutView.vue'
import ToDoView from '../views/ToDoView.vue'
import AuthView from '../views/AuthView.vue'
import ShoppingListView from '../views/ShoppingListView.vue'

const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return !!token
}

const routes = [
  {
    path: '/',
    redirect: () => isAuthenticated() ? '/home' : '/auth'
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { redirectIfAuth: true } // If already authenticated, redirect to home.
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
  const auth = isAuthenticated()

  if (to.matched.some(record => record.meta.redirectIfAuth) && auth) {
    return next({ name: 'home' })
  }

  if (to.matched.some(record => record.meta.requiresAuth) && !auth) {
    return next({
      name: 'auth',
      query: { redirect: to.fullPath }
    })
  }

  next()
})

export default router
