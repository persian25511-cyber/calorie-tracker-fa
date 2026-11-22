import { defineRailway, project, service } from "railway/iac";

// Railway Infrastructure as Code (replaces deprecated railway.json / railway.toml).
// Apply with: railway config apply   (after `railway login` and `railway link`)
export default defineRailway(() => {
  const web = service("web", {
    build: "npm run build",
    start: "npx serve --single --listen $PORT dist",
    healthcheck: "/",
  });

  return project("calorie-tracker-fa", {
    resources: [web],
  });
});
