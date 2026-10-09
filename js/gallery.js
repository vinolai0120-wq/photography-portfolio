const galleryButtons = [...document.querySelectorAll('.gallery-image')];
const wall = document.querySelector('.gallery');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const caption = lightbox?.querySelector('.lightbox-caption');
const prevControls = [...document.querySelectorAll('[data-gallery-prev]')];
const nextControls = [...document.querySelectorAll('[data-gallery-next]')];
const counter = document.querySelector('[data-gallery-counter]');
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
      const localFallback = getComputedStyle(item).getPropertyValue('--art-image').trim();
      art.style.backgroundImage = localFallback || 'none';
      const probe = new Image();
      probe.onload = () => {
        art.style.backgroundImage = `url("${item.dataset.full}")`;
      };
      probe.src = item.dataset.full;
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
  if (!lightbox || !lightboxImage) return;
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

galleryButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (index === currentIndex) {
      openLightbox();
      return;
    }
    updateWall(index);
  });
});

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

updateWall(0);
