const RASPBERRY_IP = 'http://192.168.1.100:5000';

let doorUnlocked = false;
let lightOn = false;
let alarmOn = false;
let acOn = false;

function getTime() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function addHistory(text) {
  const history = document.getElementById("history");
  const event = document.createElement("div");
  event.className = "event";
  event.innerHTML = `<span>${text}</span><span class="event-time">${getTime()}</span>`;
  history.prepend(event);
}

async function sendCommand(endpoint) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${RASPBERRY_IP}/${endpoint}`, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Respuesta fallida');
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    alert("⚠️ Dispositivo desconectado. No se pudo establecer comunicación con la Raspberry Pi.");
    addHistory("❌ Error: Sin conexión con Raspberry");
    document.getElementById("connectionDot").style.background = "#ef4444";
    document.getElementById("connectionDot").style.boxShadow = "0 0 10px #ef4444";
    document.getElementById("connectionText").textContent = "Desconectado";
    return false;
  }
}

async function toggleDoor() {
  const targetState = !doorUnlocked;
  const endpoint = targetState ? 'puerta/desbloquear' : 'puerta/bloquear';
  const success = await sendCommand(endpoint);
  if (!success) return;

  doorUnlocked = targetState;
  const status = document.getElementById("officeStatus");
  const substatus = document.getElementById("officeSubstatus");
  const button = document.getElementById("officeButton");
  const icon = document.getElementById("officeIcon");

  if (doorUnlocked) {
    status.textContent = "Desbloqueada";
    status.style.color = "#22c55e";
    substatus.textContent = "Puerta abierta / Acceso libre";
    button.textContent = "BLOQUEAR PUERTA";
    button.classList.add("close");
    icon.textContent = "📂";
    addHistory("🔓 Puerta de oficina desbloqueada");
  } else {
    status.textContent = "Bloqueada";
    status.style.color = "#f8fafc";
    substatus.textContent = "Acceso de oficina seguro";
    button.textContent = "DESBLOQUEAR PUERTA";
    button.classList.remove("close");
    icon.textContent = "🚪";
    addHistory("🔒 Puerta de oficina bloqueada");
  }
  updateTime();
}

async function toggleLight() {
  const targetState = !lightOn;
  const endpoint = targetState ? 'luces/encender' : 'luces/apagar';
  const success = await sendCommand(endpoint);
  if (!success) return;

  lightOn = targetState;
  const button = document.getElementById("lightButton");
  if (lightOn) {
    button.classList.add("active");
    button.textContent = "💡 Luces encendidas";
    addHistory("💡 Luces de oficina encendidas");
  } else {
    button.classList.remove("active");
    button.textContent = "💡 Luces";
    addHistory("🌑 Luces de oficina apagadas");
  }
  updateTime();
}

async function toggleAlarm() {
  const targetState = !alarmOn;
  const endpoint = targetState ? 'alarma/activar' : 'alarma/desactivar';
  const success = await sendCommand(endpoint);
  if (!success) return;

  alarmOn = targetState;
  const button = document.getElementById("alarmButton");
  if (alarmOn) {
    button.classList.add("active");
    button.textContent = "🚨 Alarma activa";
    addHistory("🚨 Alarma de seguridad activada");
  } else {
    button.classList.remove("active");
    button.textContent = "🚨 Alarma";
    addHistory("🔕 Alarma de seguridad desactivada");
  }
  updateTime();
}

async function toggleAC() {
  const targetState = !acOn;
  const endpoint = targetState ? 'ac/encender' : 'ac/apagar';
  const success = await sendCommand(endpoint);
  if (!success) return;

  acOn = targetState;
  const button = document.getElementById("acButton");
  if (acOn) {
    button.classList.add("active");
    button.textContent = "❄️ AC encendido";
    addHistory("❄️ Climatización encendida");
  } else {
    button.classList.remove("active");
    button.textContent = "❄️ Clima (AC)";
    addHistory("🛑 Climatización apagada");
  }
  updateTime();
}

async function refreshStatus() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${RASPBERRY_IP}/estado`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Error al obtener estado");
    
    const data = await response.json();
    document.getElementById("humidityVal").textContent = data.humedad + "%";
    document.getElementById("tempVal").textContent = data.temperatura + " °C";

    document.getElementById("connectionDot").style.background = "#22c55e";
    document.getElementById("connectionDot").style.boxShadow = "0 0 10px #22c55e";
    document.getElementById("connectionText").textContent = "Dispositivo conectado";
    addHistory("🔄 Estado de oficina actualizado");
  } catch (error) {
    clearTimeout(timeoutId);
    document.getElementById("connectionDot").style.background = "#ef4444";
    document.getElementById("connectionDot").style.boxShadow = "0 0 10px #ef4444";
    document.getElementById("connectionText").textContent = "Desconectado";
    addHistory("❌ Error de conexión al actualizar");
  }
  updateTime();
}

function updateTime() {
  document.getElementById("lastUpdate").textContent = getTime();
}

window.onload = refreshStatus;