// -----------------------------
// LOAD PROJECT DATA
// -----------------------------
async function loadProjectAssets() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
      console.error('No project ID provided in URL');
      return;
    }

    const response = await fetch(`Projects/${projectId}/project.json`);
    if (!response.ok) {
      console.error('Failed to load project.json');
      return;
    }

    const projectData = await response.json();

    document.title = projectData.title + ' - Thomas Handgraaf Portfolio';

    const titleElement = document.getElementById('project-title');
    if (titleElement) {
      titleElement.textContent = projectData.title;
    }

    const descriptionElement = document.getElementById('project-description');
    const descriptionText = projectData.detailedDescription || projectData.description;
    if (descriptionElement) {
      descriptionElement.innerHTML = descriptionText;
    }

    // Set GitHub link if available
    if (projectData.githubUrl) {
      const githubLink = document.getElementById('github-link');
      if (githubLink) {
        githubLink.href = projectData.githubUrl;
        githubLink.style.display = 'inline-block';
      }
    }

    const loadedAssets = [];

    // -----------------------------
    // IMAGES
    // -----------------------------
    if (projectData.assets.images && projectData.assets.images.length > 0) {
      projectData.assets.images.forEach(imageData => {
        const imagePath = typeof imageData === 'string' ? imageData : imageData.path;
        const description = typeof imageData === 'string' ? '' : imageData.description;

        loadedAssets.push({
          type: 'image',
          path: `Projects/${projectId}/${imagePath}`,
          alt: projectData.title,
          description: description
        });
      });
    }

    // -----------------------------
    // YOUTUBE VIDEOS
    // -----------------------------
    if (projectData.assets.videos && projectData.assets.videos.length > 0) {
      projectData.assets.videos.forEach(videoData => {
        loadedAssets.push({
          type: 'video',
          id: videoData.id,
          description: videoData.description || ''
        });
      });
    }

    if (loadedAssets.length > 0) {
      initCarousel(loadedAssets);
    }

  } catch (error) {
    console.error('Error loading project assets:', error);
  }
}

// -----------------------------
// CAROUSEL STATE
// -----------------------------
let currentAssetIndex = 0;
let assets = [];

// -----------------------------
// INIT
// -----------------------------
function initCarousel(carouselAssets) {
  assets = carouselAssets;
  currentAssetIndex = 0;

  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => previousAsset());
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => nextAsset());
  }

  createIndicators();
  enableIndicatorMouseWheelScroll();

  displayAsset(0);
}

// -----------------------------
// DISPLAY
// -----------------------------
function displayAsset(index) {
  if (assets.length === 0) return;

  currentAssetIndex = (index + assets.length) % assets.length;

  const asset = assets[currentAssetIndex];
  const contentContainer = document.getElementById('carousel-content');

  if (!contentContainer) return;

  const descriptionElement = document.getElementById('asset-description-text');
  if (descriptionElement) {
    descriptionElement.innerHTML = asset.description || '';
  }

  // Cleanup previous media
  const oldVideo = contentContainer.querySelector('video');
  if (oldVideo) {
    oldVideo.pause();
    oldVideo.src = '';
  }

  const oldIframe = contentContainer.querySelector('iframe');
  if (oldIframe) {
    oldIframe.src = '';
  }

  contentContainer.innerHTML = '';

  // -----------------------------
  // IMAGE
  // -----------------------------
  if (asset.type === 'image') {
    const img = document.createElement('img');
    img.src = asset.path;
    img.alt = asset.alt;
    img.className = 'carousel-asset';
    contentContainer.appendChild(img);
  }

  // -----------------------------
  // YOUTUBE VIDEO
  // -----------------------------
  if (asset.type === 'video') {
    const iframe = document.createElement('iframe');

    iframe.src = `https://www.youtube.com/embed/${asset.id}?autoplay=1&mute=1&rel=0`;
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.className = 'carousel-asset';
    iframe.style.width = '1000px';
    iframe.style.height = 'auto';
    iframe.style.aspectRatio = '16 / 9';
    iframe.style.border = 'none';

    contentContainer.appendChild(iframe);
  }

  updateIndicators();
  scrollActiveIndicatorIntoView();
}

// -----------------------------
// NAVIGATION
// -----------------------------
function previousAsset() {
  displayAsset(currentAssetIndex - 1);
}

function nextAsset() {
  displayAsset(currentAssetIndex + 1);
}

// -----------------------------
// INDICATORS
// -----------------------------
function createIndicators() {
  const indicatorsContainer = document.getElementById('carousel-indicators');
  if (!indicatorsContainer) return;

  indicatorsContainer.innerHTML = '';

  assets.forEach((asset, index) => {
    const indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';

    // IMAGE THUMB
    if (asset.type === 'image') {
      const img = document.createElement('img');
      img.src = asset.path;
      img.alt = `Thumbnail ${index + 1}`;
      indicator.appendChild(img);
    }

    // YOUTUBE THUMB
    if (asset.type === 'video') {
      const img = document.createElement('img');
      img.src = `https://img.youtube.com/vi/${asset.id}/hqdefault.jpg`;
      img.alt = `Video ${index + 1}`;
      indicator.appendChild(img);

      const badge = document.createElement('div');
      badge.className = 'video-badge';
      badge.textContent = '▶';
      indicator.appendChild(badge);
    }

    indicator.addEventListener('click', () => displayAsset(index));
    indicatorsContainer.appendChild(indicator);
  });

  updateIndicators();
}

// -----------------------------
// ACTIVE STATE
// -----------------------------
function updateIndicators() {
  const indicators = document.querySelectorAll('.carousel-indicator');

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentAssetIndex);
  });
}

// -----------------------------
// SCROLL SYNC
// -----------------------------
function scrollActiveIndicatorIntoView() {
  const indicators = document.querySelectorAll('.carousel-indicator');
  const active = indicators[currentAssetIndex];

  if (!active) return;

  active.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  });
}

// -----------------------------
// SCROLL SUPPORT
// -----------------------------
function enableIndicatorMouseWheelScroll() {
  const indicatorsContainer = document.getElementById('carousel-indicators');

  if (!indicatorsContainer) return;

  indicatorsContainer.addEventListener('wheel', function(e) {
    e.preventDefault();

    indicatorsContainer.scrollBy({
      left: e.deltaY * 3,
      behavior: 'auto'
    });
  }, { passive: false });
}

// -----------------------------
// BOOT
// -----------------------------
document.addEventListener('DOMContentLoaded', loadProjectAssets);