// ...existing code...
    return `
        <div class="artwork-card">
            <img src="${artwork.imageUrl}" alt="${artwork.title}">
            <h3>${artwork.title}</h3>
            <p class="artist">By ${artwork.artist}</p>
            <p class="price">₱${artwork.price.toFixed(2)}</p>
            <button onclick="addToCart('${artwork.id}')" class="add-to-cart-btn">Add to Cart</button>
        </div>
    `;
// ...existing code...
