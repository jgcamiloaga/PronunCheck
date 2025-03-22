// Función para alternar entre tema claro y oscuro
function toggleTheme() {
  const body = document.body;
  body.classList.toggle("dark-theme");

  // Guardar preferencia en localStorage
  const isDarkTheme = body.classList.contains("dark-theme");
  localStorage.setItem("darkTheme", isDarkTheme);
}

// Inicializar tema según preferencia guardada
function initTheme() {
  const isDarkTheme = localStorage.getItem("darkTheme") === "true";
  if (isDarkTheme) {
    document.body.classList.add("dark-theme");
  }
}

// Inicializar estadísticas
function initStats() {
  const totalWords = localStorage.getItem("totalWords") || 0;
  const correctWords = localStorage.getItem("correctWords") || 0;

  // Actualizar elementos si existen
  const totalWordsElement = document.getElementById("totalWords");
  const correctWordsElement = document.getElementById("correctWords");

  if (totalWordsElement) totalWordsElement.textContent = totalWords;
  if (correctWordsElement) correctWordsElement.textContent = correctWords;
}

// Evento para alternar tema
document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initStats();

  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
});

// Seleccionar todos los enlaces de categorías
const enlacesCategorias = document.querySelectorAll(".category");

enlacesCategorias.forEach((enlace) => {
  enlace.addEventListener("click", function (event) {
    event.preventDefault();

    // Añadir animación de clic
    enlace.style.transform = "scale(0.95)";
    setTimeout(() => {
      enlace.style.transform = "";
    }, 200);

    const categoriaSeleccionada = enlace.dataset.category;
    // Almacenar la categoría seleccionada en localStorage
    localStorage.setItem("categoriaSeleccionada", categoriaSeleccionada);

    // Redirigir manualmente al enlace después de una breve animación
    setTimeout(() => {
      window.location.href = enlace.href;
    }, 300);
  });
});

