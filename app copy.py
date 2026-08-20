from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from gpiozero import LED, Buzzer, DHT11

app = Flask(__name__)
# ==========================================
# HARDWARE RASPBERRY PI
# ==========================================

led = LED(17)
alarma = Buzzer(27)
sensor = DHT11(4)
# ==========================================
# CONFIGURACIÓN
# ==========================================

app.secret_key = "clave-secreta-del-proyecto"

# ==========================================
# PROTECCIÓN DE LOGIN
# ==========================================

def login_requerido(func):

    @wraps(func)
    def decorador(*args, **kwargs):

        if "usuario_id" not in session:

            return redirect(
                url_for("iniciar_sesion")
            )

        return func(*args, **kwargs)

    return decorador
# ==========================================
# BASE DE DATOS
# ==========================================

def conectar_db():

    conexion = sqlite3.connect("usuarios.db")

    conexion.row_factory = sqlite3.Row

    return conexion


def crear_base_datos():

    conexion = conectar_db()

    # ==========================================
    # USUARIOS
    # ==========================================

    conexion.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL,
            contraseña TEXT NOT NULL
        )
    """)

    # ==========================================
    # ENTORNOS
    # ==========================================

    conexion.execute("""
        CREATE TABLE IF NOT EXISTS entornos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            tipo TEXT NOT NULL,

            FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id)
        )
    """)

    # ==========================================
    # ESPACIOS
    # ==========================================

    conexion.execute("""
        CREATE TABLE IF NOT EXISTS espacios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entorno_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            tipo TEXT NOT NULL,

            FOREIGN KEY (entorno_id)
            REFERENCES entornos(id)
        )
    """)

    # ==========================================
    # DISPOSITIVOS
    # ==========================================

    conexion.execute("""
        CREATE TABLE IF NOT EXISTS dispositivos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            espacio_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            estado TEXT NOT NULL DEFAULT 'apagado',

            FOREIGN KEY (espacio_id)
            REFERENCES espacios(id)
        )
    """)

    conexion.commit()

    conexion.close()


# ==========================================
# FUNCIONES DE ENTORNOS
# ==========================================

def crear_entorno_db(usuario_id, nombre, tipo):

    conexion = conectar_db()

    cursor = conexion.execute(
        """
        INSERT INTO entornos (
            usuario_id,
            nombre,
            tipo
        )
        VALUES (?, ?, ?)
        """,
        (
            usuario_id,
            nombre,
            tipo
        )
    )

    entorno_id = cursor.lastrowid

    conexion.commit()

    conexion.close()

    return entorno_id


# ==========================================
# OBTENER ENTORNO DE UN USUARIO
# ==========================================

def obtener_entorno(usuario_id, tipo):

    conexion = conectar_db()

    entorno = conexion.execute(
        """
        SELECT *
        FROM entornos
        WHERE usuario_id = ?
        AND tipo = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (
            usuario_id,
            tipo
        )
    ).fetchone()

    conexion.close()

    return entorno


# ==========================================
# CREAR ESPACIO
# ==========================================

def crear_espacio_db(entorno_id, nombre, tipo):

    conexion = conectar_db()

    cursor = conexion.execute(
        """
        INSERT INTO espacios (
            entorno_id,
            nombre,
            tipo
        )
        VALUES (?, ?, ?)
        """,
        (
            entorno_id,
            nombre,
            tipo
        )
    )

    espacio_id = cursor.lastrowid

    conexion.commit()

    conexion.close()

    return espacio_id


# ==========================================
# CREAR DISPOSITIVO
# ==========================================

def crear_dispositivo_db(
    espacio_id,
    tipo,
    estado="apagado"
):

    conexion = conectar_db()

    conexion.execute(
        """
        INSERT INTO dispositivos (
            espacio_id,
            tipo,
            estado
        )
        VALUES (?, ?, ?)
        """,
        (
            espacio_id,
            tipo,
            estado
        )
    )

    conexion.commit()

    conexion.close()


# ==========================================
# OBTENER ESPACIOS DE UN ENTORNO
# ==========================================

def obtener_espacios(entorno_id):

    conexion = conectar_db()

    espacios = conexion.execute(
        """
        SELECT *
        FROM espacios
        WHERE entorno_id = ?
        ORDER BY id
        """,
        (entorno_id,)
    ).fetchall()

    conexion.close()

    return espacios


# ==========================================
# OBTENER DISPOSITIVOS DE UN ESPACIO
# ==========================================

