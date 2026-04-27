// Load project data and display assets (images and videos)
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

    document.getElementById('project-title').textContent = projectData.title;
    
    // Convert \n to <br> tags for line breaks in description
    const descriptionText = projectData.detailedDescription || projectData.description;
    document.getElementById('project-description').innerHTML = descriptionText;

    const assets = [];

    if (projectData.assets.images && projectData.assets.images.length > 0) {
      projectData.assets.images.forEach(imageData => {
        // Handle both old format (string) and new format (object)
        const imagePath = typeof imageData === 'string' ? imageData : imageData.path;
        const description = typeof imageData === 'string' ? '' : imageData.description;
        
        assets.push({
          type: 'image',
          path: `Projects/${projectId}/${imagePath}`,
          alt: projectData.title,
          description: description
        });
      });
    }

    if (projectData.assets.videos && projectData.assets.videos.length > 0) {
      projectData.assets.videos.forEach(videoData => {
        // Handle both old format (string) and new format (object)
        const videoPath = typeof videoData === 'string' ? videoData : videoData.path;
        const description = typeof videoData === 'string' ? '' : videoData.description;
        
        assets.push({
          type: 'video',
          path: `Projects/${projectId}/${videoPath}`,
          description: description
        });
      });
    }

    if (assets.length > 0) {
      initCarousel(assets);
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

  prevBtn.addEventListener('click', () => previousAsset());
  nextBtn.addEventListener('click', () => nextAsset());

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

  const descriptionElement = document.getElementById('asset-description-text');
  if (descriptionElement) {
    descriptionElement.innerHTML = asset.description || '';
  }

  const oldVideo = contentContainer.querySelector('video');
  if (oldVideo) {
    oldVideo.pause();
    oldVideo.src = '';
  }
  contentContainer.innerHTML = '';

  if (asset.type === 'image') {
    const img = document.createElement('img');
    img.src = asset.path;
    img.alt = asset.alt;
    img.className = 'carousel-asset';
    contentContainer.appendChild(img);
  }

  if (asset.type === 'video') {
    const video = document.createElement('video');
    video.src = asset.path;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.className = 'carousel-asset';

    contentContainer.appendChild(video);
  }

  updateIndicators();
  scrollActiveIndicatorIntoView(); // 🔥 added
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
  indicatorsContainer.innerHTML = '';

  assets.forEach((asset, index) => {
    const indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';

    if (asset.type === 'image') {
      const img = document.createElement('img');
      img.src = asset.path;
      img.alt = `Thumbnail ${index + 1}`;
      indicator.appendChild(img);
    }

    if (asset.type === 'video') {
      const video = document.createElement('video');
      video.src = asset.path;
      indicator.appendChild(video);

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
// SCROLL SYNC (NEW)
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

  indicatorsContainer.addEventListener('wheel', (e) => {
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