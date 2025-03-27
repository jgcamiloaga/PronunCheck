// Función para detectar si es un dispositivo móvil
function esMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Función para mostrar el aviso de dispositivo móvil
function mostrarAvisoMobile() {
  // Si no es un dispositivo móvil, mostrar el aviso
  if (!esMobile()) {
    const avisoMobile = document.createElement("div");
    avisoMobile.className = "mobile-notice";
    avisoMobile.innerHTML = `
        <div class="mobile-notice-content">
          <div class="mobile-icon">📱</div>
          <h2>Esta aplicación está optimizada para dispositivos móviles</h2>
          <p>El reconocimiento de voz funciona mejor en smartphones y tablets.</p>
          <p>Para una mejor experiencia, por favor accede desde tu dispositivo móvil escaneando el código QR:</p>
          <div class="qr-placeholder">
            <img src="img/qr.png" alt="QR Code" />
          </div>
          <button id="continueAnyway" class="btn-continue">Continuar de todos modos</button>
        </div>
      `;

    document.body.appendChild(avisoMobile);

    // Evento para el botón de continuar
    document.getElementById("continueAnyway").addEventListener("click", () => {
      avisoMobile.classList.add("hidden");
      setTimeout(() => {
        avisoMobile.remove();
      }, 500);
    });
  }
}

// Ejecutar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", mostrarAvisoMobile);
