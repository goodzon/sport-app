# Стадия сборки
FROM node:18-alpine AS build-stage

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Сборка для продакшена
RUN npm run build

# Стадия продакшена
FROM nginx:stable-alpine AS production-stage

# Копируем собранные файлы из стадии сборки
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем настройки nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]