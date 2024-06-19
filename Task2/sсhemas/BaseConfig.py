from pydantic import field_validator, BaseModel


class BaseConfig(BaseModel):
    @field_validator('ideal_values', 'min_values', 'max_values', 'monitoring_settings')
    def validate_keys(self, v):
        if v is not None and not isinstance(v, dict):
            raise ValueError('Значення повинне бути словником')
        return v

    @field_validator('monitoring_settings')
    def validate_monitoring_settings(self, v):
        if v is not None and 'Interval' not in v:
            raise ValueError('Словник повинен містити ключ "Interval"')
        return v