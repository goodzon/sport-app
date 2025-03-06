# Используем Node.js v18
FROM node:18-alpine

# Создаем директорию приложения
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все исходники
COPY . .

# Экспортируем порт, который будет слушать приложение
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]