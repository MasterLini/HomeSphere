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
          placeholder="Choose a username"
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
    },
    passwordValidationMessage() {
      const password = this.registerForm.password;
      if (!password) return '';
      if (password.length < 8) return 'Password must be at least 8 characters long';
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
      if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
      if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
      return '';
    }
  },
  methods: {
    async handleRegister() {
      this.error = null;
      this.passwordError = null;

      // Validate password requirements
      const validationMessage = this.passwordValidationMessage;
      if (validationMessage) {
        this.passwordError = validationMessage;
        return;
      }

      // Validate password confirmation
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.passwordError = 'Passwords do not match';
        return;
      }

      this.isLoading = true;
      try {
        await register({
          username: this.registerForm.username.trim(),
          email: this.registerForm.email.trim(),
          password: this.registerForm.password
        });

        this.$emit('submit', this.registerForm);
      } catch (error) {
        if (error.response?.data?.code === 'VALIDATION_ERROR') {
          this.passwordError = error.response.data.message;
        } else {
          this.error = error.response?.data?.message || 'Registration failed. Please try again.';
        }
        console.error('Registration error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1rem);
  width: 100%;
  max-height: calc(100vh - 12rem);
  overflow-y: auto;
  padding-right: 0.5rem;
  margin: 0;
  scrollbar-width: thin;
  scrollbar-color: #4fd1c5 #f0f9f6;
}

form::-webkit-scrollbar {
  width: 0.375rem;
}

form::-webkit-scrollbar-track {
  background: #f0f9f6;
  border-radius: 0.25rem;
}

form::-webkit-scrollbar-thumb {
  background-color: #4fd1c5;
  border-radius: 0.25rem;
}

.form-group {
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
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

.password-requirements {
  background-color: #f3f4f6;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.password-requirements.valid {
  background-color: #d1fae5;
  border: 1px solid #059669;
}

.requirements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  background: inherit;
  border-radius: 0.75rem 0.75rem 0 0;
  padding: 0.5rem 0;
  z-index: 2;
}

.check-icon {
  font-size: 1.2em;
}

.password-requirements ul {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
}

.password-requirements li {
  margin: 0.5rem 0;
  padding: 0.25rem 0;
  color: #6b7280;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  gap: 0.5rem;
}

.requirement-icon {
  flex: 0 0 1.25rem;
  text-align: center;
}

.password-requirements li.met {
  color: #059669;
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

.submit-btn-container {
  position: sticky;
  bottom: 0;
  background: linear-gradient(to bottom, transparent, white 15%);
  padding: 1rem 0 0;
  margin-top: auto;
  z-index: 2;
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
  min-height: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn:hover:not(:disabled) {
  background-color: #38b2ac;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.sign-in-text {
  text-align: center;
  margin-top: 0.75rem;
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

@media (max-width: 480px) {
  .password-requirements {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
  }

  .submit-btn {
    min-height: 2.75rem;
    padding: 0.75rem;
  }

  input {
    padding: 0.75rem;
  }

  .submit-btn-container {
    padding-top: 0.75rem;
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
</style>
