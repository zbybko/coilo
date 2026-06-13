#!/usr/bin/env node
// Direct video generation wrapper - fal.ai (Kling/Seedance) and BytePlus
// ModelArk (Seedance 2.0, billed against a prepaid token pack). No deps.
//
//   FAL_KEY=... node scripts/genvideo.mjs \
//     --model kling --image public/media/sakura.webp \
//     --prompt "slow cinematic camera orbit..." --duration 12
//
//   ARK_API_KEY=... node scripts/genvideo.mjs \
//     --model ark-seedance --image public/media/sakura.webp \
//     --prompt "slow cinematic camera orbit..." --duration 5 --resolution 720p
//
// Models:
//   kling              fal.ai    fal-ai/kling-video/v3/standard/image-to-video   $0.084/s (no audio)
//   seedance           fal.ai    bytedance/seedance-2.0/image-to-video           $0.3024/s (1080p)
//   ark-seedance       ModelArk  dreamina-seedance-2-0-260128                    prepaid tokens
//   ark-seedance-fast  ModelArk  dreamina-seedance-2-0-fast-260128               prepaid tokens
//
// fal key:  $FAL_KEY or ~/.fal_key
// ark key:  $ARK_API_KEY or ~/.ark_key
// Output lands in render/ai/.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { basename, extname, join } from "node:path";

const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks";

const RES_DIMS = {
  "480p":  { "16:9": [854, 480],  "9:16": [480, 854],  "1:1": [640, 640] },
  "720p":  { "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [960, 960] },
  "1080p": { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1440, 1440] },
};

function estimateArkTokens(o) {
  const dims = RES_DIMS[o.resolution]?.[o.ar];
  if (!dims) return null;
  const [w, h] = dims;
  return Math.round((w * h * o.duration * 24) / 1024);
}

const MODELS = {
  kling: {
    provider: "fal",
    id: "fal-ai/kling-video/v3/standard/image-to-video",
    usdPerSec: 0.084,
    buildInput: (o) => ({
      prompt: o.prompt,
      start_image_url: o.imageUrl,
      duration: String(o.duration),
      generate_audio: false,
      negative_prompt: "blur, distort, low quality, people, text, watermark",
    }),
  },
  seedance: {
    provider: "fal",
    id: "bytedance/seedance-2.0/image-to-video",
    usdPerSec: 0.3024,
    buildInput: (o) => ({
      prompt: o.prompt,
      image_url: o.imageUrl,
      duration: o.duration,
      resolution: o.resolution,
      aspect_ratio: o.ar,
      generate_audio: false,
    }),
  },
  "ark-seedance": {
    provider: "ark",
    id: "dreamina-seedance-2-0-260128",
    buildInput: (o) => ({
      model: "dreamina-seedance-2-0-260128",
      content: [
        { type: "text", text: o.prompt },
        { type: "image_url", image_url: { url: o.imageUrl }, role: "first_frame" },
      ],
      ratio: o.ar,
      resolution: o.resolution,
      duration: o.duration,
      generate_audio: false,
    }),
  },
  "ark-seedance-fast": {
    provider: "ark",
    id: "dreamina-seedance-2-0-fast-260128",
    buildInput: (o) => ({
      model: "dreamina-seedance-2-0-fast-260128",
      content: [
        { type: "text", text: o.prompt },
        { type: "image_url", image_url: { url: o.imageUrl }, role: "first_frame" },
      ],
      ratio: o.ar,
      resolution: o.resolution,
      duration: o.duration,
      generate_audio: false,
    }),
  },
  "seedance-ref": {
    provider: "fal",
    id: "bytedance/seedance-2.0/reference-to-video",
    usdPerSec: 0.3024,
    buildInput: (o) => ({
      prompt: o.prompt,
      image_urls: o.imageUrls,
      ...(o.videoUrls.length ? { video_urls: o.videoUrls } : {}),
      duration: o.duration,
      resolution: o.resolution,
      aspect_ratio: o.ar,
      generate_audio: false,
    }),
  },
  "ark-seedance1": {
    provider: "ark",
    id: "seedance-1-0-pro-250528",
    buildInput: (o) => ({
      model: "seedance-1-0-pro-250528",
      content: [
        { type: "text", text: o.prompt },
        { type: "image_url", image_url: { url: o.imageUrl }, role: "first_frame" },
      ],
      ratio: o.ar,
      resolution: o.resolution,
      duration: o.duration,
      generate_audio: false,
    }),
  },
};

function parseArgs(argv) {
  const o = { model: "kling", duration: 12, resolution: "1080p", ar: "16:9", out: "render/ai", images: [], videos: [] };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const need = () => argv[++i] ?? fail(`missing value for ${k}`);
    if (k === "--model") o.model = need();
    else if (k === "--prompt") o.prompt = need();
    else if (k === "--image") o.images.push(need());
    else if (k === "--video") o.videos.push(need());
    else if (k === "--duration") o.duration = Number(need());
    else if (k === "--resolution") o.resolution = need();
    else if (k === "--ar") o.ar = need();
    else if (k === "--out") o.out = need();
    else if (k === "--yes" || k === "-y") o.yes = true;
    else fail(`unknown flag ${k}`);
  }
  return o;
}

