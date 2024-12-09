<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="card-content">
        <h1 class="title">✨ Join Us!</h1>
        
        <div class="tabs">
          <button 
            :class="['tab-btn', { active: isLogin }]" 
            @click="isLogin = true"
          >
            Sign In
          </button>
          <button 
            :class="['tab-btn', { active: !isLogin }]" 
            @click="isLogin = false"
          >
            Sign Up
          </button>
        </div>

        <div class="form-container">
          <transition name="fade" mode="out-in">
            <login-form
              v-if="isLogin"
              @submit="handleLogin"
              key="login"
            />
            <register-form
              v-else
              @submit="handleRegister"
              key="register"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

export default {
  name: 'AuthView',
  components: {
    LoginForm,
    RegisterForm
  },
  data() {
    return {
      isLogin: false
    }
  },
  methods: {
    handleLogin(loginData) {
      console.log('Login:', loginData)
    },
    handleRegister(registerData) {
      console.log('Register:', registerData)
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f9f6;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.card-content {
  padding: 32px;
}

.title {
  text-align: center;
  color: #2c7a7b;
  font-size: 24px;
  margin-bottom: 24px;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 8px;
  background: #f0f9f6;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  font-size: 1em;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: white;
  color: #2c7a7b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-container {
  margin-top: 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
