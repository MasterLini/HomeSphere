<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="bg-light border-end sidebar">
      <h5 class="sidebar-header p-3">Meine App</h5>
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">🏠 Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">ℹ️ About</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/contact" class="nav-link" active-class="active">📞 Kontakt</router-link>
        </li>
      </ul>
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
/* Sidebar-Styling */
.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar-header {
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #f8f9fa;
  text-align: center;
}

.nav-link {
  color: #333;
  padding: 0.75rem 1rem;
  transition: background-color 0.3s;
}

.nav-link.active,
.nav-link:hover {
  background-color: #e9ecef;
  color: #000;
}

.main-content {
  margin-left: 250px; /* Gleiche Breite wie Sidebar */
}
</style>