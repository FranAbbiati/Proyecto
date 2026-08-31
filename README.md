# 🏠 Sistema de Control y Domótica — Raspberry Pi + Flask

Sistema web de **control y automatización** desarrollado con **Python, Flask y Raspberry Pi**, diseñado para administrar diferentes espacios desde una interfaz web.

El sistema permite controlar cuatro espacios:

* 🏠 **Casa**
* 🚗 **Garage**
* 🏫 **Escuela**
* 🏢 **Oficina**

En cada espacio se pueden controlar diferentes dispositivos, como:

* 💡 Luz LED
* 🚨 Alarma
* 📷 Cámara
* 🌡️ Sensor de temperatura y humedad

Además, el garage cuenta con un **servomotor SG90** para controlar el portón.

El sistema cuenta con un **inicio de sesión obligatorio**, por lo que el usuario debe autenticarse antes de acceder al panel de control.

---

# ✨ Características principales

## 🔐 Inicio de sesión

El sistema comienza con una pantalla de autenticación.

El usuario debe ingresar sus credenciales para acceder al panel principal.

Las contraseñas se almacenan mediante **hashing seguro utilizando `werkzeug.security`**, evitando guardarlas en texto plano.

---

## 🏠 Control de espacios

El usuario puede seleccionar el espacio que desea administrar:

| Espacio    | Funciones                                                            |
| ---------- | -------------------------------------------------------------------- |
| 🏠 Casa    | 💡 Luz · 🚨 Alarma · 📷 Cámara · 🌡️ Temperatura/Humedad             |
| 🚗 Garage  | 💡 Luz · 🚨 Alarma · 📷 Cámara · 🌡️ Temperatura/Humedad · 🚪 Portón |
| 🏫 Escuela | 💡 Luz · 🚨 Alarma · 📷 Cámara · 🌡️ Temperatura/Humedad · 🚪 Portón |
| 🏢 Oficina | 💡 Luz · 🚨 Alarma · 📷 Cámara · 🌡️ Temperatura/Humedad             |

Los dispositivos pueden activarse, desactivarse o consultarse desde el panel web.

---

# 🔧 Hardware utilizado

El sistema utiliza una **Raspberry Pi** como unidad central de control.

| Componente      | Modelo                             | Función                                     |
| --------------- | ---------------------------------- | ------------------------------------------- |
| 🖥️ Controlador | Raspberry Pi                       | Ejecuta Flask y controla el hardware        |
| 🚨 Sirena       | **X-28 S22**                       | Sistema de alarma                           |
| 🌡️ Sensor      | **DHT11**                          | Medición de temperatura y humedad           |
| 🚪 Servomotor   | **SG90**                           | Control del portón                          |
| 🔌 Relé         | **Módulo relé de 5 V**             | Interruptor de la alimentación de la sirena |
| 💡 Iluminación  | **LED**                            | Iluminación del sistema                     |
| 📷 Cámara       | Web cam con conector USB-C         | Vigilancia                                  |

---

# 🔌 Conexiones del hardware

La Raspberry Pi funciona como el **controlador central** del sistema.

Los GPIO se utilizan para enviar señales de control y recibir información de los sensores.

Los dispositivos que necesitan una alimentación independiente, como la sirena X-28, utilizan su propia fuente de alimentación.

> ⚠️ **Importante:** los GPIO de la Raspberry Pi trabajan con lógica de 3,3 V. Nunca se debe conectar una fuente de 5 V, 9 V o superior directamente a un GPIO.

---

# 💡 Conexión de la luz LED

La iluminación del sistema se realiza mediante una **LED independiente**.

La LED se conecta a un GPIO de la Raspberry Pi utilizando una resistencia para limitar la corriente.

### 🔌 Conexión

| LED                    | Raspberry Pi                                      |
| ---------------------- | ------------------------------------------------- |
| Ánodo (+), pata larga  | GPIO 17                                           |
| Cátodo (-), pata corta | GND                                               |

Esquema:

