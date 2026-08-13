from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)

# ==========================================
# CONFIGURACIÓN
# ==========================================

app.secret_key = "clave-secreta-del-proyecto"


# ==========================================
# BASE DE DATOS
# ==========================================

def conectar_db():

    conexion = sqlite3.connect("usuarios.db")

    conexion.row_factory = sqlite3.Row

    return conexion


def crear_base_datos():

    conexion = conectar_db()

    conexion.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL,
            contraseña TEXT NOT NULL
        )
    """)

    conexion.commit()

    conexion.close()


# ==========================================
# INICIO DE SESIÓN
# ==========================================

@app.route("/")
def iniciar_sesion():

    return render_template("registrohtml.html")


# ==========================================
# CREAR CUENTA
# ==========================================

@app.route("/registro", methods=["GET", "POST"])
def registro():

    # ==========================================
    # MOSTRAR FORMULARIO
    # ==========================================

    if request.method == "GET":

        return render_template(
            "registroSesionhtml.html"
        )


    # ==========================================
    # OBTENER DATOS
    # ==========================================

    usuario = request.form.get("usuario", "").strip()

    contraseña = request.form.get("contrasena", "")

    confirmar = request.form.get(
        "confirmar_contrasena",
        ""
    )


    # ==========================================
    # COMPROBAR USUARIO VACÍO
    # ==========================================

    if usuario == "":

        return render_template(
            "registroSesionhtml.html",
            error="El nombre de usuario no puede estar vacío.",
            error_campo="usuario",
            usuario=usuario
        )


    # ==========================================
    # COMPROBAR CONTRASEÑAS
    # ==========================================

    if contraseña != confirmar:

        return render_template(
            "registroSesionhtml.html",
            error="Las contraseñas no coinciden.",
            error_campo="contrasenas",
            usuario=usuario
        )


    # ==========================================
    # CONECTAR CON BASE DE DATOS
    # ==========================================

    conexion = conectar_db()


    # ==========================================
    # COMPROBAR SI EL USUARIO EXISTE
    # ==========================================

    usuario_existente = conexion.execute(
        """
        SELECT *
        FROM usuarios
        WHERE nombre = ?
        """,
        (usuario,)
    ).fetchone()


    if usuario_existente:

        conexion.close()

        return render_template(
            "registroSesionhtml.html",
            error="Ese nombre de usuario ya está en uso.",
            error_campo="usuario",
            usuario=usuario
        )


    # ==========================================
    # ENCRIPTAR CONTRASEÑA
    # ==========================================

    contraseña_hash = generate_password_hash(
        contraseña
    )


    # ==========================================
    # GUARDAR USUARIO
    # ==========================================

    conexion.execute(
        """
        INSERT INTO usuarios (nombre, contraseña)
        VALUES (?, ?)
        """,
        (
            usuario,
            contraseña_hash
        )
    )

    conexion.commit()

    conexion.close()


    # ==========================================
    # REGISTRO CORRECTO
    # ==========================================

    return redirect(
        url_for("iniciar_sesion")
    )


# ==========================================
# PROCESAR LOGIN
# ==========================================

@app.route("/login", methods=["POST"])
def login():

    usuario = request.form.get(
        "usuario",
        ""
    ).strip()

    contraseña = request.form.get(
        "contrasena",
        ""
    )


    # ==========================================
    # BUSCAR USUARIO
    # ==========================================

    conexion = conectar_db()

    datos_usuario = conexion.execute(
        """
        SELECT *
        FROM usuarios
        WHERE nombre = ?
        """,
        (usuario,)
    ).fetchone()

    conexion.close()


    # ==========================================
    # USUARIO NO EXISTE
    # ==========================================

    if datos_usuario is None:

        return render_template(
            "registrohtml.html",
            error="El usuario no existe.",
            error_campo="usuario",
            usuario=usuario
        )


    # ==========================================
    # CONTRASEÑA INCORRECTA
    # ==========================================

    if not check_password_hash(
        datos_usuario["contraseña"],
        contraseña
    ):

        return render_template(
            "registrohtml.html",
            error="La contraseña es incorrecta.",
            error_campo="contrasena",
            usuario=usuario
        )


    # ==========================================
    # LOGIN CORRECTO
    # ==========================================

    session["usuario_id"] = datos_usuario["id"]

    session["usuario"] = datos_usuario["nombre"]


    # ==========================================
    # IR AL CENTRO DE AUTOMATIZACIÓN
    # ==========================================

    return redirect(
        url_for("index")
    )


# ==========================================
# CENTRO DE AUTOMATIZACIÓN
# ==========================================

@app.route("/index")
def index():

    # ==========================================
    # COMPROBAR SESIÓN
    # ==========================================

    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )


    # ==========================================
    # MOSTRAR PÁGINA
    # ==========================================

    return render_template(
        "index.html",
        usuario=session["usuario"]
    )


# ==========================================
# CERRAR SESIÓN
# ==========================================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(
        url_for("iniciar_sesion")
    )


# ==========================================
# INICIAR APLICACIÓN
# ==========================================

if __name__ == "__main__":

    crear_base_datos()

    app.run(
        debug=True
    )