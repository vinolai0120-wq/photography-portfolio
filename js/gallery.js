const galleryButtons = [...document.querySelectorAll('.gallery-image')];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const caption = lightbox.querySelector('.lightbox-caption');
let currentIndex = 0;

function showImage(index) {
  currentIndex = (index + galleryButtons.length) % galleryButtons.length;
  const item = galleryButtons[currentIndex];
  const background = getComputedStyle(item).backgroundImage;
  const fallback = item.dataset.placeholder || background.match(/url\(["']?(.*?)["']?\)/)?.[1];
  lightboxImage.onerror = () => {
    lightboxImage.onerror = null;
    if (fallback) lightboxImage.src = fallback;
  };
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = item.dataset.caption;
  caption.textContent = item.dataset.caption;
  lightbox.hidden = false;
  document.body.classList.add('modal-open');
  lightbox.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = '';
  document.body.classList.remove('modal-open');
}

galleryButtons.forEach((button, index) => button.addEventListener('click', () => showImage(index)));
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (event.key === 'ArrowRight') showImage(currentIndex + 1);
});
