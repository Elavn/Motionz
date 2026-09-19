const menuTrigger  = document.querySelector('.menu-trigger');
const menuPanel    = document.querySelector('.menu-panel');
const menuLinks    = document.querySelectorAll('.menu-panel .nav-link');
const menuClose    = document.querySelector('.menu-close');
const cookieStrip  = document.querySelector('.cookie-strip');
const cookieDismiss = document.querySelector('#cookie-dismiss');
const heroVideo    = document.querySelector('.hero-video');
const reelTrack    = document.querySelector('.reel-track');
const workPage     = document.querySelector('#work-page');
const workProjects = [...document.querySelectorAll('.work-project')];
const interactionCue = document.querySelector('#interaction-cue');
const interactionLabel = interactionCue?.querySelector('.interaction-cue__label');
const mouseBlinker = document.querySelector('#mouse-blinker');
function revealSite() {
  requestAnimationFrame(() => document.body.classList.add('site-ready'));
}

function showInteractionCue(label, event) {
  if (!interactionCue || !interactionLabel) return;
  interactionLabel.textContent = label;
  interactionCue.style.left = `${event.clientX}px`;
  interactionCue.style.top = `${event.clientY}px`;
  interactionCue.classList.remove('is-animating');
  void interactionCue.offsetWidth;
  interactionCue.classList.add('is-visible', 'is-animating');
}
function moveInteractionCue(event) {
  if (!interactionCue?.classList.contains('is-visible')) return;
  interactionCue.style.left = `${event.clientX}px`;
  interactionCue.style.top = `${event.clientY}px`;
}
function hideInteractionCue() {
  interactionCue?.classList.remove('is-visible', 'is-animating');
}
document.addEventListener('pointerover', event => {
  const reel = event.target.closest('.project-reel');
  const clickable = event.target.closest('a, button');
  if (reel) showInteractionCue('DRAG', event);
  else if (clickable) showInteractionCue('CLICK', event);
});
document.addEventListener('pointermove', moveInteractionCue);
document.addEventListener('pointermove', event => {
  if (!mouseBlinker) return;
  mouseBlinker.style.left = `${event.clientX}px`;
  mouseBlinker.style.top = `${event.clientY}px`;
});
document.addEventListener('pointerout', event => {
  if (!event.relatedTarget || !event.relatedTarget.closest?.('a, button, .project-reel')) hideInteractionCue();
});

/* ── Work project index ─────────────────────────────────────────────────── */
if (workPage && workProjects.length) {
  const previewVideos = [...workPage.querySelectorAll('.work-preview-video')];
  const previewImages = [...workPage.querySelectorAll('.work-preview-image')];
  const viewCurrent = workPage.querySelector('#work-view-current');
  const viewTotal = workPage.querySelector('#work-view-total');
  let activeProject = 0;
  let wheelDistance = 0;

  viewTotal.textContent = String(workProjects.length).padStart(2, '0');

  function setPreview(projectIndex) {
    activeProject = (projectIndex + workProjects.length) % workProjects.length;
    const source = workProjects[activeProject].dataset.media;
    workProjects.forEach((project, index) => {
      const active = index === activeProject;
      project.classList.toggle('is-active', active);
      project.setAttribute('aria-selected', String(active));
    });
    viewCurrent.textContent = String(activeProject + 1).padStart(2, '0');

    const mediaType = workProjects[activeProject].dataset.mediaType || 'video';
    previewVideos.forEach(video => {
      const frame = video.closest('.work-page-preview');
      const image = frame?.querySelector('.work-preview-image');
      if (mediaType === 'image') {
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (image) {
          image.hidden = false;
          image.src = source;
          image.onload = () => {
            if (frame) frame.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
          };
        }
        return;
      }
      if (image) image.hidden = true;
      if (video.dataset.source === source) return;
      video.dataset.source = source;
      video.src = source;
      video.onloadedmetadata = () => {
        if (frame && video.videoWidth && video.videoHeight)
          frame.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      };
      video.load();
      video.play().catch(() => {});
    });
  }

  workProjects.forEach((project, index) => {
    project.addEventListener('mouseenter', () => setPreview(index));
    project.addEventListener('focus', () => setPreview(index));
    project.addEventListener('click', () => setPreview(index));
  });
  workPage.addEventListener('wheel', event => {
    const distance = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(distance) < 2) return;
    wheelDistance += distance;
    const stepSize = 42;
    while (Math.abs(wheelDistance) >= stepSize) {
      setPreview(activeProject + (wheelDistance > 0 ? 1 : -1));
      wheelDistance += wheelDistance > 0 ? -stepSize : stepSize;
    }
  }, { passive: true });

  workPage.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      setPreview(activeProject + 1);
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      setPreview(activeProject - 1);
    }
  });

  function syncWorkRoute() {
    const active = window.location.hash === '#work';
    workPage.hidden = !active;
    workPage.classList.toggle('is-active', active);
    if (active) setPreview(activeProject);
  }
  window.addEventListener('hashchange', syncWorkRoute);
  syncWorkRoute();
}

