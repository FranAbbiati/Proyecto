const RASPBERRY_IP = 'http://192.168.1.100:5000';

let gateOpen = false;
let lightOn = false;
let alarmOn = false;

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

async function triggerBell() {
  const success = await sendCommand('timbre/sonar');
  if (!success) return;

  const status = document.getElementById("schoolStatus");
  const substatus = document.getElementById("schoolSubstatus");
  
  status.textContent = "¡Timbre Sonando!";
  status.style.color = "#22c55e";
  substatus.textContent = "Alarma de fin/inicio de clase activa";
  addHistory("🔔 Timbre escolar activado manualmente");

  setTimeout(() => {
    status.textContent = "Sistema en espera";
    status.style.color = "#f8fafc";
    substatus.textContent = "Control de timbre y accesos institucionales";
  }, 3000);

  updateTime();
}

async function toggleGate() {
  const targetState = !gateOpen;
  const endpoint = targetState ? 'porton/abrir' : 'porton/cerrar';
  const success = await sendCommand(endpoint);
  if (!success) return;

  gateOpen = targetState;
  const button = document.getElementById("gateButton");
  if (gateOpen) {
    button.classList.add("active");
    button.textContent = "🚪 Portón Abierto";
    addHistory("🟢 Portón principal abierto");
  } else {
    button.classList.remove("active");
    button.textContent = "🚪 Portón Principal";
    addHistory("🔒 Portón principal cerrado");
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
    addHistory("💡 Luces del patio encendidas");
  } else {
    button.classList.remove("active");
    button.textContent = "💡 Luces Patio";
    addHistory("🌑 Luces del patio apagadas");
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
    button.textContent = "🚨 Alarma Activa";
    addHistory("🚨 Alarma perimetral activada");
  } else {
    button.classList.remove("active");
    button.textContent = "🚨 Alarma Perimetral";
    addHistory("🔕 Alarma perimetral desactivada");
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
    addHistory("🔄 Estado del colegio actualizado");
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