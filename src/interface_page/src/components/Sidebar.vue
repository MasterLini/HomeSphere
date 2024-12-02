<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="bg-light border-end sidebar">
      <ul class="nav flex-column justify-content-center">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active" title="Home">
            🏠
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active" title="About">
            ℹ️
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/todo" class="nav-link" active-class="active" title="ToDo">
            📜
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/contact" class="nav-link" active-class="active" title="Contact">
            📞
          </router-link>
        </li>
      </ul>
      <div class="user-icon mt-auto p-3">
        <router-link to="/user" class="nav-link" active-class="active" title="User">
          👤
        </router-link>
      </div>
    </div>

    <!-- Hauptinhalt -->
    <div class="main-content flex-grow-1 p-4">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  overflow-y: auto;
  z-index: 1000;
  background-color: #f8f9fa;
}

.nav-link {
  color: #333;
  padding: 1rem;
  transition: background-color 0.3s, transform 0.3s;
  text-align: center;
  font-size: 1.5rem;
}

.nav-link.active,
.nav-link:hover {
  background-color: #e9ecef;
  color: #000;
  transform: scale(1.1);
}

.user-icon {
  margin-top: auto;
  padding-bottom: 1rem;
}

.main-content {
  margin-left: 80px; /* Gleiche Breite wie Sidebar */
}
</style>
