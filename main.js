// Simple data-driven slide player powered by JSON descriptors in static/slides.
(function () {
  const stage = document.getElementById('stage');
  const loading = document.getElementById('loading');
  const errorBox = document.getElementById('error');
  const slideLabel = document.getElementById('slide-label');
  const photoLabel = document.getElementById('photo-label');
  const statusLine = document.getElementById('status');

  const slides = [];
  let currentSlide = 0;
  let currentPhoto = 0;

  const MAX_SLIDES = 99;
  const DEFAULT_BASE = { width: 4000, height: 2250 };

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function parseIndex(idx) {
    const n = parseInt(idx, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function percent(value, total) {
    return `${(value / total) * 100}%`;
  }

  function setStatus(message) {
    statusLine.textContent = message || '';
  }

  function setError(message) {
    errorBox.textContent = message || '';
  }

  function hideLoading() {
    if (loading) {
      loading.classList.add('hidden');
    }
  }

  function buildSlide(rawItems, order) {
    const background = rawItems.find(
      (item) => item.human_name === 'bg' && item.bitmap
    );

    const baseWidth =
      background && Array.isArray(background.bbox) && background.bbox.length === 4
        ? background.bbox[2] - background.bbox[0]
        : DEFAULT_BASE.width;
    const baseHeight =
      background && Array.isArray(background.bbox) && background.bbox.length === 4
        ? background.bbox[3] - background.bbox[1]
        : DEFAULT_BASE.height;

    const photoItems = rawItems
      .filter((item) => /^photo\d+$/i.test(item.human_name))
      .sort((a, b) => {
        const aNum = parseInt(a.human_name.replace(/[^0-9]/g, ''), 10);
        const bNum = parseInt(b.human_name.replace(/[^0-9]/g, ''), 10);
        return aNum - bNum;
      });

    const textItems = rawItems.filter(
      (item) => /^text\d+$/i.test(item.human_name) || item.human_name === 'slide_title'
    );

    const staticOverlays = rawItems
      .filter((item) => item.bitmap)
      .filter((item) => item.human_name !== 'bg')
      .filter((item) => !/^photo\d+$/i.test(item.human_name))
      .filter((item) => !/^text\d+$/i.test(item.human_name) && item.human_name !== 'slide_title');

    const staticLayers = [...textItems, ...staticOverlays].sort(
      (a, b) => parseIndex(a.index) - parseIndex(b.index)
    );

    return {
      id: order,
      baseWidth,
      baseHeight,
      background,
      photos: photoItems,
      staticLayers,
    };
  }

  function createLayer(item, base) {
    if (!item || !item.bitmap) {
      return null;
    }

    const element = document.createElement('img');
    element.className = 'layer';
    element.alt = item.human_name || item.name || 'layer';
    element.src = `static/${item.bitmap}`;

    if (Array.isArray(item.bbox) && item.bbox.length === 4) {
      const [x1, y1, x2, y2] = item.bbox;
      element.style.left = percent(x1, base.width);
      element.style.top = percent(y1, base.height);
      element.style.width = percent(x2 - x1, base.width);
      element.style.height = percent(y2 - y1, base.height);
    }

    element.style.zIndex = String(parseIndex(item.index));
    return element;
  }

  function renderSlide() {
    const slide = slides[currentSlide];
    if (!slide) {
      return;
    }

    stage.innerHTML = '';

    const composite = [];
    if (slide.background) {
      composite.push(slide.background);
    }

    const photo = slide.photos[currentPhoto] || slide.photos[0];
    if (photo) {
      composite.push(photo);
    }

    composite.push(...slide.staticLayers);

    composite
      .sort((a, b) => parseIndex(a.index) - parseIndex(b.index))
      .forEach((layer) => {
        const el = createLayer(layer, {
          width: slide.baseWidth,
          height: slide.baseHeight,
        });
        if (el) {
          stage.appendChild(el);
        }
      });

    updateHud();
  }

  function updateHud() {
    if (!slides.length) {
      slideLabel.textContent = 'Slide 0/0';
      photoLabel.textContent = 'Photo 0/0';
      return;
    }

    const slideNumber = currentSlide + 1;
    slideLabel.textContent = `Slide ${slideNumber}/${slides.length}`;

    const totalPhotos = slides[currentSlide].photos.length;
    if (totalPhotos > 0) {
      photoLabel.textContent = `Photo ${Math.min(currentPhoto + 1, totalPhotos)}/${totalPhotos}`;
    } else {
      photoLabel.textContent = 'No photos on this slide';
    }
  }

  function goToSlide(target) {
    if (!slides.length) {
      return;
    }

    if (target < 0 || target >= slides.length) {
      setStatus('Reached the edge of the deck.');
      return;
    }

    currentSlide = target;
    currentPhoto = 0;
    renderSlide();
    setStatus(`Now on slide ${currentSlide + 1}.`);
  }

  function changePhoto(delta) {
    const slide = slides[currentSlide];
    const totalPhotos = slide?.photos.length || 0;

    if (!totalPhotos) {
      setStatus('This slide has no photo layers.');
      return;
    }

    const next = Math.min(totalPhotos - 1, Math.max(0, currentPhoto + delta));
    if (next === currentPhoto) {
      setStatus(delta > 0 ? 'Already at last photo.' : 'Already at first photo.');
      return;
    }

    currentPhoto = next;
    renderSlide();
    setStatus(`Photo ${currentPhoto + 1} of ${totalPhotos}.`);
  }

  async function discoverSlides() {
    const discovered = [];

    for (let i = 1; i <= MAX_SLIDES; i += 1) {
      const id = pad(i);
      const path = `static/slides/slide_${id}.json`;

      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
          if (i === 1 && !discovered.length) {
            throw new Error('No slide json files were found in static/slides.');
          }
          break;
        }

        const raw = await response.json();
        discovered.push(buildSlide(raw, id));
      } catch (err) {
        if (!discovered.length) {
          throw err;
        }
        break;
      }
    }

    return discovered;
  }

  function handleKey(event) {
    if (!slides.length) {
      return;
    }

    const key = event.key;
    if (key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(currentSlide + 1);
    } else if (key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(currentSlide - 1);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      changePhoto(1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      changePhoto(-1);
    }
  }

  async function start() {
    try {
      const loaded = await discoverSlides();
      slides.push(...loaded);

      if (!slides.length) {
        setError('No slides could be loaded.');
        return;
      }

      renderSlide();
      setStatus('Ready. Use arrow keys to navigate.');
    } catch (err) {
      setError(err?.message || 'Unable to load slides.');
    } finally {
      hideLoading();
    }
  }

  document.addEventListener('keydown', handleKey);
  start();
})();
