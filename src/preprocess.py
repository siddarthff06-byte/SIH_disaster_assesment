import os
import cv2
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # .../SIH_Project/src
PROJECT_ROOT = os.path.dirname(BASE_DIR)                  # .../SIH_Project

def crop_and_resize(path, size=512):
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not read image at {path} — check the path and filename")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (size, size))
    return img

if __name__ == "__main__":
    before_path = os.path.join(PROJECT_ROOT, "data", "raw", "before.png")
    after_path  = os.path.join(PROJECT_ROOT, "data", "raw", "after.png")

    before = crop_and_resize(before_path)
    after  = crop_and_resize(after_path)

    # Quick sanity check — both images must be same shape to compare later
    assert before.shape == after.shape, "Before/after images are misaligned — fix before proceeding"

    processed_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)

    np.save(os.path.join(processed_dir, "before.npy"), before)
    np.save(os.path.join(processed_dir, "after.npy"), after)
    print("Preprocessing done. Shapes match:", before.shape, after.shape)