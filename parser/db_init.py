import os
import json
import logging
import argparse
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("db_init.log"),
        logging.StreamHandler()
    ]
)

# Параметры подключения к PostgreSQL по умолчанию
DEFAULT_DB_CONFIG = {
    'host': 'localhost',
    'user': 'postgres',
    'password': 'postgres',
    'port': 5432,
    'database': 'fitbeast'
}

# SQL скрипт для создания таблиц
CREATE_TABLES_SQL = """
-- Создание расширения для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица категорий продуктов
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица продуктов
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES product_categories(id),
    proteins DECIMAL(5,1),
    fats DECIMAL(5,1),
    carbs DECIMAL(5,1),
    calories DECIMAL(6,1),
    water DECIMAL(5,1),
    serving_size INTEGER, -- размер порции в граммах
    image_url VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для улучшения поиска по имени продукта
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('russian', name));

-- Таблица жанров музыки
CREATE TABLE IF NOT EXISTS music_genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица плейлистов
CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre_id INTEGER REFERENCES music_genres(id),
    description TEXT,
    bpm INTEGER, -- beats per minute, темп музыки
    duration INTEGER, -- длительность в секундах
    workout_type VARCHAR(100), -- тип тренировки (кардио, силовая и т.д.)
    intensity VARCHAR(50), -- интенсивность (низкая, средняя, высокая)
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица треков
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    duration INTEGER, -- длительность в секундах
    bpm INTEGER, -- beats per minute
    audio_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица связи плейлистов и треков (многие ко многим)
CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- позиция трека в плейлисте
    PRIMARY KEY (playlist_id, track_id)
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица избранных продуктов пользователя
CREATE TABLE IF NOT EXISTS user_favorite_products (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

-- Таблица избранных плейлистов пользователя
CREATE TABLE IF NOT EXISTS user_favorite_playlists (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, playlist_id)
);

-- Таблица пользовательских настроек
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    auto_play_music BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'ru',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание триггера для автоматического обновления timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применение триггера к таблицам с updated_at
DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime 
BEFORE UPDATE ON products 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_product_categories_modtime ON product_categories;
CREATE TRIGGER update_product_categories_modtime 
BEFORE UPDATE ON product_categories 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_playlists_modtime ON playlists;
CREATE TRIGGER update_playlists_modtime 
BEFORE UPDATE ON playlists 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_user_settings_modtime ON user_settings;
CREATE TRIGGER update_user_settings_modtime 
BEFORE UPDATE ON user_settings 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
"""

# SQL для заполнения жанров музыки
INSERT_MUSIC_GENRES_SQL = """
INSERT INTO music_genres (name, slug, description) VALUES
('Хип-хоп', 'hip-hop', 'Энергичная музыка с выраженным битом и ритмом'),
('Электронная', 'electronic', 'Музыка, созданная с использованием электронных инструментов'),
('Рок', 'rock', 'Мощная музыка с характерным гитарным звучанием'),
('Поп', 'pop', 'Популярная музыка с запоминающимися мелодиями'),
('EDM', 'edm', 'Электронная танцевальная музыка с высоким темпом'),
('Дабстеп', 'dubstep', 'Электронная музыка с мощным басом и ломаным ритмом'),
('Драм-н-бейс', 'drum-and-bass', 'Быстрая электронная музыка с тяжелыми басами'),
('Трэп', 'trap', 'Стиль хип-хопа с тяжелыми битами и быстрыми хай-хэтами'),
('Техно', 'techno', 'Ритмичная электронная музыка с минималистичным звучанием'),
('Хаус', 'house', 'Танцевальная электронная музыка с четким ритмом');
"""

