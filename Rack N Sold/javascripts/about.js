// Team members data
const teamMembers = [
    {
        name: "Mark Joshua Diog",
        role: "Founder & CEO",
        image: "images/team/joshua.jpg",
        description: "Art enthusiast with 10+ years in digital platforms"
    },
    {
        name: "Colleen Mallari",
        role: "Head of Curation",
        image: "C:\Users\MALLARI\Downloads\Rack N Sold\Rack N Sold\images\colleen.png",
        description: "Former gallery curator with passion for emerging artists"
    },
    {
        name: "Jan Marzo",
        role: "Technical Director",
        image: "images/team/michael.jpg",
        description: "Tech expert ensuring smooth platform operations"
    },
    
];

// Load team members
document.addEventListener('DOMContentLoaded', () => {
    const teamContainer = document.getElementById('team-members');
    
    teamMembers.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member';
        
        memberDiv.innerHTML = `
            <img src="${member.image}" alt="${member.name}">
            <h3>${member.name}</h3>
            <h4>${member.role}</h4>
            <p>${member.description}</p>
        `;
        
        teamContainer.appendChild(memberDiv);
    });

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
