import cv2
import numpy as np

def crop_and_resize(path, size=512):
    img = cv2.imread(path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (size, size))
    return img

if __name__ == "__main__":
    before = crop_and_resize("../data/raw/before.png")
    after  = crop_and_resize("../data/raw/after.png")

    # Quick sanity check — both images must be same shape to compare later
    assert before.shape == after.shape, "Before/after images are misaligned — fix before proceeding"

    np.save("../data/processed/before.npy", before)
    np.save("../data/processed/after.npy", after)
    print("Preprocessing done. Shapes match:", before.shape, after.shape)