/**
 * Форматирование времени (секунды -> MM:SS)
 * @param {Number} seconds - Время в секундах
 * @returns {String} - Форматированное время в формате MM:SS
 */
export function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Форматирование даты в локальный формат
   * @param {String} dateString - Дата в формате ISO или timestamp
   * @param {Object} options - Опции форматирования (см. Intl.DateTimeFormat)
   * @returns {String} - Локализованная дата
   */
  export function formatDate(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Опции по умолчанию: день.месяц.год
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options }).format(date);
  }
  
  /**
   * Форматирование числа с разделителями групп разрядов
   * @param {Number} number - Число для форматирования
   * @param {Number} decimals - Количество десятичных знаков
   * @param {Boolean} showZero - Показывать ли ноль или вернуть пустую строку
   * @returns {String} - Форматированное число
   */
  export function formatNumber(number, decimals = 0, showZero = true) {
    if (number === null || number === undefined || (number === 0 && !showZero)) {
      return '';
    }
    
    return number.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
  
  /**
   * Форматирование калорий
   * @param {Number} calories - Количество калорий
   * @returns {String} - Форматированное значение
   */
  export function formatCalories(calories) {
    if (calories === null || calories === undefined) {
      return '-';
    }
    
    return `${formatNumber(calories, 0)} ккал`;
  }
  
  /**
   * Форматирование граммов нутриентов (белков, жиров, углеводов)
   * @param {Number} grams - Количество граммов
   * @returns {String} - Форматированное значение
   */
  export function formatGrams(grams) {
    if (grams === null || grams === undefined) {
      return '-';
    }
    
    return `${formatNumber(grams, 1)} г`;
  }
  
  /**
   * Форматирование имени пользователя
   * @param {Object} user - Объект пользователя
   * @returns {String} - Форматированное имя
   */
  export function formatUserName(user) {
    if (!user) return 'Гость';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    }
    
    return 'Пользователь';
  }
  
  /**
   * Получение инициалов пользователя
   * @param {Object} user - Объект пользователя
   * @returns {String} - Инициалы
   */
  export function getUserInitials(user) {
    if (!user) return '?';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return '?';
  }
  
  /**
   * Получение BPM категории
   * @param {Number} bpm - Beats per minute
   * @returns {String} - Категория
   */
  export function getBpmCategory(bpm) {
    if (!bpm) return 'Неизвестно';
    
    if (bpm < 90) return 'Медленный';
    if (bpm < 120) return 'Умеренный';
    if (bpm < 140) return 'Средний';
    if (bpm < 170) return 'Быстрый';
    return 'Очень быстрый';
  }
  
  /**
   * Обрезание текста до указанной длины с многоточием
   * @param {String} text - Исходный текст
   * @param {Number} maxLength - Максимальная длина
   * @returns {String} - Обрезанный текст
   */
  export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + '...';
  }