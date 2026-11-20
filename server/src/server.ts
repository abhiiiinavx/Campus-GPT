import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  🎓 ===================================================
  🚀 CampusIQ Server Live & Operational!
  🏷️ Tagline: "One AI Platform for Everything on Campus."
  🌐 Environment: ${env.NODE_ENV}
  🔌 Port: ${PORT}
  📑 Swagger Docs: http://localhost:${PORT}/api/v1/docs
  ❤️ Health Check: http://localhost:${PORT}/api/v1/health
  ===================================================
  `);
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
