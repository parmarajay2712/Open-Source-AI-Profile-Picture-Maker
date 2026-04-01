"""
rembg AI Service — Background Removal & Replacement
FastAPI wrapper around the rembg library for removing and replacing image backgrounds.
"""

import io
import time
from typing import Optional

import numpy as np
from PIL import Image, ImageFilter
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI(title="PFP Maker — rembg Service", version="1.0.0")

# Lazy-load the rembg session for faster startup
_session = None


def get_session():
    global _session
    if _session is None:
        from rembg import new_session
        _session = new_session("u2net")
    return _session


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "rembg", "uptime": int(time.time())}


@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    """Remove the background from an uploaded image."""
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=415, detail="Only JPEG and PNG images are supported.")

    try:
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents)).convert("RGBA")

        from rembg import remove
        output_image = remove(input_image, session=get_session())

        buf = io.BytesIO()
        output_image.save(buf, format="PNG")
        buf.seek(0)

        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")


@app.post("/replace-bg")
async def replace_background(
    file: UploadFile = File(...),
    bg_type: str = Form("color"),
    bg_value: str = Form("#FFFFFF"),
):
    """Remove background and replace with a solid color or blurred version."""
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=415, detail="Only JPEG and PNG images are supported.")

    try:
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents)).convert("RGBA")

        from rembg import remove
        fg_image = remove(input_image, session=get_session())

        if bg_type == "color":
            bg_color = parse_hex_color(bg_value)
            bg = Image.new("RGBA", fg_image.size, bg_color)
            bg.paste(fg_image, (0, 0), fg_image)
            result = bg.convert("RGB")
        elif bg_type == "blur":
            blur_radius = int(bg_value) if bg_value.isdigit() else 10
            bg = input_image.convert("RGB").filter(ImageFilter.GaussianBlur(radius=blur_radius))
            bg = bg.convert("RGBA")
            bg.paste(fg_image, (0, 0), fg_image)
            result = bg.convert("RGB")
        else:
            # For 'image' type, just return the transparent bg result
            result = fg_image

        buf = io.BytesIO()
        fmt = "PNG" if bg_type == "image" else "PNG"
        result.save(buf, format=fmt)
        buf.seek(0)

        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background replacement failed: {str(e)}")


def parse_hex_color(hex_str: str) -> tuple:
    """Parse a hex color string like #RRGGBB into an (R, G, B, 255) tuple."""
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 6:
        r, g, b = int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16)
        return (r, g, b, 255)
    return (255, 255, 255, 255)
