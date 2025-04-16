$(document).ready(function () {
    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }
    });
});

document.addEventListener('visibilitychange',
    function () {
        if (document.visibilityState === "visible") {
            document.title = "Project | Harsh Jingar";
            $("#favicon").attr("href", "../assets/images/myprofile.jpg");
        }
        else {
            document.title = "Come Back To Portfolio";
            $("#favicon").attr("href", "../assets/images/favhand.png");
        }
    });

// Get the project ID from URL query parameter
function getProjectId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get project data
async function getProjects() {
    try {
        const response = await fetch("projects.json");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

// Show specific project details with all the enhanced sections
async function showProjectDetails() {
    const projectId = getProjectId();
    
    // If no project ID is specified, redirect to home page
    if (projectId === null) {
        window.location.href = "/My-Portfolio-Website/#work";
        return;
    }
    
    const projects = await getProjects();
    const project = projects[parseInt(projectId)];
    
    // If project not found, show error message
    if (!project) {
        document.getElementById("project-container").innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Project not found. Please go back to the main page.</p>
            </div>
        `;
        return;
    }
    
    // Clone the template
    const template = document.getElementById('project-template');
    const projectElement = template.content.cloneNode(true);
    
    // Fill in the project details
    projectElement.querySelector('.project-title').textContent = project.name;
    
    // Set project metadata (using placeholders if not available)
    const dateText = projectElement.querySelector('.date-text');
    dateText.textContent = project.date || 'Recent Project';
    
    const categoryText = projectElement.querySelector('.category-text');
    categoryText.textContent = formatCategory(project.category) || 'Web Project';
    
    // Project description
    const description = projectElement.querySelector('.project-description');
    description.textContent = project.desc;
    
    // Add YouTube video if available, otherwise show project image
    const videoContainer = projectElement.querySelector('.video-container');
    const projectImage = projectElement.querySelector('.project-image');
    const projectImagesSection = projectElement.querySelector('.project-images');
    
    if (project.videoId && project.videoId.trim() !== '') {
        // Extract video ID from URL if a full URL is provided
        let videoId = project.videoId;
        
        // Handle YouTube URLs in various formats
        if (videoId.includes('youtube.com/') || videoId.includes('youtu.be/')) {
            // Extract ID from youtube.com/watch?v=ID format
            const watchMatch = videoId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&]+)/);
            if (watchMatch && watchMatch[1]) {
                videoId = watchMatch[1];
            }
        }
        
        // Use YouTube iframe API with mobile-friendly parameters
        videoContainer.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1&enablejsapi=0"
                title="${project.name}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                loading="lazy"
                frameborder="0">
            </iframe>
        `;
        
        // Hide the project image section when video is available
        projectImagesSection.style.display = 'none';
    } else {
        // Hide video section if no video ID and show project image instead
        const videoSection = projectElement.querySelector('.project-video');
        videoSection.style.display = 'none';
        
        // Show project image
        projectImagesSection.style.display = 'block'; // Ensure the image container is visible
        projectImage.src = `/My-Portfolio-Website/assets/images/projects/${project.image}.png`;
        projectImage.alt = project.name;
    }
    
    // Add tech stack if available
    const techStackList = projectElement.querySelector('.tech-stack');
    if (project.techStack && project.techStack.length > 0) {
        project.techStack.forEach(tech => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="${getTechIcon(tech)}"></i>${tech}`;
            techStackList.appendChild(li);
        });
    } else {
        // Add default technologies based on category
        const defaultTechs = getDefaultTechnologies(project.category);
        defaultTechs.forEach(tech => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="${getTechIcon(tech)}"></i>${tech}`;
            techStackList.appendChild(li);
        });
    }
    
    // Add features if available
    const featuresList = projectElement.querySelector('.features-list');
    if (project.features && project.features.length > 0) {
        project.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
    } else {
        // Generate features from description
        const generatedFeatures = generateFeaturesFromDescription(project.desc);
        generatedFeatures.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
    }
    
    // Add challenges if available
    const challengesContainer = projectElement.querySelector('.challenges-container');
    if (project.challenges && project.challenges.length > 0) {
        project.challenges.forEach(challenge => {
            const challengeItem = document.createElement('div');
            challengeItem.className = 'challenge-item';
            challengeItem.innerHTML = `
                <h3>${challenge.title}</h3>
                <p>${challenge.solution}</p>
            `;
            challengesContainer.appendChild(challengeItem);
        });
    } else {
        // Add a default challenge
        const defaultChallenge = document.createElement('div');
        defaultChallenge.className = 'challenge-item';
        defaultChallenge.innerHTML = `
            <h3>Development Process</h3>
            <p>This project involved careful planning and implementation to ensure that all requirements were met while maintaining best practices in code quality and user experience.</p>
        `;
        challengesContainer.appendChild(defaultChallenge);
    }
    
    // Set project links - only show buttons if links are provided
    const viewBtn = projectElement.querySelector('.view-btn');
    const codeBtn = projectElement.querySelector('.code-btn');
    const projectActions = projectElement.querySelector('.project-actions');
    
    // Check if view link exists and is valid
    if (project.links && project.links.view && project.links.view !== "#" && project.links.view.trim() !== "") {
        viewBtn.href = project.links.view;
        viewBtn.style.display = 'flex';
    } else {
        viewBtn.style.display = 'none';
    }
    
    // Check if code link exists and is valid
    if (project.links && project.links.code && project.links.code !== "#" && project.links.code.trim() !== "") {
        codeBtn.href = project.links.code;
        codeBtn.style.display = 'flex';
    } else {
        codeBtn.style.display = 'none';
    }
    
    // Hide the entire actions section if both buttons are hidden
    if (viewBtn.style.display === 'none' && codeBtn.style.display === 'none') {
        projectActions.style.display = 'none';
    }
    
    // Clear the loading indicator and append the project details
    document.getElementById("project-container").innerHTML = '';
    document.getElementById("project-container").appendChild(projectElement);
    
    // Update page title with project name
    document.title = `${project.name} | Harsh Jingar`;
    
    // Initialize animations
    initAnimations();
}

// Initialize scroll reveal animations
function initAnimations() {
    const srtop = ScrollReveal({
        origin: 'top',
        distance: '80px',
        duration: 1000,
        reset: true
    });
    
    srtop.reveal('.project-header', { delay: 200 });
    srtop.reveal('.project-video', { delay: 300 });
    srtop.reveal('.project-images', { delay: 400 });
    srtop.reveal('.project-section', { interval: 200 });
    srtop.reveal('.project-actions', { delay: 600 });
}

// Format category name to be more readable
function formatCategory(category) {
    if (!category) return 'Web Project';
    
    const formatted = category
        .replace(/([A-Z])/g, ' $1') // Insert a space before all uppercase letters
        .replace(/^./, str => str.toUpperCase()) // Uppercase the first character
        .replace(/([a-z])([a-z]*)/g, (g0, g1, g2) => g1.toUpperCase() + g2); // Capitalize each word
    
    switch(category) {
        case 'professionalweb':
            return 'Professional Website';
        case 'basicweb':
            return 'Web Application';
        case 'mern':
            return 'MERN Stack';
        case 'lamp':
            return 'LAMP Stack';
        case 'android':
            return 'Android App';
        default:
            return formatted;
    }
}

// Get icon for technology
function getTechIcon(tech) {
    tech = tech.toLowerCase();
    
    const icons = {
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'javascript': 'fab fa-js',
        'react': 'fab fa-react',
        'node': 'fab fa-node-js',
        'node.js': 'fab fa-node-js',
        'express': 'fab fa-node-js',
        'mongodb': 'fas fa-database',
        'php': 'fab fa-php',
        'mysql': 'fas fa-database',
        'bootstrap': 'fab fa-bootstrap',
        'java': 'fab fa-java',
        'python': 'fab fa-python',
        'android': 'fab fa-android',
        'git': 'fab fa-git-alt',
        'github': 'fab fa-github',
        'wordpress': 'fab fa-wordpress',
        'sass': 'fab fa-sass',
        'angular': 'fab fa-angular',
        'vue': 'fab fa-vuejs',
        'aws': 'fab fa-aws',
        'docker': 'fab fa-docker',
        'linux': 'fab fa-linux',
        'windows': 'fab fa-windows',
        'apple': 'fab fa-apple',
        'npm': 'fab fa-npm',
        'yarn': 'fab fa-yarn',
    };
    
    return icons[tech] || 'fas fa-code';
}

// Get default technologies based on project category
function getDefaultTechnologies(category) {
    switch(category) {
        case 'professionalweb':
            return ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'PHP'];
        case 'basicweb':
            return ['HTML', 'CSS', 'JavaScript', 'Bootstrap'];
        case 'mern':
            return ['MongoDB', 'Express', 'React', 'Node.js'];
        case 'lamp':
            return ['Linux', 'Apache', 'MySQL', 'PHP'];
        case 'android':
            return ['Java', 'Android', 'XML'];
        default:
            return ['HTML', 'CSS', 'JavaScript'];
    }
}

