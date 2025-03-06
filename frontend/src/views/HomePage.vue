<template>
    <div class="home-page container">
      <header class="home-hero">
        <div class="hero-content">
          <h1>FitBeast</h1>
          <p>Ваш помощник в здоровом питании и тренировках</p>
          
          <div class="hero-actions">
            <router-link to="/products" class="btn btn-primary">
              Каталог продуктов
            </router-link>
            <router-link to="/playlists" class="btn btn-outline">
              Музыкальные плейлисты
            </router-link>
          </div>
        </div>
      </header>
  
      <section class="features">
        <div class="feature">
          <div class="feature-icon">💪</div>
          <h3>Тренировки</h3>
          <p>Подбирайте плейлисты для разных типов тренировок</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">🥗</div>
          <h3>Питание</h3>
          <p>Отслеживайте пищевую ценность продуктов</p>
        </div>
        
        <div class="feature">
          <div class="feature-icon">🎵</div>
          <h3>Музыка</h3>
          <p>Энергичные плейлисты для мотивации</p>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomePage'
  }
  </script>
  
  <style lang="scss" scoped>
  .home-page {
    text-align: center;
  }
  
  .home-hero {
    padding: var(--spacing-xxl) 0;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    
    .hero-content {
      max-width: 600px;
      margin: 0 auto;
      
      h1 {
        font-size: var(--font-size-xxl);
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: var(--spacing-md);
      }
      
      p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xl);
      }
    }
    
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      
      .btn {
        padding: var(--spacing-md) var(--spacing-lg);
      }
    }
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-xl);
    padding: var(--spacing-xxl) 0;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
    
    .feature {
      background-color: var(--bg-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-normal);
      
      &:hover {
        transform: translateY(-10px);
      }
      
      .feature-icon {
        font-size: var(--font-size-xxl);
        margin-bottom: var(--spacing-md);
      }
      
      h3 {
        margin-bottom: var(--spacing-sm);
        color: var(--text-primary);
      }
      
      p {
        color: var(--text-secondary);
      }
    }
  }
  </style>