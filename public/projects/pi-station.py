"""Dialearn: Pi Zero 2 W + Adafruit BME280 I2C breakout (default 0x77).
Prepare Raspberry Pi OS, I2C, Blinka and adafruit-circuitpython-bme280 first.
Run in that Python environment. Ctrl+C stops. No network upload occurs.
"""
import csv
import time
from datetime import datetime, timezone
from pathlib import Path
import board
import adafruit_bme280.basic as adafruit_bme280

def main():
    path = Path("weather.csv")
    new_file = not path.exists() or path.stat().st_size == 0
    sensor = adafruit_bme280.Adafruit_BME280_I2C(board.I2C(), address=0x77)
    with path.open("a", newline="") as output:
        writer = csv.writer(output)
        if new_file:
            writer.writerow(["time_utc", "temperature_c", "humidity_percent", "pressure_hpa"])
        try:
            while True:
                row = [datetime.now(timezone.utc).isoformat(), round(sensor.temperature, 2),
                       round(sensor.relative_humidity, 2), round(sensor.pressure, 2)]
                writer.writerow(row)
                output.flush()
                print(row)
                time.sleep(5)
        except KeyboardInterrupt:
            print("Stopped; readings saved locally in weather.csv.")

if __name__ == "__main__":
    main()
