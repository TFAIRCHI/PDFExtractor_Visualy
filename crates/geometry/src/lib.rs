use pyo3::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct BBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

impl BBox {
    pub fn normalize(&self, page_width: f64, page_height: f64) -> Result<BBox, &'static str> {
        if page_width <= 0.0 || page_height <= 0.0 {
            return Err("page dimensions must be positive");
        }
        Ok(BBox {
            x: self.x / page_width,
            y: self.y / page_height,
            width: self.width / page_width,
            height: self.height / page_height,
        })
    }
}

#[pyfunction]
fn normalize_bbox(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    page_width: f64,
    page_height: f64,
) -> PyResult<(f64, f64, f64, f64)> {
    let normalized = BBox {
        x,
        y,
        width,
        height,
    }
    .normalize(page_width, page_height)
    .map_err(pyo3::exceptions::PyValueError::new_err)?;
    Ok((
        normalized.x,
        normalized.y,
        normalized.width,
        normalized.height,
    ))
}

#[pymodule]
fn pdf_intelligence_geometry(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(normalize_bbox, m)?)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::BBox;

    #[test]
    fn normalizes_bbox() {
        let normalized = BBox {
            x: 50.0,
            y: 100.0,
            width: 25.0,
            height: 20.0,
        }
        .normalize(200.0, 400.0)
        .unwrap();

        assert_eq!(normalized.x, 0.25);
        assert_eq!(normalized.y, 0.25);
        assert_eq!(normalized.width, 0.125);
        assert_eq!(normalized.height, 0.05);
    }
}
