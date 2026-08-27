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

    const controller =
        new AbortController();

    const timeoutId =
        setTimeout(
            () => controller.abort(),
            2000
        );


    try {

        const response =
            await fetch(
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


        conexionCorrecta();

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


        conexionError();


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
            "🚨 Alarma de oficina activada"
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
            "🔕 Alarma de oficina desactivada"
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
   PUERTA DE OFICINA
   MISMO SERVO DEL GARAGE
   GPIO 18
========================================== */

function toggleDoor() {

    fetch("/porton/toggle")
        .then(response => response.json())
        .then(data => {

            if (data.estado === "abierto") {

                document.getElementById(
                    "officeStatus"
                ).textContent =
                    "Desbloqueada";


                document.getElementById(
                    "officeSubstatus"
                ).textContent =
                    "La puerta está abierta";


                document.getElementById(
                    "officeButton"
                ).textContent =
                    "BLOQUEAR PUERTA";


                document.getElementById(
                    "officeIcon"
                ).textContent =
                    "🚪";


                addHistory(
                    "🚪 Puerta de oficina desbloqueada"
                );

            }


            else if (data.estado === "cerrado") {

                document.getElementById(
                    "officeStatus"
                ).textContent =
                    "Bloqueada";


                document.getElementById(
                    "officeSubstatus"
                ).textContent =
                    "La puerta está asegurada";


                document.getElementById(
                    "officeButton"
                ).textContent =
                    "DESBLOQUEAR PUERTA";


                document.getElementById(
                    "officeIcon"
                ).textContent =
                    "🚪";


                addHistory(
                    "🔒 Puerta de oficina bloqueada"
                );

            }


            else {

                alert(
                    "Error: " +
                    data.mensaje
                );

            }

        })
        .catch(error => {

            console.error(error);


            alert(
                "No se pudo conectar con la Raspberry Pi."
            );

        });
}


/* ==========================================
   ILUMINACIÓN
========================================== */

async function toggleLight() {

    const targetState =
        !lightOn;


    const endpoint =
        targetState
            ? "led/on"
            : "led/off";


    const success =
        await sendCommand(endpoint);


    if (!success) return;


    lightOn =
        targetState;


    const button =
        document.getElementById(
            "lightButton"
        );


    const estado =
        document.getElementById(
            "lightVal"
        );


    if (lightOn) {

        if (button) {

            button.classList.add(
                "active"
            );

            button.textContent =
                "💡 Luces encendidas";

        }


        if (estado) {

            estado.textContent =
                "Encendida";

        }


        addHistory(
            "💡 Iluminación de oficina encendida"
        );


    } else {

        if (button) {

            button.classList.remove(
                "active"
            );

            button.textContent =
                "💡 Luces";

        }


        if (estado) {

            estado.textContent =
                "Apagada";

        }


        addHistory(
            "🌑 Iluminación de oficina apagada"
        );

    }


    updateTime();
}


/* ==========================================
   CLIMA
========================================== */

async function toggleAC() {

    addHistory(
        "⚠️ Climatización todavía no conectada al hardware"
    );


    alert(
        "La climatización todavía no está conectada a la Raspberry Pi."
    );
}


/* ==========================================
   ACTUALIZAR HORA
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