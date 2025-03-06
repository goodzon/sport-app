<template>
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h2>Вход в FitBeast</h2>
          <p>Начните свой путь к здоровому образу жизни</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Input -->
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              :class="{'input-error': v$.email.$error}"
              @blur="v$.email.$touch()"
              placeholder="Введите ваш email"
            >
            <div v-if="v$.email.$error" class="error-message">
              {{ emailErrorMessage }}
            </div>
          </div>
          
          <!-- Password Input -->
          <div class="form-group">
            <label for="password">Пароль</label>
            <div class="password-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password"
                :class="{'input-error': v$.password.$error}"
                @blur="v$.password.$touch()"
                placeholder="Введите пароль"
              >
              <button 
                type="button" 
                class="password-toggle" 
                @click="togglePasswordVisibility"
                aria-label="Показать/скрыть пароль"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div v-if="v$.password.$error" class="error-message">
              {{ passwordErrorMessage }}
            </div>
          </div>
          
          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            :disabled="v$.$invalid || isLoading"
          >
            <span v-if="!isLoading">Войти</span>
            <div v-else class="spinner"></div>
          </button>
          
          <!-- Additional Links -->
          <div class="form-footer">
            <router-link to="/register" class="register-link">
              Нет аккаунта? Зарегистрируйтесь
            </router-link>
            <router-link to="/reset-password" class="forgot-password">
              Забыли пароль?
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { useVuelidate } from '@vuelidate/core'
  import { required, email, minLength } from '@vuelidate/validators'
  
  export default {
    name: 'LoginForm',
    
    setup() {
      const store = useStore()
      const router = useRouter()
      
      // Form state
      const email = ref('')
      const password = ref('')
      const showPassword = ref(false)
      const isLoading = ref(false)
      
      // Validation rules
      const rules = {
        email: { 
          required, 
          email 
        },
        password: { 
          required, 
          minLength: minLength(6) 
        }
      }
      
      const v$ = useVuelidate(rules, { email, password })
      
      // Error messages
      const emailErrorMessage = computed(() => {
        if (v$.value.email.required.$invalid) {
          return 'Email обязателен'
        }
        if (v$.value.email.email.$invalid) {
          return 'Некорректный формат email'
        }
        return ''
      })
      
      const passwordErrorMessage = computed(() => {
        if (v$.value.password.required.$invalid) {
          return 'Пароль обязателен'
        }
        if (v$.value.password.minLength.$invalid) {
          return 'Пароль должен быть не менее 6 символов'
        }
        return ''
      })
      
      // Toggle password visibility
      const togglePasswordVisibility = () => {
        showPassword.value = !showPassword.value
      }
      
      // Login handler
      const handleLogin = async () => {
        v$.value.$touch()
        
        if (v$.value.$invalid) {
          return
        }
        
        try {
          isLoading.value = true
          await store.dispatch('auth/login', {
            email: email.value,
            password: password.value
          })
          
          // Redirect to home page after successful login
          router.push('/')
        } catch (error) {
          // Error handled by Vuex action via notification
        } finally {
          isLoading.value = false
        }
      }
      
      return {
        email,
        password,
        showPassword,
        isLoading,
        v$,
        emailErrorMessage,
        passwordErrorMessage,
        togglePasswordVisibility,
        handleLogin
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 70px); // Высота минус хедер
    background: var(--bg-secondary);
  }
  
  .login-container {
    width: 100%;
    max-width: 400px;
    padding: var(--spacing-xl);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
  }
  
  .login-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    
    h2 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--spacing-sm);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p {
      color: var(--text-secondary);
    }
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .form-group {
    position: relative;
    
    label {
      display: block;
      margin-bottom: var(--spacing-xs);
      font-weight: var(--font-weight-medium);
    }
    
    input {
      width: 100%;
      padding: var(--spacing-sm);
      border: 2px solid var(--bg-tertiary);
      border-radius: var(--border-radius-md);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      transition: border-color var(--transition-fast);
      
      &:focus {
        border-color: var(--accent-primary);
        outline: none;
      }
      
      &.input-error {
        border-color: var(--color-error);
      }
    }
    
    .password-wrapper {
      position: relative;
      
      .password-toggle {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        
        &:hover {
          color: var(--text-primary);
        }
      }
    }
    
    .error-message {
      color: var(--color-error);
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-xs);
    }
  }
  
  .form-footer {
    display: flex;
    justify-content: space-between;
    margin-top: var(--spacing-md);
    
    .register-link, 
    .forgot-password {
      color: var(--accent-primary);
      font-size: var(--font-size-sm);
      transition: color var(--transition-fast);
      
      &:hover {
        color: var(--accent-secondary);
      }
    }
  }
  
  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>