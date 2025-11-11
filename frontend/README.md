
#  React + Tailwind CSS + Vite + TypeScript Template

This branch provides a **React** starter template configured with **Tailwind CSS**, **Vite**, and **TypeScript**. Ideal for modern frontend development with fast builds and utility-first styling.

---

## 📁 Folder Structure


``` 
├── public/  
├── src/  
├── .gitignore  
├── README.md  
├── eslint.config.js  
├── index.html  
├── package-lock.json  
├── package.json  
├── postcss.config.cjs  
├── tailwind.config.js  
├── tsconfig.json  
├── tsconfig.app.json  
├── tsconfig.node.json  
└── vite.config.ts

```

---

## 🧰 Tech Stack

- ⚛️ React
- ⚡ Vite
- 🎨 Tailwind CSS v3
- 🟦 TypeScript


---

## 🚀 Getting Started

### 1. Clone the Repository & Checkout the Tailwind Branch

```bash
https://github.com/dharshan-kumarj/React_CSS_Frameworks_Starter/tree/Tailwind
cd React_CSS_Frameworks_Starter
git checkout Tailwind

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Start the Dev Server

```bash
npm run dev

```

----------

## 🧩 Tailwind CSS Configuration

###  `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```
### `postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

###  `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```

----------

## 🧪 Verifying Tailwind CSS

To check if Tailwind is working:

1.  Go to `src/App.tsx`
    
2.  Add a class like `bg-blue-600 text-white p-4 rounded`
    
3.  Run the app and see the changes
    

----------

## 🏗️ Build for Production

```bash
npm run build

```

Then preview using:

```bash
npm run preview

```