// Lógica específica para la página de juego
if (
  window.location.pathname.endsWith("game.html") ||
  window.location.pathname.endsWith("game")
) {
  // Variables para el seguimiento del progreso
  let correctCount = 0;
  let totalAttempts = 0;
  let palabrasEnCategoria = [];
  let indicePalabraActual = 0;

  // Recuperar la categoría seleccionada desde localStorage
  const categoriaSeleccionada = localStorage.getItem("categoriaSeleccionada");
  let palabraSeleccionada = "";

  // Mostrar la categoría actual en la interfaz
  const currentCategoryElement = document.getElementById("currentCategory");
  if (currentCategoryElement && categoriaSeleccionada) {
    currentCategoryElement.textContent = categoriaSeleccionada;
  }

  if (categoriaSeleccionada) {
    // Cargar las palabras desde el archivo JSON
    fetch("words.json")
      .then((response) => response.json())
      .then((data) => {
        const categoria = data.categories.find(
          (cat) => cat.category === categoriaSeleccionada
        );

        if (categoria) {
          palabrasEnCategoria = categoria.words;
          // Mezclar las palabras para orden aleatorio
          palabrasEnCategoria = shuffleArray(palabrasEnCategoria);
          seleccionarPalabra(0);
        } else {
          console.error("Categoría no encontrada en el JSON.");
        }
      })
      .catch((error) => console.error("Error al cargar las palabras:", error));
  } else {
    console.error("No se ha seleccionado ninguna categoría.");
  }

  // Función para mezclar array (algoritmo Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Seleccionar una palabra por índice
  function seleccionarPalabra(indice) {
    if (palabrasEnCategoria.length > 0 && indice < palabrasEnCategoria.length) {
      palabraSeleccionada = palabrasEnCategoria[indice];
      document.getElementById("word").textContent = palabraSeleccionada;

      // Resetear la interfaz para la nueva palabra
      document.getElementById("userAttempt").textContent =
        "Tu intento aparecerá aquí...";
      document.getElementById("resultMessage").textContent = "";
      document.getElementById("resultMessage").className = "result-display";

      // Ocultar el botón de siguiente palabra
      const nextWordBtn = document.getElementById("nextWord");
      if (nextWordBtn) {
        nextWordBtn.classList.add("hidden");
      }

      // Habilitar el botón de grabación
      const btnGrabar = document.getElementById("startRecognition");
      desactivarBoton();
    } else {
      console.error(
        "No hay palabras disponibles para seleccionar o índice fuera de rango."
      );
    }
  }

  // Variables para la voz y la configuración de la pronunciación
  let availableVoices = [];
  let selectedVoice = null;

  // Cargar voces disponibles
  function cargarVoces() {
    availableVoices = window.speechSynthesis.getVoices();
    selectedVoice = availableVoices.find((voice) => voice.lang === "en-US");
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () {
      cargarVoces();
    };

    // Intentar cargar voces inmediatamente también
    cargarVoces();
  }

  // Función para escuchar la pronunciación correcta
  function reproducirPronunciacion() {
    if (palabraSeleccionada) {
      const synth = window.speechSynthesis;

      // Añadir animación al botón
      const btnPronunciacion = document.getElementById("playPronunciation");
      btnPronunciacion.classList.add("active");
      setTimeout(() => {
        btnPronunciacion.classList.remove("active");
      }, 1000);

      // Detener cualquier reproducción en curso
      synth.cancel();

      const utterThis = new SpeechSynthesisUtterance(palabraSeleccionada);
      utterThis.lang = "en-US"; // Configurar idioma inglés

      // Asignar la voz seleccionada, si existe
      if (selectedVoice) {
        utterThis.voice = selectedVoice;
      }

      // Ajustar velocidad y tono
      utterThis.rate = 0.9;
      utterThis.pitch = 1.0;

      synth.speak(utterThis);
    } else {
      console.error("No hay palabra seleccionada para pronunciar.");
    }
  }

  // Función para escuchar la pronunciación del usuario
  function iniciarReconocimiento() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Lo sentimos, tu navegador no soporta el reconocimiento de voz.");
      console.error(
        "API de reconocimiento de voz no soportada en este navegador."
      );
      return;
    }

    activarBoton();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    // Mostrar animación de grabación
    const btnGrabar = document.getElementById("startRecognition");
    btnGrabar.classList.add("active");

    recognition.onresult = function (event) {
      const userAttempt = event.results[0][0].transcript;
      const newUserAttempt = userAttempt.replace(/\./g, "");

      document.getElementById("userAttempt").textContent = `${newUserAttempt}`;

      verificarPronunciacion(userAttempt);

      // Incrementar contador de intentos
      totalAttempts++;
      actualizarProgreso();
    };

    recognition.onerror = function (event) {
      console.error("Error en el reconocimiento:", event.error);
      desactivarBoton();
    };

    recognition.onend = function () {
      desactivarBoton();
    };
  }

  // Función para botón activo
  const btnGrabar = document.getElementById("startRecognition");

  function activarBoton() {
    btnGrabar.innerHTML = '<span class="btn-icon">🎙️</span> Escuchando...';
    btnGrabar.classList.add("active");
    btnGrabar.disabled = true;
  }

  // Función para botón inactivo
  function desactivarBoton() {
    btnGrabar.innerHTML = '<span class="btn-icon">🎤</span> Iniciar grabación';
    btnGrabar.classList.remove("active");
    btnGrabar.disabled = false;
  }

  // Función para verificar la pronunciación
  function verificarPronunciacion(userAttempt) {
    const mensajeResultado = document.getElementById("resultMessage");
    const newUserAttempt = userAttempt.replace(/\./g, "");
    const nextWordBtn = document.getElementById("nextWord");

    // Normalizar las cadenas para evitar errores de comparación
    if (
      newUserAttempt.trim().toLowerCase() ===
      palabraSeleccionada.trim().toLowerCase()
    ) {
      mensajeResultado.textContent = "¡Correcto! 🎉";
      mensajeResultado.className = "result-display success";

      // Incrementar contador de palabras correctas
      correctCount++;

      // Actualizar estadísticas globales
      const totalWords = parseInt(localStorage.getItem("totalWords") || 0) + 1;
      const correctWords =
        parseInt(localStorage.getItem("correctWords") || 0) + 1;
      localStorage.setItem("totalWords", totalWords);
      localStorage.setItem("correctWords", correctWords);
    } else {
      mensajeResultado.textContent = "Inténtalo de nuevo. 🔄";
      mensajeResultado.className = "result-display fail";

      // Actualizar estadísticas globales solo para intentos
      const totalWords = parseInt(localStorage.getItem("totalWords") || 0) + 1;
      localStorage.setItem("totalWords", totalWords);
    }

    // Mostrar botón para siguiente palabra
    if (nextWordBtn) {
      nextWordBtn.classList.remove("hidden");
    }

    // Actualizar progreso
    actualizarProgreso();

    desactivarBoton();
  }

  // Función para actualizar la barra de progreso
  function actualizarProgreso() {
    const progressBar = document.getElementById("progressBar");
    const correctCountElement = document.getElementById("correctCount");
    const totalAttemptsElement = document.getElementById("totalAttempts");

    if (progressBar && correctCountElement && totalAttemptsElement) {
      const porcentaje =
        totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
      progressBar.style.width = `${porcentaje}%`;

      correctCountElement.textContent = correctCount;
      totalAttemptsElement.textContent = totalAttempts;
    }
  }

  // Función para pasar a la siguiente palabra
  function siguientePalabra() {
    indicePalabraActual++;

    // Si llegamos al final, volver al principio
    if (indicePalabraActual >= palabrasEnCategoria.length) {
      indicePalabraActual = 0;
    }

    seleccionarPalabra(indicePalabraActual);
  }

  // Eventos para los botones
  document
    .getElementById("playPronunciation")
    .addEventListener("click", reproducirPronunciacion);
  document
    .getElementById("startRecognition")
    .addEventListener("click", iniciarReconocimiento);

  // Evento para el botón de siguiente palabra
  const nextWordBtn = document.getElementById("nextWord");
  if (nextWordBtn) {
    nextWordBtn.addEventListener("click", siguientePalabra);
  }
}
