# 🛰️ VISTA — Project Changelog & Contribution Log

> **VISTA (Visual Intelligence for Satellite-based Threat Assessment)**  
> Comprehensive development timeline, contributors, and version milestones.

---

## 👥 Contributor Overview

* **Siddarth** (`@siddarthff06-byte`): Core ML pipeline, change detection algorithms, satellite data preprocessing, and damage severity classification.
* **Dinesh** (`@dinesh`): Frontend UI scaffolding, Stitch design integration, VISTA branding, and Orbital Surveillance scroll-reveal login console.
* **Sujay** (`@sujaykshatri`): Satellite imagery fetcher, in-browser analysis pipeline, smart disaster presets, automated PDF/CSV report generation, Copernicus API proxy, and Vercel production deployment.

---

## 🏷️ Version Milestones & Release Tags

| Tag | Milestone | Key Features | Contributors |
| :--- | :--- | :--- | :--- |
| `v1.0.0` | **Orbital Login & Production Deployment** | Scroll-reveal MIL-STD login console, 3D radar sweep, Vercel serverless live deployment | Dinesh, Sujay |
| `v0.4.0` | **Report Export & Satellite Proxies** | Client-side jsPDF disaster report generation, CSV export, and `/api` Copernicus proxy | Sujay, Dinesh |
| `v0.3.0` | **Disaster Presets & Interactive UI** | Real-world disaster coordinates (Turkey Earthquake, Hurricane Ian), live satellite fetcher | Sujay, Dinesh |
| `v0.2.0` | **Interactive Frontend Scaffold** | React + Vite dashboard, 32×32 sector damage overlay grid, and statistics panel | Dinesh, Sujay |
| `v0.1.0` | **Core ML & Change Detection Pipeline** | Difference-based change detection, structural loss math, and dataset preprocessing | Siddarth |

---

## 📜 Detailed Commit Timeline

### [Phase 5] UI Innovation, Master Documentation & Live Deployment
* **`build: update vercel configuration and sync latest changes`** — *Sujay Kshatri (2026-09-09)*
  * Configured Vercel production build routing and environment variables.
  * Added Phase 2 master technical plans and SIH presentation documentation.
  * Successfully deployed live on Vercel at `https://vista-sat.vercel.app`.
* **`feat: implement vista scroll reveal login screen and dynamic logo`** — *Dinesh (2026-09-09)*
  * Built the orbital surveillance landing page with NORAD telemetry headers.
  * Implemented cubic ease-out scroll-reveal glassmorphic authentication console.
  * Added dynamic 3D logo emblem, lens glow, and radar sweep background animations.

### [Phase 4] Serverless Architecture & PDF Report Export
* **`feat: add serverless proxy endpoints for live Vercel deployment`** — *Sujay Kshatri (2026-08-27)*
  * Created `/api/token.js` and `/api/process.js` to securely proxy requests to Copernicus Data Space.
  * Enabled CORS-safe satellite fetching on cloud deployments.
* **`docs: update README documentation`** — *Sujay Kshatri (2026-08-27)*
  * Polished architectural overview, installation guide, and pipeline documentation.
* **`feat: smart disaster presets, PDF report export, and scientific documentation`** — *Sujay Kshatri (2026-08-27)*
  * Built complete PDF report generator using `jspdf` and `html2canvas`.
  * Added instant disaster presets with pre-loaded high-resolution disaster pairs.
* **`build: add firebase hosting config`** — *Dinesh (2026-08-27)*
  * Configured Firebase hosting rewrite rules and `.firebaserc`.

### [Phase 3] Frontend Architecture & Disaster Presets
* **`docs: add example disaster locations for testing`** — *Dinesh (2026-08-27)*
  * Documented latitude/longitude bounding boxes for historic disaster events.
* **`feat: rebrand to VISTA, add CSV export, secure API keys`** — *Dinesh (2026-08-27)*
  * Added CSV raw data export for GIS / emergency responders.
  * Rebranded UI assets to VISTA and secured environment variables.
* **`feat: update frontend with satellite fetcher, severity grid, and analysis engine`** — *Sujay Kshatri (2026-08-27)*
  * Implemented browser-based Canvas pixel-difference change detection algorithm.
  * Integrated interactive 1024-cell damage classification overlay with filter buttons.
  * Added live Copernicus Sentinel-2 L2A satellite image fetcher.
* **`feat: initial vista frontend scaffold — stitch import and routing`** — *Dinesh (2026-08-27)*
  * Created the initial React + Vite application layout with hero banner, file uploader, and navigation.

### [Phase 2] ML Algorithm & Damage Classification Engine
* **`fix: fix path handling in preprocess/inference scripts and update severity output`** — *Siddarth (2026-08-26)*
  * Fixed cross-platform directory separator handling across Windows and Linux.
  * Standardized damage category classification thresholds (Intact, Minor, Major, Destroyed).
* **`fix: replace untrained segmentation model with diff-based change detection`** — *Siddarth (2026-08-26)*
  * Replaced unstable deep learning segmentation with deterministic difference-based change detection to eliminate false-positive "all destroyed" outputs.
* **`feat: model pipeline complete through part 6 — masks and severity classification`** — *Siddarth (2026-08-26)*
  * Implemented damage bounding box calculations and structural loss ratio formulas.

### [Phase 1] Project Initialization & Data Preprocessing
* **`feat: part 3 complete — preprocess script working and data processed`** — *Siddarth (2026-08-25)*
  * Built pre-processing scripts to normalize, crop, and align multi-spectral satellite imagery.
* **`chore: add initial folder structure`** — *Siddarth (2026-08-25)*
  * Structured folders for raw data, processed tiles, scripts, and model outputs.
* **`chore: initial repository structure`** — *Siddarth (2026-08-25)*
  * Initialized Git repository and base configuration.
