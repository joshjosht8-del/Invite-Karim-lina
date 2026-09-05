/* ===================================================================
   CONFIG — modifiez uniquement cette section pour personnaliser
   l'invitation pour un nouveau client (nom, date, lieu, musique...)
   =================================================================== */
const CONFIG = {
  names: { bride: "Lina", groom: "Karim" },
  initials: "L&K",
  weddingDateISO: "2026-09-27T16:00:00+01:00", // date + heure de la cérémonie
  venue: {
    name: "Domaine des Oliviers",
    address: "12 Route des Collines, Alger",
    mapQuery: "Alger"
  },
  music: {
    autoplayOnOpen: true,
    src: "assets/theme-song.mp3"
  },
  formspreeEndpoint: "https://formspree.io/f/VOTRE_ID_FORMSPREE"
};

/* ===================================================================
   ENVELOPE — clic sur le cachet = ouverture + révélation du site
   =================================================================== */
(function initEnvelope(){
  const screen   = document.getElementById('envelope-screen');
  const envelope = document.getElementById('envelope');
  const seal     = document.getElementById('wax-seal');
  const main     = document.getElementById('invitation');
  const audio    = document.getElementById('theme-song');

  function openInvitation(){
    if (envelope.classList.contains('is-opening')) return;
    envelope.classList.add('is-opening');

    if (CONFIG.music.autoplayOnOpen){
      audio.play().catch(() => { /* lecture bloquée par le navigateur : le bouton musique reste disponible */ });
    }

    setTimeout(() => {
      screen.classList.add('is-open');
      main.classList.add('is-visible');
      main.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = '';
      revealOnScroll();
    }, 950);
  }

  seal.addEventListener('click', openInvitation);
  seal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvitation(); }
  });

  document.body.style.overflow = 'hidden';
})();

/* ===================================================================
   MUSIQUE — bouton lecture / pause
   =================================================================== */
(function initMusicToggle(){
  const btn   = document.getElementById('music-toggle');
  const audio = document.getElementById('theme-song');
  const iconPause = btn.querySelector('.icon-pause');
  const iconPlay  = btn.querySelector('.icon-play');

  function setState(playing){
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Mettre en pause la musique' : 'Lancer la musique');
    iconPause.hidden = !playing;
    iconPlay.hidden  = playing;
  }

  btn.addEventListener('click', () => {
    if (audio.paused){ audio.play().catch(() => {}); setState(true); }
    else { audio.pause(); setState(false); }
  });

  audio.addEventListener('pause', () => setState(false));
  audio.addEventListener('play',  () => setState(true));
})();

/* ===================================================================
   COMPTE À REBOURS
   =================================================================== */
(function initCountdown(){
  const target = new Date(CONFIG.weddingDateISO).getTime();
  const els = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs')
  };
  const pad = n => String(Math.max(0,n)).padStart(2,'0');

  function tick(){
    const diff = target - Date.now();
    if (diff <= 0){
      els.days.textContent = '00'; els.hours.textContent = '00';
      els.mins.textContent = '00'; els.secs.textContent = '00';
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.days.textContent = pad(d); els.hours.textContent = pad(h);
    els.mins.textContent = pad(m); els.secs.textContent = pad(s);
  }
  tick();
  const timer = setInterval(tick, 1000);
})();

/* ===================================================================
   RÉVÉLATION DES SECTIONS AU SCROLL (un seul effet, discret)
   =================================================================== */
function revealOnScroll(){
  const panels = document.querySelectorAll('.panel');
  if (!('IntersectionObserver' in window)){
    panels.forEach(p => p.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  panels.forEach(p => io.observe(p));
}

/* ===================================================================
   RSVP — envoi via Formspree, sans rechargement de page
   =================================================================== */
(function initRSVP(){
  const form   = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Envoi en cours…';
    try{
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok){
        status.textContent = 'Merci ! Votre réponse a bien été reçue.';
        form.reset();
      } else {
        status.textContent = "L'envoi a échoué. Merci de réessayer.";
      }
    } catch(err){
      status.textContent = "L'envoi a échoué. Merci de réessayer.";
    }
  });
})();
