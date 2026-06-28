from flask import Blueprint, request, Response, jsonify
import requests as req

stream_bp = Blueprint("stream", __name__)

# These are the headers that fool the CDN into thinking
# the request is coming from a real browser session
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "identity",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "video",
    "Sec-Fetch-Mode": "no-cors",
    "Sec-Fetch-Site": "cross-site",
}


@stream_bp.route("/stream")
def stream():
    video_url = request.args.get("url")
    referer   = request.args.get("ref", "https://videodownloader.site/")

    if not video_url:
        return jsonify({"error": "No URL provided"}), 400

    headers = {
        **BROWSER_HEADERS,
        "Referer": referer,
        "Origin":  "https://videodownloader.site",
        "Range":   request.headers.get("Range", "bytes=0-"),
    }

    try:
        r = req.get(
            video_url,
            headers=headers,
            stream=True,
            timeout=30,
            allow_redirects=True
        )

        # If still blocked, return a clear error
        if r.status_code == 403:
            return jsonify({
                "error": "Access denied by CDN",
                "direct_url": video_url,
                "hint": "Open direct_url in browser"
            }), 403

        response_headers = {
            "Content-Type":   r.headers.get("Content-Type", "video/mp4"),
            "Accept-Ranges":  "bytes",
            "Content-Length": r.headers.get("Content-Length", ""),
            "Content-Range":  r.headers.get("Content-Range", ""),
            # Allow the browser player to seek
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Headers": "Range",
            "Access-Control-Expose-Headers": "Content-Length, Content-Range",
        }

        return Response(
            r.iter_content(chunk_size=1024 * 512),
            status=r.status_code,
            headers=response_headers
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stream_bp.route("/stream", methods=["OPTIONS"])
def stream_preflight():
    # Handle CORS preflight for Range header requests
    return Response(headers={
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Headers": "Range, Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
    })

@stream_bp.route("/download")
def download():
    video_url = request.args.get("url")
    filename  = request.args.get("filename", "video.mp4")
    referer   = request.args.get("ref", "https://videodownloader.site/")

    if not video_url:
        return jsonify({"error": "No URL provided"}), 400

    headers = {
        **BROWSER_HEADERS,
        "Referer": referer,
        "Origin":  "https://videodownloader.site",
        "Range":   "bytes=0-",
    }

    try:
        r = req.get(
            video_url,
            headers=headers,
            stream=True,
            timeout=30,
            allow_redirects=True
        )

        if r.status_code == 403:
            return jsonify({"error": "Access denied"}), 403

        response_headers = {
            "Content-Type":        r.headers.get("Content-Type", "video/mp4"),
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length":      r.headers.get("Content-Length", ""),
            "Access-Control-Allow-Origin": "*",
        }

        return Response(
            r.iter_content(chunk_size=1024 * 512),
            status=200,
            headers=response_headers
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500