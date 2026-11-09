/* =========================================================
   BOBI'S VALLEY – interazioni
   1. Menu mobile e tendina Social Media
   2. Ombra dell'header e riflesso "liquid glass"
   3. Carosello dei Bobis (3D, trascinabile, infinito)
   4. Comparsa delle sezioni allo scroll
   5. Anno nel footer
   Ogni blocco controlla che gli elementi esistano: lo script
   funziona anche nelle pagine interne.
   ========================================================= */
(function () {
    'use strict';
    var $ = function (s) { return document.querySelector(s); };
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Immagini: se un file ha il nome un po' diverso (es. bobi-brie_1.png o "bobi-brie (1).png") lo cerca da solo ---------- */
    function rescue(img) {
        var tries = img._tries || (img._tries = ['_1', ' (1)']);
        var base = img._base || (img._base = img.getAttribute('src').replace(/\.(png|jpe?g|webp)$/i, ''));
        var ext = (img.getAttribute('src').match(/\.(png|jpe?g|webp)$/i) || ['', 'png'])[0];
        if (!tries.length) return;
        img.src = encodeURI(base + tries.shift() + (ext.charAt(0) === '.' ? ext : '.' + ext));
    }
    document.addEventListener('error', function (e) { if (e.target.tagName === 'IMG') rescue(e.target); }, true);
    document.querySelectorAll('img').forEach(function (img) { if (img.complete && img.naturalWidth === 0) rescue(img); });

    /* ---------- 1. Menu ---------- */
    var toggle = $('.nav-toggle'), menu = $('#menu'), sub = $('.has-sub'), subBtn = $('.sub-toggle');
    function setMenu(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
        menu.classList.toggle('open', open);
    }
    function setSub(open) {
        if (!sub) return;
        sub.classList.toggle('open', open);
        subBtn.setAttribute('aria-expanded', String(open));
    }
    if (toggle && menu) {
        toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) { setMenu(false); setSub(false); }
        });
    }
    if (subBtn) subBtn.addEventListener('click', function () { setSub(!sub.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (sub && !sub.contains(e.target)) setSub(false); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { if (toggle) setMenu(false); setSub(false); }
    });

    /* ---------- 2. Header e riflesso del vetro ---------- */
    var header = $('.site-header');
    function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.addEventListener('pointermove', function (e) {
        var g = e.target.closest && e.target.closest('.glass');
        if (!g) return;
        var r = g.getBoundingClientRect();
        g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        g.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    /* ---------- 3. Carosello dei Bobis ---------- */
    var stage = $('#stage');
    if (stage) {
        // f = nome del file bobi-<f>.png, c = colore della carta, a = colore d'accento
        var D = [
            { n: 'Brie',     f: 'brie',     c: '#fff1a0', a: '#f2b705', t: 'Un formaggino morbidissimo. Ama i pisolini al sole e le coccole!' },
            { n: 'Bruli',    f: 'bruli',    c: '#ffd3da', a: '#c8243a', t: 'Una piccola bottiglia di vino rosso, timida ma tanto dolce.' },
            { n: 'Bolli',    f: 'bolli',    c: '#e3e9f4', a: '#8d9ab3', t: 'Un pentolino scoppiettante: quando è felice fa le bollicine!' },
            { n: 'Bobish',   f: 'bobish',   c: '#ffd6e5', a: '#ff6f9f', t: 'Un pesciolino rosa tutto da coccolare. Adora le onde del molo!' },
            { n: 'Balga',    f: 'balga',    c: '#cff5df', a: '#2fc384', t: 'Un\u2019alga dolce che dondola piano. Fa il solletico a chi nuota vicino.' },
            { n: 'Bobella',  f: 'bobella',  c: '#ffdcc8', a: '#ff8f4d', t: 'Una stellina marina arancione, timida ma coccolona. Brilla al tramonto!' },
            { n: 'Biana',    f: 'biana',    c: '#d6f6dc', a: '#46c764', t: 'Un Bobi liana: si arrampica ovunque e abbraccia tutti coi suoi riccioli verdi!' },
            { n: 'Bobisole', f: 'bobisole', c: '#fff0b8', a: '#ffb81f', t: 'Un Bobi girasole: segue il sole con lo sguardo e porta allegria ovunque.' },
            { n: 'Bosa',     f: 'bosa',     c: '#ffd5e1', a: '#ee3f78', t: 'Un Bobi rosa: profumatissimo, un po\u2019 timido e sempre elegante.' }
        ];
        var N = D.length, cards = [], dots = [];
        var pos = 0, target = 0, dragging = false, dirty = true, S = 220, active = -1;
        var sec = $('#bobis'), live = $('#live'), dotsBox = $('#dots'), lastTouch = 0, hover = false, visible = true;

        D.forEach(function (d, i) {
            var el = document.createElement('article');
            el.className = 'bcard glass';
            el.style.setProperty('--c', d.c);
            el.style.setProperty('--a', d.a);
            el.setAttribute('aria-label', d.n + ', Bobi numero ' + (i + 1));
            el.innerHTML = '<p class="bnum">BOBI #' + (i + 1) + '</p>' +
                '<div class="bart"><img src="bobi-' + d.f + '.png" alt="' + d.n + '" draggable="false"><i class="bshadow"></i></div>' +
                '<h3 class="bname">' + d.n + '</h3><p class="bdesc">' + d.t + '</p>';
            stage.appendChild(el);
            cards.push(el);

            var b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', 'Vai a ' + d.n);
            b.addEventListener('click', function () { goTo(i); });
            dotsBox.appendChild(b);
            dots.push(b);
        });

        function wrap(v) { return ((v + N / 2) % N + N) % N - N / 2; }          // distanza con segno, in [-N/2, N/2)
        function idx() { return ((Math.round(pos) % N) + N) % N; }
        function kick() { dirty = true; lastTouch = performance.now(); }
        function goTo(i) { var r = Math.round(target); target = r + wrap(i - r); kick(); }
        function step(n) { target = Math.round(target) + n; kick(); }

        function render() {
            S = (cards[0].offsetWidth || 260) * 0.72;
            cards.forEach(function (el, i) {
                var o = wrap(i - pos), a = Math.abs(o);
                if (a > 3.2) { el.style.visibility = 'hidden'; return; }   // visibility (non display): la larghezza resta misurabile
                el.style.visibility = '';
                var x = Math.sign(o) * (a < 1 ? a * S : S + (a - 1) * S * 0.5);
                var ry = Math.max(-50, Math.min(50, -o * 34));
                var z = -Math.min(a, 2.5) * 140;
                var sc = 1 - Math.min(a, 2.5) * 0.07;
                el.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + ry.toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
                el.style.opacity = Math.max(0, 1 - Math.max(0, a - 1.2) * 0.55).toFixed(2);
                el.style.zIndex = 100 - Math.round(a * 10);
                el.style.pointerEvents = a > 2.6 ? 'none' : '';
                el.classList.toggle('is-active', a < 0.5);
                el.setAttribute('aria-hidden', a < 0.5 ? 'false' : 'true');
            });
            var k = idx();
            if (k !== active) {                       // cambia il Bobi in primo piano
                active = k;
                dots.forEach(function (b, j) { b.classList.toggle('on', j === k); });
                sec.style.setProperty('--tint', D[k].a);
                sec.style.setProperty('--tint2', D[k].c);
                live.textContent = D[k].n + ' (' + (k + 1) + ' di ' + N + ')';
            }
        }

        // un solo ciclo di animazione: calcola solo quando qualcosa si muove
        function tick() {
            if (!dragging) {
                var diff = target - pos;
                if (Math.abs(diff) > 0.0005) { pos += diff * (reduced ? 1 : 0.11); dirty = true; }
                else if (pos !== target) { pos = target; dirty = true; }
            }
            if (dirty) { render(); dirty = false; }
            requestAnimationFrame(tick);
        }

        /* trascinamento (mouse, touch, penna) con inerzia */
        var sx = 0, sp = 0, lx = 0, lt = 0, v = 0, moved = 0;
        stage.addEventListener('pointerdown', function (e) {
            dragging = true; moved = 0; sx = lx = e.clientX; sp = pos; lt = performance.now(); v = 0;
            stage.setPointerCapture(e.pointerId); stage.classList.add('grab'); kick();
        });
        stage.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            var now = performance.now(), dt = Math.max(now - lt, 1);
            v = 0.8 * v + 0.2 * ((e.clientX - lx) / dt);
            lx = e.clientX; lt = now;
            moved = Math.max(moved, Math.abs(e.clientX - sx));
            pos = sp - (e.clientX - sx) / S;
            dirty = true; lastTouch = now;
        });
        function release(e) {
            if (!dragging) return;
            dragging = false; stage.classList.remove('grab');
            if (moved < 6) {                          // è un clic: porta davanti la carta toccata
                var c = document.elementFromPoint(e.clientX, e.clientY);
                c = c && c.closest('.bcard');
                if (c) { goTo(cards.indexOf(c)); return; }
            }
            var inertia = Math.max(-2, Math.min(2, -v * 320 / S));
            target = Math.round(pos + inertia); kick();
        }
        stage.addEventListener('pointerup', release);
        stage.addEventListener('pointercancel', release);

        stage.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
            if (e.key === 'ArrowLeft')  { step(-1); e.preventDefault(); }
        });
        $('#next').addEventListener('click', function () { step(1); });
        $('#prev').addEventListener('click', function () { step(-1); });
        window.addEventListener('resize', function () { dirty = true; });

        /* scorrimento automatico: si ferma se ci passi sopra, se interagisci o se esci dalla sezione */
        var car = $('#carousel');
        car.addEventListener('mouseenter', function () { hover = true; });
        car.addEventListener('mouseleave', function () { hover = false; });
        car.addEventListener('focusin', function () { hover = true; });
        car.addEventListener('focusout', function () { hover = false; });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.3 }).observe(car);
        }
        if (!reduced) {
            setInterval(function () {
                if (visible && !hover && !dragging && performance.now() - lastTouch > 4500) step(1);
            }, 3800);
        }
        requestAnimationFrame(tick);
    }

    /* ---------- 4. Comparsa allo scroll ---------- */
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('visible');
                    obs.unobserve(en.target);
                    setTimeout(function () { en.target.style.transitionDelay = ''; }, 1000);
                }
            });
        }, { threshold: 0.15 });
        items.forEach(function (el, i) {
            el.style.transitionDelay = (i % 3) * 80 + 'ms';
            obs.observe(el);
        });
    } else {
        items.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Messaggio "stiamo lavorando" per i collegamenti non ancora pronti (attributo data-soon) ---------- */
    var toastEl, toastT;
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('[data-soon]');
        if (!a) return;
        e.preventDefault();
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast glass';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = '\uD83D\uDEE0\uFE0F Stiamo ancora lavorando a questa parte del sito. Torna presto!';
        void toastEl.offsetWidth;
        toastEl.classList.add('show');
        clearTimeout(toastT);
        toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3400);
    });

    /* ---------- 5. Anno ---------- */
    var anno = $('#anno');
    if (anno) anno.textContent = new Date().getFullYear();
})();