# SQL для добавления примерных плейлистов
INSERT_SAMPLE_PLAYLISTS_SQL = """
INSERT INTO playlists (name, genre_id, description, bpm, workout_type, intensity, image_url) VALUES
('Интенсивная кардио-тренировка', (SELECT id FROM music_genres WHERE slug = 'edm'), 'Энергичные треки для максимальной кардио нагрузки', 145, 'кардио', 'высокая', '/images/playlists/cardio.jpg'),
('Силовая тренировка', (SELECT id FROM music_genres WHERE slug = 'rock'), 'Мощные рок-хиты для силовых упражнений', 120, 'силовая', 'высокая', '/images/playlists/strength.jpg'),
('Утренняя растяжка', (SELECT id FROM music_genres WHERE slug = 'electronic'), 'Спокойные электронные треки для растяжки и разминки', 90, 'растяжка', 'низкая', '/images/playlists/stretch.jpg'),
('HIIT тренировка', (SELECT id FROM music_genres WHERE slug = 'dubstep'), 'Интенсивные треки с изменяющимся темпом для интервальных тренировок', 160, 'интервальная', 'высокая', '/images/playlists/hiit.jpg'),
('Йога и медитация', (SELECT id FROM music_genres WHERE slug = 'electronic'), 'Успокаивающие треки для расслабления и концентрации', 60, 'йога', 'низкая', '/images/playlists/yoga.jpg'),
('Бег на выносливость', (SELECT id FROM music_genres WHERE slug = 'drum-and-bass'), 'Ритмичные треки для поддержания оптимального темпа бега', 170, 'бег', 'средняя', '/images/playlists/running.jpg'),
('Функциональный тренинг', (SELECT id FROM music_genres WHERE slug = 'trap'), 'Динамичные треки для функциональных тренировок', 130, 'функциональная', 'средняя', '/images/playlists/functional.jpg'),
('Восстановление и релаксация', (SELECT id FROM music_genres WHERE slug = 'electronic'), 'Мелодичные треки для периода восстановления после тренировки', 75, 'восстановление', 'низкая', '/images/playlists/recovery.jpg');
"""

def parse_arguments():
    parser = argparse.ArgumentParser(description='Инициализация базы данных для FitBeast')
    parser.add_argument('--host', default=DEFAULT_DB_CONFIG['host'], help='Хост базы данных')
    parser.add_argument('--port', type=int, default=DEFAULT_DB_CONFIG['port'], help='Порт базы данных')
    parser.add_argument('--user', default=DEFAULT_DB_CONFIG['user'], help='Имя пользователя базы данных')
    parser.add_argument('--password', default=DEFAULT_DB_CONFIG['password'], help='Пароль пользователя базы данных')
    parser.add_argument('--database', default=DEFAULT_DB_CONFIG['database'], help='Имя базы данных')
    parser.add_argument('--data-file', default='parsed_data/nutrition_data.json', help='Путь к JSON-файлу с данными о продуктах')
    parser.add_argument('--sql-file', default='parsed_data/insert_data.sql', help='Путь к SQL-файлу с данными для вставки')
    parser.add_argument('--recreate-db', action='store_true', help='Пересоздать базу данных, если она существует')
    parser.add_argument('--sample-data', action='store_true', help='Добавить примерные данные для плейлистов')
    
    return parser.parse_args()

def connect_to_postgres(host, port, user, password, database=None):
    """Подключение к PostgreSQL серверу"""
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except Exception as e:
        logging.error(f"Ошибка подключения к PostgreSQL: {e}")
        return None

def create_database(host, port, user, password, database, recreate=False):
    """Создание базы данных"""
    try:
        # Подключаемся к postgres для управления базами данных
        conn = connect_to_postgres(host, port, user, password, 'postgres')
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Проверяем существует ли база данных
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database,))
        exists = cursor.fetchone()
        
        if exists:
            if recreate:
                logging.info(f"База данных {database} существует. Пересоздание...")
                # Закрываем все активные соединения с базой
                cursor.execute(f"""
                    SELECT pg_terminate_backend(pg_stat_activity.pid)
                    FROM pg_stat_activity
                    WHERE pg_stat_activity.datname = '{database}'
                    AND pid <> pg_backend_pid()
                """)
                cursor.execute(f"DROP DATABASE {database}")
            else:
                logging.info(f"База данных {database} уже существует.")
                cursor.close()
                conn.close()
                return True
        
        # Создаем базу данных
        cursor.execute(f"CREATE DATABASE {database}")
        logging.info(f"База данных {database} успешно создана")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Ошибка при создании базы данных: {e}")
        return False

def create_tables(host, port, user, password, database):
    """Создание таблиц в базе данных"""
    try:
        conn = connect_to_postgres(host, port, user, password, database)
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Выполняем SQL скрипт для создания таблиц
        cursor.execute(CREATE_TABLES_SQL)
        conn.commit()
        
        logging.info("Таблицы успешно созданы")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Ошибка при создании таблиц: {e}")
        return False

