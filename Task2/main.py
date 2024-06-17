import json
import math


def read_config_from_json(file_path):
    with open(file_path, 'r') as file:
        config = json.load(file)
    return config


config_path = 'set_config.json'
config = read_config_from_json(config_path)


def calculate_adjustment_factor(current_val, min_val, max_val, ideal_val, key):
    if current_val < min_val or current_val > max_val:
        return 0  # 0 якщо значення знаходиться за межами допустимого діапазону
    else:
        return 1  # 1 якщо значення знаходиться в допустимому діапазоні


def adjust_model_config(scores, config, temperature, humidity, co2):
    # Ця функція розраховує коефіцієнти корекції для кожного параметра
    # на основі поточних значень та конфігурації. Потім множимо бали на ці коефіцієнти, щоб врахувати
    # вплив кожного параметра на загальний результат.
    adjustment_factors = {
        'Temperature': calculate_adjustment_factor(temperature, config['min_values']['Temperature'],
                                                   config['max_values']['Temperature'],
                                                   config['ideal_values']['Temperature'], 'Temperature'),
        'Humidity': calculate_adjustment_factor(humidity, config['min_values']['Humidity'],
                                                config['max_values']['Humidity'], config['ideal_values']['Humidity'],
                                                'Humidity'),
        'CO2': calculate_adjustment_factor(co2, config['min_values']['CO2'], config['max_values']['CO2'],
                                           config['ideal_values']['CO2'], 'CO2')
    }

    adjusted_scores = {
        'Temperature': scores['Temperature'] * adjustment_factors['Temperature'],
        'Humidity': scores['Humidity'] * adjustment_factors['Humidity'],
        'CO2': scores['CO2'] * adjustment_factors['CO2']
    }

    return adjusted_scores


# Смоделював функцію для розрахунку продуктивності на основі температури, вологості та рівня CO2 (математична модель)
def calculate_productivity(temperature, humidity, co2, config):
    # Ваги параметрів - це наша оцінка їх важливості. Температура - найважливіша,
    # вологість - трохи менш важлива, а CO2 - найменш важливий. Так я задаю пріоритети!
    temperature_weight = 5
    humidity_weight = 3
    co2_weight = 1

    # Для температури та вологості використовую експоненціальну залежність, бо вона досить агресивно впливає на відхилення від ідеальних значень!
    # Так я отримую більш реалістичну оцінку!
    temperature_score = math.exp(-((temperature - config['ideal_values']['Temperature']) ** 2) / 50)
    humidity_score = math.exp(-((humidity - config['ideal_values']['Humidity']) ** 2) / 100)

    # Використання логарифмічної залежності для CO2, щоб забезпечити плавне зменшення балів на великому діапазоні значень
    co2_ideal = config['ideal_values']['CO2']
    co2_max = config['max_values']['CO2']
    if co2 <= co2_ideal:
        co2_score = 1
    else:
        co2_score = 1 - math.log(1 + (co2 - co2_ideal) / (co2_max - co2_ideal)) / math.log(2)

    scores = {
        "Temperature": temperature_score,
        "Humidity": humidity_score,
        "CO2": co2_score
    }

    adjusted_scores = adjust_model_config(scores, config, temperature, humidity, co2)

    # Обчислення загального балу як середнє геометричне зважених балів
    overall_score = (
                            adjusted_scores["Temperature"] ** temperature_weight *
                            adjusted_scores["Humidity"] ** humidity_weight *
                            adjusted_scores["CO2"] ** co2_weight
                    ) ** (1 / (temperature_weight + humidity_weight + co2_weight)) * 100

    return round(overall_score)


# Тестую аналіз на різних кейсах
print(calculate_productivity(22, 45, 500, config))
print(calculate_productivity(23, 50, 600, config))
print(calculate_productivity(33, 45, 500, config))
print(calculate_productivity(35, 90, 500, config))
print(calculate_productivity(42, 45, 500, config))
