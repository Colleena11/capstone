// Load team members
document.addEventListener('DOMContentLoaded', () => {
    const teamContainer = document.getElementById('team-members');
    
    // Team members data
    const teamMembers = [
        {
            name: 'Mark Joshua Diog',
            role: 'CEO & Founder',
            image: 'images/team/jm.jpg',
            description: 'Lead developer and visionary behind Rack N Sold.'
        },
        {
            name: 'Colleen Mallari',
            role: 'Chief Marketing Officer',
            image: 'images/team/ruki.jpg',
            description: 'Handles marketing strategy and business development.'
        },
        {
            name: 'Jan Jaerod Marzo',
            role: 'Art Director',
            image: 'images/team/clarenz.jpg',
            description: 'Oversees artistic direction and curation.'
        },
    ];

    // Render team members
    teamContainer.innerHTML = teamMembers.map(member => `
        <div class="team-member">
            <img src="${member.image}" alt="${member.name}" 
                 onerror="this.src='images/sample.png'">
            <h3>${member.name}</h3>
            <h4>${member.role}</h4>
            <p>${member.description}</p>
        </div>
    `).join('');

    // Add smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Add animation on scroll
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.value-card, .team-member');
    
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        // Add animation class when element is in viewport
        if(position.top < window.innerHeight - 100) {
            element.classList.add('fade-in');
        }
    });
});
