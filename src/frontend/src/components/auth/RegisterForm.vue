<template>
  <form @submit.prevent="handleRegister">
    <div class="form-group">
      <label>
        <span class="label-icon">👤</span>
        Username
      </label>
      <input
          type="text"
          v-model="registerForm.username"
          placeholder="Your Username"
          required
      >
    </div>
    <div class="form-group">
      <label>
        Name
      </label>
      <input
          type="text"
          v-model="registerForm.firstName"
          placeholder="Your Firstname"
          required
      >
      <input
          type="text"
          v-model="registerForm.lastName"
          placeholder="Your Lastname"
          required
      >
    </div>
    <div class="form-group">
      <label>
        <span class="label-icon">📧</span>
        Email address
      </label>
      <input
          type="email"
          v-model="registerForm.email"
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
            v-model="registerForm.password"
            placeholder="Create a password"
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
        <span class="label-icon">🔒</span>
        Confirm Password
      </label>
      <div class="password-input">
        <input
            :type="showPassword ? 'text' : 'password'"
            v-model="registerForm.confirmPassword"
            placeholder="Confirm your password"
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
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-if="passwordError" class="error-message">
      {{ passwordError }}
    </div>
    <div v-if="registerForm.password" class="password-requirements" :class="{ valid: isPasswordValid }">
      <div class="requirements-header">
        Password requirements:
        <span v-if="isPasswordValid" class="check-icon">✅</span>
      </div>
      <ul>
        <li :class="{ met: registerForm.password.length >= 8 }">
          <span class="requirement-icon">{{ registerForm.password.length >= 8 ? '✅' : '❌' }}</span>
          At least 8 characters
        </li>
        <li :class="{ met: /[A-Z]/.test(registerForm.password) }">
          <span class="requirement-icon">{{ /[A-Z]/.test(registerForm.password) ? '✅' : '❌' }}</span>
          One uppercase letter
        </li>
        <li :class="{ met: /[a-z]/.test(registerForm.password) }">
          <span class="requirement-icon">{{ /[a-z]/.test(registerForm.password) ? '✅' : '❌' }}</span>
          One lowercase letter
        </li>
        <li :class="{ met: /[0-9]/.test(registerForm.password) }">
          <span class="requirement-icon">{{ /[0-9]/.test(registerForm.password) ? '✅' : '❌' }}</span>
          One number
        </li>
        <li :class="{ met: /[!@#$%^&*]/.test(registerForm.password) }">
          <span class="requirement-icon">{{ /[!@#$%^&*]/.test(registerForm.password) ? '✅' : '❌' }}</span>
          One special character (!@#$%^&*)
        </li>
      </ul>
    </div>
    <div class="submit-btn-container">
      <button type="submit" class="submit-btn" :disabled="isLoading">
        <span v-if="isLoading" class="loading-spinner">🔄</span>
        <span v-else class="btn-icon">✨</span>
        {{ isLoading ? 'Creating Account...' : 'Create Account' }}
      </button>
      <p class="sign-in-text">
        Already have an account? <a href="#" @click.prevent="$emit('switch')">Sign in here</a>
      </p>
    </div>
  </form>
</template>

<script>
import { register } from '@/api/auth';

export default {
  name: 'RegisterForm',
  data() {
    return {
      registerForm: {
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      isLoading: false,
      error: null,
      passwordError: null
    }
  },
  computed: {
    isPasswordValid() {
      const password = this.registerForm.password;
      return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*]/.test(password);
    }
  },
  methods: {
    validateForm() {
      this.error = null;
      this.passwordError = null;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.registerForm.email)) {
        this.error = 'Please enter a valid email address';
        return false;
      }

      // Validate username
      if (this.registerForm.username.length < 3) {
        this.error = 'Username must be at least 3 characters long';
        return false;
      }

      // Validate password
      if (!this.isPasswordValid) {
        this.error = 'Please meet all password requirements';
        return false;
      }

      // Validate password confirmation
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.passwordError = 'Passwords do not match';
        return false;
      }

      return true;
    },
    async handleRegister() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const { password, confirmPassword, ...userData } = this.registerForm;
        await register({
          ...userData,
          password
        });

        this.$router.push({ name: 'home' });
      } catch (error) {
        console.error('Registration failed:', error);
        this.error = error.message || 'Registration failed. Please try again.';
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

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
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
  cursor: pointer;
  color: #4a5568;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #2d3748;
}

.password-toggle:focus {
  outline: none;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #e53e3e;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
}

.password-requirements {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.requirements-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  color: #4a5568;
  font-size: 0.875rem;
}

.requirement-icon {
  flex-shrink: 0;
}

.password-requirements.valid {
  background-color: #f0fff4;
  border-color: #9ae6b4;
}

.sign-in-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #4a5568;
}

.sign-in-text a {
  text-decoration: none;
  font-weight: 600;
}

.sign-in-text a:hover {
  text-decoration: underline;
}

.submit-btn-container {
  margin-top: 1.5rem;
}

.btn-icon {
  font-size: 1.2em;
}
</style>