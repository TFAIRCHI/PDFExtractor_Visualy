from extraction_service.geometry import normalize_bbox
from extraction_service.models import BBox


def test_normalize_bbox() -> None:
    normalized = normalize_bbox(BBox(x=50, y=100, width=25, height=20), 200, 400)

    assert normalized.x == 0.25
    assert normalized.y == 0.25
    assert normalized.width == 0.125
    assert normalized.height == 0.05