def insert_data_from_sql_file(host, port, user, password, database, sql_file):
    """Вставка данных из SQL файла"""
    if not os.path.exists(sql_file):
        logging.error(f"SQL файл {sql_file} не найден")
        return False
        
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
            
        conn = connect_to_postgres(host, port, user, password, database)
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Выполняем SQL запросы из файла
        cursor.execute(sql_content)
        conn.commit()
        
        logging.info(f"Данные из файла {sql_file} успешно добавлены в базу данных")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Ошибка при вставке данных из SQL файла: {e}")
        return False

def insert_data_from_json(host, port, user, password, database, json_file):
    """Вставка данных из JSON файла"""
    if not os.path.exists(json_file):
        logging.error(f"JSON файл {json_file} не найден")
        return False
        
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
            
        conn = connect_to_postgres(host, port, user, password, database)
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Получаем все категории продуктов
        categories = set(product['category'] for product in products_data)
        
        # Словарь для хранения id категорий
        category_ids = {}
        
        # Вставляем категории и сохраняем их id
        for category in categories:
            category_name = {
                'meat': 'Мясо',
                'poultry': 'Птица',
                'fish': 'Рыба и морепродукты',
                'dairy': 'Молочные продукты',
                'eggs': 'Яйца',
                'grains': 'Злаки и крупы',
                'bread': 'Хлеб и выпечка',
                'pasta': 'Макароны и паста',
                'vegetables': 'Овощи',
                'fruits': 'Фрукты',
                'berries': 'Ягоды',
                'nuts': 'Орехи и семена',
                'legumes': 'Бобовые',
                'sweets': 'Сладости',
                'beverages': 'Напитки',
                'other': 'Другое'
            }.get(category, 'Другое')
            
            # Проверяем, существует ли категория
            cursor.execute("SELECT id FROM product_categories WHERE slug = %s", (category,))
            result = cursor.fetchone()
            
            if result:
                category_ids[category] = result[0]
            else:
                cursor.execute(
                    "INSERT INTO product_categories (name, slug, description) VALUES (%s, %s, %s) RETURNING id",
                    (category_name, category, category_name)
                )
                category_ids[category] = cursor.fetchone()[0]
        
        # Вставляем данные о продуктах
        for product in products_data:
            name = product['name']
            category = product['category']
            proteins = product['proteins']
            fats = product['fats']
            carbs = product['carbs']
            calories = product['calories']
            water = product['water']
            
            # Проверяем, существует ли продукт
            cursor.execute("SELECT id FROM products WHERE name = %s", (name,))
            if not cursor.fetchone():
                cursor.execute(
                    """
                    INSERT INTO products 
                    (name, category_id, proteins, fats, carbs, calories, water, serving_size) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (name, category_ids[category], proteins, fats, carbs, calories, water, 100)
                )
        
        conn.commit()
        
        # Получаем количество добавленных продуктов
        cursor.execute("SELECT COUNT(*) FROM products")
        products_count = cursor.fetchone()[0]
        
        logging.info(f"Данные из файла {json_file} успешно добавлены в базу данных. Всего продуктов: {products_count}")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Ошибка при вставке данных из JSON файла: {e}")
        return False

def insert_sample_data(host, port, user, password, database):
    """Вставка примерных данных для плейлистов и треков"""
    try:
        conn = connect_to_postgres(host, port, user, password, database)
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Вставляем жанры музыки
        cursor.execute(INSERT_MUSIC_GENRES_SQL)
        
        # Вставляем плейлисты
        cursor.execute(INSERT_SAMPLE_PLAYLISTS_SQL)
        
        conn.commit()
        
        logging.info("Примерные данные для плейлистов успешно добавлены")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Ошибка при вставке примерных данных: {e}")
        return False

def main():
    args = parse_arguments()
    
    # Создаем базу данных
    if not create_database(args.host, args.port, args.user, args.password, args.database, args.recreate_db):
        return
    
    # Создаем таблицы
    if not create_tables(args.host, args.port, args.user, args.password, args.database):
        return
    
    # Вставляем данные
    if os.path.exists(args.sql_file):
        insert_data_from_sql_file(args.host, args.port, args.user, args.password, args.database, args.sql_file)
    elif os.path.exists(args.data_file):
        insert_data_from_json(args.host, args.port, args.user, args.password, args.database, args.data_file)
    else:
        logging.warning("Файлы с данными не найдены. База данных создана без данных о продуктах.")
    
    # Вставляем примерные данные для плейлистов
    if args.sample_data:
        insert_sample_data(args.host, args.port, args.user, args.password, args.database)
    
    logging.info("Инициализация базы данных успешно завершена")

if __name__ == "__main__":
    main()