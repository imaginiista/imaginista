document.addEventListener('DOMContentLoaded', () => {

    /* =============================
    HELPERS
    ============================= */
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    function byId(id){ return document.getElementById(id); }
    function safe(id, evt, fn){ const el = byId(id); if(!el){ console.warn('Elemento faltando:', id); return; } el.addEventListener(evt, fn); }

    /* =============================
    Respect reduced motion
    ============================= */
    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =============================
    LOOP PRINCIPAL DE ANIMAÇÃO (Waves + Refraction)
    - Consolidação de animacoes para usar requestAnimationFrame (melhor performance)
    ============================= */
    let t = 0;
    let f1 = 0.006, f2 = 0.018, dir = 1;
    let lastRefractionUpdate = performance.now();
    const REFRACTION_INTERVAL = 220; // Atualiza a refração a cada 220ms

    function mainLoop(time) {
        if (!REDUCE) {
            t += 0.0026;

            // 1. Animação das Ondas (SVG Path Morph)
            const path = document.getElementById('wavePath');
            if (path) {
                const a = 40 + Math.sin(t * 2.05) * 18;
                const b = 120 + Math.cos(t * 1.65) * 12;
                const c = 80 + Math.sin(t * 1.1) * 10;
                const d = 140 + Math.cos(t * 0.9) * 8;
                const dAttr = `M0 100 C200 ${a} 400 ${b} 600 100 C800 ${c} 1000 ${d} 1200 100 L1200 160 L0 160 Z`;
                path.setAttribute('d', dAttr);
            }

            // 2. Animação da Refração (SVG Filter) - Atualiza em intervalos
            const turb = document.querySelector('feTurbulence#turb');
            if (turb && (time - lastRefractionUpdate > REFRACTION_INTERVAL)) {
                f1 += 0.0008 * dir;
                f2 += 0.0009 * dir;
                if (f1 > 0.01 || f1 < 0.004) dir *= -1;
                turb.setAttribute('baseFrequency', `${f1} ${f2}`);
                lastRefractionUpdate = time;
            }
        }
        requestAnimationFrame(mainLoop);
    }
    requestAnimationFrame(mainLoop);
    // Fim da consolidação

    /* =============================
    PARTICLES / BUBBLES (Geração dinâmica)
    =============================*/
    (function makeBubbles(){
        const container = byId('particles');
        if(!container || REDUCE) return;
        const count = 18;
        const styleSheet = document.createElement('style');
        document.head.appendChild(styleSheet);
        
        for(let i=0;i<count;i++){
            const b = document.createElement('div');
            b.className = 'bubble';
            const size = Math.round(Math.random()*60)+8;
            b.style.width = size+'px';
            b.style.height = size+'px';
            b.style.left = (Math.random()*100)+'%';
            b.style.top = (40 + Math.random()*50)+'%';
            b.style.opacity = (0.02 + Math.random()*0.08).toFixed(2);

            // keyframes dinâmicos para cada bolha
            const dur = (8 + Math.random()*14).toFixed(1);
            const driftX = (-30 + Math.random()*60).toFixed(1);
            const rise = Math.round(60 + Math.random()*160);
            const keyName = `bubble${i}`;
            const keyframes = `@keyframes ${keyName} {
                0% { transform: translate(0,0) scale(0.98); opacity:${b.style.opacity} }
                50% { transform: translate(${driftX}px, -${rise}px) scale(1.04); opacity:${(parseFloat(b.style.opacity) + 0.06).toFixed(2)} }
                100% { transform: translate(0,0) scale(0.98); opacity:${b.style.opacity} }
            }`;
            try {
                styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
            } catch (e) {
                styleSheet.innerHTML += keyframes; // Fallback
            }
            
            b.style.animation = `${keyName} ${dur}s ease-in-out ${ (Math.random()*4).toFixed(2) }s infinite`;
            container.appendChild(b);
        }
    })();

    /* =============================
    LOGO SHINE (canvas)
    =============================*/
    (function logoShine(){
        const logoWrap = document.querySelector('.logo');
        if(!logoWrap || REDUCE) return;
        const canvas = logoWrap.querySelector('.shine');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        
        function resize(){
            canvas.width = logoWrap.clientWidth * devicePixelRatio;
            canvas.height = logoWrap.clientHeight * devicePixelRatio;
            canvas.style.width = logoWrap.clientWidth + 'px';
            canvas.style.height = logoWrap.clientHeight + 'px';
            ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
        }
        resize();
        window.addEventListener('resize', resize, {passive:true});
        
        let t = 0;
        function draw(){
            t += 0.02;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            const w = canvas.width / devicePixelRatio, h = canvas.height / devicePixelRatio;
            
            const grad = ctx.createLinearGradient(-w + Math.sin(t)*w, 0, w + Math.cos(t)*w, 0);
            grad.addColorStop(0,'rgba(255,255,255,0)');
            grad.addColorStop(0.45,'rgba(255,255,255,0.06)');
            grad.addColorStop(0.5,'rgba(255,255,255,0.14)');
            grad.addColorStop(0.55,'rgba(255,255,255,0.04)');
            grad.addColorStop(1,'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,w,h);
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    })();


    /* =============================
    IntersectionObserver -> inview (fadeUp + stagger)
    =============================*/
    (function observeInView(){
        const STAGGER_CLS = '.stagger-el'; 
        $$('.person, .item-row, .checkline, .badge, .map-actions, .add-inline, h3').forEach(el => {
            el.classList.add(STAGGER_CLS.slice(1)); 
        });

        if(REDUCE) { $$('.fadeInUp').forEach(el=>el.classList.add('inview')); return; }
        const els = $$('.fadeInUp');
        
        const io = new IntersectionObserver((entries)=>{
            entries.forEach((entry)=>{
                if(entry.isIntersecting){
                    entry.target.classList.add('inview');
                    
                    const staggerEls = entry.target.querySelectorAll(STAGGER_CLS);
                    staggerEls.forEach((s, idx)=>{
                        s.style.transitionDelay = (idx * 50) + 'ms';
                    });

                    io.unobserve(entry.target);
                }
            });
        },{threshold:0.12});
        
        els.forEach(el=>io.observe(el));
    })();

    /* =============================
    PARALLAX on scroll
    =============================*/
    (function setupParallax(){
        if(REDUCE) return;
        const par = document.querySelectorAll('[data-parallax]');
        let isTicking = false;

        function updateParallax(){
            const sc = window.scrollY;
            par.forEach(el=>{
                const v = parseFloat(el.dataset.parallax || 0.02);
                el.style.transform = `translateY(${-(sc * v)}px)`;
                
                // Opacidade e sombra (mantendo a lógica original)
                const rect = el.getBoundingClientRect();
                const factor = Math.max(0, Math.min(1, 1 - Math.abs(rect.top) / (window.innerHeight*0.8)));
                el.style.opacity = 0.7 + 0.3*factor;
                el.style.boxShadow = `0 ${8 + (1-factor)*12}px ${20 + (1-factor)*30}px rgba(0,0,0,${0.35+(1-factor)*0.2})`;
            });
            isTicking = false;
        }

        function onScroll(){
            if(!isTicking){
                requestAnimationFrame(updateParallax);
                isTicking = true;
            }
        }
        window.addEventListener('scroll', onScroll, {passive:true});
        updateParallax();
    })();

    /* =============================
    MAP ZOOM (tap to zoom) + vibra
    =============================*/
    (function mapZoom(){
        const mapWrap = byId('map-card');
        const mapImg = byId('map-image');
        if(!mapWrap || !mapImg) return;
        let zoomed = false;
        mapImg.addEventListener('click', (e)=>{
            if(REDUCE) return;
            e.preventDefault(); 
            zoomed = !zoomed;
            if(zoomed){
                mapWrap.classList.add('zoomed');
                navigator.vibrate && navigator.vibrate(10);
            } else {
                mapWrap.classList.remove('zoomed');
                navigator.vibrate && navigator.vibrate(8);
            }
        });
    })();

    /* =============================
    BUTTONS: Waze / Google / scroll / highlight
    =============================*/
    const MAP_ADDRESS = 'Aldeia das Águas Park Resort, BR 393, KM 270 — Dorândia, Barra do Piraí — RJ';
    const MAP_COORD = '-22.486240,-43.962974';

    safe('open-waze','click', ()=> {
        navigator.vibrate && navigator.vibrate(12);
        window.open(`https://waze.com/ul?ll=${MAP_COORD}&navigate=yes`, '_blank');
    });

    safe('open-google','click', ()=> {
        navigator.vibrate && navigator.vibrate(8);
        // CORREÇÃO: Uso da URL correta para o Google Maps
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_ADDRESS)}`, '_blank');
    });

    safe('open-checklist','click', ()=> {
        const target = byId('checklist-card');
        target?.scrollIntoView({behavior:'smooth',block:'center'});
        navigator.vibrate && navigator.vibrate(6);
        if(target){ target.style.transition='box-shadow 220ms var(--ease)'; target.style.boxShadow='0 24px 50px rgba(0,0,0,0.6)'; setTimeout(()=>target.style.boxShadow='var(--shadow-1)',420); }
    });

    safe('open-map','click', ()=> {
        const t = byId('map-card');
        t?.scrollIntoView({behavior:'smooth',block:'center'});
        navigator.vibrate && navigator.vibrate(6);
        if(t){ t.style.transition='transform 260ms var(--ease)'; t.style.transform='scale(1.02)'; setTimeout(()=>t.style.transform='none',260); }
    });

    /* =============================
    CHECKLIST (save/load/add/check animation/remove)
    =============================*/
    const CHECK_KEY = 'aldeia_check_v5';

    function createRemoveButton(labelElement){
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '&#10005;'; // X simples
        removeBtn.title = 'Remover item';
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            labelElement.remove();
            saveChecklist();
            navigator.vibrate && navigator.vibrate(8);
        });
        return removeBtn;
    }

    function addExtraToDOM(text, isChecked = false){
        const div = document.createElement('label');
        div.className=`checkline extra ${isChecked ? 'checked' : ''} stagger-el`;
        const key = `extra-${Date.now() + Math.random()}`;
        div.innerHTML = `<input type='checkbox' data-key='${key}' ${isChecked ? 'checked' : ''}> ${text}`; 
        
        // Adiciona o botão de remoção apenas para itens extras
        div.appendChild(createRemoveButton(div)); 

        const ref = document.querySelector('#checklist .add-inline');
        ref.parentElement.insertBefore(div, ref);

        if(!isChecked) {
            div.classList.add('micro-bounce');
            setTimeout(()=> div.classList.remove('micro-bounce'), 420);
        }

        const cb = div.querySelector('input');
        cb.addEventListener('change', ()=>{
            saveChecklist();
            if(cb.checked){ div.classList.add('checked'); } else { div.classList.remove('checked'); }
        });
        return div;
    }

    function loadChecklist(){
        try{
            const raw = localStorage.getItem(CHECK_KEY);
            if(!raw) return;
            const obj = JSON.parse(raw);
            
            // Carrega itens predefinidos
            document.querySelectorAll('#checklist label:not(.extra) input[type=checkbox]').forEach(cb=>{
                const key = cb.dataset.key;
                if(key && obj[key]) { 
                    cb.checked = true; 
                    cb.parentElement.classList.add('checked'); 
                }
            });
            
            // Carrega itens extras
            if(obj._extra && Array.isArray(obj._extra)) {
                obj._extra.forEach(item => addExtraToDOM(item.text, item.checked));
            }
        }catch(e){ console.warn('loadChecklist error', e); }
    }

    function saveChecklist(){
        const obj = {};
        const extras = [];
        
        // Salva o status dos itens predefinidos
        document.querySelectorAll('#checklist label:not(.extra) input[type=checkbox]').forEach(cb=>{
            const key = cb.dataset.key;
            if(key) { obj[key] = !!cb.checked; }
        });
        
        // Salva o conteúdo e status dos itens extras (sem os botões de remoção no texto)
        document.querySelectorAll('#checklist .extra').forEach(x=>{
            // Extrai o texto do item, removendo o conteúdo do botão de remoção para salvar apenas o nome.
            const textContent = Array.from(x.childNodes).filter(node => node.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
            const checked = x.querySelector('input').checked;
            if(textContent) { // Garante que não está salvando um item vazio
                extras.push({text: textContent, checked: checked});
            }
        });
        
        obj._extra = extras;
        localStorage.setItem(CHECK_KEY, JSON.stringify(obj));
    }

    safe('add-btn','click', ()=>{
        const inputEl = byId('new-item');
        const v = inputEl.value.trim();
        if(!v) return;
        addExtraToDOM(v);
        inputEl.value = '';
        saveChecklist();
        const btn = byId('add-btn');
        btn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});
    });

    // checkbox animation + save para itens predefinidos
    document.querySelectorAll('#checklist label:not(.extra) input[type=checkbox]').forEach(cb=>{
        cb.addEventListener('change', ()=>{
            const el = cb.parentElement;
            if(cb.checked){
                el.classList.add('checked');
                el.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:260});
            } else {
                el.classList.remove('checked');
            }
            saveChecklist();
            navigator.vibrate && navigator.vibrate(6);
        });
    });

    loadChecklist();

    /* =============================
    SHARING (WhatsApp) + button shine/pulse + Toast Feedback
    =============================*/
    function showToast(message){
        let toast = byId('toast-feedback');
        if(!toast){
            toast = document.createElement('div');
            toast.id = 'toast-feedback';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(()=> toast.classList.remove('show'), 3000);
    }
    
    function collectChecklist(onlyMarked){
        const lines = [];
        document.querySelectorAll('#checklist .checkline').forEach(lbl=>{
            const cb = lbl.querySelector('input');
            // Lógica para extrair texto do item sem o botão de remoção
            const text = Array.from(lbl.childNodes)
                            .filter(node => node.nodeType === 3)
                            .map(n => n.textContent.trim())
                            .join(' ')
                            .trim();

            if(onlyMarked){ if(cb.checked) lines.push('✅ '+text); }
            else lines.push((cb.checked ? '✅ ' : '[ ] ') + text);
        });
        return lines;
    }

    function animateButton(id){
        const b = byId(id);
        if(!b) return;
        b.classList.add('pulse');
        b.classList.add('shine');
        setTimeout(()=>{ b.classList.remove('pulse'); b.classList.remove('shine'); }, 900);
    }
    
    const SHARE_HEADER = `Aldeia das Águas — Checklist e logística\nPonto: Estação Santíssimo (Av. de Santa Cruz, 9591)\nSaída sugerida: 06:10 (chegar 09:20)\n\n`;

    safe('share-marked','click', ()=>{
        const lines = collectChecklist(true);
        if(lines.length===0){ alert('Nenhum item marcado para compartilhar.'); return; }
        animateButton('share-marked');
        const text = encodeURIComponent(SHARE_HEADER + lines.join('\n'));
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        navigator.vibrate && navigator.vibrate(10);
        showToast('Itens marcados prontos para o WhatsApp!');
    });

    safe('share-all','click', ()=>{
        animateButton('share-all');
        const lines = collectChecklist(false);
        const text = encodeURIComponent(SHARE_HEADER + lines.join('\n'));
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        navigator.vibrate && navigator.vibrate(10);
        showToast('Checklist completo pronto para o WhatsApp!');
    });

    /* =============================
    Button touch ripple + hover interactions
    =============================*/
    (function attachButtonEffects(){
        const btns = Array.from(document.querySelectorAll('.btn'));
        btns.forEach(btn=>{
            if(!REDUCE) {
                // Efeito hover
                btn.addEventListener('pointerenter', ()=>{ btn.style.transform='translateY(-3px)'; });
                btn.addEventListener('pointerleave', ()=>{ btn.style.transform='none'; });
            }
            
            btn.addEventListener('pointerdown', (ev)=>{
                if(REDUCE) return;
                // Efeito Ripple
                const r = document.createElement('span');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 1.2;
                
                r.style.cssText = `
                    position:absolute; width:${size}px; height:${size}px;
                    left:${ev.clientX - rect.left - size/2}px;
                    top:${ev.clientY - rect.top - size/2}px;
                    border-radius:50%; background:rgba(255,255,255,0.08); pointer-events:none;
                    transform:scale(0); opacity:0.95; transition:transform 420ms cubic-bezier(.2,.9,.3,1), opacity 420ms;
                `;
                btn.appendChild(r);
                requestAnimationFrame(()=> r.style.transform='scale(1)');
                setTimeout(()=>{ r.style.opacity='0'; setTimeout(()=>r.remove(),450); },420);
            });
        });
    })();

    /* =============================
    INITIAL FADE-IN & Loading Overlay Removal
    =============================*/
    // Anima as primeiras cartas imediatamente após o carregamento
    $$('.fadeInUp').slice(0,3).forEach((el, i)=> setTimeout(()=> {
        el.classList.add('inview');
        // Inicia o stagger nos elementos internos
        el.querySelectorAll('.stagger-el').forEach((s, idx)=>{
            s.style.transitionDelay = (idx * 50) + 'ms';
        });
    }, i*80));
    
    // Remove a camada de loading para revelar o conteúdo
    const loading = byId('loading-overlay');
    if(loading) {
        setTimeout(()=>{
            loading.style.opacity = '0';
            setTimeout(()=> loading.remove(), 300);
        }, 300);
    }
});

/* =============================
End of main.js
=============================*/