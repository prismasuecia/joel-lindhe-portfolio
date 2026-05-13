const strips = document.querySelectorAll("[data-strip]");

strips.forEach((strip) => {
  const folder = strip.dataset.folder;
  const prefix = strip.dataset.prefix;
  const count = Number(strip.dataset.count);

  for (let index = 1; index <= count; index += 1) {
    const number = String(index).padStart(2, "0");
    const link = document.createElement("a");
    const image = document.createElement("img");

    link.href = `#${strip.id || "home"}`;
    link.className = "strip-image";
    image.src = `${folder}/${prefix}-${number}.jpg`;
    image.alt = "";
    image.loading = index > 4 ? "lazy" : "eager";

    link.append(image);
    strip.append(link);
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
