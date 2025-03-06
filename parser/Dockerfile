# Используем Python 3.9
FROM python:3.9-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходные файлы
COPY parser.py .
COPY db_init.py .

# Создаем директорию для выходных данных
RUN mkdir -p parsed_data

# Запускаем парсер
CMD ["python", "parser.py"]