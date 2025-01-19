document.addEventListener('DOMContentLoaded', async () => {
    const approvedArtworksContainer = document.getElementById('approved-artworks');
    const artworkForm = document.getElementById('artwork-form');
    const artworksGrid = document.getElementById('approved-artworks');

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

    artworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const imageFile = document.getElementById('artwork-image').files[0];
        const title = document.getElementById('artwork-title').value;
        const price = document.getElementById('artwork-price').value;

        try {
            // Use the storage reference from firebaseServices
            const storageRef = firebaseServices.storage.ref();
            const imageRef = storageRef.child(`artworks/${Date.now()}_${imageFile.name}`);
            await imageRef.put(imageFile);
            const imageUrl = await imageRef.getDownloadURL();

            await firebaseServices.db.collection('artworks').add({
                title,
                price,
                imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            artworkForm.reset();
            alert('Artwork uploaded successfully!');
        } catch (error) {
            console.error('Error uploading artwork:', error);
            alert('Error uploading artwork');
        }
    });

    // Display artworks
    function displayArtworks() {
        db.collection('artworks').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            artworksGrid.innerHTML = '';
            snapshot.forEach(doc => {
                const artwork = doc.data();
                const artworkElement = `
                    <div class="artwork-item">
                        <img src="${artwork.imageUrl}" alt="${artwork.title}">
                        <h3>${artwork.title}</h3>
                        <p>$${artwork.price}</p>
                        <button onclick="deleteArtwork('${doc.id}')" class="delete-btn">Delete</button>
                    </div>
                `;
                artworksGrid.innerHTML += artworkElement;
            });
        });
    }

    // Delete artwork
    async function deleteArtwork(docId) {
        if (confirm('Are you sure you want to delete this artwork?')) {
            try {
                await db.collection('artworks').doc(docId).delete();
                alert('Artwork deleted successfully!');
            } catch (error) {
                console.error('Error deleting artwork:', error);
                alert('Error deleting artwork');
            }
        }
    }

    // Initial load of approved artworks
    loadApprovedArtworks();
    displayArtworks();
});
