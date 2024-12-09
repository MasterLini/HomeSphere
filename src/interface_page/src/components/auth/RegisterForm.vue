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
    <button type="submit" class="submit-btn">
      <span class="btn-icon">✨</span>
      Create Account
    </button>
    <p class="sign-in-text">
      Already have an account? <a href="#" @click.prevent="$emit('switch')">Sign in here</a>
    </p>
  </form>
</template>

<script>
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
      showPassword: false
    }
  },
  methods: {
    handleRegister() {
      this.$emit('submit', this.registerForm)
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 0.9em;
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
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #38b2ac;
}

.password-toggle .mdi {
  font-size: 20px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1em;
  transition: all 0.2s ease;
  background-color: #fff9db;
}

input::placeholder {
  color: #a0aec0;
}

input:focus {
  outline: none;
  border-color: #4fd1c5;
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #4fd1c5;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
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
  margin-top: 16px;
  font-size: 0.9em;
  color: #4a5568;
}

.sign-in-text a {
  color: #38b2ac;
  text-decoration: none;
  font-weight: 500;
}

.sign-in-text a:hover {
  text-decoration: underline;
}
</style>
