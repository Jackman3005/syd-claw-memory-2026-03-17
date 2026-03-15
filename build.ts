// Build script — produces a self-contained dist/ folder ready to deploy
// Usage: bun run build

import { mkdirSync, cpSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const distDir = "./dist";
const srcDir = "./src";

// Clean and create dist
mkdirSync(distDir, { recursive: true });

// Copy reveal.js dist files
const revealDist = "./node_modules/reveal.js/dist";
mkdirSync(join(distDir, "reveal"), { recursive: true });
cpSync(join(revealDist, "reset.css"), join(distDir, "reveal/reset.css"));
cpSync(join(revealDist, "reveal.css"), join(distDir, "reveal/reveal.css"));
cpSync(join(revealDist, "reveal.js"), join(distDir, "reveal/reveal.js"));
cpSync(join(revealDist, "theme"), join(distDir, "reveal/theme"), { recursive: true });

// Copy custom styles
cpSync(join(srcDir, "styles.css"), join(distDir, "styles.css"));

// Copy and patch index.html to use local reveal paths
let html = readFileSync(join(srcDir, "index.html"), "utf-8");

// Rewrite paths from node_modules to local reveal/
html = html.replace(
  /\/node_modules\/reveal\.js\/dist\//g,
  "./reveal/"
);

// Rewrite styles.css path
html = html.replace(
  /\.\/styles\.css/,
  "./styles.css"
);

writeFileSync(join(distDir, "index.html"), html);

// Copy any images/assets from src
const glob = new Bun.Glob("**/*.{png,jpg,jpeg,gif,svg,webp,ico,mp4,webm}");
for await (const entry of glob.scan({ cwd: srcDir })) {
  const destPath = join(distDir, entry);
  mkdirSync(join(destPath, ".."), { recursive: true });
  cpSync(join(srcDir, entry), destPath);
}

console.log(`
  ✅ Build complete!
  
  Output: ${distDir}/
  
  The dist/ folder is fully self-contained.
  Serve it with any static file server, or deploy to:
  - GitHub Pages
  - Vercel
  - Netlify
  - Any web host
`);
