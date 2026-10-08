# FormFit AI — Precision File & Photo Preparation

FormFit AI is a modern, high-performance, client-side application designed to prepare photos, signatures, certificates, and PDF documents for official government, visa, university, and employment portals.

## 🚀 Key Highlights & Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router v7 (`react-router-dom`) with SPA fallback support
- **Styling**: Tailwind CSS + Custom Design System tokens (warm minimalist cream `#FAF8F6` & dark mode `#0E1217`)
- **Icons**: `lucide-react`
- **PDF Engine**: `pdf-lib` (merge, split, compress) + `jspdf` (multi-page document compilation)
- **Local-First Privacy**: All image resizing, binary-search JPEG compression, signature ink extraction, and PDF manipulation run 100% in-browser. No remote file uploads.

---

## 🧭 Routes & Direct URLs

All routes support direct access, page refreshes, and browser Back/Forward navigation:

| Route | Description |
|---|---|
| `/` | Landing page with hero comparison and popular presets |
| `/tools` | All-in-one tools hub & navigation center |
| `/photo` | Photo preparation: upload, rotate, crop, binary-search compression |
| `/photo/prepare` | Direct alias for photo editor |
| `/signature` | Signature preparation: touch/mouse drawing & paper background removal |
| `/document` | Document scanner: multi-page certificate scans with brightness/contrast & PDF creation |
| `/pdf` | PDF suite: merge multiple PDFs, split page ranges, compress, and convert images to PDF |
| `/presets` | Presets catalog: official portal specs (UPSC, SSC, US Visa, Passport) + custom preset creator |
| `/history` | Local processing history with download and deletion actions |
| `/settings` | Theme controls (Light/Dark/System), language selector, and local data clearance |
| `/help` | Searchable FAQ center with interactive accordions |
| `/privacy` | Privacy policy and local-first browser guarantees |
| `/terms` | Terms of service and application disclaimer |

---

## 🏗️ Project Architecture
```
FormFit AI/
├── frontend/               # React 19 + Vite Frontend SPA
│   ├── src/                # UI components, pages, services, layouts
│   ├── public/             # Static assets & PWA files
│   ├── index.html          # HTML entry point
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── package.json        # Frontend dependencies & scripts
├── backend/                # Node.js + Express API Server
│   ├── src/                # Controllers, models, routes, middleware
│   ├── server.js           # Server entry point (port 5050)
│   └── package.json        # Backend dependencies & scripts
├── tests/                  # Integration & unit test suites
└── package.json            # Root workspace scripts
```

---

## 🛠️ Getting Started Locally

```bash
# Install dependencies for both frontend and backend
npm run install:all

# Run both backend & frontend concurrently
npm run dev

# Or run frontend only (http://localhost:5175)
npm run frontend:dev

# Or run backend only (http://localhost:5050)
npm run backend:dev

# Run all test suites
npm test

# Build production bundle for frontend
npm run build

---

## 🌐 Deployment Configuration

- **Vercel**: SPA fallback configured in `vercel.json` (`/ (.*) -> /index.html`).
- **Netlify**: SPA redirect rules configured in `public/_redirects` (`/* /index.html 200`).
- **PWA**: Configured with `public/manifest.webmanifest` and `public/sw.js` for offline shell support.
