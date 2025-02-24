<template>
  <form @submit.prevent="handleLogin">
    <div class="form-group">
      <label>
        <span class="label-icon">📧</span>
        Email address
      </label>
      <input
          type="email"
          v-model="loginForm.email"
          placeholder="Enter your email"
          required
      >
    </div>
    <div class="form-group">
      <label>
        <span class="label-icon">🔒</span>
        Password
      </label>
      <div class="password-input">
        <input
            :type="showPassword ? 'text' : 'password'"
            v-model="loginForm.password"
            placeholder="Enter your password"
            required
        >
        <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
            :title="showPassword ? 'Hide password' : 'Show password'"
        >
          <span class="mdi" :class="showPassword ? 'mdi-eye-off' : 'mdi-eye'"></span>
        </button>
      </div>
    </div>
    <div class="form-group">
      <label>
        <input
            type="checkbox"
            v-model="loginForm.remember"
        >
        Remember me
      </label>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <button type="submit" class="submit-btn" :disabled="isLoading">
      <span v-if="isLoading" class="loading-spinner">🔄</span>
      <span v-else class="btn-icon">✨</span>
      {{ isLoading ? 'Signing In...' : 'Sign In' }}
    </button>
    <p class="sign-in-text">
      Don't have an account? <a href="#" @click.prevent="$emit('switch')">Sign up here</a>
    </p>
  </form>
</template>

<script>
import { login } from '@/api/auth'

export default {
  name: 'LoginForm',
  data() {
    return {
      loginForm: {
        email: '',
        password: '',
        remember: false
      },
      showPassword: false,
      isLoading: false,
      error: null
    }
  },
  methods: {
    async handleLogin() {
      this.error = null;
      this.isLoading = true;

      try {
        const response = await login(this.loginForm);
        const token = response.data.token;
        localStorage.setItem('token', token);

        // Redirect to intended destination or home
        const redirectPath = this.$route.query.redirect;
        if (redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')) {
          this.$router.push(redirectPath);
        } else {
          this.$router.push({ name: 'home' });
        }
      } catch (err) {
        console.error('Login failed:', err);
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: clamp(1rem, 3vw, 1.25rem);
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
}

.label-icon {
  font-size: 1.2em;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 2.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.5rem;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  min-width: 2.5rem;
  min-height: 2.5rem;
}

.password-toggle:hover {
  color: #38b2ac;
}

.password-toggle .mdi {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}

input {
  width: 100%;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 2vw, 1rem);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  transition: all 0.2s ease;
  background-color: #fff9db;
}

input::placeholder {
  color: #a0aec0;
}

input:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 0.1875rem rgba(79, 209, 197, 0.1);
}

.submit-btn {
  width: 100%;
  padding: clamp(0.75rem, 2vw, 1rem);
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  min-height: 3rem;
}

.submit-btn:hover {
  background-color: #38b2ac;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.2em;
}

.sign-in-text {
  text-align: center;
  margin-top: 1rem;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  color: #4a5568;
}

.sign-in-text a {
  color: #38b2ac;
  text-decoration: none;
  font-weight: 500;
  padding: 0.25rem;
}

.sign-in-text a:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
}

@media (max-width: 480px) {
  input, .submit-btn {
    padding: 0.75rem;
  }

  .password-toggle {
    right: 0.5rem;
    min-width: 2rem;
    min-height: 2rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
  font-size: 1.2em;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.submit-btn:disabled:hover {
  background-color: #9ca3af;
  transform: none;
}
</style>
