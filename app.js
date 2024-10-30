//Cargar las palabras desde el archivo JSON
let palabras = [];

fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    palabras = data.palabras;
    console.log("Palabras cargadas:", palabras);
    seleccionarPalabraAleatoria(); // Seleccionar una palabra
  })
  .catch((error) => console.error("Error al cargar las palabras:", error));

let palabraSeleccionada = "";

//Seleccionar una palabra aleatoria
function seleccionarPalabraAleatoria() {
  if (palabras.length > 0) {
    const indiceAleatorio = Math.floor(Math.random() * palabras.length);
    palabraSeleccionada = palabras[indiceAleatorio];
    document.getElementById("word").textContent = palabraSeleccionada;
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

//Función para escuchar la pronunciación correcta
function reproducirPronunciacion() {
  if (palabraSeleccionada) {
    const synth = window.speechSynthesis;
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

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event) {
    const userAttempt = event.results[0][0].transcript;
    document.getElementById(
      "userAttempt"
    ).textContent = `Tu pronunciación: ${userAttempt}`;

    verificarPronunciacion(userAttempt);
  };

  recognition.onerror = function (event) {
    console.error("Error en el reconocimiento:", event.error);
  };
}

//Función para verificar la pronunciación
function verificarPronunciacion(userAttempt) {
  const mensajeResultado = document.getElementById("resultMessage");

  if (userAttempt.toLowerCase() === palabraSeleccionada.toLowerCase()) {
    mensajeResultado.textContent = "¡Correcto!";
    mensajeResultado.className = "success";
  } else {
    mensajeResultado.textContent = "Inténtalo de nuevo.";
    mensajeResultado.className = "fail";
  }
}

// 6. Eventos para los botones
document
  .getElementById("playPronunciation")
  .addEventListener("click", reproducirPronunciacion);
document
  .getElementById("startRecognition")
  .addEventListener("click", iniciarReconocimiento);
