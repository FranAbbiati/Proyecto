/* =========================================================
   COLEGIO - JAVASCRIPT
========================================================= */


/* =========================================================
   HORA
========================================================= */

function obtenerHora() {

    return new Date().toLocaleTimeString(
        "es-AR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



/* =========================================================
   HISTORIAL
========================================================= */

function agregarHistorial(texto) {

    const historial =
        document.getElementById("history");

    if (!historial) {
        return;
    }


    const evento =
        document.createElement("div");

    evento.className =
        "history-event";


    const mensaje =
        document.createElement("span");

    mensaje.textContent =
        texto;


    const hora =
        document.createElement("span");

    hora.textContent =
        obtenerHora();


    evento.appendChild(mensaje);

    evento.appendChild(hora);


    historial.prepend(evento);


    const eventos =
        historial.querySelectorAll(
            ".history-event"
        );


    if (eventos.length > 8) {

        eventos[eventos.length - 1].remove();

    }

}



/* =========================================================
   CAMBIAR DISPOSITIVO
========================================================= */

async function toggleDispositivo(boton) {

    if (!boton) {
        return;
    }


    const id =
        boton.getAttribute("data-id");


    const tipo =
        boton.getAttribute("data-tipo");


    if (!id || !tipo) {

        console.error(
            "Falta el ID o tipo del dispositivo."
        );

        return;

    }


    boton.disabled = true;


    try {

        const respuesta =
            await fetch(
                "/dispositivo/" + id + "/toggle",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                data.error ||
                data.mensaje ||
                "No se pudo cambiar el dispositivo."
            );

            return;

        }


        actualizarDispositivo(
            id,
            tipo,
            data.estado
        );


        if (tipo === "iluminacion") {

            if (data.estado === "encendido") {

                agregarHistorial(
                    "💡 Iluminación encendida"
                );

            } else {

                agregarHistorial(
                    "🌑 Iluminación apagada"
                );

            }

        }


        if (tipo === "alarma") {

            if (data.estado === "encendido") {

                agregarHistorial(
                    "🚨 Alarma activada"
                );

            } else {

                agregarHistorial(
                    "🔕 Alarma desactivada"
                );

            }

        }


        actualizarHardware();

    }

    catch (error) {

        console.error(
            "Error:",
            error
        );


        alert(
            "No se pudo comunicar con la Raspberry Pi."
        );

    }

    finally {

        boton.disabled = false;

    }

}



/* =========================================================
   ACTUALIZAR VISUALMENTE UN DISPOSITIVO
========================================================= */

function actualizarDispositivo(
    id,
    tipo,
    estado
) {

    const boton =
        document.querySelector(
            '.device-button[data-id="' +
            id +
            '"]'
        );


    const estadoElemento =
        document.getElementById(
            "estado-" + id
        );


    const nombre =
        document.getElementById(
            "nombre-" + id
        );


    if (!boton) {
        return;
    }


    if (estado === "encendido") {

        boton.classList.add("active");


        if (estadoElemento) {

            estadoElemento.classList.add(
                "on"
            );

        }


        if (tipo === "iluminacion") {

            if (nombre) {

                nombre.textContent =
                    "Luz encendida";

            }


            if (estadoElemento) {

                estadoElemento.textContent =
                    "🟢 ENCENDIDA";

            }

        }


        if (tipo === "alarma") {

            if (nombre) {

                nombre.textContent =
                    "Alarma activa";

            }


            if (estadoElemento) {

                estadoElemento.textContent =
                    "🔴 ACTIVA";

            }

        }

    }

    else {

        boton.classList.remove("active");


        if (estadoElemento) {

            estadoElemento.classList.remove(
                "on"
            );

        }


        if (tipo === "iluminacion") {

            if (nombre) {

                nombre.textContent =
                    "Luz apagada";

            }


            if (estadoElemento) {

                estadoElemento.textContent =
                    "⚫ APAGADA";

            }

        }


        if (tipo === "alarma") {

            if (nombre) {

                nombre.textContent =
                    "Alarma";

            }


            if (estadoElemento) {

                estadoElemento.textContent =
                    "⚫ APAGADA";

            }

        }

    }

}



/* =========================================================
   ACTUALIZAR HARDWARE FÍSICO
========================================================= */

async function actualizarHardware() {

    try {

        const respuesta =
            await fetch(
                "/estado-hardware"
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo consultar el hardware."
            );

        }


        const data =
            await respuesta.json();


        const luz =
            document.getElementById(
                "hardwareLuz"
            );


        const alarma =
            document.getElementById(
                "hardwareAlarma"
            );


        if (luz) {

            if (data.iluminacion) {

                luz.textContent =
                    "🟢 ENCENDIDA";

            } else {

                luz.textContent =
                    "⚫ APAGADA";

            }

        }


        if (alarma) {

            if (data.alarma) {

                alarma.textContent =
                    "🔴 ACTIVA";

            } else {

                alarma.textContent =
                    "⚫ APAGADA";

            }

        }

    }

    catch (error) {

        console.error(
            "Error hardware:",
            error
        );


        const luz =
            document.getElementById(
                "hardwareLuz"
            );


        const alarma =
            document.getElementById(
                "hardwareAlarma"
            );


        if (luz) {

            luz.textContent =
                "⚠️ Sin conexión";

        }


        if (alarma) {

            alarma.textContent =
                "⚠️ Sin conexión";

        }

    }

}



