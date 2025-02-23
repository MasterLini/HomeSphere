<template>
  <div id="app">
    <template v-if="!isAuthRoute">
      <Sidebar :user="user" />
      <div class="main-content">
        <router-view />
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import { getUserInfo } from './api/user';

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      user: null,
    };
  },
  computed: {
    isAuthRoute() {
      return this.$route.path === '/auth';
    }
  },
  mounted() {
    // First, get the authenticated user info from /users/me
    getUserInfo()
      .then(data => {
        this.user = data;
        console.log('Authenticated user:', data);
      })
      .catch(err => {
        console.error('Error fetching authenticated user:', err);
      });
  }
};
</script>

<style>
:root {
  --primary-color: #4fd1c5;
  --secondary-color: #38b2ac;
  --background-color: #f0f9f6;
  --text-color: #4a5568;
  --input-bg: #fff;
  --border-color: #e2e8f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--background-color);
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  color: var(--text-color);
}

.main-content {
  margin-left: 80px;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
  background-color: var(--background-color);
}

/* Global input styles */
input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1em;
  background-color: var(--input-bg);
  color: var(--text-color);
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
}

input::placeholder {
  color: #a0aec0;
}

/* Global button styles */
button {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-1px);
}

/* Global heading styles */
h1, h2, h3, h4, h5, h6 {
  color: var(--text-color);
  margin-bottom: 1rem;
}

h1 {
  font-size: 2em;
  font-weight: 600;
}

/* Card style */
.card {
  background-color: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 6px var(--shadow-color);
}
</style>