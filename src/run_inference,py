import os
import numpy as np
import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

def compute_change_mask(before_img, after_img, threshold=30):
    """
    Detects significant pixel changes between before/after images.
    threshold: how much a pixel's grayscale value must differ to count as 'changed'.
    Higher threshold = stricter (fewer false positives from lighting/noise).
    Lower threshold = more sensitive (may pick up shadows/noise as change).
    """
    before_gray = cv2.cvtColor(before_img, cv2.COLOR_RGB2GRAY).astype(int)
    after_gray  = cv2.cvtColor(after_img, cv2.COLOR_RGB2GRAY).astype(int)

    diff = np.abs(after_gray - before_gray)
    change_mask = diff > threshold

    return change_mask

if __name__ == "__main__":
    processed_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    before_img = np.load(os.path.join(processed_dir, "before.npy"))
    after_img  = np.load(os.path.join(processed_dir, "after.npy"))

    change_mask = compute_change_mask(before_img, after_img, threshold=30)

    # No trained segmentation model available, so:
    # before_mask = assume the whole image is "structure present"
    # after_mask  = pixels that did NOT change = still standing
    before_mask = np.ones(before_img.shape[:2], dtype=bool)
    after_mask  = ~change_mask

    print("Before mask 'on' pixels:", before_mask.sum(), "/", before_mask.size)
    print("After mask 'on' pixels:", after_mask.sum(), "/", after_mask.size)
    print("Changed pixels:", change_mask.sum(), "/", change_mask.size)

    masks_dir = os.path.join(PROJECT_ROOT, "outputs", "masks")
    os.makedirs(masks_dir, exist_ok=True)

    np.save(os.path.join(masks_dir, "before_mask.npy"), before_mask)
    np.save(os.path.join(masks_dir, "after_mask.npy"), after_mask)
    print("Masks saved to outputs/masks/ (diff-based, not model-based)")