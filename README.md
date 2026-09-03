# 🏠 Sistema de Control y Domótica

## 📌 Descripción

Este proyecto consiste en un **Sistema de Control y Domótica de Entornos**, desarrollado con **Python, Flask y Raspberry Pi**.

El sistema permite controlar diferentes entornos desde una interfaz web centralizada. Cada entorno puede contar con distintos dispositivos y sensores, permitiendo realizar acciones de automatización y monitoreo.

Los entornos implementados son:

* 🏠 **Casa**
* 🚗 **Garage**
* 🏫 **Escuela**
* 🏢 **Oficina**

El usuario debe iniciar sesión para acceder al sistema y controlar los dispositivos disponibles en cada entorno.

---

# ⚙️ Funcionalidades

El sistema permite:

* 🔐 Registro e inicio de sesión de usuarios.
* 🔒 Almacenamiento seguro de contraseñas mediante hash.
* 🏠 Acceso a diferentes entornos.
* 💡 Control de iluminación.
* 🚨 Activación y desactivación de alarma.
* 🌡️ Lectura de temperatura.
* 💧 Lectura de humedad.
* 📷 Visualización mediante cámara.
* 🚪 Control del portón del garage mediante servo.
* 🌐 Control de los dispositivos desde una interfaz web.
* 🔄 Comunicación entre la página web y la Raspberry Pi.
* 💾 Almacenamiento de información mediante SQLite.

---

# 🧰 Hardware utilizado

| Componente      | Función                                 |
| --------------- | --------------------------------------- |
| Raspberry Pi    | Control principal del sistema           |
| X-28 S22        | Sistema de alarma                       |
| DHT11           | Sensor de temperatura y humedad         |
| SG90            | Apertura y cierre del portón del garage |
| Módulo relay 5V | Control de la alarma                    |
| LED             | Iluminación                             |
| Cámara USB      | Monitoreo mediante video                |

---

# 🔌 Conexiones GPIO

Se utiliza la numeración **BCM** de la Raspberry Pi.

| Dispositivo        |    GPIO |
| ------------------ | ------: |
| LED de iluminación | GPIO 17 |
| Servo SG90         | GPIO 18 |
| Relay de alarma    | GPIO 27 |
| DHT11              |  GPIO 4 |

---

# 💡 LED de iluminación

El LED se utiliza para representar el sistema de iluminación.

### Conexión

* Ánodo del LED → resistencia → GPIO 17
* Cátodo del LED → GND

### Funcionamiento

```text
GPIO 17 HIGH → LED encendido
GPIO 17 LOW  → LED apagado
```

El control se realiza mediante `gpiozero`.

---

# 🚨 Sistema de alarma

La alarma utiliza un **relay de 5V** para controlar la alimentación de la sirena X-28 S22.

### Relay

* VCC / JD-VCC → 5V
* GND → GND
* IN → GPIO 27

La sirena utiliza su alimentación correspondiente y el relay permite controlar su activación.

### Funcionamiento

```text
GPIO 27 HIGH → Relay activado
GPIO 27 LOW  → Relay desactivado
```

> ⚠️ La conexión de la sirena y su batería debe realizarse respetando las especificaciones eléctricas del equipo. No se debe conectar directamente una carga que supere la capacidad del GPIO o del relay.

---

# 🌡️ Sensor DHT11

El DHT11 permite obtener:

* Temperatura
* Humedad

### Conexión

| DHT11 | Raspberry Pi |
| ----- | ------------ |
| VCC   | 3.3V         |
| DATA  | GPIO 4       |
| GND   | GND          |

En Python se utiliza:

```python
import board
import adafruit_dht

sensor_dht = adafruit_dht.DHT11(board.D4)
```

---

# 🚪 Servo SG90

El servo se utiliza para controlar el **portón del Garage**.

### Conexión

| SG90             | Raspberry Pi |
| ---------------- | ------------ |
| Rojo             | Alimentación |
| Marrón/Negro     | GND          |
| Naranja/Amarillo | GPIO 18      |

El servo puede utilizar posiciones diferentes para representar:

```text
0°  → Portón cerrado
90° → Portón abierto
```

> ⚠️ Si el servo requiere más corriente de la que puede entregar la Raspberry Pi, debe utilizarse una alimentación externa adecuada, manteniendo GND común entre la fuente y la Raspberry Pi.

---

# 📷 Cámara

Se utiliza una **cámara USB conectada a la Raspberry Pi** para realizar el monitoreo del entorno.

La cámara puede visualizarse desde la interfaz web del sistema.

---

# 💻 Tecnologías utilizadas

## Backend

* Python 3
* Flask
* SQLite3
* Werkzeug Security
* GPIO Zero
* Adafruit Blinka
* Adafruit CircuitPython DHT

## Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API

## Hardware

* Raspberry Pi
* DHT11
* SG90
* Relay 5V
* LED
* X-28 S22
* Cámara USB

---

# 🐍 Instalación en Raspberry Pi

## 1. Actualizar Raspberry Pi

Abrir una terminal en la Raspberry Pi y ejecutar:

```bash
sudo apt update
sudo apt upgrade -y
```

---

# 2. Instalar Git y Python

Instalar Python, pip, Git y el módulo para crear entornos virtuales:

```bash
sudo apt install -y python3 python3-pip python3-venv git
```

Comprobar las instalaciones:

```bash
python3 --version
```

```bash
git --version
```

---

# 3. Descargar el proyecto desde GitHub

Clonar el repositorio:

```bash
git clone https://github.com/FranAbbiati/Proyecto.git
```

Entrar a la carpeta:

