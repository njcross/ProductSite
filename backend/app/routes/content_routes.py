
from flask import Blueprint, request, jsonify, current_app
import json
import os

content_bp = Blueprint('content_routes', __name__)

from app.utils.decorators import admin_required

def is_admin():
    return request.headers.get("X-Admin") == "true"

@content_bp.route('/api/update-content', methods=['POST'])
@admin_required
def update_content():
    return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data or "field" not in data or "value" not in data:
        return jsonify({"error": "Missing 'field' or 'value'"}), 400

    content_path = os.path.join(current_app.root_path, 'static', 'content.json')

    # Ensure file exists
    if not os.path.exists(content_path):
        with open(content_path, 'w') as f:
            json.dump({}, f)

    # Load existing data
    with open(content_path, 'r') as f:
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
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(file.filename)
    save_path = os.path.join(upload_folder, filename)
    file.save(save_path)

    image_url = f'/static/uploads/{filename}'
    return jsonify({"success": True, "url": image_url})



@content_bp.route('/api/content-preview', methods=['GET'])
def content_preview():
    content_path = os.path.join(current_app.root_path, 'static', 'content.json')
    if not os.path.exists(content_path):
        return jsonify({})
    with open(content_path, 'r') as f:
        content = json.load(f)
    return jsonify(content)
