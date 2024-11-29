<template>
  <div id="app">
    <Sidebar />
    <div class="main-content flex-grow-1 p-4">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';

export default {
  components: {
    Sidebar,
  },
};
</script>