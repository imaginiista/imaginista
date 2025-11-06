// ===========================
// 🎨 Alternar Tema (Lua / Sol)
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");

  // Tema escuro padrão
  if (!html.hasAttribute("data-theme")) {
    html.setAttribute("data-theme", "dark");
  }

  themeToggle.addEventListener("click", () => {
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    initParticles(); // Atualiza cor das partículas
  });
});

// ======================================
// 🌌 Inicialização e Configuração de Partículas (somente bolinhas)
// ======================================
window.initParticles = async function () {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const isDark = currentTheme === "dark";

  // Define a cor das partículas conforme o tema
  const particleColor = isDark ? "#ffffff" : "#00aaff"; // branco no dark, azul no claro
  // Para amarelo no claro, troque "#00aaff" por "#ffd700"

  await tsParticles.load("tsparticles-bg", {
    fpsLimit: 60,
    background: { color: { value: "transparent" } },
    fullScreen: { enable: false },
    particles: {
      number: { value: 120, density: { enable: true, area: 800 } },
      color: { value: particleColor },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.3, max: 0.9 },
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0.3, sync: false },
      },
      size: {
        value: { min: 1, max: 3 },
        random: true,
        anim: { enable: true, speed: 2, size_min: 0.5, sync: false },
      },
      move: {
        enable: true,
        speed: { min: 0.2, max: 1 },
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
        attract: { enable: false },
      },
      links: {
        enable: false, // ❌ sem rede, apenas bolinhas
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
      },
    },
    detectRetina: true,
  });
};

// ======================================
// 🎵 Controles de Música
// ======================================
const music = document.getElementById("bg-music");
const playPauseBtn = document.getElementById("play-pause");
const volUpBtn = document.getElementById("vol-up");
const volDownBtn = document.getElementById("vol-down");

let isPlaying = false;

function togglePlay() {
  if (!isPlaying) {
    music.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    music.pause();
    playPauseBtn.textContent = "▶️";
  }
  isPlaying = !isPlaying;
}

playPauseBtn.addEventListener("click", togglePlay);
volUpBtn.addEventListener("click", () => {
  music.volume = Math.min(music.volume + 0.1, 1);
});
volDownBtn.addEventListener("click", () => {
  music.volume = Math.max(music.volume - 0.1, 0);
});

// ======================================
// 🖼️ Carrossel Automático
// ======================================
const carouselItems = document.querySelectorAll(".carousel-item");
const pagination = document.querySelector(".carousel-pagination");
let currentSlide = 0;

// Cria os indicadores
carouselItems.forEach((_, index) => {
  const dot = document.createElement("span");
  dot.classList.add("dot");
  if (index === 0) dot.classList.add("active");
  pagination.appendChild(dot);
});

const dots = document.querySelectorAll(".dot");

function showSlide(index) {
  carouselItems.forEach((item, i) => {
    item.classList.toggle("active", i === index);
    dots[i].classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % carouselItems.length;
  showSlide(currentSlide);
}

setInterval(nextSlide, 4000);

// Clique manual nos indicadores
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    currentSlide = index;
    showSlide(currentSlide);
  });
});

// ======================================
// 🧙‍♂️ Mascote flutuante
// ======================================
const mascot = document.getElementById("mascot");
if (mascot) {
  let angle = 0;
  setInterval(() => {
    angle += 0.03;
    mascot.style.transform = `translateY(${Math.sin(angle) * 5}px)`;
  }, 30);
}

// ======================================
// 🚀 Inicialização Geral
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("loaded");
  initParticles(); // inicia o fundo animado
});
