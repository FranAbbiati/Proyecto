# 🚗 Garage Control - Sistema de Domótica con Raspberry Pi y Flask

Este proyecto consiste en un panel de control remoto web desarrollado para gestionar un sistema de garage automatizado mediante una **Raspberry Pi**. Permite controlar de manera segura un portón, la iluminación y un sistema de alarma a través de una interfaz interactiva con autenticación de usuarios.

---

## 🛠️ Tecnologías Utilizadas

*   **Backend:** Python 3 con [Flask](https://palletsprojects.com) (Framework web ágil).
*   **Control de Hardware:** [GPIO Zero](https://readthedocs.io) (Librería moderna de Python para el control de pines GPIO).
*   **Base de Datos:** SQLite3 con encriptación de contraseñas mediante `werkzeug.security`.
*   **Frontend:** HTML5, CSS3 clásico y JavaScript Asincrónico (Fetch API).

---

## 🗺️ Arquitectura del Proyecto

El sistema está diseñado bajo una arquitectura cliente-servidor desacoplada mediante una **API JSON**:
1. El **Usuario** interactúa con los botones de la interfaz web.
2. **JavaScript (Frontend)** intercepta los clics y realiza peticiones asincrónicas (`fetch`) en segundo plano hacia rutas específicas de la API de Flask (`/api/...`).
3. **Flask (Backend)** valida la sesión activa del usuario, procesa la orden física con `gpiozero` conmutando el pin correspondiente, y retorna una respuesta de éxito en formato JSON.
4. **JavaScript** recibe la respuesta JSON y modifica el DOM (la interfaz visual) en tiempo real **sin necesidad de recargar la página**.

---

## 🔌 Esquema y Configuración de Pines (GPIO)

El control de los periféricos físicos se realiza utilizando la numeración **BCM** de la Raspberry Pi. Por defecto, están asignados de la siguiente manera en `app.py`:

| Componente | Pin GPIO (BCM) | Tipo de Dispositivo | Descripción Física |
| :--- | :---: | :---: | :--- |
| **💡 Luz** | `GPIO 17` | `LED` | Módulo LED o Relé acoplado a lámparas de 220V |
| **🚪 Portón** | `GPIO 22` | `OutputDevice` | Servomotor o Relé de pulso para el motor del portón |
| **🔔 Alarma** | `GPIO 27` | `OutputDevice` | Buzzer piezoeléctrico de 5V o sirena cableada |
> **Nota:** Recordá enlazar tus archivos estáticos en los HTML usando la sintaxis de Flask:
> `<script src="{{ url_for('static', filename='garagejs.js') }}"></script>`

---

## 🚀 Instalación y Despliegue

### 1. Requisitos Previos en Raspberry Pi
Asegurate de tener instalado Python 3, pip y las dependencias de hardware. Ejecutá en la terminal de la Pi:
```bash
sudo apt update
sudo apt install python3-pip python3-rpi.gpio
pip install flask gpiozero
```

### 2. Ejecución del Servidor
Ubicate en la carpeta raíz del proyecto y arrancá el script de Python:
```bash
python3 app.py
```

### 3. Acceso desde otros Dispositivos
El servidor está configurado para escuchar en la dirección `0.0.0.0` en el **puerto 5000**. Esto significa que podés controlar tu garage desde tu celular u otra computadora conectada a la misma red Wi-Fi ingresando al navegador web y escribiendo:
```text
http://[IP_DE_TU_RASPBERRY_PI]:5000
```
*(Podés averiguar la IP de tu placa ejecutando `hostname -I` en la terminal de la Raspberry Pi)*.

---

## 🔒 Seguridad e Interfaces
*   **Control de Accesos:** Todas las rutas críticas de la API físicas verifican la existencia de un `usuario_id` en la cookie de sesión (`session`). Si un usuario no está logueado, las peticiones físicas son rechazadas (`401 Unauthorized`).
*   **Seguridad de Claves:** Las contraseñas se almacenan en la base de datos aplicando algoritmos de *hashing* seguro, por lo que nunca se guardan en texto plano.
