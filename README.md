# VISTA (Visual Intelligence for Structure and Threat Assessment)

VISTA is an AI-powered, browser-based disaster assessment tool that leverages Sentinel-2 satellite imagery to detect and classify building damage in disaster zones. By comparing "before" and "after" satellite images, VISTA performs pixel-level change detection across a 32x32 grid to classify areas as intact, damaged, or destroyed.

## Key Features

- **Live Satellite Data Fetching:** Directly integrates with Copernicus Data Space (Sentinel Hub) to fetch up-to-date, true-color L2A satellite imagery.
- **On-Device Processing:** All image processing and change detection runs entirely in your browser. No image data is uploaded to a server, ensuring fast execution and absolute privacy.
- **Severity Grid Classification:** Analyzes a 32x32 grid and classifies structural damage using an intuitive color-coded overlay.
- **Exportable Reports:** One-click export of assessment results to CSV format, enabling seamless integration with spreadsheet tools and GIS software.

## Setup & Installation

VISTA is built using React and Vite.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siddarthff06-byte/SIH_disaster_assesment.git
   cd SIH_disaster_assesment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory of the project. You will need API credentials from [Sentinel Hub / Copernicus](https://shapps.sentinel-hub.com/dashboard/#/account/settings).
   ```env
   VITE_CLIENT_ID=your_client_id_here
   VITE_CLIENT_SECRET=your_client_secret_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Deployment

VISTA is highly optimized for serverless hosting environments like **Vercel** or **Netlify**. 
Simply link your GitHub repository to your preferred platform, and ensure you configure `VITE_CLIENT_ID` and `VITE_CLIENT_SECRET` in the platform's environment variables dashboard.

## Example Usage for Testing

To test the satellite fetching and analysis capabilities, you can use the following known disaster events which have clear Sentinel-2 imagery available:

### 1. Maui Wildfires (Hawaii, USA) - Aug 2023
- **Location:** `Lahaina, Hawaii`
- **Before Date:** `2023-07-25`
- **After Date:** `2023-08-15`
- **Cloud Cover:** `10%`
- **Radius:** `5 km`

### 2. Kahramanmaraş Earthquake (Turkey) - Feb 2023
- **Location:** `Kahramanmaraş, Turkey`
- **Before Date:** `2023-01-20`
- **After Date:** `2023-02-20`
- **Cloud Cover:** `20%`
- **Radius:** `10 km`

### 3. Wayanad Landslides (Kerala, India) - July 2024
- **Location:** `Wayanad, Kerala, India`
- **Before Date:** `2024-05-15`
- **After Date:** `2024-08-15`
- **Cloud Cover:** `40%` *(higher cloud tolerance needed due to monsoon season)*
- **Radius:** `8 km`

## Architecture & Logic

- `src/components/SatelliteFetcher.jsx`: Manages the OAuth2 flow with Copernicus and requests 512x512 PNG tiles for the specified location and dates.
- `src/analysis.js`: Performs the pixel-differencing logic between the 'before' and 'after' images, calculating the loss ratio per grid cell.
- `src/components/SeverityGrid.jsx`: Renders the interactive classification map over the 'after' image.
