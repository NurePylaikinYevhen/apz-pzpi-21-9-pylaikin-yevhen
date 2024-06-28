import asyncio
from typing import Optional
import signal

from ServerCommunicator import DeviceConfig
from Task3.DHT22Simulator import DHT22Simulator
from Task3.MHZ19Simulator import MHZ19Simulator
from Task3.ServerCommunicator import ServerCommunicator

DEFAULT_CONFIG = {
    "interval": 30,
    "min_temp": 10, "max_temp": 40, "ideal_temp": 25,
    "min_humidity": 20, "max_humidity": 80, "ideal_humidity": 50,
    "min_co2": 400, "max_co2": 5000, "ideal_co2": 1000
}


class ESP32Simulator:
    def __init__(self, server_url: str, mac_address: str):
        self.server = ServerCommunicator(server_url, mac_address)
        self.mac_address = mac_address
        self.config = self.get_config()
        self.dht22 = DHT22Simulator(self.config)
        self.mhz19 = MHZ19Simulator(self.config)
        self.running = True

    def get_config(self) -> DeviceConfig:
        config = self.server.get_config()
        if config:
            print(f"[{self.mac_address}] Отримано конфігурацію вдало")
            return config
        else:
            print(f"[{self.mac_address}] Використовуються значення за замовчуванням. Перевірте підключення до сервера.")
            return DeviceConfig(
                interval=30,
                min_temp=15, max_temp=29, ideal_temp=22,
                min_humidity=20, max_humidity=80, ideal_humidity=45,
                min_co2=0, max_co2=1000, ideal_co2=500
            )

    async def read_sensors(self) -> tuple[float, float, int]:
        temperature, humidity = self.dht22.read()
        co2 = self.mhz19.read()
        return temperature, humidity, co2

    def send_data(self, temperature: float, humidity: float, co2: int) -> Optional[dict]:
        data = {
            "mac_address": self.mac_address,
            "Temperature": temperature,
            "Humidity": humidity,
            "CO2": co2
        }
        response = self.server.send_data(data)
        if response:
            print(f"[{self.mac_address}] Дані надіслані успішно")
            return response
        else:
            print(f"[{self.mac_address}] Помилка надсилання даних")
            return None

    async def run(self):
        while self.running:
            try:
                temperature, humidity, co2 = await self.read_sensors()
                print(f"[{self.mac_address}] Температура: {temperature}°C, Вологість: {humidity}%, CO2: {co2} ppm")

                response = self.send_data(temperature, humidity, co2)
                if response:
                    print(f"[{self.mac_address}] Передбачення: {response['prediction']}")
                    print(f"[{self.mac_address}] Рекомендації:")
                    for rec in response['recommendations']:
                        print(f"[{self.mac_address}] - {rec}")

                if self.config.interval > 0:
                    await asyncio.sleep(self.config.interval)
                else:
                    print(f"[{self.mac_address}] Інтервал дорівнює 0, зупиняємо симулятор")
                    self.stop()
            except Exception as e:
                print(f"[{self.mac_address}] Помилка в циклі виконання: {e}")
                await asyncio.sleep(5)

    def stop(self):
        self.running = False

async def run_simulator(server_url: str, mac_address: str):
    simulator = ESP32Simulator(server_url, mac_address)
    await simulator.run()

async def main():
    server_url = "http://localhost:5000/api"
    print("Введіть список MAC-адрес через пробіл:")
    mac_addresses = input().split()

    tasks = []
    for mac_address in mac_addresses:
        task = asyncio.create_task(run_simulator(server_url, mac_address))
        tasks.append(task)

    def signal_handler():
        print("\nОтримано сигнал завершення. Зупиняємо симулятори...")
        for task in tasks:
            task.cancel()

    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler)

    try:
        await asyncio.gather(*tasks)
    except asyncio.CancelledError:
        pass

if __name__ == "__main__":
    asyncio.run(main())
