from flask import Flask
from flask_cors import CORS
from routes.options  import options_bp
from routes.episodes import episodes_bp
from routes.resolve  import resolve_bp
from routes.stream   import stream_bp
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(options_bp)
app.register_blueprint(episodes_bp)
app.register_blueprint(resolve_bp)
app.register_blueprint(stream_bp)

@app.route("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)