import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import hostingConfig from "./.openai/hosting.json";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  vars: { ENQUIRY_TO: "zakhar.bybko@icloud.com" },
  send_email: [{ name: "ENQUIRY_EMAIL", destination_address: "zakhar.bybko@icloud.com" }],
  ratelimits: [{ name: "ENQUIRY_RATE_LIMITER", namespace_id: "1001", simple: { limit: 3, period: 60 as const } }],
  routes: [
    { pattern: "coilo.de", custom_domain: true },
    { pattern: "www.coilo.de", custom_domain: true },
  ],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      config: localBindingConfig,
    }),
  ],
});
