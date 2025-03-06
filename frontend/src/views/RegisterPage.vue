<template>
    <div class="register-wrapper">
      <RegisterForm />
    </div>
  </template>
  
  <script>
  import RegisterForm from '@/components/auth/RegisterForm.vue'
  
  export default {
    name: 'RegisterPage',
    components: {
      RegisterForm
    }
  }
  </script>
  
  <style scoped>
  .register-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--bg-secondary);
  }
  </style>