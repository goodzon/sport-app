<template>
    <div class="not-found-page container">
      <div class="not-found-content">
        <div class="error-code">
          <span>404</span>
        </div>
        
        <h1>Страница не найдена</h1>
        
        <p>К сожалению, запрошенная вами страница не существует или была удалена.</p>
        
        <div class="not-found-actions">
          <router-link to="/" class="btn btn-primary">
            На главную
          </router-link>
          
          <router-link to="/products" class="btn btn-outline">
            Каталог продуктов
          </router-link>
        </div>
        
        <div class="error-illustration">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="300">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:var(--accent-primary);stop-opacity:1" />
                <stop offset="100%" style="stop-color:var(--accent-secondary);stop-opacity:1" />
              </linearGradient>
            </defs>
            
            <path fill="url(#gradient)" opacity="0.3" d="M404.3,261.4c-16.5-54.5-82.3-54.5-99.4,0c-8.7,27.4-44.5,42.8-68.5,25.9
              c-32.4-22.8-74.9-36.4-120.3-36.4c-116.1,0-210.3,94.2-210.3,210.3s94.2,210.3,210.3,210.3s210.3-94.2,210.3-210.3
              C326.4,335.5,313.5,295.4,404.3,261.4z"/>
            
            <circle cx="250" cy="200" r="150" fill="url(#gradient)" opacity="0.1"/>
            
            <path fill="var(--text-secondary)" d="M250,350c-41.4,0-75,33.6-75,75s33.6,75,75,75s75-33.6,75-75S291.4,350,250,350z M250,475
              c-27.6,0-50-22.4-50-50s22.4-50,50-50s50,22.4,50,50S277.6,475,250,475z"/>
            
            <path fill="var(--text-secondary)" opacity="0.7" d="M250,50c-27.6,0-50,22.4-50,50s22.4,50,50,50s50-22.4,50-50S277.6,50,250,50z M250,125
              c-13.8,0-25-11.2-25-25s11.2-25,25-25s25,11.2,25,25S263.8,125,250,125z"/>
            
            <path fill="var(--accent-primary)" d="M354.3,200c-16.5-54.5-82.3-54.5-99.4,0c-8.7,27.4-44.5,42.8-68.5,25.9
              c-32.4-22.8-74.9-36.4-120.3-36.4C50,189.5,0,239.5,0,300.5s50,111,111,111s111-50,111-111c0-16.5-4.5-32-12-45.5
              c15-7.5,32.5-12,50.5-12s35.5,4.5,50.5,12c-7.5,13.5-12,29-12,45.5c0,61,50,111,111,111s111-50,111-111S415.3,189.5,354.3,200z"/>
          </svg>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundPage'
  }
  </script>
  
  <style lang="scss" scoped>
  .not-found-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 70px);
  }
  
  .not-found-content {
    text-align: center;
    max-width: 600px;
    
    .error-code {
      $font-size: 6rem; // Используем SCSS-переменную вместо CSS-переменной
      font-size: $font-size;
      font-weight: var(--font-weight-black);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: var(--spacing-lg);
    }
    
    h1 {
      font-size: var(--font-size-xl);
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
    }
    
    p {
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xl);
    }
    
    .not-found-actions {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
      
      .btn {
        padding: var(--spacing-sm) var(--spacing-lg);
      }
    }
    
    .error-illustration {
      max-width: 500px;
      margin: 0 auto;
      
      svg {
        max-width: 100%;
        height: auto;
      }
    }
  }
  </style>