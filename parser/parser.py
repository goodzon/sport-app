import requests
from bs4 import BeautifulSoup
import json
import os
import re
import time
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("parser.log"),
        logging.StreamHandler()
    ]
)

# Директория для сохранения данных
output_dir = "parsed_data"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Настройки заголовков для запроса
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
}

# Список URL для извлечения данных
urls = {
    'proteins': 'https://frs24.ru/st/soderzhanie-belka-v-produktah/',
    'fats': 'https://frs24.ru/st/soderzhanie-zhirov-v-produktah/',
    'carbs': 'https://frs24.ru/st/soderzhanie-uglevodov-v-produktah/',
    'calories': 'https://frs24.ru/st/tablica-kalorijnosti-produktov-pitaniya/',
    'water': 'https://frs24.ru/st/soderzhanie-vody-v-produktah-tablica/'
}

# Общий словарь для хранения данных о продуктах
all_products = {}

# Словарь категорий продуктов для автоматической классификации
category_keywords = {
    'meat': ['говядина', 'свинина', 'телятина', 'баранина', 'мясо', 'фарш', 'колбаса', 'сосиски', 'ветчина', 'бекон'],
    'poultry': ['курица', 'курин', 'индейка', 'утка', 'гусь', 'цыпленок', 'куриц'],
    'fish': ['рыба', 'лосось', 'семга', 'треска', 'тунец', 'сельдь', 'форель', 'карп', 'окунь', 'судак', 'щука', 'креветки', 'краб'],
    'dairy': ['молоко', 'сыр', 'творог', 'кефир', 'йогурт', 'сметана', 'сливки', 'масло сливочное', 'простокваша', 'ряженка'],
    'eggs': ['яйцо', 'яйца', 'белок', 'желток'],
    'grains': ['крупа', 'рис', 'гречка', 'овсянка', 'перловка', 'пшено', 'кукурузная', 'киноа', 'булгур', 'мука', 'манка'],
    'bread': ['хлеб', 'батон', 'булка', 'лаваш', 'багет', 'сдоба', 'булочка', 'пирожок'],
    'pasta': ['макароны', 'паста', 'спагетти', 'лапша', 'вермишель'],
    'vegetables': ['овощ', 'картофель', 'картошка', 'морковь', 'свекла', 'капуста', 'лук', 'чеснок', 'помидор', 'томат', 'огурец', 'перец', 'кабачок', 'баклажан', 'тыква', 'редис'],
    'fruits': ['фрукт', 'яблоко', 'банан', 'апельсин', 'груша', 'слива', 'персик', 'абрикос', 'киви', 'ананас', 'манго', 'виноград'],
    'berries': ['ягода', 'клубника', 'малина', 'черника', 'голубика', 'смородина', 'крыжовник'],
    'nuts': ['орех', 'миндаль', 'фундук', 'грецкий', 'кешью', 'фисташки', 'арахис', 'семечки', 'семена'],
    'legumes': ['бобовые', 'фасоль', 'горох', 'чечевица', 'нут', 'соя', 'бобы'],
    'sweets': ['сладость', 'сахар', 'мед', 'конфеты', 'шоколад', 'мармелад', 'печенье', 'пирожное', 'торт', 'варенье'],
    'beverages': ['напиток', 'сок', 'компот', 'чай', 'кофе', 'какао', 'вода', 'квас', 'морс', 'лимонад']
}

# Функция для определения категории продукта по его названию
def determine_category(product_name):
    product_name_lower = product_name.lower()
    
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in product_name_lower:
                return category
    
    return 'other'  # Если категория не определена

