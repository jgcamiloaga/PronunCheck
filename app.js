const enlacesCategorias = document.querySelectorAll("a");

enlacesCategorias.forEach((enlace) => {
  enlace.addEventListener("click", function (event) {
    event.preventDefault();

    const categoriaSeleccionada = enlace.dataset.category;
    // Almacenar la categoría seleccionada en localStorage
    localStorage.setItem("categoriaSeleccionada", categoriaSeleccionada);

    // Redirigir manualmente al enlace
    window.location.href = enlace.href;
  });
});

if (
  window.location.pathname.endsWith("game.html") || 
  window.location.pathname.endsWith("game")
) {
  // Recuperar la categoría seleccionada desde localStorage
  const categoriaSeleccionada = localStorage.getItem("categoriaSeleccionada");
  let palabraSeleccionada = "";

  if (categoriaSeleccionada) {
    // Cargar las palabras desde el archivo JSON
    fetch("words.json")
      .then((response) => response.json())
      .then((data) => {
        const categoria = data.categories.find(
          (cat) => cat.category === categoriaSeleccionada
        );

        if (categoria) {
          const palabras = categoria.words;
          seleccionarPalabraAleatoria(palabras);
        } else {
          console.error("Categoría no encontrada en el JSON.");
        }
      })
      .catch((error) => console.error("Error al cargar las palabras:", error));
  } else {
    console.error("No se ha seleccionado ninguna categoría.");
  }

  // Seleccionar una palabra aleatoria y mostrarla
  function seleccionarPalabraAleatoria(palabras) {
    if (palabras.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * palabras.length);
      palabraSeleccionada = palabras[indiceAleatorio];
      document.getElementById("word").textContent = palabraSeleccionada; // Mostrar la palabra en el HTML
    } else {
      console.error("No hay palabras disponibles para seleccionar.");
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

  window.speechSynthesis.onvoiceschanged = function () {
    cargarVoces();
  };

  // Función para escuchar la pronunciación correcta
  function reproducirPronunciacion() {
    if (palabraSeleccionada) {
      const synth = window.speechSynthesis;

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

  //Función para escuchar la pronunciación del usuario
  function iniciarReconocimiento() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
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

    recognition.onresult = function (event) {
      const userAttempt = event.results[0][0].transcript;
      const newUserAttempt = userAttempt.replace(/\./g, "");;

      document.getElementById(
        "userAttempt"
      ).textContent = `${newUserAttempt}`;

      verificarPronunciacion(userAttempt);
    };

    recognition.onerror = function (event) {
      console.error("Error en el reconocimiento:", event.error);
    };
  }

  //Función para botón activo
  const btnGrabar = document.getElementById("startRecognition");

  function activarBoton() {
    btnGrabar.textContent = "🎙️ Listening...";
    btnGrabar.style.backgroundColor = "#f44336";
    btnGrabar.disabled = true;
  }

  //Función para botón inactivo
  function desactivarBoton() {
    btnGrabar.textContent = "🎤 Start Recording";
    btnGrabar.style.backgroundColor = "#4caf50";
    btnGrabar.disabled = false;
  }

  //Función para verificar la pronunciación
  function verificarPronunciacion(userAttempt) {
    const mensajeResultado = document.getElementById("resultMessage");
    const newUserAttempt = userAttempt.replace(/\./g, "");;

    // Normalizar las cadenas para evitar errores de comparación
    if (
      newUserAttempt.trim().toLowerCase() ===
      palabraSeleccionada.trim().toLowerCase()
    ) {
      mensajeResultado.textContent = "¡Correcto!";
      mensajeResultado.className = "success";
    } else {
      mensajeResultado.textContent = "Inténtalo de nuevo.";
      mensajeResultado.className = "fail";
    }

    desactivarBoton();
  }

  // Eventos para los botones
  document
    .getElementById("playPronunciation")
    .addEventListener("click", reproducirPronunciacion);
  document
    .getElementById("startRecognition")
    .addEventListener("click", iniciarReconocimiento);
}
