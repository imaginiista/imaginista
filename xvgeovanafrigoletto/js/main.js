// ------------------------------
// main.js - completo (final)
// ------------------------------

// --- Lógica do Slideshow Automático e Manual ---
let slideIndex = 1;
let slideInterval;

function plusSlides(n) {
    showSlides(slideIndex += n);
    resetAutoSlide();
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    resetAutoSlide();
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    for (i = 0; i < slides.length; i++) slides[i].style.display = "none";
    for (i = 0; i < dots.length; i++) dots[i].className = dots[i].className.replace(" active", "");

    slides[slideIndex - 1].style.display = "block";
    if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active";
}

function startAutoSlide() {
    slideInterval = setInterval(function() {
        plusSlides(1);
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

// --- Animação de Elementos ao Scroll ---
const faders = document.querySelectorAll('.fade-in');
const appearOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px"
};
const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
    });
}, appearOptions);

// --- Vagalumes (fireflies) ---
function createFireflies() {
    const container = document.querySelector('.firefly-container');
    if (!container) return;

    const numFireflies = 25;
    for (let i = 0; i < numFireflies; i++) {
        let firefly = document.createElement('div');
        firefly.className = 'firefly';

        let x = Math.random() * 100;
        let y = Math.random() * 100;

        let duration = Math.random() * 10 + 8;
        let delay = Math.random() * 10;

        firefly.style.left = x + 'vw';
        firefly.style.top = y + 'vh';
        firefly.style.animationDuration = duration + 's';
        firefly.style.animationDelay = delay + 's';

        container.appendChild(firefly);
    }
}

// --- Contagem Regressiva ---
function startCountdown() {
    const countDownDate = new Date("Jan 31, 2026 19:00:00").getTime();
    const countdownElement = document.getElementById("timer");
    if (!countdownElement) return;

    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = (days >= 0) ? days : 0;
        document.getElementById("hours").innerText = (hours >= 0) ? hours : 0;
        document.getElementById("minutes").innerText = (minutes >= 0) ? minutes : 0;
        document.getElementById("seconds").innerText = (seconds >= 0) ? seconds : 0;

        if (distance < 0) {
            clearInterval(x);
            const cd = document.getElementById("countdown");
            if (cd) cd.innerHTML = "<p>A festa começou!</p>";
        }
    }, 1000);
}

