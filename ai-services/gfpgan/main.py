"""
GFPGAN AI Service — Face Enhancement / Restoration
FastAPI wrapper around GFPGAN for enhancing and restoring face quality in images.
"""

import io
import os
import time
import tempfile

import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI(title="PFP Maker — GFPGAN Service", version="1.0.0")

# Lazy-load the GFPGAN restorer
_restorer = None
_model_dir = os.path.join(tempfile.gettempdir(), "gfpgan_models")


def get_restorer():
    global _restorer
    if _restorer is None:
        os.makedirs(_model_dir, exist_ok=True)
        from gfpgan import GFPGANer
        _restorer = GFPGANer(
            model_path="https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
            upscale=2,
            arch="clean",
            channel_multiplier=2,
            bg_upsampler=None,
        )
    return _restorer


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "gfpgan", "uptime": int(time.time())}


@app.post("/enhance")
async def enhance_face(file: UploadFile = File(...)):
    """Enhance face quality using GFPGAN."""
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=415, detail="Only JPEG and PNG images are supported.")

    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        input_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if input_img is None:
            raise HTTPException(status_code=400, detail="Could not decode image.")

        restorer = get_restorer()
        _, _, output = restorer.enhance(
            input_img,
            has_aligned=False,
            only_center_face=False,
            paste_back=True,
        )

        if output is None:
            raise HTTPException(
                status_code=422,
                detail="No face detected in the image. Please upload a clear photo with a visible face.",
            )

        _, buf_encoded = cv2.imencode(".png", output)
        buf = io.BytesIO(buf_encoded.tobytes())
        buf.seek(0)

        return StreamingResponse(buf, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face enhancement failed: {str(e)}")