```bash
cd Proyecto
```

---

# 4. Crear un entorno virtual

Es recomendable utilizar un entorno virtual para evitar problemas con las librerías de Python y el sistema operativo.

Crear el entorno:

```bash
python3 -m venv venv
```

Activarlo:

```bash
source venv/bin/activate
```

Cuando esté activo, aparecerá algo similar a:

```text
(venv)
```

al comienzo de la terminal.

---

# 5. Actualizar pip

Con el entorno virtual activado:

```bash
pip install --upgrade pip
```

---

# 6. Instalar Flask

```bash
pip install flask
```

---

# 7. Instalar GPIO Zero

```bash
pip install gpiozero
```

GPIO Zero permite controlar componentes conectados a los GPIO de la Raspberry Pi.

---

# 8. Instalar Adafruit Blinka

```bash
pip install adafruit-blinka
```

Esta librería permite utilizar módulos de CircuitPython, como `board`, en la Raspberry Pi.

---

# 9. Instalar la librería del DHT11

```bash
pip install adafruit-circuitpython-dht
```

También instalar el paquete necesario del sistema:

```bash
sudo apt install -y libgpiod2
```

---

# 10. Instalar todas las librerías Python juntas

En caso de querer realizar la instalación de una sola vez:

```bash
pip install flask gpiozero adafruit-blinka adafruit-circuitpython-dht
```

Y:

```bash
sudo apt install -y libgpiod2
```

---

# 11. Comprobar las librerías

Para comprobar Flask:

```bash
python3 -c "import flask; print('Flask OK')"
```

Para GPIO Zero:

```bash
python3 -c "import gpiozero; print('GPIO Zero OK')"
```

Para Adafruit Blinka:

```bash
python3 -c "import board; print('Blinka OK')"
```

Para el DHT11:

```bash
python3 -c "import adafruit_dht; print('DHT11 OK')"
```

Si todos muestran `OK`, las librerías principales están instaladas correctamente.

---

# ▶️ Ejecutar el sistema

Con el entorno virtual activado:

```bash
python3 app.py
```

Si Flask inicia correctamente, aparecerá una dirección similar a:

```text
http://127.0.0.1:5000
```

Para acceder desde otra computadora conectada a la misma red, obtener la dirección IP de la Raspberry Pi:

```bash
hostname -I
```

Por ejemplo:

```text
192.168.1.100
```

Desde el navegador se puede acceder utilizando:

```text
http://192.168.1.100:5000
```

reemplazando la IP por la dirección correspondiente de la Raspberry Pi.

---

# 🔄 Actualizar el proyecto desde GitHub

Si ya se tiene el proyecto instalado y se realizaron cambios en GitHub:

Entrar a la carpeta:

```bash
cd Proyecto
```

Activar el entorno virtual:

```bash
source venv/bin/activate
```

Actualizar el proyecto:

```bash
git pull
```

Luego ejecutar nuevamente:

```bash
python3 app.py
```

---

# 🔐 Seguridad

El sistema requiere autenticación para acceder a los entornos.

Las contraseñas de los usuarios no se almacenan directamente en texto plano. Se utiliza:

```python
generate_password_hash()
```

para generar un hash seguro.

Para verificar las contraseñas se utiliza:

```python
check_password_hash()
```

También se utilizan sesiones de Flask para controlar el acceso de los usuarios.

---

# 🌐 Funcionamiento del sistema

El funcionamiento general es:

```text
                 ┌──────────────────┐
                 │   Navegador Web   │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │      Flask       │
                 │     Python       │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        ┌─────────┐   ┌─────────┐  ┌─────────┐
        │ SQLite  │   │   GPIO  │  │ Cámara  │
        └─────────┘   └────┬────┘  └─────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
           DHT11          LED          Relay
                                         │
                                         ▼
                                      X-28 S22
```

---

# 🏠 Entornos

## Casa

Permite controlar los dispositivos configurados para el entorno doméstico, como:

* Iluminación
* Alarma
* Temperatura
* Humedad
* Cámara

---

## 🚗 Garage

Permite controlar:

* Iluminación
* Alarma
* Temperatura
* Humedad
* Cámara
* Portón mediante servo SG90

---

## 🏫 Escuela

Permite controlar los dispositivos disponibles para el entorno educativo:

* Iluminación
* Alarma
* Temperatura
* Humedad
* Cámara

---

## 🏢 Oficina

Permite controlar los dispositivos disponibles para el entorno laboral:

* Iluminación
* Alarma
* Temperatura
* Humedad
* Cámara

---

# 🎯 Objetivo del proyecto

El objetivo es desarrollar un sistema centralizado que permita **administrar y automatizar diferentes entornos mediante una interfaz web**, utilizando una Raspberry Pi como dispositivo de control.

El proyecto busca integrar:

* Programación
* Desarrollo web
* Bases de datos
* Electrónica
* Automatización
* Sensores
* Actuadores
* Internet de las cosas (IoT)

---

# 🚀 Estado del proyecto

Actualmente el sistema cuenta con:

* ✅ Registro de usuarios
* ✅ Inicio de sesión
* ✅ Base de datos SQLite
* ✅ Sistema de sesiones
* ✅ Entorno Casa
* ✅ Entorno Garage
* ✅ Entorno Escuela
* ✅ Entorno Oficina
* ✅ Control de iluminación
* ✅ Sistema de alarma
* ✅ Sensor DHT11
* ✅ Temperatura
* ✅ Humedad
* ✅ Cámara
* ✅ Servo SG90 para Garage
* ✅ Integración con Raspberry Pi
* ✅ Control mediante navegador web
