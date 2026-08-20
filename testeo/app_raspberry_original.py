from flask import Flask, render_template, jsonify
from gpiozero import LED, Buzzer, DHT11
import time

app = Flask(__name__)

# Configuración de pines (ajustalos según tu cableado GPIO en modo BCM)
led = LED(17)       # Pin GPIO 17 para el LED
alarma = Buzzer(27) # Pin GPIO 27 para el buzzer/alarma
sensor = DHT11(4)   # Pin GPIO 4 para el sensor DHT11

@app.route('/')
def index():
    return render_template('index.html')

# Rutas para controlar el LED
@app.route('/led/on')
def led_on():
    led.on()
    return "LED encendido"

@app.route('/led/off')
def led_off():
    led.off()
    return "LED apagado"

# Rutas para controlar la Alarma
@app.route('/alarma/on')
def alarma_on():
    alarma.on()
    return "Alarma activada"

@app.route('/alarma/off')
def alarma_off():
    alarma.off()
    return "Alarma desactivada"

# Ruta para leer temperatura y humedad
@app.route('/sensor')
def leer_sensor():
    try:
        humedad = sensor.humidity
        temperatura = sensor.temperature
        if humedad is not None and temperatura is not None:
            return jsonify({'temperatura': round(temperatura, 1), 'humedad': round(humedad, 1)})
        else:
            return jsonify({'error': 'No se pudo leer el sensor'})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)