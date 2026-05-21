const strips = document.querySelectorAll("[data-strip]");
const scriptSource = document.currentScript?.src || "";
const assetVersion = new URL(scriptSource, window.location.href).searchParams.get("v");
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
  const [meta = "", ...captionLines] = (image.dataset.caption || "").split("\n");

  lightboxImage.src = image.src;
  lightboxCaption.replaceChildren();
  const metaElement = document.createElement("span");
  metaElement.className = "lightbox__meta";
  metaElement.textContent = meta;
  lightboxCaption.append(metaElement);

  if (captionLines.length) {
    const textElement = document.createElement("span");
    textElement.className = "lightbox__text";
    textElement.textContent = captionLines.join(" ");
    lightboxCaption.append(textElement);
  }

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
    const imagePath = `${folder}/${prefix}-${number}.jpg`;
    image.src = assetVersion ? `${imagePath}?v=${assetVersion}` : imagePath;
    image.alt = "";
    image.dataset.caption = captions[index - 1] || "";
    image.loading = index > 4 ? "lazy" : "eager";
    link.dataset.caption = image.dataset.caption;
    if (image.dataset.caption) {
      link.classList.add("has-caption");
    }

    link.append(image);
    strip.append(link);
    images.push(image);
  }

  strip.addEventListener("click", (event) => {
    const link = event.target.closest(".strip-image");
    if (!link || !strip.contains(link)) return;
    const clickedImage = link.querySelector("img");
    const clickedIndex = Math.max(0, images.indexOf(clickedImage));

    event.preventDefault();
    openLightbox(images, clickedIndex);
  });

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
