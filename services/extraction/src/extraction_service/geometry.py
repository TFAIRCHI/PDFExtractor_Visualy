from __future__ import annotations

from .models import BBox


def normalize_bbox(source: BBox, page_width: float, page_height: float) -> BBox:
    if page_width <= 0 or page_height <= 0:
        raise ValueError("Page dimensions must be positive.")
    return BBox(
        x=source.x / page_width,
        y=source.y / page_height,
        width=source.width / page_width,
        height=source.height / page_height,
    )


def clamp_bbox(box: BBox, page_width: float, page_height: float) -> BBox:
    x = min(max(box.x, 0.0), page_width)
    y = min(max(box.y, 0.0), page_height)
    width = min(max(box.width, 0.0), page_width - x)
    height = min(max(box.height, 0.0), page_height - y)
    return BBox(x=x, y=y, width=width, height=height)
