// 1. Cargar las palabras desde el archivo JSON
let palabras = [];

fetch('words.json')  // Asegúrate de que esta ruta sea correcta
    .then(response => response.json())
    .then(data => {
        palabras = data.palabras;
        console.log('Palabras cargadas:', palabras);  // Verificar que las palabras se carguen
        seleccionarPalabraAleatoria();  // Seleccionar una palabra después de cargarlas
    })
    .catch(error => console.error('Error al cargar las palabras:', error));

let palabraSeleccionada = '';

// 2. Seleccionar una palabra aleatoria
function seleccionarPalabraAleatoria() {
    if (palabras.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * palabras.length);
        palabraSeleccionada = palabras[indiceAleatorio];
        document.getElementById('word').textContent = palabraSeleccionada;
    } else {
        console.error('No hay palabras disponibles para seleccionar.');
    }
}

// Variables para la voz y la configuración de la pronunciación
let availableVoices = [];
let selectedVoice = null;

// Cargar voces disponibles
function cargarVoces() {
    availableVoices = window.speechSynthesis.getVoices();
    selectedVoice = availableVoices.find(voice => voice.lang === 'en-US'); // Selecciona una voz en inglés
}

// Asegurarse de que las voces estén cargadas
window.speechSynthesis.onvoiceschanged = function() {
    cargarVoces();
};

// 3. Función para escuchar la pronunciación correcta
function reproducirPronunciacion() {
    if (palabraSeleccionada) {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(palabraSeleccionada);
        utterThis.lang = 'en-US';  // Configurar idioma inglés
        
        // Asignar la voz seleccionada, si existe
        if (selectedVoice) {
            utterThis.voice = selectedVoice;
        }

        // Ajustar velocidad y tono
        utterThis.rate = 0.9;  // Velocidad (1 es el valor por defecto)
        utterThis.pitch = 1.0; // Tono (1 es el valor por defecto)

        synth.speak(utterThis);
    } else {
        console.error('No hay palabra seleccionada para pronunciar.');
    }
}

// 4. Función para escuchar la pronunciación del usuario
function iniciarReconocimiento() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error('API de reconocimiento de voz no soportada en este navegador.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {
        const userAttempt = event.results[0][0].transcript;
        document.getElementById('userAttempt').textContent = `Tu pronunciación: ${userAttempt}`;

        verificarPronunciacion(userAttempt);
    };

    recognition.onerror = function(event) {
        console.error('Error en el reconocimiento:', event.error);
    };
}

// 5. Función para verificar la pronunciación
function verificarPronunciacion(userAttempt) {
    const mensajeResultado = document.getElementById('resultMessage');
    
    if (userAttempt.toLowerCase() === palabraSeleccionada.toLowerCase()) {
        mensajeResultado.textContent = '¡Correcto!';
        mensajeResultado.className = 'success';
    } else {
        mensajeResultado.textContent = 'Inténtalo de nuevo.';
        mensajeResultado.className = 'fail';
    }
}

// 6. Eventos para los botones
document.getElementById('playPronunciation').addEventListener('click', reproducirPronunciacion);
document.getElementById('startRecognition').addEventListener('click', iniciarReconocimiento);
