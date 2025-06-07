
from flask import Blueprint, request, jsonify, current_app
import json
import os

content_bp = Blueprint('content', __name__)

from app.utils.decorators import admin_required

@content_bp.route('/api/update-content', methods=['POST'])
@admin_required
def update_content():

    data = request.get_json()
    if not data or "field" not in data or "value" not in data:
        return jsonify({"error": "Missing 'field' or 'value'"}), 400

    content_path = os.path.join(current_app.root_path, '../../react-router-bootstrap-app/public/', 'content.json')

    # Ensure file exists
    if not os.path.exists(content_path):
        with open(content_path, 'w') as f:
            json.dump({}, f)

    # Load existing data
    with open(content_path, 'r', encoding='utf-8') as f:
        content = json.load(f)

    # Update field
    content[data["field"]] = data["value"]

    # Save file
    with open(content_path, 'w') as f:
        json.dump(content, f, indent=2)

    return jsonify({"success": True, "updated": {data["field"]: data["value"]}})


from werkzeug.utils import secure_filename
from flask import send_from_directory

@content_bp.route('/api/upload-image', methods=['POST'])
@admin_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    from flask import current_app
    upload_folder = os.path.join(current_app.root_path, '../../react-router-bootstrap-app/public/', 'images')
    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(file.filename)
    save_path = os.path.join(upload_folder, filename)
    file.save(save_path)
    os.chmod(save_path, 0o755)  # Set file permissions to be readable

    image_url = f'/images/{filename}'
    return jsonify({"success": True, "url": image_url})



@content_bp.route('/api/content-preview', methods=['GET'])
def content_preview():
    content_path = os.path.join(current_app.root_path, '../../react-router-bootstrap-app/public', 'content.json')
    if not os.path.exists(content_path):
        return jsonify({})
    with open(content_path, 'r', encoding='utf-8') as f:
        content = json.load(f)
    return jsonify(content)

@content_bp.route('/api/images', methods=['GET'])
@admin_required
def list_uploaded_images():
    """Returns a list of URLs for all uploaded images."""
    images_folder = os.path.join(current_app.root_path, '../../react-router-bootstrap-app/public/images')
    base_url = '/images'  # This should match your frontend static serving path

    if not os.path.exists(images_folder):
        return jsonify([])

    image_files = [
        f"{base_url}/{filename}"
        for filename in os.listdir(images_folder)
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.jfif', '.ico'))
    ]

    return jsonify(sorted(image_files))
