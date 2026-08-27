import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Virtual Garden",
    description: "A Zen Garden that thrives with your productivity",
    permissions: ["storage", "alarms", "tabs", "idle"],
    web_accessible_resources: [
      {
        resources: ["assets/*"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
