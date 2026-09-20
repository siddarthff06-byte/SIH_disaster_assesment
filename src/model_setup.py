import segmentation_models_pytorch as smp

def get_model():
    model = smp.DeepLabV3Plus(
        encoder_name="resnet34",
        encoder_weights="imagenet",   # pretrained — do NOT train from scratch
        in_channels=3,
        classes=1,
    )
    model.eval()
    return model

if __name__ == "__main__":
    model = get_model()
    print("Model loaded:", model.__class__.__name__)