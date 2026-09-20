# VISTA (Visual Intelligence for Spatial Triage and Assessment)

> **AI-Powered Satellite Disaster Assessment & Building Damage Classification**  
> Direct integration with European Space Agency (ESA) Copernicus Sentinel-2 constellation for rapid, on-device humanitarian damage scanning.

---

## 📌 Overview & Core Capabilities

VISTA is an automated disaster intelligence and assessment engine designed for rapid humanitarian response. By capturing and analyzing multi-temporal **pre-event** and **post-event** satellite imagery, VISTA performs sub-pixel change detection across an interactive **32×32 spatial grid** (1,024 sectors) to classify infrastructure and terrain damage into three intuitive tiers:
* 🟢 **Intact** (< 20% loss ratio) — Baseline structural stability
* 🟡 **Damaged** (20% – 60% loss ratio) — Significant structural or environmental alteration
* 🔴 **Destroyed** (≥ 60% loss ratio) — High-severity collapse, burn scar, or inundation

```
+-------------------------------------------------------------------------+
|                        VISTA SYSTEM ARCHITECTURE                        |
+-------------------------------------------------------------------------+
|                                                                         |
|   +-----------------------+           +-----------------------------+   |
|   |   ESA Copernicus      |           |    User / Emergency Teams   |   |
|   |   Sentinel-2 (CDSE)   |           |    (Web Browser / Mobile)   |   |
|   +-----------+-----------+           +--------------+--------------+   |
|               | (OAuth2 BOA Data)                    |                  |
|               v                                      v                  |
|   +-----------------------+           +-----------------------------+   |
|   |  Serverless Proxy     |           |   VISTA Web Engine (Vite)   |   |
|   |  /api/token           |<--------->|   - Interactive 32x32 Grid  |   |
|   |  /api/process         |           |   - Scroll-Reveal Telemetry |   |
|   +-----------------------+           |   - Preset Disaster Catalog |   |
|                                       +--------------+--------------+   |
|                                                      |                  |
|                                                      v                  |
|                                       +-----------------------------+   |
|                                       |     Multi-Format Export     |   |
|                                       |   - Executive PDF Reports   |   |
|                                       |   - 1,024-Sector CSV Data   |   |
|                                       +-----------------------------+   |
+-------------------------------------------------------------------------+
```

### ✨ Key Features
- **Live Copernicus Data Space Integration:** Direct OAuth2 integration with Sentinel-2 L2A constellations for automated satellite tile acquisition.
- **Serverless API Proxy (`/api/token`, `/api/process`):** Seamless cloud proxy handling CORS-compliant authenticated token requests and raster processing on platforms like Vercel.
- **Smart Calamity Auto-Suggestions & Presets:** Type any region (*Nepal, Vizag, Odisha, Wayanad, Maui, Valencia, Turkey, Derna*) to automatically load verified historical and ongoing calamity coordinates, cloud tolerances, and optimal temporal windows.
- **100% On-Device Client-Side Processing:** Pixel transformation, change masking, and severity categorization run directly in your web browser for instant results and high security.
- **Executive PDF Disaster Reports:** Generate comprehensive humanitarian assessment reports featuring side-by-side satellite imagery, color-coded severity maps, quantified damage distributions, and relief recommendations.
- **Exportable CSV Metrics:** Full tabular export of all 1,024 spatial sectors with coordinate indices and damage ratios for GIS and spreadsheet software.
- **Modern UI/UX:** Interactive scroll-reveal login screen, real-time telemetry metrics, dynamic animated logo, and responsive dashboard design.

---

## 🛰️ Data Source Authenticity & Scientific Provenance

VISTA retrieves real-world Earth Observation (EO) data from the **Copernicus Data Space Ecosystem (CDSE)**:

| Parameter | Specification |
| :--- | :--- |
| **Constellation** | Sentinel-2A & Sentinel-2B (European Space Agency / European Commission) |
| **Sensor** | MultiSpectral Instrument (MSI) |
| **Processing Level** | **Level-2A (L2A)** Bottom-Of-Atmosphere (BOA) surface reflectance |
| **Atmospheric Correction** | Sen2Cor processor (eliminates Rayleigh scattering, aerosol haze, and water vapor absorption) |
| **Spatial Resolution** | **10 meters Ground Sample Distance (GSD)** per pixel |
| **Spectral Bands** | Band 4 (Red: 665 nm), Band 3 (Green: 560 nm), Band 2 (Blue: 490 nm) |
| **Georeferencing & CRS** | WGS 84 / CRS84 (EPSG:4326) with sub-pixel geolocation accuracy ($\le 5\text{m}$) |

