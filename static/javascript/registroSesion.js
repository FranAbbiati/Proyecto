const formulario = document.getElementById("formRegistro");

const contraseña = document.getElementById("contrasena");

const confirmar = document.getElementById("confirmar_contrasena");

const mensaje = document.getElementById("errorContrasena");


function comprobarContraseñas() {

    // Si todavía no escribió nada en el segundo campo,
    // no mostramos ningún error.
    if (confirmar.value === "") {

        contraseña.classList.remove("campo-error");

        confirmar.classList.remove("campo-error");

        mensaje.classList.remove("mostrar-error");

        return true;
    }


    // Comprobar si las contraseñas son diferentes

    if (contraseña.value !== confirmar.value) {

        contraseña.classList.add("campo-error");

        confirmar.classList.add("campo-error");

        mensaje.classList.add("mostrar-error");

        return false;
    }


    // Las contraseñas coinciden

    contraseña.classList.remove("campo-error");

    confirmar.classList.remove("campo-error");

    mensaje.classList.remove("mostrar-error");

    return true;
}


// ==========================================
// COMPROBAR MIENTRAS ESCRIBE
// ==========================================

contraseña.addEventListener(
    "input",
    comprobarContraseñas
);


confirmar.addEventListener(
    "input",
    comprobarContraseñas
);


// ==========================================
// COMPROBAR AL ENVIAR
// ==========================================

formulario.addEventListener(
    "submit",
    function(event) {

        if (!comprobarContraseñas()) {

            event.preventDefault();

        }

    }
);