const fail = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

function getKey(provider) {
  const env = provider === "ark" ? "ARK_API_KEY" : "FAL_KEY";
  const file = provider === "ark" ? ".ark_key" : ".fal_key";
  if (process.env[env]) return process.env[env].trim();
  const f = join(homedir(), file);
  if (existsSync(f)) return readFileSync(f, "utf8").trim();
  fail(`no ${env} env var and no ~/${file} file`);
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".mov": "video/quicktime" };

function imageToDataUri(path) {
  const mime = MIME[extname(path).toLowerCase()] ?? fail(`unsupported image type: ${path}`);
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

async function fetchJson(url, headers, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers, ...init.headers },
  });
  const body = await res.text();
  if (!res.ok) fail(`${url} -> HTTP ${res.status}: ${body.slice(0, 500)}`);
  return JSON.parse(body);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runFal(model, o, key) {
  const input = model.buildInput(o);
  const headers = { Authorization: `Key ${key}` };
  const submitted = await fetchJson(`https://queue.fal.run/${model.id}`, headers, {
    method: "POST",
    body: JSON.stringify(input),
  });
  const statusUrl = submitted.status_url ?? `https://queue.fal.run/${model.id}/requests/${submitted.request_id}/status`;
  const responseUrl = submitted.response_url ?? `https://queue.fal.run/${model.id}/requests/${submitted.request_id}`;
  console.log(`request:  ${submitted.request_id}`);

  let status;
  for (;;) {
    status = await fetchJson(statusUrl, headers);
    if (status.status === "COMPLETED") break;
    if (status.status === "FAILED" || status.error) fail(`generation failed: ${JSON.stringify(status).slice(0, 500)}`);
    process.stdout.write(`\rstatus:   ${status.status}${status.queue_position != null ? ` (queue #${status.queue_position})` : ""}   `);
    await sleep(5000);
  }
  console.log("\rstatus:   COMPLETED              ");

  const result = await fetchJson(responseUrl, headers);
  return result.video?.url ?? result.output?.video?.url ?? fail(`no video url in response: ${JSON.stringify(result).slice(0, 500)}`);
}

async function runArk(model, o, key) {
  const input = model.buildInput(o);
  const headers = { Authorization: `Bearer ${key}` };
  const submitted = await fetchJson(ARK_BASE, headers, {
    method: "POST",
    body: JSON.stringify(input),
  });
  const taskId = submitted.id ?? fail(`no task id in response: ${JSON.stringify(submitted).slice(0, 500)}`);
  console.log(`task:     ${taskId}`);

  let status;
  for (;;) {
    status = await fetchJson(`${ARK_BASE}/${taskId}`, headers);
    if (status.status === "succeeded") break;
    if (["failed", "expired", "cancelled"].includes(status.status)) fail(`generation ${status.status}: ${JSON.stringify(status).slice(0, 500)}`);
    process.stdout.write(`\rstatus:   ${status.status}   `);
    await sleep(5000);
  }
  console.log("\rstatus:   succeeded              ");

  return status.content?.video_url ?? fail(`no video_url in response: ${JSON.stringify(status).slice(0, 500)}`);
}

async function main() {
  const o = parseArgs(process.argv);
  const model = MODELS[o.model] ?? fail(`--model must be one of: ${Object.keys(MODELS).join(", ")}`);
  if (!o.prompt) fail("--prompt is required");
  if (!o.images.length) fail("--image is required (repeatable)");
  for (const f of [...o.images, ...o.videos]) if (!existsSync(f)) fail(`file not found: ${f}`);
  o.image = o.images[0];

  const key = getKey(model.provider);
  console.log(`model:    ${model.id}`);
  console.log(`duration: ${o.duration}s  resolution: ${o.resolution}  ratio: ${o.ar}`);
  if (model.provider === "fal") {
    console.log(`est. cost: $${(model.usdPerSec * o.duration).toFixed(2)}`);
  } else {
    const tokens = estimateArkTokens(o);
    if (tokens) console.log(`est. tokens: ~${tokens.toLocaleString()} (from your prepaid ModelArk balance)`);
  }
  if (!o.yes) {
    process.stdout.write("submit? [y/N] ");
    const answer = await new Promise((r) => process.stdin.once("data", (d) => r(String(d).trim())));
    if (!/^y(es)?$/i.test(answer)) { console.log("aborted"); return; }
  }

  o.imageUrl = imageToDataUri(o.image);
  o.imageUrls = o.images.map(imageToDataUri);
  o.videoUrls = o.videos.map(imageToDataUri);

  const videoUrl = model.provider === "ark" ? await runArk(model, o, key) : await runFal(model, o, key);

  mkdirSync(o.out, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  const outPath = join(o.out, `${o.model}_${basename(o.image, extname(o.image))}_${stamp}.mp4`);
  const video = await fetch(videoUrl);
  if (!video.ok) fail(`download failed: HTTP ${video.status}`);
  writeFileSync(outPath, Buffer.from(await video.arrayBuffer()));
  console.log(`saved:    ${outPath}`);
  console.log(`url:      ${videoUrl}`);
}

main().catch((e) => fail(e.message));
