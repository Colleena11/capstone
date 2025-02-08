from flask import Flask, request, jsonify, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import base64
import logging
import sys
from io import BytesIO
from PIL import Image

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('server.log')
    ]
)
logger = logging.getLogger(__name__)

# Get the absolute path to the project root directory
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(ROOT_DIR)
ADMIN_DIR = os.path.join(PARENT_DIR, 'admin-platform', 'public')
RACK_N_SOLD_DIR = os.path.join(PARENT_DIR, 'Rack N Sold')
DB_PATH = os.path.join(ROOT_DIR, 'artworks.db')

# Verify directories exist
for directory in [ROOT_DIR, PARENT_DIR, ADMIN_DIR, RACK_N_SOLD_DIR]:
    if not os.path.exists(directory):
        logger.error(f"Directory does not exist: {directory}")
        raise FileNotFoundError(f"Directory does not exist: {directory}")

logger.info(f"Root directory: {ROOT_DIR}")
logger.info(f"Parent directory: {PARENT_DIR}")
logger.info(f"Admin directory: {ADMIN_DIR}")
logger.info(f"Rack N Sold directory: {RACK_N_SOLD_DIR}")
logger.info(f"Database path: {DB_PATH}")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Use SQLite with absolute path
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB limit

db = SQLAlchemy(app)