/* =========================================================
   ACTUALIZAR TEMPERATURA Y HUMEDAD
========================================================= */

async function actualizarSensores() {

    try {

        const respuesta =
            await fetch(
                "/sensor"
            );


        if (!respuesta.ok) {

            throw new Error(
                "Error leyendo sensor."
            );

        }


        const data =
            await respuesta.json();


        if (data.error) {

            throw new Error(
                data.error
            );

        }


        const temperaturas =
            document.querySelectorAll(
                "[id^='temperatura-']"
            );


        temperaturas.forEach(
            function(elemento) {

                elemento.textContent =
                    data.temperatura +
                    " °C";

            }
        );


        const humedades =
            document.querySelectorAll(
                "[id^='humedad-']"
            );


        humedades.forEach(
            function(elemento) {

                elemento.textContent =
                    data.humedad +
                    " %";

            }
        );

    }

    catch (error) {

        console.error(
            "Error sensor:",
            error
        );

    }

}



/* =========================================================
   COMPROBAR CONEXIÓN
========================================================= */

async function comprobarConexion() {

    const punto =
        document.getElementById(
            "connectionDot"
        );


    const texto =
        document.getElementById(
            "connectionText"
        );


    try {

        const respuesta =
            await fetch(
                "/sensor"
            );


        if (!respuesta.ok) {

            throw new Error();

        }


        if (punto) {

            punto.style.background =
                "#22c55e";

            punto.style.boxShadow =
                "0 0 10px #22c55e";

        }


        if (texto) {

            texto.textContent =
                "Sistema conectado";

        }

    }

    catch (error) {

        if (punto) {

            punto.style.background =
                "#ef4444";

            punto.style.boxShadow =
                "0 0 10px #ef4444";

        }


        if (texto) {

            texto.textContent =
                "Desconectado";

        }

    }

}



/* =========================================================
   ACTUALIZAR TODO
========================================================= */

function actualizarTodo() {

    actualizarSensores();

    actualizarHardware();

    comprobarConexion();

    agregarHistorial(
        "🔄 Sistema actualizado"
    );

}



/* =========================================================
   INICIO
========================================================= */

window.addEventListener(
    "load",
    function() {

        actualizarSensores();

        actualizarHardware();

        comprobarConexion();

    }
);



/* =========================================================
   ACTUALIZACIÓN AUTOMÁTICA
========================================================= */

setInterval(
    actualizarSensores,
    5000
);


setInterval(
    actualizarHardware,
    3000
);


setInterval(
    comprobarConexion,
    10000
);