from dataclasses import dataclass
from typing import Optional, Dict, Any
import requests


@dataclass
class DeviceConfig:
    interval: int
    min_temp: float
    max_temp: float
    ideal_temp: float
    min_humidity: float
    max_humidity: float
    ideal_humidity: float
    min_co2: int
    max_co2: int
    ideal_co2: int


class ServerCommunicator:
    def __init__(self, base_url: str, mac_address: str):
        self.base_url = base_url.rstrip('/')
        self.mac_address = mac_address
        self.headers = {"mac_address": self.mac_address}

    def get_config(self) -> Optional[DeviceConfig]:
        try:
            url = f"{self.base_url}/admin/device/config"
            print(f"Отримання конфігу з: {url}")
            print(f"Заголовки: {self.headers}")
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            print(f"Дані отримані з конфігу: {data}")
            return DeviceConfig(
                interval=data['monitoring_settings']['Interval'],
                min_temp=data['min_values']['Temperature'],
                max_temp=data['max_values']['Temperature'],
                ideal_temp=data['ideal_values']['Temperature'],
                min_humidity=data['min_values']['Humidity'],
                max_humidity=data['max_values']['Humidity'],
                ideal_humidity=data['ideal_values']['Humidity'],
                min_co2=data['min_values']['CO2'],
                max_co2=data['max_values']['CO2'],
                ideal_co2=data['ideal_values']['CO2']
            )
        except requests.RequestException as e:
            print(f"Помилка при отриманні конфігу: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Статус: {e.response.status_code}")
                print(f"Контент: {e.response.text}")
            return None

    def send_data(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            url = f"{self.base_url}/analytics/predict"
            print(f"Дані надіслані: {url}")
            print(f"Заголовки: {self.headers}")
            print(f"Дані: {data}")
            response = requests.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Помилка при надсиланні даних: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"Статус: {e.response.status_code}")
                print(f"Контент: {e.response.text}")
            return None
