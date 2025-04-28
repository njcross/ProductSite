from flask import app, jsonify

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200