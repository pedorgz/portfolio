// =========================================================
// Interações da página: menu mobile + expandir/recolher projetos.
// (O fundo de partículas fica no arquivo js/bg-particles.js)
// =========================================================
(function () {
  'use strict';

  // ---------- Menu mobile ----------
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('nav.links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    // Fecha o menu ao clicar em qualquer link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
      });
    });
  }

  // ---------- Expandir / recolher projetos ----------
  var expandButtons = document.querySelectorAll('.expand-btn');

  expandButtons.forEach(function (btn) {
    var detail = btn.nextElementSibling; // a div .project-detail logo abaixo do botão
    if (!detail) return;

    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        // recolhe: volta ao max-height:0 do CSS
        detail.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        // abre: usa a altura real do conteúdo para animar
        detail.style.maxHeight = detail.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Reajusta a altura dos painéis abertos ao redimensionar a janela
  // (o texto pode quebrar em mais/menos linhas e mudar a altura).
  window.addEventListener('resize', function () {
    document
      .querySelectorAll('.expand-btn[aria-expanded="true"]')
      .forEach(function (btn) {
        var detail = btn.nextElementSibling;
        if (detail) detail.style.maxHeight = detail.scrollHeight + 'px';
      });
  });

  // ---------- Tilt 3D suave na foto de perfil ----------
  // Segue o mouse dando sensação de profundidade. Só ativa em telas
  // com mouse (pointer fino) e quando o usuário não pediu "reduzir movimento".
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canHover && !reduceMotion) {
    var heroPhoto = document.querySelector('.hero-photo');
    var frame = heroPhoto && heroPhoto.querySelector('.photo-frame');

    if (frame) {
      var STRENGTH = 16; // quanto maior, mais a foto inclina

      heroPhoto.addEventListener('mousemove', function (e) {
        var r = frame.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;  // -0.5 a 0.5
        var py = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform =
          'perspective(720px) rotateY(' + (px * STRENGTH) + 'deg) rotateX(' +
          (-py * STRENGTH) + 'deg)';
      });

      heroPhoto.addEventListener('mouseleave', function () {
        frame.style.transform = '';
      });
    }
  }
})();