def obtener_dispositivos(espacio_id):

    conexion = conectar_db()

    dispositivos = conexion.execute(
        """
        SELECT *
        FROM dispositivos
        WHERE espacio_id = ?
        ORDER BY id
        """,
        (espacio_id,)
    ).fetchall()

    conexion.close()

    return dispositivos

# ==========================================
# OBTENER ESPACIO GENERAL DE UN ENTORNO
# ==========================================

def obtener_espacio_general(entorno_id):

    conexion = conectar_db()

    espacio = conexion.execute(
        """
        SELECT *
        FROM espacios
        WHERE entorno_id = ?
        AND tipo = 'general'
        LIMIT 1
        """,
        (entorno_id,)
    ).fetchone()

    conexion.close()

    return espacio
# ==========================================
# INICIO DE SESIÓN
# ==========================================

@app.route("/")
def iniciar_sesion():

    return render_template(
        "registrohtml.html"
    )


# ==========================================
# CREAR CUENTA
# ==========================================

@app.route("/registro", methods=["GET", "POST"])
def registro():

    if request.method == "POST":

        usuario = request.form["usuario"]

        contraseña = request.form["contrasena"]

        confirmar = request.form[
            "confirmar_contrasena"
        ]

        # --------------------------------------
        # COMPROBAR CONTRASEÑAS
        # --------------------------------------

        if contraseña != confirmar:

            return "Las contraseñas no coinciden."

        # --------------------------------------
        # CONECTAR BASE DE DATOS
        # --------------------------------------

        conexion = conectar_db()

        # --------------------------------------
        # COMPROBAR USUARIO EXISTENTE
        # --------------------------------------

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

            return "Ese nombre de usuario ya existe."

        # --------------------------------------
        # ENCRIPTAR CONTRASEÑA
        # --------------------------------------

        contraseña_hash = generate_password_hash(
            contraseña
        )

        # --------------------------------------
        # GUARDAR USUARIO
        # --------------------------------------

        conexion.execute(
            """
            INSERT INTO usuarios (
                nombre,
                contraseña
            )
            VALUES (?, ?)
            """,
            (
                usuario,
                contraseña_hash
            )
        )

        conexion.commit()

        conexion.close()

        # --------------------------------------
        # VOLVER AL LOGIN
        # --------------------------------------

        return redirect(
            url_for("iniciar_sesion")
        )

    return render_template(
        "registroSesionhtml.html"
    )


# ==========================================
# PROCESAR LOGIN
# ==========================================

@app.route("/login", methods=["POST"])
def login():

    usuario = request.form["usuario"]

    contraseña = request.form["contrasena"]

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

    # --------------------------------------
    # USUARIO INEXISTENTE
    # --------------------------------------

    if datos_usuario is None:

        return render_template(
            "registrohtml.html",
            error="El usuario no existe.",
            error_campo="usuario",
            usuario=usuario
        )

    # --------------------------------------
    # CONTRASEÑA INCORRECTA
    # --------------------------------------

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

    # --------------------------------------
    # GUARDAR SESIÓN
    # --------------------------------------

    session["usuario_id"] = datos_usuario["id"]

    session["usuario"] = datos_usuario["nombre"]

    # --------------------------------------
    # IR AL CENTRO
    # --------------------------------------

    return redirect(
        url_for("index")
    )


# ==========================================
# PÁGINA PRINCIPAL
# ==========================================

@app.route("/index")
@login_requerido
def index():

    conexion = conectar_db()

    entornos = conexion.execute(
        """
        SELECT *
        FROM entornos
        WHERE usuario_id = ?
        ORDER BY id DESC
        """,
        (session["usuario_id"],)
    ).fetchall()

    conexion.close()

    return render_template(
        "index.html",
        usuario=session["usuario"],
        entornos=entornos
    )
# ==========================================
# CREAR ENTORNO
# ==========================================

@app.route("/crear-entorno")
@login_requerido
def crear_entorno():

    return render_template(
        "crear_entorno.html",
        usuario=session["usuario"]
    )


# ==========================================
# CASA
# ==========================================

