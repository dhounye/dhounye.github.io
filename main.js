/* Delphine Hounye — site scripts */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mobile menu */
  var burger = document.querySelector('.hamburger');
  var links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () { links.classList.toggle('open'); });
  }

  /* one subtle reveal pass on scroll */
  var toReveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    toReveal.forEach(function (el) { io.observe(el); });
  } else {
    toReveal.forEach(function (el) { el.classList.add('in'); });
  }

  /* counters */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step); else el.firstChild.nodeValue = target.toLocaleString('en-US');
    }
    if (reduce) { el.firstChild.nodeValue = target.toLocaleString('en-US'); return; }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* floating keyword tags in the hero */
  var field = document.querySelector('.tag-field');
  if (field) {
    var words = ['Stata', 'SurveyCTO', 'XLSForm', 'Back-check', 'HFC', 'Panel', 'Logit', 'R Shiny', 'Oaxaca-Blinder', 'Python',
      'KoboCollect', 'Survey Solutions', 'Impact evaluation', 'Baseline', 'Endline', 'Dashboard', 'Data cleaning', 'Enumerators',
      'CRVS', 'Afrobarometer', 'YOLOv8', 'Quantitative', 'Qualitative', 'Field supervision', 'Time series', 'QGIS'];
    var solidEvery = 5;
    for (var i = 0; i < words.length; i++) {
      var t = document.createElement('span');
      t.className = 'tag' + (i % solidEvery === 0 ? ' solid' : '');
      t.textContent = words[i];
      // keep tags away from the centre where the headline sits
      // keep tags off the text column: right band around the photo, or a thin strip above the text
      var onRight = Math.random() < 0.65;
      var left = onRight ? 54 + Math.random() * 42 : 2 + Math.random() * 44;
      var top = onRight ? 6 + Math.random() * 86 : 4 + Math.random() * 12;
      t.style.left = left + '%';
      t.style.top = top + '%';
      t.style.setProperty('--dur', (18 + Math.random() * 16).toFixed(1) + 's');
      t.style.setProperty('--delay', (-Math.random() * 30).toFixed(1) + 's');
      t.style.setProperty('--dx', ((Math.random() - 0.5) * 140).toFixed(0) + 'px');
      t.style.setProperty('--dy', (-(120 + Math.random() * 220)).toFixed(0) + 'px');
      t.style.setProperty('--rot', ((Math.random() - 0.5) * 10).toFixed(1) + 'deg');
      field.appendChild(t);
    }
  }

  /* particles that gather into her first name behind the headline */
  var canvas = document.getElementById('nameParticles');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var word = canvas.getAttribute('data-word') || 'DELPHINE';
    var particles = [], targets = [], W, H, dpr;
    var mouse = { x: -9999, y: -9999 };

    function buildTargets() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var off = document.createElement('canvas');
      off.width = W; off.height = H;
      var oc = off.getContext('2d');
      var size = Math.min(W * 0.11, 150);
      oc.font = '700 ' + size + 'px Ubuntu, sans-serif';
      oc.textAlign = 'center'; oc.textBaseline = 'middle';
      oc.fillStyle = '#fff';
      oc.fillText(word, W * 0.36, H * 0.5);
      var data = oc.getImageData(0, 0, W, H).data;
      targets = [];
      var gap = W < 700 ? 5 : 4;
      for (var y = 0; y < H; y += gap) {
        for (var x = 0; x < W; x += gap) {
          if (data[(y * W + x) * 4 + 3] > 128) targets.push({ x: x, y: y });
        }
      }
      // shuffle and cap
      targets.sort(function () { return Math.random() - 0.5; });
      var cap = W < 700 ? 900 : 2200;
      if (targets.length > cap) targets = targets.slice(0, cap);
      particles = targets.map(function (t) {
        return { x: Math.random() * W, y: Math.random() * H, tx: t.x, ty: t.y,
          vx: 0, vy: 0, r: 0.9 + Math.random() * 1.4, a: 0.3 + Math.random() * 0.45, ph: Math.random() * Math.PI * 2 };
      });
    }

    var t0 = performance.now();
    function frame(now) {
      var elapsed = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // gentle breathing offset so the word never sits perfectly still
        var ox = Math.sin(elapsed * 0.8 + p.ph) * 2.2, oy = Math.cos(elapsed * 0.6 + p.ph) * 2.2;
        var dx = (p.tx + ox) - p.x, dy = (p.ty + oy) - p.y;
        p.vx += dx * 0.02; p.vy += dy * 0.02;
        // mouse repulsion
        var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
        if (md < 9000) { var f = (9000 - md) / 9000; p.vx += mx * f * 0.06; p.vy += my * f * 0.06; }
        p.vx *= 0.86; p.vy *= 0.86;
        p.x += p.vx; p.y += p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(163,179,255,' + p.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    function onResize() { buildTargets(); }
    var hero = canvas.parentElement;
    hero.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', onResize);

    // wait for the webfont so the letter shapes are right
    if (document.fonts && document.fonts.load) {
      document.fonts.load('700 100px Ubuntu').then(function () { buildTargets(); requestAnimationFrame(frame); });
    } else { buildTargets(); requestAnimationFrame(frame); }
  }
})();
