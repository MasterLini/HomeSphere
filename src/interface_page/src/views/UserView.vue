<template>
  <div class="user-view p-4">
    <div class="user-card card shadow-sm">
      <div class="card-body text-center">
        <div class="user-avatar mb-3">
          <img src="" alt="User Avatar" class="avatar-img">
        </div>
        <h5 class="card-title">John Doe</h5>
        <p class="card-text text-muted">johndoe@example.com</p>
        <router-link to="/edit-profile" class="btn btn-primary mt-3">Edit Profile</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserView',
};
</script>

<style scoped>
.user-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.user-card {
  width: 300px;
  border: none;
  border-radius: 10px;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
