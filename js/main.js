'use strict';

/* ─── Particle Canvas ─── */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, animFrame;

  const PARTICLE_COUNT = 80;
  const PRIMARY = '0, 180, 255';
  const ACCENT  = '123, 47, 247';

  class Particle {
    constructor() { this.reset(true); }

    reset(initial) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.r  = Math.random() * 1.8 + 0.5;
      this.life = 1;
      this.decay = Math.random() * 0.003 + 0.001;
      this.color = Math.random() > 0.5 ? PRIMARY : ACCENT;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.life * 0.7})`;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    const DIST = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          const alpha = (1 - d / DIST) * 0.18 * Math.min(particles[i].life, particles[j].life);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${PRIMARY}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    initParticles();
    if (animFrame) cancelAnimationFrame(animFrame);
    loop();
  }

  window.addEventListener('resize', () => { resize(); });
  start();
})();

/* ─── Sticky Header ─── */
(function () {
  const header = document.getElementById('site-header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── Mobile Nav ─── */
(function () {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('main-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ─── Animated Counters ─── */
(function () {
  const nums = document.querySelectorAll('.stat-number[data-target]');
  if (!nums.length) return;

  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();
    const easeOut  = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.floor(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
})();

/* ─── Scroll-reveal (AOS substitute) ─── */
(function () {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => entry.target.classList.add('aos-visible'), parseInt(delay, 10));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ─── Smooth active nav highlight ─── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ─── Contact Form ─── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const WEB3FORMS_KEY = 'a56190a4-a745-4731-9d89-9bbd676b367e';

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const name    = form.querySelector('#name').value.trim();
    const phone   = form.querySelector('#phone').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const service = form.querySelector('#service').value;
    const message = form.querySelector('#message').value.trim();
    const sameday = form.querySelector('#sameday').checked;

    if (!name)    { showError('Please enter your name.'); return; }
    if (!phone)   { showError('Please enter your phone number.'); return; }
    if (!service) { showError('Please select a service.'); return; }

    btn.disabled = true;
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin-btn 1s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Sending...
    `;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Quote Request – ${service} – ${name}`,
          from_name: 'The Fiber Dad Website',
          name,
          phone,
          email: email || 'Not provided',
          service,
          message: message || 'No additional details provided.',
          same_day: sameday ? 'Yes – urgent' : 'No'
        })
      });

      const data = await res.json();

      if (data.success) {
        form.innerHTML = `
          <div class="form-success show">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="1.5" style="display:block;margin:0 auto 20px">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>Got it, ${esc(name)}!</h3>
            <p>I'll reach out to <strong>${esc(phone)}</strong> within 2 hours to discuss your project and provide a free quote.</p>
            <p style="margin-top:12px">Need help right now? Call <a href="tel:+18654050828" style="color:var(--primary)">(865) 405-0828</a></p>
          </div>
        `;
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Send My Free Quote Request
      `;
      showError('Something went wrong. Please call us directly at (865) 405-0828.');
    }
  });

  function showError(msg) {
    let el = form.querySelector('.form-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#ff5f5f;font-size:.88rem;margin-top:12px;text-align:center;';
      form.appendChild(el);
    }
    el.textContent = msg;
    setTimeout(() => el.remove(), 5000);
  }
})();

/* ─── Floating CTA hide on contact section ─── */
(function () {
  const cta     = document.querySelector('.floating-cta');
  const contact = document.getElementById('contact');
  if (!cta || !contact) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      cta.style.opacity      = entry.isIntersecting ? '0' : '1';
      cta.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
    });
  }, { threshold: 0.2 });

  io.observe(contact);
})();

/* ─── Nav active style injection ─── */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .main-nav a.active { color: var(--primary) !important; }
    @keyframes spin-btn { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();
