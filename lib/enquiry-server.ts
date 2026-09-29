import { PRODUCT_COLORS } from "./sales";

type Dependencies = {
  ready: boolean;
  limit: (key: string) => Promise<{ success: boolean }>;
  send: (message: { email: string; subject: string; text: string }) => Promise<void>;
};

export async function handleEnquiry(request: Request, dependencies: Dependencies) {
  const reply = (status: number, error?: string) => Response.json(
    error ? { error } : { ok: true },
    { status, headers: { "Cache-Control": "no-store" } },
  );
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply(403, "invalid_origin");
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415, "invalid_content_type");
  // Read a bounded stream, including requests without a Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return reply(400, "invalid_request");
  const chunks: Uint8Array[] = [];
  let size = 0;
  let payload: Record<string, unknown>;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return reply(413, "too_large"); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return reply(400, "invalid_request");
    payload = parsed;
  } catch { return reply(400, "invalid_request"); }

  if (payload.website) return reply(400, "invalid_request");
  const { email, name, message, color, lang } = payload;
  const selected = PRODUCT_COLORS.find((item) => item.slug === color);
  if (typeof email !== "string" || email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email)
    || typeof name !== "string" || name.length > 100
    || typeof message !== "string" || message.length > 600
    || !selected || (lang !== "en" && lang !== "de")) return reply(400, "invalid_fields");
  if (!dependencies.ready) return reply(503, "unavailable");
  try {
    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
    const key = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    if (!(await dependencies.limit(key)).success) return reply(429, "rate_limited");
    await dependencies.send({
      email,
      subject: `Coilo enquiry - ${selected.name}`,
      text: `New sales-launch enquiry from coilo.de\n\nColor: ${selected.name}\nName: ${name.trim() || "-"}\nEmail: ${email}\nLanguage: ${lang}\n\nMessage:\n${message.trim() || "-"}\n\nThe visitor requests notification when sales open. This is not an order or payment.`,
    });
    return reply(200);
  } catch {
    // Do not log the request, email body, or provider errors containing personal data.
    return reply(502, "send_failed");
  }
}

export function createRawEmail(from: string, to: string, message: { email: string; subject: string; text: string }) {
  const base64 = (value: string) => btoa(Array.from(new TextEncoder().encode(value), (byte) => String.fromCharCode(byte)).join(""));
  return [
    `From: Coilo <${from}>`, `To: ${to}`, `Reply-To: ${message.email}`,
    `Subject: =?UTF-8?B?${base64(message.subject)}?=`,
    `Date: ${new Date().toUTCString()}`, `Message-ID: <${crypto.randomUUID()}@coilo.de>`,
    "MIME-Version: 1.0", 'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64", "", base64(message.text).match(/.{1,76}/g)!.join("\r\n"), "",
  ].join("\r\n");
}
