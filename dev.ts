// Dev server with hot reload for slide development
// Usage: bun run dev

const srcDir = "./src";
const nodeModulesDir = "./node_modules";

const server = Bun.serve({
  port: parseInt(process.env.PORT || "3000"),
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    // Default to index.html
    if (path === "/") path = "/index.html";

    // Serve node_modules (for reveal.js)
    if (path.startsWith("/node_modules/")) {
      const file = Bun.file(`.${path}`);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    }

    // Inject hot-reload script into HTML
    if (path.endsWith(".html")) {
      const file = Bun.file(`${srcDir}${path}`);
      if (await file.exists()) {
        let html = await file.text();
        // Inject live reload script before </body>
        const reloadScript = `
<script>
  // Hot reload - polls for changes
  let lastModified = '';
  setInterval(async () => {
    try {
      const res = await fetch('/__reload');
      const data = await res.json();
      if (lastModified && lastModified !== data.hash) {
        location.reload();
      }
      lastModified = data.hash;
    } catch {}
  }, 500);
</script>`;
        html = html.replace("</body>", `${reloadScript}\n</body>`);
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    // Reload endpoint - returns hash of src directory mtime
    if (path === "/__reload") {
      const glob = new Bun.Glob("**/*");
      let hash = "";
      for await (const entry of glob.scan({ cwd: srcDir })) {
        const file = Bun.file(`${srcDir}/${entry}`);
        const stat = await file.exists();
        if (stat) {
          hash += `${entry}:${file.lastModified}|`;
        }
      }
      return Response.json({ hash });
    }

    // Serve other src files (CSS, JS, images, etc.)
    const file = Bun.file(`${srcDir}${path}`);
    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`
  🦞 SydClaw Talk — Dev Server
  
  Local:   http://localhost:${server.port}
  
  Editing files in src/ will auto-reload the browser.
  Press Ctrl+C to stop.
`);