@app.route("/casa")
@login_requerido
def casa():

    # Buscar si el usuario ya tiene una casa guardada

    entorno = obtener_entorno(
        session["usuario_id"],
        "casa"
    )

    # ==========================================
    # SI YA EXISTE
    # ==========================================

    if entorno:

        espacios = obtener_espacios(
            entorno["id"]
        )

        espacios_completos = []

        for espacio in espacios:

            dispositivos = obtener_dispositivos(
                espacio["id"]
            )

            espacios_completos.append({

                "id": espacio["id"],

                "nombre": espacio["nombre"],

                "tipo": espacio["tipo"],

                "dispositivos": dispositivos

            })

        return render_template(
            "entorno.html",
            usuario=session["usuario"],
            entorno=entorno,
            nombre_entorno=entorno["nombre"],
            espacios=espacios_completos,
            habitaciones=espacios_completos
        )

    # ==========================================
    # SI TODAVÍA NO EXISTE
    # ==========================================

    return render_template(
        "casa.html",
        usuario=session["usuario"]
    )

# ==========================================
# CONFIGURAR HABITACIONES DE CASA
# ==========================================

@app.route(
    "/casa/habitaciones",
    methods=["POST"]
)
@login_requerido
def configurar_habitaciones():

    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    nombre_entorno = request.form.get(
        "nombre_entorno"
    )

    cantidad_habitaciones = request.form.get(
        "cantidad_habitaciones"
    )

    if (
        not nombre_entorno
        or not cantidad_habitaciones
    ):

        return redirect(
            url_for("casa")
        )

    cantidad_habitaciones = int(
        cantidad_habitaciones
    )

    return render_template(
        "configurar_habitaciones.html",
        usuario=session["usuario"],
        nombre_entorno=nombre_entorno,
        cantidad_habitaciones=cantidad_habitaciones
    )


# ==========================================
# CONFIGURAR DISPOSITIVOS DE CASA
# ==========================================

@app.route(
    "/casa/dispositivos",
    methods=["POST"]
)
@login_requerido
def configurar_dispositivos():

    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    nombre_entorno = request.form.get(
        "nombre_entorno"
    )

    cantidad_habitaciones = int(
        request.form.get(
            "cantidad_habitaciones",
            0
        )
    )

    habitaciones = []

    for numero in range(
        1,
        cantidad_habitaciones + 1
    ):

        nombre_habitacion = request.form.get(
            f"habitacion{numero}"
        )

        habitaciones.append(
            nombre_habitacion
        )

    return render_template(
        "configurar_dispositivos.html",
        usuario=session["usuario"],
        nombre_entorno=nombre_entorno,
        cantidad_habitaciones=cantidad_habitaciones,
        habitaciones=habitaciones
    )

# ==========================================
# FINALIZAR Y GUARDAR CASA
# ==========================================

@app.route(
    "/crear-entorno/finalizar",
    methods=["POST"]
)
@login_requerido
def finalizar_entorno():

    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    usuario_id = session["usuario_id"]


    # ==========================================
    # DATOS DEL ENTORNO
    # ==========================================

    nombre_entorno = request.form.get(
        "nombre_entorno"
    )

    cantidad_habitaciones = int(
        request.form.get(
            "cantidad_habitaciones",
            0
        )
    )


    if not nombre_entorno:

        return redirect(
            url_for("casa")
        )


    # ==========================================
    # CREAR ENTORNO CASA
    # ==========================================

    entorno_id = crear_entorno_db(
        usuario_id,
        nombre_entorno,
        "casa"
    )


    # ==========================================
    # CREAR HABITACIONES
    # ==========================================

    for numero in range(
        1,
        cantidad_habitaciones + 1
    ):

        nombre_habitacion = request.form.get(
            f"habitacion{numero}"
        )


        if not nombre_habitacion:

            nombre_habitacion = (
                f"Habitación {numero}"
            )


        # Crear habitación

        espacio_id = crear_espacio_db(
            entorno_id,
            nombre_habitacion,
            "habitacion"
        )


        # ==========================================
        # DISPOSITIVOS
        # ==========================================

        dispositivos = {

            "temperatura":
                f"temperatura_{numero}",

            "iluminacion":
                f"iluminacion_{numero}",

            "alarma":
                f"alarma_{numero}",

            "ventilacion":
                f"ventilacion_{numero}"

        }


        for tipo, campo in dispositivos.items():

            if request.form.get(campo):

                crear_dispositivo_db(
                    espacio_id,
                    tipo
                )


    # ==========================================
    # VOLVER A CASA
    # ==========================================

    return redirect(
        url_for("casa")
    )

# ==========================================
# COLEGIO
# ==========================================