// Generate features from project description
function generateFeaturesFromDescription(description) {
    if (!description) return ['Interactive user interface', 'Responsive design', 'Clean code architecture'];
    
    const features = [];
    
    // Add a responsive design feature
    features.push('Responsive design for optimal viewing on all devices');
    
    // Split description into sentences
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Extract potential features (sentences with action verbs or key components)
    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        
        // Look for phrases indicating features
        if (
            trimmed.includes('feature') || 
            trimmed.includes('includes') || 
            trimmed.includes('supports') ||
            trimmed.includes('allows') ||
            trimmed.includes('enable') ||
            trimmed.includes('provides')
        ) {
            features.push(capitalizeFirstLetter(trimmed));
        }
    });
    
    // If we couldn't extract enough features, add some generic ones
    if (features.length < 3) {
        if (description.toLowerCase().includes('user')) {
            features.push('User-friendly interface with intuitive navigation');
        }
        
        if (description.toLowerCase().includes('seo')) {
            features.push('SEO optimization for better search engine visibility');
        }
        
        if (description.toLowerCase().includes('secure') || description.toLowerCase().includes('security')) {
            features.push('Secure design with data protection measures');
        }
        
        if (description.toLowerCase().includes('performance')) {
            features.push('Optimized performance for fast loading times');
        }
        
        // Still need more features?
        if (features.length < 3) {
            features.push('Clean and modern design aesthetics');
            
            if (features.length < 3) {
                features.push('Cross-browser compatibility');
            }
        }
    }
    
    // Limit to 5 features maximum
    return features.slice(0, 5);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', showProjectDetails);