# Функция для извлечения данных из таблицы
def extract_table_data(url, nutrient_type):
    logging.info(f"Извлечение данных о {nutrient_type} из {url}")
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            logging.error(f"Ошибка при загрузке страницы: {response.status_code}")
            return
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Поиск всех таблиц на странице
        tables = soup.find_all('table')
        
        if not tables:
            logging.warning("Таблицы не найдены на странице")
            return
        
        # Перебираем таблицы и извлекаем данные
        for table_idx, table in enumerate(tables):
            logging.info(f"Обработка таблицы {table_idx + 1} из {len(tables)}")
            
            # Получить заголовки таблицы (если есть)
            headers_row = table.find('thead')
            if headers_row:
                headers = [header.text.strip() for header in headers_row.find_all('th')]
            else:
                # Если тега thead нет, ищем первую строку
                first_row = table.find('tr')
                if first_row:
                    headers = [header.text.strip() for header in first_row.find_all(['th', 'td'])]
                else:
                    logging.warning("Не удалось найти заголовки таблицы")
                    continue
            
            # Поиск строк с данными
            rows = table.find_all('tr')
            
            # Пропускаем первую строку, если она содержит заголовки
            start_idx = 1 if headers_row or (first_row and first_row.find('th')) else 0
            
            for row in rows[start_idx:]:
                cells = row.find_all(['td', 'th'])
                
                # Если меньше 2 ячеек, пропускаем строку
                if len(cells) < 2:
                    continue
                
                # Первая ячейка обычно содержит название продукта
                product_name = cells[0].text.strip()
                
                # Очистка названия продукта от лишних символов
                product_name = re.sub(r'\s+', ' ', product_name)
                
                # Пропускаем строки с заголовками или разделителями
                if len(product_name) <= 2 or product_name.isupper() or product_name.startswith('—'):
                    continue
                
                # Пытаемся извлечь значение питательного вещества
                nutrient_value = None
                
                # В зависимости от типа таблицы значение может быть в разных столбцах
                if len(cells) >= 2:
                    # Обычно значение находится во втором столбце
                    value_text = cells[1].text.strip()
                    
                    # Извлекаем числовое значение
                    value_match = re.search(r'(\d+[.,]?\d*)', value_text)
                    if value_match:
                        nutrient_value = value_match.group(1).replace(',', '.')
                
                # Если не удалось извлечь значение, пропускаем
                if not nutrient_value:
                    continue
                
                # Добавляем или обновляем информацию о продукте
                if product_name not in all_products:
                    # Определяем категорию продукта
                    category = determine_category(product_name)
                    
                    all_products[product_name] = {
                        'name': product_name,
                        'category': category,
                        'proteins': None,
                        'fats': None,
                        'carbs': None,
                        'calories': None,
                        'water': None
                    }
                
                # Обновляем значение нужного питательного вещества
                try:
                    all_products[product_name][nutrient_type] = float(nutrient_value)
                except ValueError:
                    logging.warning(f"Не удалось преобразовать значение '{nutrient_value}' в число для продукта '{product_name}'")
    
    except Exception as e:
        logging.error(f"Ошибка при обработке {url}: {e}")

# Обработка всех URL и извлечение данных
def parse_all_data():
    for nutrient_type, url in urls.items():
        extract_table_data(url, nutrient_type)
        # Небольшая пауза между запросами
        time.sleep(1.5)

    # Фильтруем продукты с недостаточной информацией
    filtered_products = {}
    for name, product in all_products.items():
        non_null_values = sum(1 for value in [product["proteins"], product["fats"], product["carbs"], product["calories"], product["water"]] if value is not None)
        if non_null_values >= 2:  # Продукт должен иметь хотя бы 2 непустых значения
            filtered_products[name] = product
    
    # Преобразуем словарь в список
    products_list = list(filtered_products.values())
    
    # Сортируем продукты по названию
    products_list.sort(key=lambda x: x['name'])
    
    return products_list

# Сохранение данных в JSON
def save_data_to_json(products_list):
    output_file = os.path.join(output_dir, 'nutrition_data.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products_list, f, ensure_ascii=False, indent=2)
    
    logging.info(f"Данные успешно сохранены в {output_file}. Всего продуктов: {len(products_list)}")
    return output_file

# Генерация SQL-скрипта для заполнения базы данных
def generate_sql_script(products_list):
    output_file = os.path.join(output_dir, 'insert_data.sql')
    
    # Получаем уникальные категории
    categories = set(product['category'] for product in products_list)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Запись комментария
        f.write("-- Скрипт для заполнения базы данных данными о пищевой ценности продуктов\n\n")
        
        # Запись категорий
        f.write("-- Вставка категорий продуктов\n")
        
        for category in sorted(categories):
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
            
            f.write(f"INSERT INTO product_categories (name, slug, description) VALUES ('{category_name}', '{category}', '{category_name}');\n")
        
        f.write("\n-- Вставка продуктов\n")
        
        # Запись продуктов
        for product in products_list:
            proteins = product['proteins'] if product['proteins'] is not None else 'NULL'
            fats = product['fats'] if product['fats'] is not None else 'NULL'
            carbs = product['carbs'] if product['carbs'] is not None else 'NULL'
            calories = product['calories'] if product['calories'] is not None else 'NULL'
            water = product['water'] if product['water'] is not None else 'NULL'
            
            # Экранирование одинарных кавычек в названии продукта
            name = product['name'].replace("'", "''")
            
            f.write(f"INSERT INTO products (name, category_id, proteins, fats, carbs, calories, water, serving_size) \n")
            f.write(f"VALUES ('{name}', (SELECT id FROM product_categories WHERE slug = '{product['category']}'), {proteins}, {fats}, {carbs}, {calories}, {water}, 100);\n\n")
    
    logging.info(f"SQL-скрипт успешно создан: {output_file}")
    return output_file

# Основная функция
def main():
    logging.info("Начинаем парсинг данных о пищевой ценности продуктов")
    
    # Парсинг данных
    products_list = parse_all_data()
    
    # Сохранение данных в JSON
    json_file = save_data_to_json(products_list)
    
    # Генерация SQL-скрипта
    sql_file = generate_sql_script(products_list)
    
    logging.info(f"Парсинг завершен. Результаты сохранены в {json_file} и {sql_file}")

if __name__ == "__main__":
    main()