---

## 🎯 Cross-Verification & Ground-Truth Benchmarks

VISTA's spatial damage signatures are benchmarked against authoritative disaster observation registries:

1. **Copernicus Emergency Management Service (EMS):** Rapid Mapping activations (e.g., EMSR684 for Maui Wildfires, EMSR648 for Turkey Earthquake).
2. **NASA FIRMS (Fire Information for Resource Management System):** Thermal anomaly validation for wildfire perimeter tracking.
3. **xBD / xView2 Dataset Standard:** The global benchmark for building damage assessment developed by Stanford, CMU, and Maxar containing 850,000+ building polygons across 19 global disasters.

---

## ⚡ Verified Disaster Test Presets

| Disaster Event | Target Region | Recommended Dates | Notes |
| :--- | :--- | :--- | :--- |
| **Nepal Monsoon Floods** | `Kathmandu, Nepal` | `2026-06-15` ➔ `2026-08-26` | River swell & urban inundation |
| **Visakhapatnam Floods** | `Visakhapatnam, AP` | `2024-08-15` ➔ `2024-09-08` | Coastal inundation & storm surge |
| **Odisha Mahanadi Floods** | `Cuttack, Odisha` | `2024-07-10` ➔ `2024-08-20` | Riverine agricultural flooding |
| **Wayanad Landslides** | `Meppadi, Kerala` | `2024-05-15` ➔ `2024-08-15` | Massive debris flow & hill collapse |
| **Maui Wildfires** | `Lahaina, Hawaii` | `2023-07-25` ➔ `2023-08-15` | Front St urban firestorm |
| **Kahramanmaraş Earthquake**| `Kahramanmaraş, Turkey`| `2023-01-20` ➔ `2023-02-20` | High-density pancake collapses |
| **Valencia DANA Floods** | `Paiporta, Spain` | `2024-10-01` ➔ `2024-11-05` | Flash flood sediment trails |
| **Derna Dam Breach** | `Derna, Libya` | `2023-08-20` ➔ `2023-09-20` | Catastrophic dam breach wash |

---

## ⚠️ Current Limitations

While VISTA provides rapid first-order damage localization, users and analysts should consider:
- **Sun Angle & Shadow Discrepancies:** Variations in time of day between satellite passes can cast altered building shadows.
- **Seasonal Phenology:** Agricultural harvesting or dry-season grass browning in rural sectors can register radiometric variance.
- **Cloud Obscuration:** Heavy monsoon cloud cover blocks optical Sentinel-2 sensors (mitigated using the cloud-filtering slider).

---

## 🚀 Future Scope & Roadmap

To evolve VISTA into an enterprise-grade disaster intelligence platform, the following upgrades are planned:

1. **Multispectral Physical Indices (NBR / NDWI / NDVI):**
   * **Normalized Burn Ratio (NBR):** $\frac{B08 - B12}{B08 + B12}$ — Isolates burned ash from terrain.
   * **Normalized Difference Water Index (NDWI):** $\frac{B03 - B08}{B03 + B08}$ — Masks floodwater extents.
2. **Building Footprint Masking (OpenStreetMap Overpass API):** Extract vector building polygons in the target bounding box to restrict change detection strictly to known structural footprints.
3. **On-Device Siamese Deep Learning (ONNX Runtime Web):** Deploy lightweight, quantized Siamese neural networks trained on the xBD dataset directly in WebAssembly/WebGL to evaluate structural geometry.
4. **Human-in-the-Loop Active Learning Pipeline:** Enable emergency responders to validate and flag grid cells (*"Confirmed Damage"* vs. *"False Alarm"*) to iteratively refine accuracy.

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- Copernicus Data Space OAuth Client Credentials ([Create free account](https://shapps.sentinel-hub.com/dashboard/#/account/settings))

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/siddarthff06-byte/SIH_disaster_assesment.git
cd SIH_disaster_assesment

# 2. Install dependencies
npm install

# 3. Configure environment variables (create a .env file):
VITE_CLIENT_ID=your_client_id_here
VITE_CLIENT_SECRET=your_client_secret_here

# 4. Start the local development server
npm run dev
```

### Production Deployment
* **Vercel:** Ready out of the box with `vercel.json` and serverless API endpoints in `/api`.
* **Firebase Hosting:** Ready with preconfigured `firebase.json` and `.firebaserc`.