// -----------------------------
// Explosão em fragmentos + reconstrução (rodapé .footer-logo)
// -----------------------------
function setupFooterLogoExplosion(options = {}) {
    const cols = options.cols || 12;
    const rows = options.rows || 8;
    const fragLayerId = options.fragLayerId || 'fragLayer';

    const logo = document.querySelector('.footer-logo');
    if (!logo) return;

    let fragLayer = document.getElementById(fragLayerId);
    if (!fragLayer) {
        fragLayer = document.createElement('div');
        fragLayer.id = fragLayerId;
        fragLayer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(fragLayer);
    }

    if (!logo.dataset) logo.dataset = {};

    async function createFragmentsAndAnimate() {
        if (logo.dataset.busy === "1") return;
        logo.dataset.busy = "1";

        if (!logo.complete) await new Promise(r => logo.onload = r);

        const rect = logo.getBoundingClientRect();
        const img = new Image();
        img.src = logo.src;
        try { await img.decode(); } catch (e) { /* ignore */ }

        const fragW = Math.ceil(rect.width / cols);
        const fragH = Math.ceil(rect.height / rows);
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;

        const fragments = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const sx = Math.floor(x * fragW * scaleX);
                const sy = Math.floor(y * fragH * scaleY);
                const sw = Math.ceil(fragW * scaleX);
                const sh = Math.ceil(fragH * scaleY);

                const piece = document.createElement('canvas');
                piece.width = sw;
                piece.height = sh;
                const pc = piece.getContext('2d');

                pc.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

                const left = rect.left + x * fragW;
                const top = rect.top + y * fragH;
                piece.style.position = 'fixed';
                piece.style.left = left + 'px';
                piece.style.top = top + 'px';
                piece.style.width = fragW + 'px';
                piece.style.height = fragH + 'px';
                piece.style.pointerEvents = 'none';
                piece.style.zIndex = 9999;
                piece.style.transformOrigin = 'center center';
                piece.style.willChange = 'transform, opacity';

                fragLayer.appendChild(piece);
                fragments.push({ el: piece, ox: left, oy: top });
            }
        }

        if (window.gsap) {
            gsap.set(logo, { opacity: 0.04, scale: 0.98 });
        } else {
            logo.classList.add('hidden');
        }

        if (window.gsap) {
            const tl = gsap.timeline();
            fragments.forEach(f => {
                const angle = Math.random() * Math.PI * 2;
                const dist = 80 + Math.random() * 260;
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist - (10 + Math.random() * 40);
                const rot = (Math.random() - 0.5) * 720;
                const dur = 0.8 + Math.random() * 0.7;
                tl.to(f.el, { x: tx, y: ty, rotation: rot, opacity: 0, ease: "power3.out", duration: dur }, 0);
            });

            const dustCount = Math.round((rect.width * rect.height) / 4000);
            for (let i = 0; i < dustCount; i++) {
                const d = document.createElement('div');
                const size = Math.random() * 3 + 0.8;
                d.style.position = 'fixed';
                d.style.width = d.style.height = size + 'px';
                d.style.left = rect.left + rect.width / 2 + 'px';
                d.style.top = rect.top + rect.height / 2 + 'px';
                d.style.borderRadius = '50%';
                d.style.background = 'rgba(255,255,255,0.95)';
                d.style.pointerEvents = 'none';
                d.style.zIndex = 9998;
                fragLayer.appendChild(d);
                gsap.to(d, {
                    x: (Math.random() - 0.5) * (150 + Math.random() * 300),
                    y: (Math.random() - 0.5) * (150 + Math.random() * 300),
                    opacity: 0,
                    scale: Math.random() * 1.6 + 0.3,
                    duration: 0.9 + Math.random() * 0.9,
                    ease: "power3.out",
                    onComplete: () => d.remove()
                });
            }

            await new Promise(r => setTimeout(r, 900));

            fragments.forEach(f => {
                gsap.set(f.el, { opacity: 0 });
                gsap.fromTo(f.el,
                    { x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, rotation: (Math.random() - 0.5) * 360, opacity: 0 },
                    { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.9 + Math.random() * 0.6, ease: "power2.out" }
                );
            });

            const cleanupDelay = 1100;
            setTimeout(() => {
                fragments.forEach(f => gsap.to(f.el, { opacity: 0, duration: 0.35, ease: "power1.out" }));
                gsap.to(logo, {
                    opacity: 1, scale: 1.02, duration: 0.35, ease: "back.out(1.4)", onComplete: () => {
                        gsap.to(logo, { scale: 1, duration: 0.25, ease: "power1.out" });
                        setTimeout(() => {
                            fragments.forEach(f => { try { f.el.remove(); } catch (e) { } });
                            logo.dataset.busy = "0";
                        }, 380);
                    }
                });
            }, cleanupDelay);

        } else {
            fragments.forEach((f, i) => {
                const angle = Math.random() * Math.PI * 2;
                const dist = 80 + Math.random() * 260;
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist - (10 + Math.random() * 40);
                f.el.style.transition = "transform 0.9s cubic-bezier(.2,.8,.2,1), opacity 0.9s";
                f.el.style.transform = `translate(${tx}px,${ty}px) rotate(${(Math.random()-0.5)*720}deg)`;
                f.el.style.opacity = "0";
            });
            logo.style.opacity = "0.04";
            setTimeout(() => {
                fragments.forEach(f => {
                    f.el.style.transform = "translate(0,0) rotate(0deg)";
                    f.el.style.opacity = "1";
                });
                setTimeout(() => {
                    fragments.forEach(f => { try { f.el.remove(); } catch (e) { } });
                    logo.style.opacity = "1";
                    logo.dataset.busy = "0";
                }, 1000);
            }, 900);
        }
    }

    logo.style.cursor = 'pointer';
    logo.addEventListener('click', createFragmentsAndAnimate);

    window.addEventListener('resize', () => {
        if (logo.dataset.busy !== "1") {
            try {
                const children = Array.from(fragLayer.children);
                children.forEach(ch => {
                    if (ch.tagName && (ch.tagName.toLowerCase() === 'canvas' || ch.tagName.toLowerCase() === 'div')) {
                        ch.remove();
                    }
                });
            } catch (e) { /* ignore */ }
        }
    });
}

