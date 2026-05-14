const strips = document.querySelectorAll("[data-strip]");
let activeImages = [];
let activeIndex = 0;

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = `
  <button class="lightbox__close" type="button" aria-label="Close">Close</button>
  <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">Prev</button>
  <figure class="lightbox__figure">
    <img class="lightbox__image" alt="" />
    <figcaption class="lightbox__caption"></figcaption>
  </figure>
  <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">Next</button>
`;
document.body.append(lightbox);

const lightboxImage = lightbox.querySelector(".lightbox__image");
const lightboxCaption = lightbox.querySelector(".lightbox__caption");

function showImage(index) {
  if (!activeImages.length) return;
  activeIndex = (index + activeImages.length) % activeImages.length;
  const image = activeImages[activeIndex];
  lightboxImage.src = image.src;
  lightboxCaption.textContent = image.dataset.caption || "";
  lightboxCaption.hidden = !image.dataset.caption;
}

function openLightbox(images, index) {
  activeImages = images;
  lightbox.classList.add("is-open");
  document.body.classList.add("has-lightbox");
  showImage(index);
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  document.body.classList.remove("has-lightbox");
  lightboxImage.removeAttribute("src");
}

strips.forEach((strip) => {
  const folder = strip.dataset.folder;
  const prefix = strip.dataset.prefix;
  const count = Number(strip.dataset.count);
  const captions = strip.dataset.captions ? JSON.parse(strip.dataset.captions) : [];
  const images = [];

  for (let index = 1; index <= count; index += 1) {
    const number = String(index).padStart(2, "0");
    const link = document.createElement("a");
    const image = document.createElement("img");

    link.href = `#${strip.id || "home"}`;
    link.className = "strip-image";
    image.src = `${folder}/${prefix}-${number}.jpg`;
    image.alt = "";
    image.dataset.caption = captions[index - 1] || "";
    image.loading = index > 4 ? "lazy" : "eager";

    link.append(image);
    strip.append(link);
    images.push(image);

    link.addEventListener("click", (event) => {
      if (!image.dataset.caption) return;
      event.preventDefault();
      openLightbox(images.filter((item) => item.dataset.caption), 0);
    });
  }

  strip.addEventListener(
    "wheel",
    (event) => {
      const canScrollLeft = strip.scrollLeft > 0;
      const canScrollRight =
        strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1;
      const movingRight = event.deltaY > 0 || event.deltaX > 0;
      const movingLeft = event.deltaY < 0 || event.deltaX < 0;

      if ((movingRight && canScrollRight) || (movingLeft && canScrollLeft)) {
        event.preventDefault();
        strip.scrollLeft += event.deltaY + event.deltaX;
      }
    },
    { passive: false },
  );
});

lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => showImage(activeIndex - 1));
lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => showImage(activeIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showImage(activeIndex - 1);
  if (event.key === "ArrowRight") showImage(activeIndex + 1);
});
