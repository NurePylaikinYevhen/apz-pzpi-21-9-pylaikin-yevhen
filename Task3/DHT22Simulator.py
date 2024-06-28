import random

from ServerCommunicator import DeviceConfig


class DHT22Simulator:
    def __init__(self, config: DeviceConfig):
        self.config = config

    def read(self) -> tuple[float, float]:
        temperature = random.uniform(self.config.min_temp, self.config.max_temp)
        humidity = random.uniform(self.config.min_humidity, self.config.max_humidity)
        return round(temperature, 2), round(humidity, 2)