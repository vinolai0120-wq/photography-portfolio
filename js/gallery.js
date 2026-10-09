const wall = document.querySelector('.gallery');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const caption = lightbox?.querySelector('.lightbox-caption');
const prevControls = [...document.querySelectorAll('[data-gallery-prev]')];
const nextControls = [...document.querySelectorAll('[data-gallery-next]')];
const counter = document.querySelector('[data-gallery-counter]');
const projectName = document.querySelector('[data-project-name]')?.textContent || '项目';
let galleryButtons = [];
let currentIndex = 0;
let touchStartX = null;

function imageSource(item) {
  const art = item.querySelector('.frame-art');
  const background = art ? getComputedStyle(art).backgroundImage : '';
  const fallback = background.match(/url\(["']?(.*?)["']?\)/)?.[1] || item.dataset.placeholder;
  return { full: item.dataset.full, fallback };
}

function wrapIndex(index) {
  return (index + galleryButtons.length) % galleryButtons.length;
}

function applyArtSize(item, art) {
  const values = (item.dataset.artSize || '82% auto').trim().split(/\s+/);
  let maxWidth = values[0] || '100%';
  let maxHeight = values[1] || '100%';
  if (maxWidth === 'cover') maxWidth = '88%';
  if (maxHeight === 'auto') maxHeight = maxWidth;
  if (maxWidth === 'auto') maxWidth = '88%';
  art.style.setProperty('--art-max-width', maxWidth);
  art.style.setProperty('--art-max-height', maxHeight);
}

function updateWall(index) {
  if (!galleryButtons.length) return;
  currentIndex = wrapIndex(index);
  const prevIndex = wrapIndex(currentIndex - 1);
  const nextIndex = wrapIndex(currentIndex + 1);

  galleryButtons.forEach((item, itemIndex) => {
    item.classList.remove('is-current', 'is-prev', 'is-next', 'is-hidden');
    item.tabIndex = -1;
    item.style.setProperty('--piece-scale', item.dataset.scale || '1');
    item.style.setProperty('--art-size', item.dataset.artSize || 'cover');

    const art = item.querySelector('.frame-art');
    if (art) {
      const image = art.querySelector('img');
      applyArtSize(item, art);
      if (image) image.loading = itemIndex === currentIndex ? 'eager' : 'lazy';
    }

    if (itemIndex === currentIndex) {
      item.classList.add('is-current');
      item.tabIndex = 0;
    } else if (itemIndex === prevIndex) {
      item.classList.add('is-prev');
      item.tabIndex = 0;
    } else if (itemIndex === nextIndex) {
      item.classList.add('is-next');
      item.tabIndex = 0;
    } else {
      item.classList.add('is-hidden');
    }
  });

  if (counter) counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(galleryButtons.length).padStart(2, '0')}`;
}

function moveGallery(step) {
  updateWall(currentIndex + step);
}

function openLightbox() {
  if (!lightbox || !lightboxImage || !galleryButtons.length) return;
  const item = galleryButtons[currentIndex];
  const { full, fallback } = imageSource(item);
  lightboxImage.onerror = () => {
    lightboxImage.onerror = null;
    if (fallback) lightboxImage.src = fallback;
  };
  lightboxImage.src = full;
  lightboxImage.alt = item.dataset.caption;
  caption.textContent = item.dataset.caption;
  lightbox.hidden = false;
  document.body.classList.add('modal-open');
  lightbox.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.hidden = true;
  lightboxImage.src = '';
  document.body.classList.remove('modal-open');
}

function bindGalleryButtons() {
  galleryButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (index === currentIndex) {
        openLightbox();
        return;
      }
      updateWall(index);
    });
  });
}

function createGalleryButton(item, index, manifestUrl) {
  const button = document.createElement('button');
  const manifestBase = new URL(manifestUrl, document.baseURI);
  const full = new URL(item.file, manifestBase).href;
  button.className = 'gallery-image';
  button.type = 'button';
  button.dataset.full = full;
  button.dataset.scale = item.scale ?? '1';
  button.dataset.artSize = item.artSize ?? '82% auto';
  button.dataset.caption = `${projectName} / ${String(index + 1).padStart(2, '0')}`;
  button.setAttribute('aria-label', `打开照片 ${index + 1}`);
  button.innerHTML = `<span class="frame-art" aria-hidden="true"><img src="${full}" alt="" decoding="async"></span>`;
  return button;
}

async function loadGallery() {
  if (!wall) return;
  const manifestUrl = wall.dataset.manifest;
  try {
    const response = await fetch(`${manifestUrl}?v=photos-contain-20261010`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
    const manifest = await response.json();
    galleryButtons = manifest.map((item, index) => createGalleryButton(item, index, manifestUrl));
    wall.replaceChildren(...galleryButtons);
    bindGalleryButtons();
    updateWall(0);
  } catch (error) {
    wall.innerHTML = '<p class="gallery-error">照片清单暂时无法加载。</p>';
    if (counter) counter.textContent = '-- / --';
    console.error(error);
  }
}

prevControls.forEach((button) => button.addEventListener('click', () => moveGallery(-1)));
nextControls.forEach((button) => button.addEventListener('click', () => moveGallery(1)));

if (lightbox) {
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
    moveGallery(-1);
    openLightbox();
  });
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
    moveGallery(1);
    openLightbox();
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

if (wall) {
  wall.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  wall.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 45) moveGallery(delta > 0 ? -1 : 1);
    touchStartX = null;
  }, { passive: true });
}

document.addEventListener('keydown', (event) => {
  if (lightbox && !lightbox.hidden) {
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') {
      moveGallery(-1);
      openLightbox();
    }
    if (event.key === 'ArrowRight') {
      moveGallery(1);
      openLightbox();
    }
    return;
  }

  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
  if (event.key === 'Enter' && document.activeElement?.classList.contains('is-current')) openLightbox();
});

loadGallery();
