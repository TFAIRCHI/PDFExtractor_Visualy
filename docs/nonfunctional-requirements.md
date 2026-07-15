# Nonfunctional Requirements

- Windows 11 target workstation: 8 logical CPUs, 16 GB RAM, SSD, no required GPU.
- Keep UI responsive while extraction runs in a sidecar process.
- Use bounded processing and cancellation for long-running work.
- Preserve source PDF coordinates, normalized coordinates, and display coordinates.
- Support project schema migrations from the first persisted format.
- Maintain reproducible dependency lockfiles.
- Run unit and boundary tests after meaningful changes.
