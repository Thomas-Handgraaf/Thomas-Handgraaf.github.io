// Fetch and aggregate project data from individual project.json files
async function loadProjects() {
  try {
    const projects = [];
    let projectId = 1;
    
    // Keep trying to load projects until we hit a 404
    while (true) {
      const response = await fetch(`Projects/${projectId}/project.json`);
      
      if (!response.ok) {
        // Silently stop when we can't find a project
        break;
      }
      
      const projectData = await response.json();
      projects.push(projectData);
      projectId++;
    }

    // Sort by id to maintain order
    projects.sort((a, b) => a.id - b.id);

    // Render projects
    renderProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

// Dynamically render project cards from data
function renderProjects(projects) {
  const container = document.querySelector('.projects-container');
  
  if (!container) {
    console.error('Projects container not found');
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Create and append project cards
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';

    const mainTagsArray = (project["main-tags"] || "").split(",").map(t => t.trim()).filter(Boolean);
    const tagsArray = (project.tags || "").split(",").map(t => t.trim()).filter(Boolean);

    card.innerHTML = `
     <img src="Projects/${project.id}/${project.coverImage}" alt="${project.title}">
     <h3>${project.title}</h3>
     <p>${project.description}</p>

     <div class="project-tags">
        ${mainTagsArray.map(tag => `<span class="tag main-tag">${tag}</span>`).join("")}
        ${tagsArray.map(tag => `<span class="tag">${tag}</span>`).join("")}
     </div>

     <a href="project-template.html?id=${project.id}" class="card-link">View Project</a>
`;

    container.appendChild(card);
  });
}

// Load projects when the page loads
document.addEventListener('DOMContentLoaded', loadProjects);