/* ── Hand-drawn storyboard preloader ───────────────────────────────────── */
const preloader = document.querySelector('#preloader');
const preloaderCanvas = document.querySelector('#preloader-canvas');
const preloaderSvgStage = document.querySelector('#preloader-svg-stage');
const preloaderSkip = document.querySelector('#preloader-skip');
const paperPreloader = document.querySelector('.preloader-paper-mode');

if (paperPreloader) {
  const written = document.querySelector('#preloader-written');
  const camera = document.querySelector('#preloader-camera');
  const lottieContainer = document.querySelector('#camera-snap-lottie');
  const sentence = 'Everything you remember was preserved through a lens.';
  let paperFinished = false;
  const typedLetters = [];

  let characterIndex = 0;
  sentence.split(' ').forEach((word, wordIndex, words) => {
    const wordElement = document.createElement('span');
    wordElement.className = 'preloader-word';
    [...word].forEach(character => {
      const letter = document.createElement('span');
      letter.className = 'preloader-letter';
      letter.textContent = character;
      letter.style.setProperty('--letter-index', characterIndex++);
      typedLetters.push(letter);
      wordElement.append(letter);
    });
    written?.append(wordElement);
    if (wordIndex < words.length - 1) written?.append(document.createTextNode(' '));
  });
  function finishPaperPreloader() {
    if (paperFinished) return;
    paperFinished = true;
    revealSite();
    paperPreloader.classList.add('is-done');
    paperPreloader.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => paperPreloader.remove(), 650);
  }

  function showCameraSnap() {
    paperPreloader.classList.add('camera-phase');
    camera?.classList.add('is-visible');
    if (!window.lottie || !lottieContainer) {
      window.setTimeout(finishPaperPreloader, 1500);
      return;
    }
    const animation = window.lottie.loadAnimation({
      container: lottieContainer,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: 'public/lottie/camera-snap.json'
    });
    animation.setSpeed(1.6);
    animation.addEventListener('complete', finishPaperPreloader);
    animation.addEventListener('data_failed', () => window.setTimeout(finishPaperPreloader, 900));
  }

  preloaderSkip?.addEventListener('click', finishPaperPreloader);
  window.setTimeout(() => {
    written?.classList.add('is-writing');
    typedLetters.forEach((letter, index) => {
      window.setTimeout(() => letter.classList.add('is-typed'), index * 58);
    });
    const writingTime = sentence.length * 58 + 680;
    window.setTimeout(showCameraSnap, writingTime);
  }, 180);
} else if (preloader && preloaderSvgStage) {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgFiles = [
    'focus-marker.svg',
    'camera-lens.svg',
    'human-moment.svg',
    'arrows-dotted-01.svg',
    'arrows-dotted-02.svg',
    'camera-stabilizer.svg',
    'camera-tripod.svg',
    'composition-man.svg',
    'crowd-chaos.svg',
    'camera-operator.svg',
    'illustration-symbols-01.svg',
    'illustration-symbols-02.svg',
    'picture-stack.svg',
    'taking-pictures-circle.svg',
    'timer-countdown.svg',
    'transfer-pictures.svg',
    'aerial-world.svg',
    'motionz-wordmark.svg',
    'wordmark-detail.svg',
    'floppy-disk.svg',
    'headphones.svg',
    'video-document.svg',
    'Group%203.svg'
  ];
  const svgDurations = [230, 240, 240, 250, 250, 220, 220, 240, 290, 290, 250, 250, 220, 220, 210, 230, 320];
  const compositeFiles = new Set([
    'camera-lens.svg',
    'human-moment.svg',
    'crowd-chaos.svg',
    'camera-operator.svg',
    'aerial-world.svg',
    'motionz-wordmark.svg'
  ]);
  const tinyFiles = new Set([
    'camera-stabilizer.svg',
    'camera-tripod.svg',
    'composition-man.svg',
    'picture-stack.svg',
    'taking-pictures-circle.svg',
    'timer-countdown.svg',
    'transfer-pictures.svg',
    'video-document.svg'
  ]);
  const priorityDrawFiles = new Set([
    'floppy-disk.svg',
    'headphones.svg',
    'Group%203.svg'
  ]);
  let svgFinished = false;
  let svgFrames = [];

  async function loadSvgFrames() {
    const loaded = await Promise.all(svgFiles.map(async (file, index) => {
      try {
        const wrapper = document.createElement('div');
        wrapper.className = 'preloader-svg-frame';
        const positionX = 16 + ((index * 43) % 69);
        const positionY = 18 + ((index * 29) % 62);
        const rotation = -7 + ((index * 19) % 15);
        wrapper.style.setProperty('--svg-left', `${positionX}%`);
        wrapper.style.setProperty('--svg-top', `${positionY}%`);
        wrapper.style.setProperty('--svg-rotation', `${rotation}deg`);
        if (tinyFiles.has(file)) wrapper.classList.add('svg-tiny');
        if (priorityDrawFiles.has(file)) wrapper.classList.add('svg-priority');
        if (compositeFiles.has(file)) {
          const image = new Image();
          image.src = `public/svgs/${file}`;
          image.alt = '';
          await image.decode();
          wrapper.classList.add('svg-composite');
          wrapper.append(image);
          return wrapper;
        }
        const response = await fetch(`public/svgs/${file}`);
        if (!response.ok) throw new Error(`Unable to load ${file}`);
        const markup = await response.text();
        wrapper.innerHTML = markup;
        const svg = wrapper.querySelector('svg');
        if (!svg) throw new Error(`Invalid SVG: ${file}`);
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.setAttribute('aria-hidden', 'true');
        svg.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect').forEach(path => {
          path.classList.add('svg-drawable');
          path.style.animationDelay = `${Math.min(index * 18, 180)}ms`;
          if (typeof path.getTotalLength === 'function') {
            const length = path.getTotalLength();
            path.classList.add('svg-path-draw');
            path.dataset.pathLength = String(length);
            path.style.setProperty('--svg-path-length', `${length}`);
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;
          }
        });
        return wrapper;
      } catch (error) {
        console.warn('[preloader]', error.message);
        return null;
      }
    }));
    svgFrames = loaded.filter(Boolean);
    svgFrames.forEach(frame => preloaderSvgStage.append(frame));
    return svgFrames.length > 0;
  }

  function drawSvgFrame(frame) {
    const isTiny = frame.classList.contains('svg-tiny');
    const isPriority = frame.classList.contains('svg-priority');
    frame.querySelectorAll('.svg-drawable').forEach((shape, shapeIndex) => {
      shape.style.opacity = '0';
      if (isTiny) {
        shape.style.fill = 'currentColor';
        shape.style.fillOpacity = '.86';
        shape.style.stroke = 'currentColor';
        shape.style.strokeWidth = '.65px';
        shape.style.strokeDasharray = 'none';
        shape.style.strokeDashoffset = '0';
        shape.animate(
          [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 340, delay: shapeIndex * 18, fill: 'forwards', easing: 'ease-out' }
        );
        return;
      }
      const length = shape.dataset.pathLength;
      if (!length) {
        shape.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 260, delay: shapeIndex * 10, fill: 'forwards', easing: 'ease-out' }
        );
        return;
      }
      shape.style.fill = 'currentColor';
      shape.style.fillOpacity = '.86';
      shape.style.stroke = 'currentColor';
      shape.style.strokeWidth = isPriority ? '.2px' : '.25px';
      shape.style.strokeDasharray = `${length}px`;
      shape.style.strokeDashoffset = `${length}px`;
      const animation = shape.animate(
        [
          { strokeDashoffset: `${length}px`, opacity: 0 },
          { strokeDashoffset: '0px', opacity: 1 }
        ],
        { duration: isPriority ? 450 : 420, delay: Math.min(shapeIndex * 45, 180), fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
      animation.onfinish = () => {
        shape.style.fill = 'currentColor';
        shape.style.fillOpacity = '.86';
      };
    });
  }

  function finishSvgPreloader() {
    if (svgFinished) return;
    svgFinished = true;
    revealSite();
    preloader.classList.remove('is-brand');
    preloader.classList.add('is-done');
    preloader.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => preloader.remove(), 400);
  }
  preloaderSkip?.addEventListener('click', finishSvgPreloader);

  async function runSvgPreloader() {
    if (!(await loadSvgFrames())) {
      window.setTimeout(finishSvgPreloader, 300);
      return;
    }
    if (svgFinished) return;
    preloaderCanvas?.remove();
    preloaderSvgStage.classList.add('is-active');
    if (reducedMotion) {
      window.setTimeout(finishSvgPreloader, 300);
      return;
    }
    let elapsed = 0;
    svgFrames.forEach((frame, index) => {
      window.setTimeout(() => {
        svgFrames.forEach(item => item.classList.remove('is-visible'));
        frame.classList.add('is-visible');
        drawSvgFrame(frame);
      }, elapsed);
      elapsed += frame.classList.contains('svg-priority')
        ? 520
        : frame.classList.contains('svg-tiny')
        ? 300
        : Math.min(svgDurations[index] || 100, 180);
    });
    window.setTimeout(() => {
      finishSvgPreloader();
    }, elapsed + 320);
  }
  runSvgPreloader();
} else if (preloader && preloaderCanvas) {
  const ctx = preloaderCanvas.getContext('2d');
  const INK = '#f5f2ea';
  const ACCENT = '#ff3b30';
  const BLACK = '#090909';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frameDurations = [80, 100, 100, 100, 100, 70, 120, 120, 100, 120, 140, 100, 100, 130, 70, 100, 180];
  const frameEnds = frameDurations.reduce((ends, duration) => {
    ends.push((ends.at(-1) || 0) + duration);
    return ends;
  }, []);
  const sequenceDuration = frameEnds.at(-1);
  let width = 0;
  let height = 0;
  let dpr = 1;
  let startedAt = performance.now();
  let finished = false;

  function resizePreloader() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    preloaderCanvas.width = Math.round(width * dpr);
    preloaderCanvas.height = Math.round(height * dpr);
    preloaderCanvas.style.width = `${width}px`;
    preloaderCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizePreloader();
  window.addEventListener('resize', resizePreloader);

  const random = (seed) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const jitter = (value, amount, seed) => value + (random(seed) - .5) * amount;

  function roughLine(x1, y1, x2, y2, amount = 2, seed = 1, color = INK, lineWidth = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(jitter(x1, amount, seed), jitter(y1, amount, seed + 1));
    ctx.lineTo(jitter(x2, amount, seed + 2), jitter(y2, amount, seed + 3));
    ctx.stroke();
  }
  function roughRect(x, y, w, h, seed = 1, color = INK, lineWidth = 2) {
    roughLine(x, y, x + w, y, 3, seed, color, lineWidth);
    roughLine(x + w, y, x + w, y + h, 3, seed + 4, color, lineWidth);
    roughLine(x + w, y + h, x, y + h, 3, seed + 8, color, lineWidth);
    roughLine(x, y + h, x, y, 3, seed + 12, color, lineWidth);
  }
  function roughCircle(x, y, radius, seed = 1, color = INK, lineWidth = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 32; i += 1) {
      const angle = (i / 32) * Math.PI * 2;
      const r = radius + (random(seed + i) - .5) * 7;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  function label(text, x, y, size = 12, color = INK, rotate = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.fillStyle = color;
    ctx.font = `${size}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.letterSpacing = '0.08em';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  function clear() {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, width, height);
  }
  function frameBox() {
    const w = Math.min(width * .72, 760);
    const h = w * .56;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    roughRect(x, y, w, h, 4, INK, 2);
    roughLine(x - 22, y, x - 4, y, 2, 40, ACCENT, 3);
    roughLine(x, y - 22, x, y - 4, 2, 44, ACCENT, 3);
    roughLine(x + w + 4, y + h, x + w + 22, y + h, 2, 48, ACCENT, 3);
    roughLine(x + w, y + h + 4, x + w, y + h + 22, 2, 52, ACCENT, 3);
    return { x, y, w, h };
  }
  function person(x, y, scale = 1, seed = 1, color = INK) {
    roughCircle(x, y - 48 * scale, 13 * scale, seed, color, 2);
    roughLine(x, y - 34 * scale, x - 10 * scale, y + 28 * scale, 4, seed + 10, color, 3);
    roughLine(x - 10 * scale, y + 28 * scale, x - 28 * scale, y + 62 * scale, 4, seed + 14, color, 3);
    roughLine(x - 10 * scale, y + 28 * scale, x + 20 * scale, y + 62 * scale, 4, seed + 18, color, 3);
    roughLine(x - 4 * scale, y - 10 * scale, x - 42 * scale, y + 8 * scale, 4, seed + 22, color, 3);
    roughLine(x - 4 * scale, y - 10 * scale, x + 35 * scale, y - 32 * scale, 4, seed + 26, color, 3);
  }
  function camera(x, y, scale = 1, seed = 1) {
    roughRect(x - 90 * scale, y - 54 * scale, 180 * scale, 108 * scale, seed, INK, 3);
    roughCircle(x + 18 * scale, y, 38 * scale, seed + 20, ACCENT, 3);
    roughCircle(x + 18 * scale, y, 18 * scale, seed + 30, INK, 2);
    roughLine(x - 54 * scale, y - 54 * scale, x - 32 * scale, y - 78 * scale, 4, seed + 40, INK, 3);
  }
  function drawFrame(index, progress) {
    clear();
    const centerX = width / 2;
    const centerY = height / 2;
    if (index === 0) {
      roughCircle(centerX, centerY, 18 + progress * 10, 2, ACCENT, 2);
      roughLine(centerX - 32, centerY, centerX + 32, centerY, 2, 4, INK, 1);
      roughLine(centerX, centerY - 32, centerX, centerY + 32, 2, 5, INK, 1);
      return;
    }
    if (index === 1 || index === 2) {
      const box = frameBox();
      person(box.x + box.w * (.42 + progress * .2), box.y + box.h * .57, .8, 12);
      roughRect(box.x + box.w * (.43 + progress * .2) - 30, box.y + box.h * .43, 60, 85, 18, ACCENT, 2);
      label('TRACK', box.x + 10, box.y - 14, 12, ACCENT, -.08);
      if (index === 2) for (let i = 0; i < 5; i += 1) roughLine(box.x + box.w * .45 - i * 20, box.y + box.h * .62 + i * 4, box.x + box.w * .45 - 70 - i * 20, box.y + box.h * .62 + i * 4, 3, 30 + i, ACCENT, 2);
      return;
    }
    if (index === 3) {
      frameBox();
      camera(centerX + (1 - progress) * width * .5, centerY, .9, 40);
      label('FOLLOW', 22, height - 34, 13, ACCENT, -.06);
      return;
    }
    if (index === 4 || index === 5) {
      roughCircle(centerX, centerY, Math.min(width, height) * (.24 + progress * .06), 50, INK, 3);
      roughCircle(centerX, centerY, Math.min(width, height) * (.17 + progress * .04), 60, ACCENT, 3);
      roughCircle(centerX, centerY, 22, 70, INK, 2);
      label(index === 4 ? 'FOCUS' : 'CLICK', centerX - 30, centerY + 6, 13, index === 4 ? ACCENT : INK, -.06);
      return;
    }
    if (index === 6 || index === 7) {
      for (let i = 0; i < 4; i += 1) person(centerX - 170 + i * 110, centerY + 40 + (i % 2) * 30, .7 + (i % 2) * .15, 80 + i);
      roughCircle(centerX + 90, centerY - 10, 26, 100, ACCENT, 3);
      label(index === 6 ? "DON'T MISS THIS" : 'HOLD THIS', 18, 38, 13, ACCENT, -.08);
      return;
    }
    if (index === 8 || index === 9) {
      person(centerX - 80, centerY + 30, 1.4, 110);
      camera(centerX + 130, centerY - 40, .55, 120);
      for (let i = 0; i < 6; i += 1) roughLine(centerX + 130, centerY - 40, centerX + 240 + i * 18, centerY - 90 + i * 32, 3, 130 + i, ACCENT, 2);
      label(index === 8 ? 'MOVE' : 'LIVE / EVENT', 20, height - 34, 13, ACCENT, -.04);
      return;
    }
    if (index === 10) {
      person(centerX, centerY + 30, 1.4, 150);
      roughRect(centerX - 100, centerY - 120, 200, 270, 160, INK, 2);
      label('OBSERVE', centerX - 36, centerY - 150, 13, ACCENT, -.08);
      return;
    }
    if (index === 11 || index === 12) {
      roughLine(centerX, height - 40, centerX + (progress * 100), height * .25, 4, 170, ACCENT, 3);
      roughLine(centerX - 75, height - 100, centerX + 60, height - 100, 3, 175, INK, 2);
      roughLine(centerX - 50, height - 180, centerX + 95, height - 180, 3, 180, INK, 2);
      roughRect(centerX - 44, height * (.68 - progress * .3), 88, 28, 185, INK, 2);
      roughLine(centerX - 34, height * (.68 - progress * .3), centerX - 75, height * (.68 - progress * .3) - 35, 3, 190, INK, 2);
      roughLine(centerX + 34, height * (.68 - progress * .3), centerX + 75, height * (.68 - progress * .3) - 35, 3, 195, INK, 2);
      label(index === 11 ? 'DRONE / 30M' : 'RISE / WIDEN / REVEAL', 20, 38, 13, ACCENT, -.06);
      return;
    }
    if (index === 13) {
      const box = frameBox();
      person(box.x + box.w * (.5 + progress * .35), centerY + 35, 1.1, 210);
      for (let i = 0; i < 5; i += 1) roughLine(box.x + box.w * .7 + i * 20, centerY - 80 + i * 40, box.x + box.w * .85 + i * 24, centerY - 100 + i * 40, 3, 220 + i, ACCENT, 2);
      label('BEYOND THE FRAME', box.x + 20, box.y - 14, 13, ACCENT, -.05);
      return;
    }
    if (index === 14) {
      camera(centerX, centerY, .65, 240);
      roughCircle(centerX, centerY, 150, 250, ACCENT, 2);
      for (let i = 0; i < 12; i += 1) roughLine(centerX, centerY, random(i + 20) * width, random(i + 40) * height, 5, 260 + i, INK, 1);
      return;
    }
    roughCircle(centerX, centerY, Math.min(width, height) * (.25 - progress * .15), 280, INK, 3);
    roughCircle(centerX, centerY, Math.min(width, height) * (.15 - progress * .08), 290, ACCENT, 3);
    label('MOTION IS EVERYWHERE', centerX - 92, centerY + Math.min(width, height) * .36, 12, INK, -.04);
  }

  function finishPreloader() {
    if (finished) return;
    finished = true;
    revealSite();
    preloader.classList.remove('is-brand');
    preloader.classList.add('is-done');
    preloader.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => preloader.remove(), 400);
  }
  preloaderSkip?.addEventListener('click', finishPreloader);

  function animatePreloader(now) {
    if (finished) return;
    const elapsed = now - startedAt;
    if (reducedMotion) {
      clear();
      preloader.classList.add('is-brand');
      window.setTimeout(finishPreloader, 520);
      return;
    }
    if (elapsed < sequenceDuration) {
      const index = frameEnds.findIndex(end => elapsed < end);
      const start = index === 0 ? 0 : frameEnds[index - 1];
      drawFrame(index, (elapsed - start) / frameDurations[index]);
    } else if (elapsed < sequenceDuration + 400) {
      clear();
      preloader.classList.add('is-brand');
    } else {
      finishPreloader();
      return;
    }
    requestAnimationFrame(animatePreloader);
  }
  requestAnimationFrame(animatePreloader);
}

/* Keep the background reel to an 18-second window, then restart it continuously. */
const HERO_LOOP_SECONDS = 18;
if (heroVideo) {
  heroVideo.loop = true;
  heroVideo.addEventListener('timeupdate', () => {
    if (heroVideo.currentTime >= HERO_LOOP_SECONDS) {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(() => {});
    }
  });
}

/* ── Menu ──────────────────────────────────────────────────────────────── */
function setMenu(open) {
  menuTrigger.setAttribute('aria-expanded', String(open));
  menuPanel.classList.toggle('is-open', open);
  menuPanel.setAttribute('aria-hidden', String(!open));
  if (open) menuLinks[0]?.focus();
}
menuTrigger.addEventListener('click', () =>
  setMenu(menuTrigger.getAttribute('aria-expanded') !== 'true')
);
menuLinks.forEach(l => l.addEventListener('click', () => setMenu(false)));
menuClose?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ── Cookie ────────────────────────────────────────────────────────────── */
if (sessionStorage.getItem('motionz-cookie-dismissed') === 'true')
  cookieStrip?.classList.add('is-dismissed');
cookieDismiss?.addEventListener('click', () => {
  cookieStrip.classList.add('is-dismissed');
  sessionStorage.setItem('motionz-cookie-dismissed', 'true');
});

/* ── Reduced motion ────────────────────────────────────────────────────── */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  heroVideo?.pause();

/* ── Scroll-driven reel ────────────────────────────────────────────────── */
/*
 * The reel-track is a seamless duplicate list (Set A + Set B = 2× the items).
 * We drive its translateX via JS so scroll/wheel moves it directly.
 * Auto-advance runs at BASE_SPEED px/frame. Scroll adds momentum that decays.
 */
if (reelTrack) {
  // Remove the CSS animation — JS drives position instead
  reelTrack.style.animation = 'none';

  const BASE_SPEED = 0.6;      // px per frame when idle
  const SCROLL_MULT = 0.4;     // how strongly wheel delta maps to speed boost
  const DECAY = 0.92;          // momentum decay per frame (lower = faster decay)

  let offset   = 0;            // current translateX in px (always negative = leftward)
  let momentum = 0;            // extra speed added by scroll, decays each frame
  let halfW    = 0;            // half the track width (= one set width)
  const reelItems = [...reelTrack.querySelectorAll('.reel-item')];
  const reelVideos = [...reelTrack.querySelectorAll('video')];

  function measure() {
    // Measure the first duplicated set directly to avoid a seam from
    // fractional widths or media loading changing the track calculation.
    const setLength = Math.floor(reelItems.length / 2);
    halfW = reelItems.slice(0, setLength).reduce((width, item) => width + item.getBoundingClientRect().width, 0);
  }
  measure();
  window.addEventListener('resize', measure);

  reelVideos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.preload = 'auto';
    video.addEventListener('loadeddata', () => video.play().catch(() => {}));
    video.addEventListener('stalled', () => video.play().catch(() => {}));
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
    video.play().catch(() => {});
  });

  function wrapOffset() {
    if (halfW <= 0) return;
    // A fast wheel/trackpad gesture can cross several loop widths in one
    // frame, so normalize repeatedly-jumped positions with modulo arithmetic.
    offset %= halfW;
    if (offset > 0) offset -= halfW;
  }

  // Wheel/trackpad: prevent vertical page scroll, add to momentum instead
  document.addEventListener('wheel', e => {
    e.preventDefault();
    // deltaY > 0 = scroll down = move reel forward (left); deltaX for horizontal trackpads
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    momentum += delta * SCROLL_MULT;
  }, { passive: false });

  let dragging = false;
  let dragX = 0;
  reelTrack.addEventListener('pointerdown', event => {
    if (!event.target.closest('.reel-item')) return;
    dragging = true;
    dragX = event.clientX;
    reelTrack.setPointerCapture?.(event.pointerId);
    document.body.classList.add('is-dragging');
    showInteractionCue('DRAG', event);
    event.preventDefault();
  });
  reelTrack.addEventListener('pointermove', event => {
    if (!dragging) return;
    const delta = event.clientX - dragX;
    dragX = event.clientX;
    offset += delta;
    momentum = 0;
    moveInteractionCue(event);
  });
  function stopDragging(event) {
    if (!dragging) return;
    dragging = false;
    reelTrack.releasePointerCapture?.(event.pointerId);
    document.body.classList.remove('is-dragging');
  }
  reelTrack.addEventListener('pointerup', stopDragging);
  reelTrack.addEventListener('pointercancel', stopDragging);

  function tick() {
    // Apply base auto-advance + scroll momentum
    offset -= (BASE_SPEED + momentum);
    momentum *= DECAY;          // friction
    if (Math.abs(momentum) < 0.01) momentum = 0;

    // Seamless loop, including very large wheel or drag jumps.
    wrapOffset();

    reelTrack.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
