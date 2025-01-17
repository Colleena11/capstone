document.addEventListener('DOMContentLoaded', async () => {
    const approvedArtworksContainer = document.getElementById('approved-artworks');

    async function loadApprovedArtworks() {
        try {
            const artworks = await firebaseServices.getApprovedArtworks();
            approvedArtworksContainer.innerHTML = '';

            artworks.forEach(artwork => {
                const artworkElement = document.createElement('div');
                artworkElement.className = 'artwork-item';
                artworkElement.innerHTML = `
                    <img src="${artwork.imageUrl}" alt="${artwork.title}">
                    <h3>${artwork.title}</h3>
                    <p>Artist: ${artwork.artist}</p>
                    <p>Price: $${artwork.price}</p>
                    <p>${artwork.description}</p>
                `;
                approvedArtworksContainer.appendChild(artworkElement);
            });
        } catch (error) {
            console.error('Error loading approved artworks:', error);
            approvedArtworksContainer.innerHTML = '<p>Error loading artworks. Please try again later.</p>';
        }
    }

    // Initial load of approved artworks
    loadApprovedArtworks();
});
