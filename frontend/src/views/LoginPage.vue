<template>
    <div class="login-wrapper">
      <LoginForm />
    </div>
  </template>
  
  <script>
  import LoginForm from '@/components/auth/LoginForm.vue'
  
  export default {
    name: 'LoginPage',
    components: {
      LoginForm
    }
  }
  </script>
  
  <style scoped>
  .login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--bg-secondary);
  }
  </style>