```text
Raspberry Pi
     │
     │ GPIO
     ▼
┌─────────────┐
│ Resistencia │
└──────┬──────┘
       │
       ▼
      LED
       │
       ▼
      GND
```

### ⚙️ Funcionamiento

* GPIO en estado **HIGH** → la LED se enciende.
* GPIO en estado **LOW** → la LED se apaga.

La resistencia es necesaria para limitar la corriente que circula por la LED y evitar dañarla.

---

# 🚨 Conexión de la alarma X-28 S22

El sistema utiliza una **sirena X-28 S22**, controlada mediante un **módulo relé de 5 V** que tenes que conectar de la siguiente manera:
VCC o JD-VCC: Conéctalo al pin físico de 5V de la Raspberry Pi.
GND (Tierra): Conéctalo a un pin de GND de la Raspberry Pi.
IN (Entrada de señal): Conéctalo al pin GPIO 27 para activar o desactivar el relé.

El relé funciona exclusivamente como un **interruptor para la alimentación de la sirena**.

La Raspberry Pi controla el relé mediante un GPIO, mientras que la sirena recibe su alimentación de una **batería externa de 9 V**.

### 🔌 Conexión de la batería y la sirena

| Elemento                      | Conexión                 |
| ----------------------------- | ------------------------ |
| 🔋 Batería 9 V — positivo (+) | `COM` del relé           |
| 🔋 Batería 9 V — negativo (-) | Cable negro de la sirena |
| 🚨 Sirena X-28 — positivo (+) | `NO` del relé            |
| 🚨 Sirena X-28 — negativo (-) | Cable negro de la sirena |

Esquema:

```text
                 BATERÍA 9 V
              ┌───────────────┐
              │               │
           (+)│               │(-)
              │               │
              ▼               ▼
          ┌───────┐       ┌───────────┐
          │  COM  │       │  NEGRO    │
          │ RELÉ  │       │  SIRENA   │
          └───┬───┘       └─────┬─────┘
              │                 │
              │                 │
          ┌───▼───┐             │
          │  NO   │             │
          │ RELÉ  │             │
          └───┬───┘             │
              │                 │
              ▼                 │
          🔴 ROJO ◄─────────────┘
          SIRENA X-28
```

### ⚙️ Funcionamiento

El contacto `NO` significa **Normally Open / Normalmente Abierto**.

**Relé desactivado:**

```text
COM ─── X ─── NO
```

COM y NO están separados, por lo que la batería no entrega el positivo a la sirena.

**Relé activado:**

```text
COM ─────── NO
```

El positivo de la batería pasa desde `COM` hacia `NO` y llega al cable rojo de la sirena.

El negativo de la batería permanece conectado directamente al cable negro de la sirena.

De esta manera:

```text
Raspberry Pi
     │
     │ GPIO
     ▼
  RELÉ 5 V
     │
     │ Interruptor
     ▼
 Batería 9 V
     │
     ▼
 X-28 S22
```

La Raspberry Pi **no alimenta directamente la sirena** ni recibe los 9 V de la batería.

> ⚠️ Verificá siempre la polaridad y el esquema específico de la X-28 S22 antes de realizar la conexión física. La batería de 9 V debe quedar aislada de los GPIO de la Raspberry Pi.

---

# 🌡️ Sensor DHT11

El **DHT11** permite medir dos variables ambientales:

* 🌡️ Temperatura
* 💧 Humedad relativa

El sensor envía los datos digitales a la Raspberry Pi mediante su pin `DATA`.

### 🔌 Conexión

| DHT11  | Raspberry Pi                 |
| ------ | ---------------------------- |
| `VCC`  | `3.3 V`                      |
| `DATA` | `GPIO 4`                     |
| `GND`  | `GND`                        |

Esquema:

```text
          DHT11
       ┌──────────┐
       │          │
 VCC ──┤ VCC      │
       │          │
DATA ──┤ DATA     │
       │          │
 GND ──┤ GND      │
       └────┬─────┘
            │
            ▼
      Raspberry Pi
```

### ⚙️ Funcionamiento

El DHT11 realiza la medición y envía los datos a través de `DATA`.

La Raspberry Pi:

