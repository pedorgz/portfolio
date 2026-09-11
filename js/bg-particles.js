// =========================================================
// Rede de partículas 3D — fundo fixo da página inteira.
// Usa Three.js (carregado via CDN no <head>). Se a lib não
// carregar por algum motivo, o script simplesmente não roda
// e o site continua funcionando normalmente sem o efeito.
// =========================================================
(function () {
  if (typeof THREE === 'undefined') return;

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // ---------- Configuração ----------
  var PARTICLE_COUNT = window.innerWidth < 720 ? 80 : 150;
  var CONNECT_DISTANCE = 6.2;
  var SPREAD = { x: 22, y: 13, z: 10 };
  var COLOR_POINT = 0x4fd1c5;   // --signal
  var COLOR_LINE = 0x4fd1c5;    // --signal

  // ---------- Setup básico ----------
  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 16;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var group = new THREE.Group();
  scene.add(group);

  // ---------- Gera os pontos ----------
  var basePositions = []; // posição de origem de cada ponto (pra drift)
  var phases = [];        // fase individual do movimento senoidal

  var positionsArray = new Float32Array(PARTICLE_COUNT * 3);

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var x = (Math.random() - 0.5) * SPREAD.x * 2;
    var y = (Math.random() - 0.5) * SPREAD.y * 2;
    var z = (Math.random() - 0.5) * SPREAD.z * 2;

    basePositions.push(x, y, z);
    phases.push(Math.random() * Math.PI * 2);

    positionsArray[i * 3] = x;
    positionsArray[i * 3 + 1] = y;
    positionsArray[i * 3 + 2] = z;
  }

  var pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positionsArray, 3)
  );

  var pointsMaterial = new THREE.PointsMaterial({
    color: COLOR_POINT,
    size: 0.16,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });

  var points = new THREE.Points(pointsGeometry, pointsMaterial);
  group.add(points);

  // ---------- Linhas de conexão ----------
  var lineMaterial = new THREE.LineBasicMaterial({
    color: COLOR_LINE,
    transparent: true,
    opacity: 0.16
  });

  var lineGeometry = new THREE.BufferGeometry();
  var lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lines);

  function rebuildConnections() {
    var pos = pointsGeometry.attributes.position.array;
    var verts = [];

    for (var a = 0; a < PARTICLE_COUNT; a++) {
      var ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];

      for (var b = a + 1; b < PARTICLE_COUNT; b++) {
        var bx = pos[b * 3], by = pos[b * 3 + 1], bz = pos[b * 3 + 2];
        var dx = ax - bx, dy = ay - by, dz = az - bz;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECT_DISTANCE) {
          verts.push(ax, ay, az, bx, by, bz);
        }
      }
    }

    lineGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(verts), 3)
    );
  }

  rebuildConnections();

  // ---------- Redimensionamento ----------
  function resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---------- Parallax do mouse ----------
  // O canvas é fixo (não rola com a página), então o parallax
  // usa a janela inteira como referência, não uma seção específica.
  var mouseX = 0;
  var mouseY = 0;
  var targetRotX = 0;
  var targetRotY = 0;

  if (!prefersReducedMotion) {
    window.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  // ---------- Loop de animação ----------
  var frame = 0;
  var clock = new THREE.Clock();

  function animate() {
    frame++;
    var t = clock.getElapsedTime();

    // drift suave de cada ponto ao redor da posição de origem
    var pos = pointsGeometry.attributes.position.array;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var bx = basePositions[i * 3];
      var by = basePositions[i * 3 + 1];
      var bz = basePositions[i * 3 + 2];
      var ph = phases[i];

      pos[i * 3] = bx + Math.sin(t * 0.3 + ph) * 0.4;
      pos[i * 3 + 1] = by + Math.cos(t * 0.25 + ph) * 0.4;
      pos[i * 3 + 2] = bz + Math.sin(t * 0.2 + ph) * 0.3;
    }
    pointsGeometry.attributes.position.needsUpdate = true;

    // recalcula as conexões só a cada poucos quadros (performance)
    if (frame % 12 === 0) rebuildConnections();

    // rotação lenta e contínua do grupo
    group.rotation.y = t * 0.04;

    // parallax sutil seguindo o mouse
    targetRotX += (mouseY * 0.15 - targetRotX) * 0.03;
    targetRotY += (mouseX * 0.2 - targetRotY) * 0.03;
    group.rotation.x = targetRotX;
    camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  if (prefersReducedMotion) {
    // sem animação: só renderiza um quadro estático
    renderer.render(scene, camera);
  } else {
    requestAnimationFrame(animate);
  }
})();