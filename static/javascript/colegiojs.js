let gateOpen = false;
let lightOn = false;
let alarmOn = false;


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
        document.getElementById("connectionDot");

    const text =
        document.getElementById("connectionText");


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
        document.getElementById("connectionDot");

    const text =
        document.getElementById("connectionText");


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

    try {

        const response =
            await fetch(`/${endpoint}`);


        if (!response.ok) {

            throw new Error(
                "Respuesta incorrecta"
            );

        }


        conexionCorrecta();

        return true;


    } catch (error) {

        conexionError();

        addHistory(
            "❌ Error de conexión con Raspberry"
        );

        alert(
            "⚠️ No se pudo comunicar con la Raspberry Pi."
        );

        return false;
    }
}


/* ==========================================
   TIMBRE
========================================== */

function triggerBell() {

    addHistory(
        "⚠️ Timbre todavía no conectado al hardware"
    );

    alert(
        "El timbre todavía no está conectado a la Raspberry Pi."
    );
}


/* ==========================================
   PORTÓN
========================================== */

function toggleGate() {

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

function toggleLight() {

    addHistory(
        "⚠️ Iluminación todavía no conectada al hardware"
    );

    alert(
        "La iluminación todavía no está conectada a la Raspberry Pi."
    );
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
            "🚨 Alarma del colegio activada"
        );


    } else {

        if (button) {

            button.classList.remove(
                "active"
            );

            button.textContent =
                "🚨 Alarma";

        }

        addHistory(
            "🔕 Alarma del colegio desactivada"
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
                data.humedad + " %";

        }


        conexionCorrecta();


        addHistory(
            "🌡️ Temperatura y humedad actualizadas"
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
   HORA
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