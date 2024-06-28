import random
from typing import Optional

from ServerCommunicator import DeviceConfig


class MHZ19Simulator:
    def __init__(self, config: DeviceConfig):
        self.config = config
        self.uart_failure_rate = 0.2
        self.pwm_failure_rate = 0.3

    def read_uart(self) -> Optional[int]:
        if random.random() < self.uart_failure_rate:
            return None
        return random.randint(self.config.min_co2, self.config.max_co2)

    def read_pwm(self) -> Optional[int]:
        if random.random() < self.pwm_failure_rate:
            return None
        return random.randint(self.config.min_co2, self.config.max_co2)

    def read(self) -> int:
        uart_value = self.read_uart()
        if uart_value is not None:
            return uart_value
        print("Помилка при читанні даних з UART, спроба використати PWM...")
        pwm_value = self.read_pwm()
        if pwm_value is not None:
            return pwm_value
        print("Помилка при читанні даних з PWM, повернення значення за замовчуванням 400 ppm")
        return 400