// -----------------------------
// Dress fragment fall + rebuild effect
// -----------------------------
function setupDressFragmentFall(options = {}) {
    const cols = options.cols || 14;
    const rows = options.rows || 10;
    const strength = options.strength || 1;
    const fragLayerId = options.fragLayerId || 'fragLayer';

    const dress = document.querySelector('.dress-img');
    if (!dress) return;

    let fragLayer = document.getElementById(fragLayerId);
    if (!fragLayer) {
        fragLayer = document.createElement('div');
        fragLayer.id = fragLayerId;
        fragLayer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(fragLayer);
    }

    if (!dress.dataset) dress.dataset = {};

    async function fragmentAndFall() {
        if (dress.dataset.busy === "1") return;
        dress.dataset.busy = "1";

        if (!dress.complete) await new Promise(r => dress.onload = r);

        const rect = dress.getBoundingClientRect();
        const iw = rect.width;
        const ih = rect.height;

        const img = new Image();
        img.src = dress.src;
        try { await img.decode(); } catch (e) { /* ignore */ }

        const fragW = Math.ceil(iw / cols);
        const fragH = Math.ceil(ih / rows);

        const scaleX = img.naturalWidth / iw;
        const scaleY = img.naturalHeight / ih;

        const fragments = [];

        for (let yy = 0; yy < rows; yy++) {
            for (let xx = 0; xx < cols; xx++) {
                const sx = Math.floor(xx * fragW * scaleX);
                const sy = Math.floor(yy * fragH * scaleY);
                const sw = Math.ceil(fragW * scaleX);
                const sh = Math.ceil(fragH * scaleY);

                const canvas = document.createElement('canvas');
                canvas.width = sw;
                canvas.height = sh;
                canvas.className = 'dress-fragment-canvas';
                const cctx = canvas.getContext('2d');

                cctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

                const left = rect.left + xx * fragW;
                const top = rect.top + yy * fragH;

                canvas.style.left = left + 'px';
                canvas.style.top = top + 'px';
                canvas.style.width = fragW + 'px';
                canvas.style.height = fragH + 'px';
                canvas.style.transformOrigin = 'center center';
                canvas.style.opacity = '1';

                fragLayer.appendChild(canvas);
                fragments.push({ el: canvas, ox: left, oy: top });
            }
        }

        dress.style.visibility = 'hidden';

        if (window.gsap) {
            fragments.forEach((f, i) => {
                const randX = (Math.random() - 0.5) * (60 + Math.random() * 260) * strength;
                const randY = (120 + Math.random() * 320) * (0.9 + Math.random() * 0.6) * strength;
                const rot = (Math.random() - 0.5) * 360;
                const dur = 0.7 + Math.random() * 0.7;

                gsap.to(f.el, {
                    x: randX,
                    y: randY,
                    rotation: rot,
                    opacity: 0,
                    ease: "power3.in",
                    duration: dur
                });
            });

            const totalFallDelay = 1100;

            setTimeout(() => {
                fragments.forEach((f, i) => {
                    const delay = 120 + Math.random() * 220;
                    gsap.set(f.el, { opacity: 0 });
                    gsap.fromTo(f.el,
                        { x: f.el._gsap && f.el._gsap.x ? f.el._gsap.x : 0, y: f.el._gsap && f.el._gsap.y ? f.el._gsap.y : 0, rotation: (Math.random() - 0.5) * 200, opacity: 0 },
                        {
                            x: 0, y: 0, rotation: 0, opacity: 1,
                            duration: 0.9 + Math.random() * 0.6,
                            ease: "power2.out",
                            delay: delay / 1000,
                        }
                    );
                });

                const cleanupDelay = 1500;
                setTimeout(() => {
                    fragments.forEach(f => { try { f.el.remove(); } catch (e) { } });
                    dress.style.visibility = 'visible';
                    dress.dataset.busy = "0";
                }, cleanupDelay);

            }, totalFallDelay);

        } else {
            fragments.forEach(f => {
                const randX = (Math.random() - 0.5) * 200 * strength;
                const randY = 120 + Math.random() * 260;
                f.el.style.transition = "transform 0.9s ease-in, opacity 0.9s";
                f.el.style.transform = `translate(${randX}px, ${randY}px) rotate(${(Math.random()-0.5)*360}deg)`;
                f.el.style.opacity = '0';
            });

            setTimeout(() => {
                fragments.forEach(f => {
                    f.el.style.transition = "transform 1s ease-out, opacity 0.8s";
                    f.el.style.transform = `translate(0px,0px) rotate(0deg)`;
                    f.el.style.opacity = '1';
                });

                setTimeout(() => {
                    fragments.forEach(f => { try { f.el.remove(); } catch (e) { } });
                    dress.style.visibility = 'visible';
                    dress.dataset.busy = "0";
                }, 1200);
            }, 1000);
        }
    }

    dress.style.cursor = "pointer";
    dress.addEventListener('click', fragmentAndFall);

    dress.tabIndex = dress.tabIndex || 0;
    dress.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fragmentAndFall();
        }
    });

    window.addEventListener('resize', () => {
        if (dress.dataset.busy !== "1") {
            try {
                const children = Array.from(fragLayer.children);
                children.forEach(ch => {
                    if (ch.tagName && (ch.tagName.toLowerCase() === 'canvas' || ch.tagName.toLowerCase() === 'div')) {
                        ch.remove();
                    }
                });
            } catch (e) { /* ignore */ }
        }
    });
}

// -----------------------------
// Iniciar tudo no DOMContentLoaded
// -----------------------------
document.addEventListener("DOMContentLoaded", function() {
    // slideshow
    try { showSlides(slideIndex); startAutoSlide(); } catch(e) { /* ignore */ }

    // scroll fade-ins
    try { faders.forEach(fader => { appearOnScroll.observe(fader); }); } catch(e) { /* ignore */ }

    // effects
    try { createFireflies(); } catch(e) { /* ignore */ }
    try { startCountdown(); } catch(e) { /* ignore */ }

    // logo explosion
    try { setupFooterLogoExplosion({ cols: 12, rows: 8, style: 'C', fragLayerId: 'fragLayer' }); } catch (e) { console.error(e); }

    // dress fragment effect
    try { setupDressFragmentFall({ cols: 14, rows: 10, strength: 1.0, fragLayerId: 'fragLayer' }); } catch (e) { console.error(e); }
});
