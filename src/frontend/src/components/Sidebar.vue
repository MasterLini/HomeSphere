<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="nav-links">
        <li class="nav-item">
          <router-link to="/home" class="nav-link" active-class="active">
            <span class="icon">&#127968;</span>
            <span class="tooltip">Home</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">
            <span class="icon">&#x2139;</span>
            <span class="tooltip">About</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/todo" class="nav-link" active-class="active">
            <span class="icon">&#128220;</span>
            <span class="tooltip">ToDo</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/shoppinglist" class="nav-link" active-class="active">
            <span class="icon">&#128722;</span>
            <span class="tooltip">Shopping List</span>
          </router-link>
        </li>
      </div>  
      <div class="bottom-nav">
        <div class="nav-item">
          <router-link to="/user" class="nav-link" active-class="active">
            <span class="icon">&#128100;</span>
            <span class="tooltip">Profile</span>
          </router-link>
        </div>
        <div class="nav-item">
          <button @click="handleLogout" class="nav-link logout-btn">
            <span class="icon">&#128682;</span>
            <span class="tooltip">Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Hauptinhalt -->
    <div class="main-content flex-grow-1 p-4">
      <router-view />
    </div>
  </div>
</template>

<script>
import { logout } from '@/api/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'Sidebar',
  setup() {
    const router = useRouter();

    const handleLogout = async () => {
      try {
        logout();
        await router.push('/auth');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    return {
      handleLogout
    };
  }
};
</script>

<style scoped>
/* Sidebar Styling */
.sidebar {
  width: 80px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: white;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 0;
  z-index: 1000;
  box-shadow: 2px 0 4px var(--shadow-color);
}

.nav-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.nav-link {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  text-decoration: none;
  position: relative;
  background-color: var(--background-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-link .icon {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.nav-link:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.nav-link.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 6px rgba(79, 209, 197, 0.2);
}

.user-icon {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

/* Tooltip Styles */
.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--text-color);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  white-space: nowrap;
  margin-left: 10px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}

.tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-style: solid;
  border-width: 5px 5px 5px 0;
  border-color: transparent var(--text-color) transparent transparent;
}

.nav-link:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%);
}

.main-content {
  margin-left: 80px; /* Gleiche Breite wie Sidebar */
}

.bottom-nav {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 44px;
  height: 44px;
}

.logout-btn:hover {
  background-color: #ff4444;
  color: white;
}

.logout-btn:hover .tooltip {
  background-color: #ff4444;
}

.logout-btn:hover .tooltip::before {
  border-right-color: #ff4444;
}
</style>
