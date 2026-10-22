# 🪔 Shubh Deepavali — Interactive Diwali Celebration

> 🚀 **Live Website:** [https://diwalidhmaka.vercel.app/](https://diwalidhmaka.vercel.app/)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-diwalidhmaka.vercel.app-success?style=for-the-badge&logo=vercel)](https://diwalidhmaka.vercel.app/)
[![Festival](https://img.shields.io/badge/Festival-Diwali-orange?style=for-the-badge)](https://diwalidhmaka.vercel.app/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://diwalidhmaka.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://diwalidhmaka.vercel.app/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=for-the-badge&logo=vite)](https://diwalidhmaka.vercel.app/)

An interactive, vibrant Diwali festival web experience built with React, Vite, TypeScript, and the Web Audio API. Celebrate the festival of lights with interactive fireworks, glowing diyas, traditional rangoli, festive sounds, and an eco-friendly celebration message!

---

## ✨ Features

- 🕯️ **Interactive Burning Matchstick**: Drag or move a lit matchstick across the canvas with realistic flame sparks and sounds.
- 🎆 **Realistic Crackers & Pyrotechnics**:
  - **Sutli Bomb & Atom Bomb**: Realistic fuse burning, detonation shake, flash effects, and sonic boom audio.
  - **Sky Rockets**: Whooshing ascent with multi-color particle burst explosions in the night sky.
  - **Ground Chakri (Ground Spinner)**: Whirling circular fire-sparks with rotational sound effects.
  - **Anaar (Flowerpot Fountain)**: Sky-reaching showers of sparkling gold and multicolor embers.
  - **Divine Arrows & Bow**: Mythological festive archery bursts with divine particle trails.
- 🦚 **Peacock Rangoli & Glowing Diyas**: Beautiful animated rangoli art and diya lighting celebration.
- 🔊 **Synthesized Web Audio & SFX**: Dynamic, realistic festive sound design created via Web Audio without heavy external audio files.
- 🧹 **Festive Dustbin (Eco-Friendly Celebration)**: Clear the celebration residue and keep the festival clean ("Kleanup") with confetti celebrations.
- 📱 **Fully Responsive**: Optimized for desktop, tablets, and mobile touchscreens.

---

## 🚀 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ashishsharma1927-pixel/Diwali_special.git
   cd Diwali_special
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be generated inside the `dist/` directory. You can preview the production build locally with:

```bash
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

This project is configured with a GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) for automatic builds and deployments to GitHub Pages.

### Setup Instructions

1. **Commit and push your files to GitHub**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment and project setup"
   git branch -M main
   git remote add origin https://github.com/ashishsharma1927-pixel/Diwali_special.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in your Repository Settings**:
   - Go to your repository on GitHub: [ashishsharma1927-pixel/Diwali_special](https://github.com/ashishsharma1927-pixel/Diwali_special)
   - Click on **Settings** (⚙️) tab at the top.
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.

3. **Enjoy your live site**:
   - The deployment workflow will run automatically upon every push to `main` (or `master`).
   - You can monitor the progress under the **Actions** tab.
   - Once completed, your site URL will be displayed in the **Pages** settings and in the GitHub Actions summary (e.g. `https://ashishsharma1927-pixel.github.io/Diwali_special/`).

---

## 🛠️ Built With

- **[React 19](https://react.dev/)**
- **[Vite](https://vite.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)**
- **[Lucide React](https://lucide.dev/)**
- **Web Audio API**
- **Custom Particle & Physics Canvas**

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