class Artwork(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    image_data = db.Column(db.LargeBinary, nullable=False)
    image_format = db.Column(db.String(10), nullable=False, default='JPEG')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')

def process_image(image_data_url):
    """Process and optimize the uploaded image."""
    try:
        # Extract the base64 data
        if ',' not in image_data_url:
            raise ValueError("Invalid image data URL format")
            
        header, encoded = image_data_url.split(',', 1)
        if not header.startswith('data:image/'):
            raise ValueError("Invalid image data URL format")
            
        try:
            image_data = base64.b64decode(encoded)
        except Exception as e:
            logger.error(f"Failed to decode base64 data: {str(e)}")
            raise ValueError("Invalid image data encoding")
        
        # Open the image using PIL
        try:
            image = Image.open(BytesIO(image_data))
        except Exception as e:
            logger.error(f"Failed to open image data: {str(e)}")
            raise ValueError("Invalid image data")
        
        # Log original image details
        logger.info(f"Original image: format={image.format}, mode={image.mode}, size={image.size}")
        
        # Convert RGBA to RGB if necessary
        if image.mode == 'RGBA':
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Optimize the image
        output = BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        processed_data = output.getvalue()
        
        # Verify the processed image
        try:
            verify_image = Image.open(BytesIO(processed_data))
            logger.info(f"Processed image: format={verify_image.format}, mode={verify_image.mode}, size={verify_image.size}")
        except Exception as e:
            logger.error(f"Failed to verify processed image: {str(e)}")
            raise ValueError("Failed to process image")
        
        return processed_data, 'JPEG'
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise ValueError(f"Failed to process image: {str(e)}")

# Cart storage (in-memory for demonstration)
cart_items = []

@app.route('/')
def serve_index():
    try:
        logger.info(f"Serving index.html from {ADMIN_DIR}")
        return send_from_directory(ADMIN_DIR, 'index.html')
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        return jsonify({'error': 'Failed to serve index.html'}), 500

@app.route('/Rack N Sold/<path:path>')
def serve_rack_n_sold(path):
    try:
        logger.info(f"Serving Rack N Sold file: {path}")
        return send_from_directory(RACK_N_SOLD_DIR, path)
    except Exception as e:
        logger.error(f"Error serving Rack N Sold file {path}: {str(e)}")
        return abort(404)

@app.route('/<path:path>')
def serve_static(path):
    try:
        logger.info(f"Serving static file: {path}")
        # Try serving from admin directory first
        if os.path.exists(os.path.join(ADMIN_DIR, path)):
            return send_from_directory(ADMIN_DIR, path)
        # Then try Rack N Sold directory
        elif os.path.exists(os.path.join(RACK_N_SOLD_DIR, path)):
            return send_from_directory(RACK_N_SOLD_DIR, path)
        else:
            logger.error(f"File not found: {path}")
            return abort(404)
    except Exception as e:
        logger.error(f"Error serving static file {path}: {str(e)}")
        return abort(404)

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_artwork():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        logger.info("Received upload request")
        data = request.json
        if not data:
            logger.error("No data received in request")
            return jsonify({'error': 'No data received'}), 400
            
        required_fields = ['title', 'artist', 'price', 'description', 'image']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        try:
            # Process and optimize the image
            image_data, image_format = process_image(data['image'])
            logger.info(f"Successfully processed image, size: {len(image_data)} bytes")
            
            artwork = Artwork(
                title=data['title'],
                artist=data['artist'],
                price=float(data['price']),
                description=data['description'],
                image_data=image_data,
                image_format=image_format,
                status='pending'
            )
            
            db.session.add(artwork)
            db.session.commit()
            logger.info(f"Successfully saved artwork with ID: {artwork.id}")
            
            return jsonify({
                'message': 'Artwork uploaded successfully',
                'artwork_id': artwork.id
            }), 201
            
        except ValueError as e:
            logger.error(f"Image processing error: {str(e)}")
            return jsonify({'error': str(e)}), 400
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in upload_artwork: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/artworks', methods=['GET'])
def get_artworks():
    try:
        logger.info("Fetching all artworks")
        artworks = Artwork.query.order_by(Artwork.created_at.desc()).all()
        logger.info(f"Found {len(artworks)} artworks")
        
        result = []
        for art in artworks:
            try:
                result.append({
                    'id': art.id,
                    'title': art.title,
                    'artist': art.artist,
                    'price': art.price,
                    'description': art.description,
                    'image': f'/api/artwork/{art.id}/image',
                    'created_at': art.created_at.isoformat(),
                    'status': art.status
                })
            except Exception as e:
                logger.error(f"Error processing artwork {art.id}: {str(e)}")
                continue
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in get_artworks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/artworks/approved', methods=['GET'])
def get_approved_artworks():
    try:
        logger.info("Fetching approved artworks")
        artworks = Artwork.query.filter_by(status='approved').order_by(Artwork.created_at.desc()).all()
        logger.info(f"Found {len(artworks)} approved artworks")
        
        result = []
        for art in artworks:
            try:
                result.append({
                    'id': art.id,
                    'title': art.title,
                    'artist': art.artist,
                    'price': art.price,
                    'description': art.description,
                    'image': f'/api/artwork/{art.id}/image',
                    'created_at': art.created_at.isoformat()
                })
            except Exception as e:
                logger.error(f"Error processing artwork {art.id}: {str(e)}")
                continue
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in get_approved_artworks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/artwork/<int:artwork_id>/image', methods=['GET'])
def get_artwork_image(artwork_id):
    try:
        logger.info(f"Fetching image for artwork ID: {artwork_id}")
        artwork = Artwork.query.get_or_404(artwork_id)
        
        # Ensure we have valid image data
        if not artwork.image_data:
            logger.error(f"No image data found for artwork {artwork_id}")
            return 'No image available', 404
            
        # Set correct content type based on image format
        content_type = f'image/{artwork.image_format.lower()}'
        logger.info(f"Serving image with content type: {content_type}")
        
        return artwork.image_data, 200, {
            'Content-Type': content_type,
            'Cache-Control': 'public, max-age=31536000'
        }
    except Exception as e:
        logger.error(f"Error in get_artwork_image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/artwork/<int:artwork_id>/status', methods=['POST'])
def update_artwork_status(artwork_id):
    try:
        data = request.json
        if not data or 'status' not in data:
            return jsonify({'error': 'Status not provided'}), 400
            
        status = data['status']
        if status not in ['approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400
            
        artwork = Artwork.query.get_or_404(artwork_id)
        artwork.status = status
        db.session.commit()
        
        return jsonify({
            'message': f'Artwork {status} successfully',
            'artwork_id': artwork_id,
            'status': status
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart', methods=['GET'])
def get_cart_items():
    try:
        return jsonify(cart_items)
    except Exception as e:
        logger.error(f"Error getting cart items: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    try:
        data = request.json
        artwork_id = data.get('artwork_id')
        
        if not artwork_id:
            return jsonify({'error': 'Artwork ID is required'}), 400
            
        artwork = Artwork.query.get(artwork_id)
        if not artwork:
            return jsonify({'error': 'Artwork not found'}), 404
            
        cart_item = {
            'id': artwork.id,
            'title': artwork.title,
            'artist': artwork.artist,
            'price': artwork.price,
            'image': f'/api/artwork/{artwork.id}/image',
            'added_at': datetime.now().isoformat()
        }
        
        cart_items.append(cart_item)
        return jsonify({'message': 'Added to cart', 'item': cart_item})
    except Exception as e:
        logger.error(f"Error adding to cart: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart/remove/<int:item_id>', methods=['POST'])
def remove_from_cart(item_id):
    try:
        global cart_items
        cart_items = [item for item in cart_items if item['id'] != item_id]
        return jsonify({'message': 'Item removed from cart'})
    except Exception as e:
        logger.error(f"Error removing from cart: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
            artwork_count = Artwork.query.count()
            logger.info(f"Current number of artworks in database: {artwork_count}")
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            sys.exit(1)
    
    logger.info("Starting Flask server")
    app.run(debug=True, port=5000)
