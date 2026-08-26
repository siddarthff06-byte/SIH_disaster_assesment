import os
import numpy as np
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

def compute_severity(before_mask, after_mask, grid_size=32):
    h, w = before_mask.shape
    results = []
    step_h, step_w = h // grid_size, w // grid_size

    for i in range(grid_size):
        for j in range(grid_size):
            y0, y1 = i*step_h, (i+1)*step_h
            x0, x1 = j*step_w, (j+1)*step_w
            before_area = before_mask[y0:y1, x0:x1].sum()
            after_area  = after_mask[y0:y1, x0:x1].sum()
            if before_area < 5:
                continue
            loss_ratio = 1 - (after_area / (before_area + 1e-6))
            if loss_ratio < 0.2:
                severity = "intact"
            elif loss_ratio < 0.6:
                severity = "damaged"
            else:
                severity = "destroyed"
            results.append({
                "building_id": f"B_{i}_{j}",
                "row": i, "col": j,
                "loss_ratio": round(float(loss_ratio), 3),
                "severity": severity
            })
    return results

if __name__ == "__main__":
    masks_dir = os.path.join(PROJECT_ROOT, "outputs", "masks")
    before_mask = np.load(os.path.join(masks_dir, "before_mask.npy"))
    after_mask  = np.load(os.path.join(masks_dir, "after_mask.npy"))

    severity_data = compute_severity(before_mask, after_mask)

    severity_dir = os.path.join(PROJECT_ROOT, "outputs", "severity")
    os.makedirs(severity_dir, exist_ok=True)

    output_path = os.path.join(severity_dir, "severity_output.json")
    with open(output_path, "w") as f:
        json.dump(severity_data, f, indent=2)

    print(f"Classified {len(severity_data)} building cells.")
    print(f"Saved to {output_path}")