@app.route("/colegio")
@login_requerido
def colegio():

    # --------------------------------------
    # BUSCAR COLEGIO DEL USUARIO
    # --------------------------------------

    entorno = obtener_entorno(
        session["usuario_id"],
        "colegio"
    )

    # --------------------------------------
    # SI YA EXISTE
    # --------------------------------------

    if entorno:

        espacios = obtener_espacios(
            entorno["id"]
        )

        espacios_completos = []

        for espacio in espacios:

            dispositivos = obtener_dispositivos(
                espacio["id"]
            )

            espacios_completos.append({

                "id": espacio["id"],

                "nombre": espacio["nombre"],

                "tipo": espacio["tipo"],

                "dispositivos": dispositivos

            })

        return render_template(
            "entorno_colegio.html",
            usuario=session["usuario"],
            entorno=entorno,
            espacios=espacios_completos
        )

    # --------------------------------------
    # SI NO EXISTE
    # --------------------------------------

    return render_template(
        "colegio.html",
        usuario=session["usuario"]
    )


# ==========================================
# CONFIGURAR COLEGIO
# ==========================================

@app.route(
    "/colegio/configurar",
    methods=["POST"]
)
@login_requerido
def configurar_colegio():
    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    nombre_entorno = request.form.get(
        "nombre_entorno"
    )

    cantidad_aulas = int(
        request.form.get(
            "cantidad_aulas",
            0
        )
    )

    cantidad_espacios = int(
        request.form.get(
            "cantidad_espacios",
            0
        )
    )

    return render_template(
        "configurar_colegio.html",
        usuario=session["usuario"],
        nombre_entorno=nombre_entorno,
        cantidad_aulas=cantidad_aulas,
        cantidad_espacios=cantidad_espacios
    )


# ==========================================
# CONFIGURAR ESPACIOS DEL COLEGIO
# ==========================================

@app.route(
    "/colegio/espacios",
    methods=["POST"]
)
@login_requerido
def configurar_espacios_colegio():

    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    nombre_entorno = request.form.get(
        "nombre_entorno"
    )

    cantidad_aulas = int(
        request.form.get(
            "cantidad_aulas",
            0
        )
    )

    cantidad_espacios = int(
        request.form.get(
            "cantidad_espacios",
            0
        )
    )

    aulas = []

    for numero in range(
        1,
        cantidad_aulas + 1
    ):

        nombre_aula = request.form.get(
            f"aula{numero}"
        )

        if not nombre_aula:

            nombre_aula = (
                f"Aula {numero}"
            )

        aulas.append(
            nombre_aula
        )

    espacios = []

    for numero in range(
        1,
        cantidad_espacios + 1
    ):

        nombre_espacio = request.form.get(
            f"espacio{numero}"
        )

        if not nombre_espacio:

            nombre_espacio = (
                f"Espacio común {numero}"
            )

        espacios.append(
            nombre_espacio
        )

    return render_template(
        "configurar_dispositivos_colegio.html",

        usuario=session["usuario"],

        nombre_entorno=nombre_entorno,

        aulas=aulas,

        espacios=espacios,

        cantidad_aulas=cantidad_aulas,

        cantidad_espacios=cantidad_espacios
    )


# ==========================================
# GUARDAR COLEGIO
# ==========================================