1. Solicita/lee los datos del sensor.
2. Obtiene la temperatura.
3. Obtiene la humedad.
4. Procesa la información mediante Python.
5. Puede mostrar los valores en el panel web.

Ejemplo:

```text
┌──────────────────────┐
│       DHT11          │
│                      │
│ Temperatura: 24 °C   │
│ Humedad:     58 %    │
└──────────┬───────────┘
           │
           ▼
    Raspberry Pi
           │
           ▼
       Panel Web
```

> ⚠️ Si se utiliza un DHT11 en formato de sensor suelto y no un módulo, puede ser necesaria una resistencia pull-up entre `VCC` y `DATA`.

---

# 🚪 Servomotor SG90

El portón automatizado utiliza un **servomotor SG90**.

El SG90 permite controlar la posición del portón mediante una señal **PWM (Pulse Width Modulation)** enviada desde la Raspberry Pi.

### 🔌 Conexión

El SG90 normalmente posee tres cables:

| Cable SG90          | Función   | Conexión                     |
| ------------------- | --------- | ---------------------------- |
| 🔴 Rojo             | VCC       | Alimentación                 |
| 🟤 Marrón/negro     | GND       | GND                          |
| 🟠 Naranja/amarillo | Señal PWM | GPIO 18                      |

Esquema:

```text
             SG90
       ┌──────────────┐
       │              │
       │ 🔴 VCC       ├──── Alimentación
       │              │
       │ 🟤 GND       ├──── GND
       │              │
       │ 🟠 SIGNAL    ├──── GPIO PWM
       │              │
       └──────────────┘
```

### ⚙️ Funcionamiento

La Raspberry Pi envía una señal PWM al cable de señal del SG90.

Dependiendo de la señal enviada, el servo se posiciona en diferentes ángulos.

Por ejemplo:

```text
0°   → Portón cerrado
90°  → Portón abierto
```

Los valores exactos deben ajustarse según el mecanismo físico utilizado.

### ⚠️ Alimentación del SG90

El SG90 puede producir picos de consumo, especialmente cuando comienza a moverse o encuentra resistencia.

Por este motivo, si el servo presenta movimientos inestables o la Raspberry Pi se reinicia, se recomienda utilizar una **fuente de alimentación adecuada para el servo**.

Si se utiliza una fuente externa para el SG90, es necesario establecer una **referencia GND común** con la Raspberry Pi para que la señal PWM tenga una referencia eléctrica correcta.

---

# 📷 Cámara

El sistema también puede incorporar una cámara compatible con Raspberry Pi.

La cámara se utiliza para funciones de **vigilancia y monitoreo**.

El funcionamiento general es:

```text
📷 Cámara
    │
    ▼
Raspberry Pi
    │
    ▼
Sistema Flask
    │
    ▼
Panel Web
```

La implementación concreta de captura o transmisión depende del modelo de cámara y del software utilizado.
Cabe aclarar que nosotros usamos una web cam que es conectada a la Raspberry pi mediante USB-C y recomendamos que usted tambien lo haga.

---

# 🧩 Esquema general del hardware

El sistema completo puede representarse de la siguiente manera:

```text
                         ┌──────────────────┐
                         │     USUARIO      │
                         │ PC / CELULAR     │
                         └────────┬─────────┘
                                  │
                                Wi-Fi
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   RASPBERRY PI   │
                         │                  │
                         │ Python + Flask   │
                         │ SQLite           │
                         │ GPIO Zero        │
                         └────────┬─────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
          💡 LED                 DHT11                 SG90
        Iluminación          Temperatura              Portón
                              Humedad
            │
            │
            │                     │
            ▼                     ▼
          GPIO                  GPIO


                         GPIO
                           │
                           ▼
                     ┌───────────┐
                     │ RELÉ 5 V  │
                     └─────┬─────┘
                           │
                    Interruptor
                           │
                           ▼
                     🔋 Batería 9 V
                           │
                           ▼
                      🚨 X-28 S22


                         📷
                       Cámara
                           │
                           ▼
                     Raspberry Pi
```

