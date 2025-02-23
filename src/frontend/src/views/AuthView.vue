<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="card-content">
        <button class="btn btn-lg text-center" @click="goHome">
          <span><i class="bi bi-arrow-left"></i></span>
        </button>
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
      <transition name="fade">
        <div v-if="showBanner" class="alert-banner">
          📧 Look in your email, a verification email has been sent.
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import router from '@/router'

export default {
  name: 'AuthView',
  components: {
    LoginForm,
    RegisterForm
  },
  data() {
    return {
      isLogin: false,
      showBanner: false
    }
  },
  methods: {
    handleLogin(loginData) {
      // The LoginForm component handles its own API call, so this may be optional.
      console.log('Login data received:', loginData)
    },
    async handleRegister(registerData) {
      console.log('Register data received:', registerData)
      // Show the verification banner after successful registration.
      this.showBanner = true;
      setTimeout(() => {
        this.showBanner = false;
      }, 5000);
    },
    goHome() {
      router.push({ path: '/home' })
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #f0f9f6;
  padding: clamp(1rem, 3vw, 2rem);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.auth-card {
  background: white;
  border-radius: clamp(1rem, 3vw, 1.5rem);
  box-shadow: 0 0.25rem 1.5rem rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: min(90vw, 28rem);
  min-width: min(100%, 20rem);
  margin: 1rem auto;
  position: relative;
  overflow: visible;
  height: auto;
  min-height: min-content;
}

.card-content {
  padding: clamp(1.25rem, 4vw, 2rem);
  overflow-y: auto;
  max-height: calc(100vh - 4rem);
}

.title {
  text-align: center;
  color: #2c7a7b;
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  background: #f0f9f6;
  padding: 0.25rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn.active {
  background: white;
  color: #2c7a7b;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05);
}

.form-container {
  margin-top: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.alert-banner {
  background-color: #e6fffa;
  color: #2c7a7b;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  font-weight: 500;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 1rem;
  width: min(90%, 25rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

@media (max-width: 480px) {
  .auth-card {
    margin: 0.5rem;
  }

  .card-content {
    padding: 1rem;
  }

  .tabs {
    gap: 0.25rem;
  }

  .tab-btn {
    padding: 0.5rem;
  }

  .alert-banner {
    width: 90%;
    bottom: 0.5rem;
  }
}
</style>