@app.route(
    "/colegio/guardar",
    methods=["POST"]
)
@login_requerido
def guardar_colegio():

    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    usuario_id = session["usuario_id"]

    nombre_entorno = request.form.get(
        "nombre_entorno"
    )

    cantidad_aulas = int(
        request.form.get(
            "cantidad_aulas",
            0
        )
    )

    cantidad_espacios = int(
        request.form.get(
            "cantidad_espacios",
            0
        )
    )

    if not nombre_entorno:

        return redirect(
            url_for("colegio")
        )

    # ==========================================
    # EVITAR DUPLICAR EL COLEGIO
    # ==========================================

    colegio_existente = obtener_entorno(
        usuario_id,
        "colegio"
    )

    if colegio_existente:

        return redirect(
            url_for("colegio")
        )

    # ==========================================
    # CREAR ENTORNO
    # ==========================================

    entorno_id = crear_entorno_db(
        usuario_id,
        nombre_entorno,
        "colegio"
    )

    # ==========================================
    # CREAR AULAS
    # ==========================================

    for numero in range(
        1,
        cantidad_aulas + 1
    ):

        nombre_aula = request.form.get(
            f"aula_nombre_{numero}"
        )

        if not nombre_aula:

            nombre_aula = (
                f"Aula {numero}"
            )

        espacio_id = crear_espacio_db(
            entorno_id,
            nombre_aula,
            "aula"
        )

        # --------------------------------------
        # DISPOSITIVOS DEL AULA
        # --------------------------------------

        dispositivos = {

            "iluminacion":
                f"iluminacion_aula_{numero}",

            "temperatura":
                f"temperatura_aula_{numero}",

            "humedad":
                f"humedad_aula_{numero}",

            "movimiento":
                f"movimiento_aula_{numero}",

            "alarma":
                f"alarma_aula_{numero}",

            "ventilacion":
                f"ventilacion_aula_{numero}"

        }

        for tipo, campo in dispositivos.items():

            if request.form.get(campo):

                crear_dispositivo_db(
                    espacio_id,
                    tipo
                )

    # ==========================================
    # CREAR ESPACIOS COMUNES
    # ==========================================

    for numero in range(
        1,
        cantidad_espacios + 1
    ):

        nombre_espacio = request.form.get(
            f"espacio_nombre_{numero}"
        )

        if not nombre_espacio:

            nombre_espacio = (
                f"Espacio común {numero}"
            )

        espacio_id = crear_espacio_db(
            entorno_id,
            nombre_espacio,
            "espacio_comun"
        )

        # --------------------------------------
        # DISPOSITIVOS DEL ESPACIO
        # --------------------------------------

        dispositivos = {

            "iluminacion":
                f"iluminacion_espacio_{numero}",

            "temperatura":
                f"temperatura_espacio_{numero}",

            "humedad":
                f"humedad_espacio_{numero}",

            "movimiento":
                f"movimiento_espacio_{numero}",

            "alarma":
                f"alarma_espacio_{numero}",

            "ventilacion":
                f"ventilacion_espacio_{numero}"

        }

        for tipo, campo in dispositivos.items():

            if request.form.get(campo):

                crear_dispositivo_db(
                    espacio_id,
                    tipo
                )

    # ==========================================
    # VOLVER AL COLEGIO
    # ==========================================

    return redirect(
        url_for("colegio")
    )


## ==========================================
# OFICINA
# ==========================================

@app.route("/oficina")
@login_requerido
def oficina():

    usuario_id = session["usuario_id"]

    # --------------------------------------
    # BUSCAR OFICINA GUARDADA
    # --------------------------------------

    entorno = obtener_entorno(
        usuario_id,
        "oficina"
    )

    # --------------------------------------
    # SI NO EXISTE
    # --------------------------------------

    if entorno is None:

        return render_template(
            "configurar_oficina.html",
            usuario=session["usuario"]
        )

    # --------------------------------------
    # BUSCAR ESPACIO GENERAL
    # --------------------------------------

    espacio = obtener_espacio_general(
        entorno["id"]
    )

    # --------------------------------------
    # OBTENER DISPOSITIVOS
    # --------------------------------------

    dispositivos = []

    if espacio:

        dispositivos = obtener_dispositivos(
            espacio["id"]
        )

    # --------------------------------------
    # MOSTRAR PANEL
    # --------------------------------------

    return render_template(
        "oficina.html",
        usuario=session["usuario"],
        entorno=entorno,
        dispositivos=dispositivos
    )


# ==========================================
# GUARDAR CONFIGURACIÓN DE OFICINA
# ==========================================

@app.route(
    "/oficina/guardar",
    methods=["POST"]
)
@login_requerido
def guardar_oficina():
    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    usuario_id = session["usuario_id"]

    # --------------------------------------
    # EVITAR DUPLICADOS
    # --------------------------------------

    oficina_existente = obtener_entorno(
        usuario_id,
        "oficina"
    )

    if oficina_existente:

        return redirect(
            url_for("oficina")
        )

    # --------------------------------------
    # CREAR ENTORNO
    # --------------------------------------

    entorno_id = crear_entorno_db(
        usuario_id,
        "Oficina",
        "oficina"
    )

    # --------------------------------------
    # CREAR ESPACIO GENERAL
    # --------------------------------------

    espacio_id = crear_espacio_db(
        entorno_id,
        "Oficina",
        "general"
    )

    # --------------------------------------
    # DISPOSITIVOS DISPONIBLES
    # --------------------------------------

    dispositivos_disponibles = [

        "temperatura",
        "humedad",
        "movimiento",
        "iluminacion",
        "alarma",
        "ventilacion",
        "camara"

    ]

    # --------------------------------------
    # GUARDAR LOS SELECCIONADOS
    # --------------------------------------

    for dispositivo in dispositivos_disponibles:

        if request.form.get(dispositivo):

            crear_dispositivo_db(
                espacio_id,
                dispositivo
            )

    # --------------------------------------
    # VOLVER AL PANEL
    # --------------------------------------

    return redirect(
        url_for("oficina")
    )

