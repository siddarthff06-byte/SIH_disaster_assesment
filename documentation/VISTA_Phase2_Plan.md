# VISTA Phase 2: Plan of Action
**Project:** VISTA — Post-Disaster Building Damage Assessment Platform
**Phase:** 2 (Multi-Spectral Upgrade + Binary Disaster Classifier)
**Team:** SIH Hackathon (24-hour sprint format, extendable for refinement)
**Hardware:** RTX 4060 Laptop GPU (8GB VRAM), i7-13650HX, 24GB RAM

---

## Table of Contents
1. [What Phase 2 Is and Why](#1-what-phase-2-is-and-why)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Sources](#3-data-sources)
4. [Spectrum Efficiency Scoring](#4-spectrum-efficiency-scoring)
5. [Tools and Setup](#5-tools-and-setup)
6. [Training Plan](#6-training-plan)
7. [Monitoring and When to Switch to Colab](#7-monitoring-and-when-to-switch-to-colab)
8. [Team Split and Timeline (24 hours)](#8-team-split-and-timeline-24-hours)
9. [Collaborative Training Strategy](#9-collaborative-training-strategy)
10. [Quantization and Deployment](#10-quantization-and-deployment)
11. [Downstream Applications](#11-downstream-applications)
12. [Evaluation Metrics](#12-evaluation-metrics)
13. [Further Refinement (Post-Hackathon)](#13-further-refinement-post-hackathon)

---

## 1. What Phase 2 Is and Why

### What Phase 1 did
- RGB-only pixel-difference heuristic: compared brightness of before and after images
- No trained model, no labels, no generalization
- Fails entirely under cloud cover, smoke, or at night
- Cannot distinguish a moved shadow from a collapsed building (high false positive rate)

### What Phase 2 does differently

| Component | Phase 1 | Phase 2 |
|---|---|---|
| Input data | RGB only (3 bands) | Multi-spectral: SAR + NIR + SWIR + RGB (6-13 bands) |
| Detection logic | Pixel brightness diff heuristic | Trained deep learning segmentation model |
| Model backbone | None | Prithvi-EO-2.0-300M (NASA/IBM, pretrained on satellite data) |
| Training data | None | xBD dataset (22,068 labeled before/after pairs) |
| False positive handling | None | Binary disaster classifier gates the segmentation model |
| Validation | Manual eyeballing | F1 score + confusion matrix on held-out test set |
| Weather robustness | Fails in cloud/smoke | SAR channel works 24/7 through all conditions |

### Primary deliverable
Multi-spectral upgrade: replace the Phase 1 heuristic with a fine-tuned Prithvi segmentation model that accepts SAR + infrared + visible bands.

### Secondary deliverable
Binary disaster classifier: a lightweight ResNet-18 that decides "is there a disaster in this image?" before the heavy segmentation model even runs. Kills false positives at low compute cost.

---

## 2. Architecture Overview

```
Input: Before/After Satellite Image Pair (multi-spectral)
                    |
        [Binary Disaster Classifier]
         ResNet-18, trained on xBD
                    |
        +-----------+-----------+
        |                       |
   No disaster             Disaster confirmed
   detected                     |
   (skip)          [Siamese Segmentation Model]
                   Prithvi-EO-2.0-300M encoder (frozen)
                   + U-Net style decoder head (trained)
                        Two input branches:
                        Branch A: Before image
                        Branch B: After image
                        Features compared -> damage map output
                                    |
                    [Per-pixel Damage Classification]
                    0: No damage
                    1: Minor damage
                    2: Major damage
                    3: Destroyed
                                    |
                    [Output: Heatmap + Thematic Map + Priority Score]
```

### Why Prithvi-EO-2.0 instead of DeepLabV3

DeepLabV3 was built for 3-channel RGB (ImageNet photos: cats, cars, furniture). Adapting it to 13-band satellite data requires manually modifying the first conv layer and retraining from scratch. Prithvi-EO-2.0 (released December 2024, IBM/NASA) was pretrained on Harmonized Landsat Sentinel-2 (HLS) satellite data and has ready fine-tuning examples for flood mapping, burn scar segmentation, and disaster analysis. It natively accepts 6-band satellite input (Blue, Green, Red, NIR, SWIR1, SWIR2) and handles temporal sequences. Fine-tuning Prithvi is faster and produces better results for this domain than DeepLabV3.

Available model sizes:
- `Prithvi-EO-2.0-300M` — use this. Fits in 8GB VRAM at batch size 2-4.
- `Prithvi-EO-2.0-600M` — too large for 8GB VRAM, skip.
- `Prithvi-EO-2.0-300M-TL` — same as 300M but with temporal and location embeddings. Use if available compute allows.

HuggingFace: `ibm-nasa-geospatial/Prithvi-EO-2.0-300M`

---

## 3. Data Sources

### Primary Training Dataset: xBD (xView2 Challenge)

- 22,068 images at 1024x1024 resolution, RGB satellite imagery
- 30.3 GB total
- Pre and post disaster image pairs
- 19 disaster types: earthquakes, floods, wildfires, volcanic eruptions, landslides, hurricanes
- 850,736 building polygons annotated with 4-class damage labels:
  - 0: No damage
  - 1: Minor damage
  - 2: Major damage
  - 3: Destroyed
- Source: Maxar/DigitalGlobe Open Data Initiative
- License: CC BY-NC-SA 3.0
- **How to get it:** Register free at [xview2.org](https://xview2.org), download "Challenge training set", "Challenge test set", "Challenge holdout set"

> This alone covers the 5,000 image target and then some.

### Secondary Dataset: Sen1Floods11

- 446 labeled 512x512 chips
- Covers 11 flood events across 6 continents and 14 biomes
- Uses Sentinel-1 (SAR) and Sentinel-2 (optical) bands
- Labels: no water (0), water/flood (1), no data/clouds (-1)
- This is the dataset Prithvi was already fine-tuned on for flood detection — so it transfers very well
- Free, available on GitHub: `cloudtostreet/Sen1Floods11`

### Indian Geography Dataset: ISRO Bhuvan

- Portal: [bhuvan-app3.nrsc.gov.in/data/download/index.php](https://bhuvan-app3.nrsc.gov.in/data/download/index.php)
- Disaster portal: [bhuvan-app1.nrsc.gov.in/disaster/disaster.php](https://bhuvan-app1.nrsc.gov.in/disaster/disaster.php)
- Free after registration with a Bhuvan account
- Data available: Resourcesat-1 (LISS III, AWiFS), Cartosat-1 DEM, IMS-1 Hyperspectral
- Free tier: 23m resolution and coarser, sufficient for regional damage scoring
- Disaster layers: floods, cyclones, landslides, earthquakes, forest fires with near-real-time satellite updates
- **Use this for the India-specific demo scenes during the presentation**

### SAR Data: Sentinel-1 via Copernicus

- Portal: [dataspace.copernicus.eu](https://dataspace.copernicus.eu)
- Free, reuses VISTA's existing Client ID and Secret from `SatelliteFetcher.jsx`
- Sentinel-1 C-band SAR: 5-20m resolution, all-weather, day and night
- Sentinel-2 multispectral: 10m resolution, 13 bands including NIR and SWIR
- No new account needed for Sentinel-1/2

### Dataset Feasibility Summary

| Dataset | Images | Annotations | Size | Free? | Use For |
|---|---|---|---|---|---|
| xBD (xView2) | 22,068 pairs | 4-class damage labels | 30.3 GB | Yes (register) | Primary training + validation |
| Sen1Floods11 | 446 chips | Flood/no-water binary | Small | Yes | SAR flood fine-tuning |
| Bhuvan (ISRO) | Thousands of Indian scenes | Raw (no annotations) | Variable | Yes (register) | India demo scenes |
| Copernicus Sentinel-1/2 | Unlimited | None (raw) | Per-download | Yes | Inference testing |
| Commercial (ICEYE, Planet) | On demand | Pre-annotated available | N/A | No (paid) | Skip for now |

---

## 4. Spectrum Efficiency Scoring

A key Phase 2 feature: instead of treating all bands equally, each spectral band gets an efficiency score based on its disaster response utility and operational constraints.

### Scoring Table

| Band | Efficiency Score | Primary Use | Key Limitation |
|---|---|---|---|
| SAR C-band (Sentinel-1) | 9.5/10 | Flood boundary, structural collapse, all-weather | Grayscale backscatter, needs speckle denoising |
| SWIR (Sentinel-2 Band 11) | 8.5/10 | Burn scars, smoke penetration, surface moisture | Blocked by thick clouds |
| NIR (Sentinel-2 Band 8) | 8.0/10 | Flood mapping (NDWI), vegetation stress | Blocked by clouds, daylight only |
| TIR (Thermal Infrared) | 7.0/10 | Fire front detection, heat signatures | Not available on Sentinel-2, needs Landsat |
| RGB Visible (Sentinel-2 Bands 2,3,4) | 5.0/10 | Human-readable baseline, change detection | Fails in cloud, smoke, night |
| VIIRS DNB (Night Lights) | 4.5/10 | Power outage proxy, urban activity | 500m resolution only, blocked by clouds |
| UV | 1.5/10 | Ozone/oil spill detection only | Rayleigh scattering ruins surface imaging |
| X-Ray / Gamma | 0/10 | None | Blocked entirely by atmosphere |

### How to compute it scientifically (for the submission)

Run ablation experiments: train the model with all bands, then remove one band at a time and record the F1 score drop. The F1 delta for each removed band is its empirical efficiency score. This turns the scoring from a table into a data-backed finding.

```python
BAND_EFFICIENCY_SCORES = {
    "SAR_C_band":  {"score": 9.5, "reason": "24/7 all-weather, cloud-penetrating"},
    "SWIR":        {"score": 8.5, "reason": "burn scars, smoke penetration, moisture"},
    "NIR":         {"score": 8.0, "reason": "NDWI flood mapping, vegetation stress"},
    "TIR":         {"score": 7.0, "reason": "heat signatures, fire fronts"},
    "RGB":         {"score": 5.0, "reason": "human-readable, fails cloud/night"},
    "VIIRS_DNB":   {"score": 4.5, "reason": "power outage proxy, 500m only"},
    "UV":          {"score": 1.5, "reason": "Rayleigh scatter, poor surface imaging"},
}
```

---

## 5. Tools and Setup

### Installation

```bash
pip install terratorch huggingface_hub torch torchvision wandb rasterio numpy matplotlib scikit-learn
```

### Tool Reference

| Tool | Purpose | Notes |
|---|---|---|
| `terratorch` | Fine-tuning framework built for Prithvi models | Handles multi-band input, temporal encoding, segmentation heads |
| `huggingface_hub` | Download Prithvi weights, push checkpoints | Free for public repos |
| `wandb` | Live training dashboard (loss, VRAM, speed) | Free tier, shareable link for teammates |
| `rasterio` | Read GeoTIFF satellite files | Satellite data is GeoTIFF, not PNG/JPG |
| `torch` + `torchvision` | Core deep learning framework | Everything runs on PyTorch |
| `numpy` + `matplotlib` | Array math and heatmap visualization | Plotting damage maps, confusion matrices |
| `scikit-learn` | F1 score, confusion matrix, evaluation | Standard evaluation metrics |

### Pulling Prithvi weights

```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="ibm-nasa-geospatial/Prithvi-EO-2.0-300M",
    local_dir="./prithvi_weights"
)
```

### WandB setup (3 lines)

```python
import wandb
wandb.init(project="vista-phase2", name="prithvi-xbd-run1")
# If using HuggingFace Trainer, add: report_to="wandb" in TrainingArguments
```

Share the run URL with teammates so everyone sees the same live dashboard.

---

## 6. Training Plan

### Phase A: Multi-Spectral Segmentation Model (Primary, ~4-6 hours training)

**Step 1: Download and preprocess xBD**

```bash
# After downloading from xview2.org, structure is:
# xbd/train/images/ (pre and post pairs)
# xbd/train/labels/ (JSON polygons with damage class)
# xbd/test/images/
# xbd/hold/images/

python preprocess_xbd.py --data_dir ./xbd --output_dir ./xbd_processed
# This converts JSON labels to pixel masks and crops 1024x1024 to 512x512 tiles
```

**Step 2: Fine-tune Prithvi-EO-2.0-300M**

```python
from terratorch.models import PrithviModelFactory
import torch

# Load pretrained encoder
model = PrithviModelFactory().build_model(
    backbone="prithvi_eo_v2_300",
    decoder="UperNetDecoder",
    num_classes=4,           # no damage, minor, major, destroyed
    in_channels=6,           # Blue, Green, Red, NIR, SWIR1, SWIR2
    pretrained=True
)

# Freeze encoder, only train decoder head
for param in model.backbone.parameters():
    param.requires_grad = False

# Training config
optimizer = torch.optim.AdamW(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=1e-4
)
```

**Step 3: Training loop with WandB logging**

```python
import wandb

wandb.init(project="vista-phase2")

for epoch in range(20):
    model.train()
    for batch in train_loader:
        images, masks = batch
        outputs = model(images)
        loss = criterion(outputs, masks)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    # Log to WandB
    wandb.log({"epoch": epoch, "loss": loss.item(), "val_f1": val_f1})

    # Save checkpoint every 5 epochs
    if epoch % 5 == 0:
        torch.save(model.state_dict(), f"checkpoint_epoch_{epoch}.pt")
```

**Recommended training settings for RTX 4060 8GB:**

| Parameter | Value | Reason |
|---|---|---|
| Batch size | 4 | Safe for 8GB VRAM with 300M model |
| Image crop size | 512x512 | Standard for Prithvi |
| Epochs (demo) | 20 | Enough for proof-of-concept |
| Epochs (final) | 50-100 | For a properly generalizing model |
| Learning rate | 1e-4 | Standard for fine-tuning frozen encoder |
| Optimizer | AdamW | Best for transformer-based models |
| Loss function | CrossEntropyLoss (weighted) | Weight class 3 (destroyed) higher due to class imbalance |

**Training time estimates on RTX 4060 8GB:**

| Epochs | Estimated Time |
|---|---|
| 10 | 2-3 hours |
| 20 | 4-6 hours |
| 50 | 10-14 hours |

---

### Phase B: Binary Disaster Classifier (Secondary, ~1-2 hours training)

Runs before the segmentation model. Answers: "Is there any disaster in this image pair?" If no, skip segmentation entirely.

```python
import torchvision.models as models
import torch.nn as nn

# ResNet-18 binary classifier
classifier = models.resnet18(pretrained=True)
classifier.fc = nn.Linear(512, 2)  # 2 classes: disaster / no disaster

# Labels from xBD:
# disaster = any post-event image with at least one building labeled damage class > 0
# no_disaster = all pre-event images
```

Training: 10-15 epochs, batch size 16, takes roughly 1-2 hours on the 4060.

This runs as a gate:

```
Before image + After image
          |
   [Binary Classifier]
          |
    p(disaster) > 0.5?
          |
    No --> output "No damage detected"
    Yes --> send to Prithvi segmentation model
```

---

## 7. Monitoring and When to Switch to Colab

### Real-time GPU monitoring

Run this in a second terminal while training:

```bash
watch -n 1 nvidia-smi
```

This refreshes every second and shows VRAM used, GPU temperature, and utilization percentage.

### WandB live dashboard

After `wandb.init()`, a URL will appear in your terminal. Open it in any browser. Share with teammates. It shows:
- Loss curve (should decrease steadily)
- Validation F1 (should increase)
- GPU utilization
- Epoch duration

### What healthy training looks like

| Metric | Healthy Range | If Outside |
|---|---|---|
| Training loss | Decreasing each epoch | Flat: reduce LR. Exploding: reduce LR drastically |
| Validation F1 | Increasing, then plateauing | If drops: model is overfitting, add dropout |
| GPU utilization | 70-99% | Below 30%: data loading bottleneck, add `num_workers=4` |
| VRAM usage | 5-7.5GB out of 8GB | Above 7.8GB: reduce batch size immediately |
| Epoch duration | Consistent | Sudden spike: laptop is thermal throttling |

### When to switch to Google Colab

| Signal | What it means | Action |
|---|---|---|
| VRAM OOM crash | Batch too large or model too big | First: drop batch size to 2. If still OOM: switch to Colab T4 |
| GPU utilization below 30% consistently | Data loading bottleneck | Add `num_workers=4` to DataLoader. Stay local |
| Epoch duration suddenly increases | Laptop thermal throttling | Point a fan at the laptop or switch to Colab |
| WandB loss flat after 10 epochs | Learning rate problem, not hardware | Adjust LR scheduler, don't switch machines |
| Unattended overnight training needed | Risk of laptop sleep or crash | Switch to Colab with Drive checkpoint saves |

### Setting up Google Colab free tier

```python
# Step 1: Go to colab.research.google.com
# Step 2: Runtime > Change runtime type > T4 GPU (free tier)

# Step 3: Mount Google Drive for checkpoint storage
from google.colab import drive
drive.mount('/content/drive')

# Step 4: Install dependencies
!pip install terratorch huggingface_hub wandb rasterio

# Step 5: Pull weights
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id="ibm-nasa-geospatial/Prithvi-EO-2.0-300M",
    local_dir="/content/drive/MyDrive/prithvi_weights"
)

# Step 6: Save checkpoint to Drive every 5 epochs so you don't lose progress on disconnect
torch.save(model.state_dict(), "/content/drive/MyDrive/checkpoints/epoch_{}.pt".format(epoch))
```

Colab free T4 gives approximately 12-15 hours per session before disconnect. Save to Drive every 5 epochs. Your RTX 4060 is more reliable for uninterrupted runs since it won't disconnect randomly.

**Recommendation:** Train locally on the 4060. Use Colab only as a backup or for a second teammate to run parallel experiments.

---

## 8. Team Split and Timeline (24 hours)

### Suggested team split

| Role | Tasks | Hours |
|---|---|---|
| Teammate A (Training lead) | Download xBD, preprocess data, run Prithvi fine-tuning, monitor WandB | Hours 1-6 training, monitor rest |
| Teammate B (Pipeline) | Build multi-spectral data ingestion (Sentinel-1/2 via Copernicus, Bhuvan download), rasterio preprocessing, band stacking | Hours 1-8 |
| Teammate C (Classifier) | Train binary disaster classifier (ResNet-18 on xBD labels), integrate as gate before segmentation | Hours 4-8 |
| Teammate D (Output/UI) | Heatmap renderer, thematic map output, priority score visualization, demo prep | Hours 6-16 |

### 24-hour timeline

| Time | Milestone |
|---|---|
| Hour 0-1 | Environment setup, xBD download started, WandB initialized |
| Hour 1-3 | xBD preprocessing done, Prithvi fine-tuning started on 4060 |
| Hour 2-5 | Binary classifier training (parallel, separate machine or Colab) |
| Hour 4-8 | Multi-spectral pipeline: Sentinel-1/2 ingestion, band stacking |
| Hour 6 | First checkpoint saved, validate on test split |
| Hour 8-10 | Binary classifier integrated as gate, end-to-end pipeline runs |
| Hour 10-14 | India demo: pull Bhuvan scenes, run inference, generate heatmaps |
| Hour 14-20 | Fine-tune output visualization, thematic maps, priority score UI |
| Hour 20-22 | Spectrum efficiency ablation (run model with/without each band, record F1) |
| Hour 22-24 | Demo prep, slide deck, submission documentation |

---

## 9. Collaborative Training Strategy

Forget federated learning for a hackathon. Use shared checkpoints instead.

### Sequential fine-tuning (recommended)

Each teammate trains the model on a different subset of the data, saves the checkpoint, and pushes it to a shared HuggingFace Hub repo or Google Drive folder.

```
Teammate A: trains on xBD earthquake subset (10 epochs) → saves checkpoint → pushes to shared HF repo
Teammate B: pulls checkpoint → trains on xBD flood subset (10 epochs) → pushes
Teammate C: pulls checkpoint → fine-tunes on Bhuvan India scenes → pushes
```

This is called continual learning. The model progressively learns from different disaster types.

**Risk:** catastrophic forgetting (model forgets earlier data when new data is added).

**Fix:** freeze the Prithvi encoder and only train the decoder head. The encoder captures general satellite features and should not be modified. Only the segmentation head learns disaster-specific patterns.

### Pushing and pulling checkpoints via HuggingFace Hub

```python
from huggingface_hub import HfApi

api = HfApi()
# Push checkpoint
api.upload_file(
    path_or_fileobj="checkpoint_epoch_20.pt",
    path_in_repo="checkpoints/epoch_20.pt",
    repo_id="your-team/vista-phase2",
    token="your_hf_token"
)

# Pull checkpoint (other teammate)
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id="your-team/vista-phase2",
    filename="checkpoints/epoch_20.pt",
    local_dir="./checkpoints"
)
```

---

## 10. Quantization and Deployment

### Do you need to quantize?

For training: no. The RTX 4060 handles Prithvi-EO-2.0-300M at batch size 4 without quantization.

For demo inference: probably not. The 4060 runs inference fine at FP32.

Only quantize if: you need to serve inference on a machine with no GPU, or a weaker CPU-only machine.

### How to quantize (INT8, runs on 8GB CPU)

```python
import torch

# After training is done
model_quantized = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear, torch.nn.Conv2d},
    dtype=torch.qint8
)

torch.save(model_quantized.state_dict(), "vista_quantized.pt")
```

Size comparison:

| Version | Size | Runs on |
|---|---|---|
| FP32 (original) | ~1.2 GB | GPU required for fast inference |
| INT8 quantized | ~300 MB | 8GB CPU, slower but functional |

---

## 11. Downstream Applications

The same segmentation model output can be repurposed for non-disaster use cases. This is a strong judge demo hook: show that VISTA is not a single-purpose disaster tool but a general geospatial intelligence platform.

### Multi-class output map (extended labels)

| Class | Disaster Use | Commercial/Business Use |
|---|---|---|
| Building (intact) | Survivor shelter identification | Site occupancy analysis |
| Building (damaged/destroyed) | Rescue priority zones | Insurance risk mapping |
| Road (clear) | Rescue route planning | Logistics and supply chain routing |
| Road (blocked) | Evacuation rerouting | Infrastructure gap analysis |
| Vegetation | Affected area boundary | Land cover classification |
| Water body | Flood extent | Drainage, irrigation planning |
| Bare land / rubble | Debris mapping | Construction site suitability |

### Land suitability and business site analysis

From the same segmentation output:

```
Segmentation output
        |
  [Derived scores per grid cell]
  - Road access score (road pixels within 500m radius)
  - Flood risk score (water body proximity + historical SAR flood data)
  - Building density (intact building pixel count per km2)
  - Bare land availability (rubble/bare land area)
        |
  [Composite site suitability score]
  Input: desired use (warehouse / residential / agriculture)
  Output: ranked map of suitable zones with reasoning
```

This can be pitched as: "The same platform that maps disaster damage can tell a business developer whether a piece of land has road access, flood risk, and buildable area before they invest."

---

## 12. Evaluation Metrics

### For the segmentation model

| Metric | What it measures | Target (demo) |
|---|---|---|
| Per-class F1 score | Precision and recall per damage level | F1 > 0.5 for destroyed class is acceptable for 20 epochs |
| Mean IoU (mIoU) | Intersection over union across all classes | mIoU > 0.4 for a fine-tuned 20-epoch model |
| Confusion matrix | Where the model confuses damage levels | Shows judges you understand failure modes |

### For the binary classifier

| Metric | Target |
|---|---|
| Accuracy | > 90% (xBD classes are reasonably balanced) |
| False negative rate | Keep this as low as possible (missing a real disaster is worse than a false alarm) |

### Computing metrics

```python
from sklearn.metrics import f1_score, confusion_matrix
import numpy as np

# After inference on test set
f1 = f1_score(y_true.flatten(), y_pred.flatten(), average=None, labels=[0,1,2,3])
print("Per-class F1:", dict(zip(["no_damage","minor","major","destroyed"], f1)))

cm = confusion_matrix(y_true.flatten(), y_pred.flatten())
```

---

## 13. Further Refinement (Post-Hackathon)

| Step | What to do | Time needed |
|---|---|---|
| More epochs | Train to 100+ epochs for a properly generalizing model | 1-2 days on 4060 |
| SAR integration | Add Sentinel-1 backscatter as a 7th channel to the model | 1-2 days pipeline work |
| VIIRS night lights | Add power outage signal as a soft overlay (not model input) | 1 day |
| Annotation pipeline | Build a tool for teammates to annotate new Indian disaster imagery from Bhuvan | 2-3 days |
| Sub-meter commercial SAR | ICEYE or Capella Space API integration for high-stakes rescue scenarios | Paid, post-funding |
| Deployment | Quantize and serve via FastAPI, integrate with existing VISTA frontend | 2-3 days |
| Temporal multi-scene analysis | Feed Prithvi a time series of 3-4 scenes for richer damage evolution tracking | 1 week |

---

## Key Links

| Resource | URL |
|---|---|
| xBD Dataset | [xview2.org](https://xview2.org) |
| Prithvi-EO-2.0-300M | [huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M](https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M) |
| TerraTorch (fine-tuning) | [github.com/NASA-IMPACT/Prithvi-EO-2.0](https://github.com/NASA-IMPACT/Prithvi-EO-2.0) |
| Sen1Floods11 | [github.com/cloudtostreet/Sen1Floods11](https://github.com/cloudtostreet/Sen1Floods11) |
| Bhuvan Disaster Portal | [bhuvan-app1.nrsc.gov.in/disaster/disaster.php](https://bhuvan-app1.nrsc.gov.in/disaster/disaster.php) |
| Bhuvan Free Data | [bhuvan-app3.nrsc.gov.in/data/download/index.php](https://bhuvan-app3.nrsc.gov.in/data/download/index.php) |
| Copernicus Data Space | [dataspace.copernicus.eu](https://dataspace.copernicus.eu) |
| WandB | [wandb.ai](https://wandb.ai) |
| Google Colab | [colab.research.google.com](https://colab.research.google.com) |

---

*Document prepared for VISTA Phase 2 — SIH Hackathon submission and Antigravity (Google) sharing.*
*Last updated: September 2026*
