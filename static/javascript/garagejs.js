const RASPBERRY_IP = window.location.origin;

let alarmOn = false;
let lightOn = false;

/* ==========================================
   HORA
========================================== */

function getTime() {

    return new Date().toLocaleTimeString(
        "es-AR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ==========================================
   HISTORIAL
========================================== */

function addHistory(text) {

    const history =
        document.getElementById("history");

    if (!history) return;


    const event =
        document.createElement("div");

    event.className = "event";


    event.innerHTML = `
        <span>${text}</span>
        <span class="event-time">
            ${getTime()}
        </span>
    `;


    history.prepend(event);
}


/* ==========================================
   CONEXIÓN
========================================== */

function conexionCorrecta() {

    const dot =
        document.getElementById(
            "connectionDot"
        );

    const text =
        document.getElementById(
            "connectionText"
        );


    if (dot) {

        dot.style.background =
            "#22c55e";

        dot.style.boxShadow =
            "0 0 10px #22c55e";

    }


    if (text) {

        text.textContent =
            "Dispositivo conectado";

    }
}


function conexionError() {

    const dot =
        document.getElementById(
            "connectionDot"
        );

    const text =
        document.getElementById(
            "connectionText"
        );


    if (dot) {

        dot.style.background =
            "#ef4444";

        dot.style.boxShadow =
            "0 0 10px #ef4444";

    }


    if (text) {

        text.textContent =
            "Desconectado";

    }
}


/* ==========================================
   COMUNICACIÓN CON FLASK
========================================== */

async function sendCommand(endpoint) {

    const controller = new AbortController();

    const timeoutId = setTimeout(
        () => controller.abort(),
        2000
    );

    try {

        const response = await fetch(
            `${RASPBERRY_IP}/${endpoint}`,
            {
                method: "GET",
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        return true;

    } catch (error) {

        clearTimeout(timeoutId);

        console.error(
            "Error enviando comando:",
            error
        );

        alert(
            "⚠️ No se pudo establecer comunicación con la Raspberry Pi."
        );

        addHistory(
            "❌ Error de comunicación con Raspberry"
        );

        const dot =
            document.getElementById("connectionDot");

        const text =
            document.getElementById("connectionText");

        if (dot) {

            dot.style.background = "#ef4444";

            dot.style.boxShadow =
                "0 0 10px #ef4444";

        }

        if (text) {

            text.textContent =
                "Desconectado";

        }

        return false;
    }
}


/* ==========================================
   ALARMA
========================================== */

async function toggleAlarm() {

    const targetState =
        !alarmOn;


    const endpoint =
        targetState
            ? "alarma/on"
            : "alarma/off";


    const success =
        await sendCommand(endpoint);


    if (!success) return;


    alarmOn =
        targetState;


    const button =
        document.getElementById(
            "alarmButton"
        );


    if (alarmOn) {

        if (button) {

            button.classList.add(
                "active"
            );

            button.textContent =
                "🚨 Alarma activa";

        }


        addHistory(
            "🚨 Alarma del garage activada"
        );


    } else {

        if (button) {

            button.classList.remove(
                "active"
            );

            button.textContent =
                "🔔 Alarma";

        }


        addHistory(
            "🔕 Alarma del garage desactivada"
        );

    }


    updateTime();
}


/* ==========================================
   SENSOR DHT11
========================================== */

async function refreshStatus() {

    try {

        const response =
            await fetch("/sensor");


        if (!response.ok) {

            throw new Error(
                "No se pudo leer el sensor"
            );

        }


        const data =
            await response.json();


        if (data.error) {

            throw new Error(
                data.error
            );

        }


        const temperatura =
            document.getElementById(
                "tempVal"
            );


        const humedad =
            document.getElementById(
                "humidityVal"
            );


        if (temperatura) {

            temperatura.textContent =
                data.temperatura + " °C";

        }


        if (humedad) {

            humedad.textContent =
                data.humedad + "%";

        }


        conexionCorrecta();


        addHistory(
            "🌡️ DHT11 actualizado"
        );


        updateTime();


    } catch (error) {

        conexionError();

        addHistory(
            "❌ Error al leer DHT11"
        );

    }
}


/* ==========================================
   PORTÓN
========================================== */

function toggleGarage() {

    fetch("/porton/toggle")
        .then(response => response.json())
        .then(data => {

            if (data.estado === "abierto") {

                document.getElementById("garageStatus").textContent = "Abierto";

                document.getElementById("garageSubstatus").textContent =
                    "El portón está abierto";

                document.getElementById("garageButton").textContent =
                    "CERRAR PORTÓN";

                document.getElementById("garageIcon").textContent = "🚪";

                addHistory("🚪 Portón abierto");

            }

            else if (data.estado === "cerrado") {

                document.getElementById("garageStatus").textContent = "Cerrado";

                document.getElementById("garageSubstatus").textContent =
                    "El portón está asegurado";

                document.getElementById("garageButton").textContent =
                    "ABRIR PORTÓN";

                document.getElementById("garageIcon").textContent = "🚪";

                addHistory("🚪 Portón cerrado");

            }

            else {

                alert("Error: " + data.mensaje);

            }

        })
        .catch(error => {

            console.error(error);

            alert(
                "No se pudo conectar con la Raspberry Pi."
            );

        });
}


function lockGarage() {

    addHistory(
        "⚠️ Portón todavía no conectado al hardware"
    );

    alert(
        "El portón todavía no está conectado a la Raspberry Pi."
    );
}


/* ==========================================
   ILUMINACIÓN
========================================== */

async function toggleLight() {

    const targetState = !lightOn;

    const endpoint = targetState
        ? "led/on"
        : "led/off";

    const success = await sendCommand(endpoint);

    if (!success) return;

    lightOn = targetState;

    const button = document.getElementById("lightButton");

    if (lightOn) {

        button.classList.add("active");

        button.textContent = "💡 Luz encendida";

        addHistory("💡 Iluminación del garage encendida");

    } else {

        button.classList.remove("active");

        button.textContent = "💡 Luz";

        addHistory("🌑 Iluminación del garage apagada");

    }

    updateTime();
}


/* ==========================================
   ACTUALIZAR
========================================== */

function updateTime() {

    const element =
        document.getElementById(
            "lastUpdate"
        );


    if (element) {

        element.textContent =
            getTime();

    }
}


/* ==========================================
   INICIO
========================================== */

window.addEventListener(
    "load",
    refreshStatus
);