# ==========================================
# GARAGE
# ==========================================

@app.route("/garage")
@login_requerido
def garage():

    usuario_id = session["usuario_id"]

    # --------------------------------------
    # BUSCAR GARAGE GUARDADO
    # --------------------------------------

    entorno = obtener_entorno(
        usuario_id,
        "garage"
    )

    # --------------------------------------
    # SI NO EXISTE
    # --------------------------------------

    if entorno is None:

        return render_template(
            "configurar_garage.html",
            usuario=session["usuario"]
        )

    # --------------------------------------
    # BUSCAR ESPACIO GENERAL
    # --------------------------------------

    espacio = obtener_espacio_general(
        entorno["id"]
    )

    # --------------------------------------
    # OBTENER DISPOSITIVOS
    # --------------------------------------

    dispositivos = []

    if espacio:

        dispositivos = obtener_dispositivos(
            espacio["id"]
        )

    # --------------------------------------
    # MOSTRAR PANEL
    # --------------------------------------

    return render_template(
        "garage.html",
        usuario=session["usuario"],
        entorno=entorno,
        dispositivos=dispositivos
    )


# ==========================================
# GUARDAR CONFIGURACIÓN DE GARAGE
# ==========================================

@app.route(
    "/garage/guardar",
    methods=["POST"]
)
@login_requerido
def guardar_garage():
    if "usuario_id" not in session:

        return redirect(
            url_for("iniciar_sesion")
        )

    usuario_id = session["usuario_id"]

    # --------------------------------------
    # EVITAR DUPLICADOS
    # --------------------------------------

    garage_existente = obtener_entorno(
        usuario_id,
        "garage"
    )

    if garage_existente:

        return redirect(
            url_for("garage")
        )

    # --------------------------------------
    # CREAR ENTORNO
    # --------------------------------------

    entorno_id = crear_entorno_db(
        usuario_id,
        "Garage",
        "garage"
    )

    # --------------------------------------
    # CREAR ESPACIO GENERAL
    # --------------------------------------

    espacio_id = crear_espacio_db(
        entorno_id,
        "Garage",
        "general"
    )

    # --------------------------------------
    # DISPOSITIVOS DISPONIBLES
    # --------------------------------------

    dispositivos_disponibles = [

        "porton",
        "temperatura",
        "humedad",
        "movimiento",
        "iluminacion",
        "alarma",
        "ventilacion",
        "camara"

    ]

    # --------------------------------------
    # GUARDAR LOS SELECCIONADOS
    # --------------------------------------

    for dispositivo in dispositivos_disponibles:

        if request.form.get(dispositivo):

            crear_dispositivo_db(
                espacio_id,
                dispositivo
            )

    # --------------------------------------
    # VOLVER AL PANEL
    # --------------------------------------

    return redirect(
        url_for("garage")
    )
# ==========================================
# CONTROL LED
# ==========================================

@app.route("/api/led/on")
@login_requerido
def led_on():

    led.on()

    return jsonify({
        "estado": "encendido"
    })


@app.route("/api/led/off")
@login_requerido
def led_off():

    led.off()

    return jsonify({
        "estado": "apagado"
    })


# ==========================================
# CONTROL ALARMA
# ==========================================

@app.route("/api/alarma/on")
@login_requerido
def alarma_on():

    alarma.on()

    return jsonify({
        "estado": "activada"
    })


@app.route("/api/alarma/off")
@login_requerido
def alarma_off():

    alarma.off()

    return jsonify({
        "estado": "desactivada"
    })


# ==========================================
# SENSOR DHT11
# ==========================================

@app.route("/api/sensor")
@login_requerido
def leer_sensor():

    try:

        humedad = sensor.humidity
        temperatura = sensor.temperature

        if humedad is not None and temperatura is not None:

            return jsonify({
                "temperatura": round(temperatura, 1),
                "humedad": round(humedad, 1)
            })

        return jsonify({
            "error": "No se pudo leer el sensor"
        }), 500

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
# ==========================================
# CERRAR SESIÓN
# ==========================================

@app.route("/logout")
@login_requerido
def logout():

    session.clear()

    return redirect(
        url_for("iniciar_sesion")
    )


# ==========================================
# INICIAR FLASK
# ==========================================

if __name__ == "__main__":

    crear_base_datos()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )