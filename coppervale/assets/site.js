// Coppervale Land — concept build. Mobile nav, header state, contour canvas, form handling.
(function () {
  var header = document.querySelector('.site-header');
  var nav = document.querySelector('.nav');
  var btn = document.querySelector('.menu-btn');
  if (btn) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  addEventListener('scroll', function () { header.classList.toggle('scrolled', scrollY > 8); }, { passive: true });

  // Topographic contours: perturbed rings around a few summits, drawn in copper.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('canvas.topo').forEach(function (cv) {
    var ctx = cv.getContext('2d');
    var peaks = [
      { x: .78, y: .32, s: 1.3 }, { x: .18, y: .95, s: 2.1 }, { x: 1.05, y: 1.1, s: 3.7 }
    ];
    var w, h, t = 0;
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var span = Math.max(w, h);
      peaks.forEach(function (p) {
        for (var r = 14, i = 0; r < span * 1.1; r += 16, i++) {
          ctx.beginPath();
          for (var a = 0; a <= Math.PI * 2 + .01; a += .05) {
            var k = 1 + .16 * Math.sin(3 * a + p.s + t) + .07 * Math.sin(5 * a - r * .012 + p.s * 2) + .04 * Math.sin(9 * a + r * .02 - t * 1.4);
            var x = p.x * w + Math.cos(a) * r * k * 1.25, y = p.y * h + Math.sin(a) * r * k * .82;
            a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          var index = i % 5 === 0;
          ctx.strokeStyle = index ? 'rgba(184,115,50,.55)' : 'rgba(184,115,50,.22)';
          ctx.lineWidth = index ? 1.1 : .7;
          ctx.stroke();
        }
      });
    }
    size(); draw();
    addEventListener('resize', function () { size(); draw(); });
    if (!reduce) (function loop() { t += .0016; draw(); requestAnimationFrame(loop); })();
  });

  // Forms: validate in the page, then show the thank-you state.
  // In the Webflow build this is Webflow's native form handling with email notifications.
  document.querySelectorAll('form.cv').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      form.querySelectorAll('[required]').forEach(function (el) {
        var f = el.closest('.fld'), msg = f.querySelector('.msg'), bad = !el.value.trim();
        if (!bad && el.type === 'email') bad = !/^\S+@\S+\.\S+$/.test(el.value);
        if (!bad && el.type === 'tel') bad = el.value.replace(/\D/g, '').length < 10;
        f.classList.toggle('invalid', bad);
        if (msg) msg.textContent = bad ? (el.dataset.err || 'This field is required.') : '';
        if (bad) { ok = false; first = first || el; }
      });
      if (!ok) { first.focus(); return; }
      var b = form.querySelector('button[type=submit]');
      b.disabled = true; b.firstChild.textContent = 'Sending ';
      setTimeout(function () {
        var wrap = form.parentElement;
        var name = form.querySelector('[name=first]');
        var who = wrap.querySelector('.who');
        if (who && name) who.textContent = name.value.trim();
        wrap.classList.add('sent');
        wrap.querySelector('.success').focus();
      }, 700);
    });
  });
})();