---

# 🗺️ Arquitectura del software

El sistema utiliza una arquitectura **cliente-servidor** con una API JSON.

### Flujo de funcionamiento

1. El usuario accede al sistema.
2. Flask muestra la pantalla de inicio de sesión.
3. El usuario introduce sus credenciales.
4. Flask verifica los datos.
5. Si son correctos, se crea una sesión.
6. El usuario accede al panel principal.
7. Selecciona Casa, Garage, Escuela u Oficina.
8. Selecciona el dispositivo que desea controlar.
9. JavaScript realiza una petición `fetch()` a la API.
10. Flask verifica la sesión.
11. Flask procesa la solicitud.
12. GPIO Zero controla el dispositivo correspondiente.
13. El servidor devuelve una respuesta JSON.
14. JavaScript actualiza la interfaz sin recargar la página.

---

# 🛠️ Tecnologías utilizadas

### Backend

* **Python 3**
* **Flask**
* **SQLite3**
* **Werkzeug Security**
* **GPIO Zero**

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript**
* **Fetch API**

### Hardware

* **Raspberry Pi**
* **X-28 S22**
* **DHT11**
* **SG90**
* **Módulo relé de 5 V**
* **LED**
* Cámara compatible con Raspberry Pi

---

# 🔌 Configuración de GPIO

El sistema utiliza la numeración **BCM** para los GPIO.

Los pines exactos deben coincidir con los definidos en `app.py`.

Una configuración de ejemplo es:

| Componente |          GPIO (BCM) | Función                 |
| ---------- | ------------------: | ----------------------- |
| 💡 LED     |           `GPIO 17` | Iluminación             |
| 🚪 SG90    |           `GPIO 18` | Control del portón      |
| 🚨 Relé    |           `GPIO 27` | Activación de la alarma |
| 🌡️ DHT11  |            `GPIO 4`  | Temperatura y humedad   |

> Recomendamos que verifique multiples veces si conecto de manera correcta todas las conexiones anteriormente mencionadas.

---

# 🚀 Instalación

## 1. Instalar dependencias

En la Raspberry Pi:

```bash
sudo apt update
sudo apt install python3-pip python3-rpi.gpio
pip install flask gpiozero
```

---

## 2. Ejecutar el servidor

Desde la carpeta principal del proyecto:

```bash
python3 app.py
```

El servidor Flask se ejecutará en el puerto `5000`.

---

## 3. Acceder desde otro dispositivo

Si la Raspberry Pi y el dispositivo utilizado están conectados a la misma red Wi-Fi, acceder desde un navegador mediante:

```text
http://IP_DE_LA_RASPBERRY_PI:5000
```

Para conocer la dirección IP:

```bash
hostname -I
```

Por ejemplo:

```text
http://192.168.1.50:5000
```

---

# 🔒 Seguridad

El sistema implementa mecanismos básicos de seguridad.

### Autenticación

El acceso al panel requiere iniciar sesión.

### Sesiones

Las rutas encargadas del control físico verifican que el usuario tenga una sesión válida.

Si el usuario no está autenticado, la solicitud es rechazada.

### Contraseñas

Las contraseñas se almacenan mediante **hashing seguro utilizando `werkzeug.security`**.

---

# 🎯 Objetivo del proyecto

El objetivo del proyecto es desarrollar un sistema de **domótica y control centralizado** utilizando una Raspberry Pi como servidor y controlador físico.

El proyecto integra:

* 🌐 Desarrollo web
* 🐍 Python
* 🔌 Electrónica
* 📡 Comunicación mediante red
* 🗄️ Bases de datos
* 🔐 Autenticación
* 🌡️ Sensores
* 🚨 Sistemas de seguridad
* 🚪 Automatización
* 📷 Videovigilancia

Todo dentro de un único sistema accesible desde un navegador web.

---

# 📌 Estado del proyecto

🚧 **En desarrollo**

El sistema se encuentra en desarrollo y se continúa trabajando en la integración del hardware, la interfaz web y el control independiente de Casa, Garage, Escuela y Oficina.
