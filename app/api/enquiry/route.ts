import { env } from "cloudflare:workers";
import { EmailMessage } from "cloudflare:email";
import { createRawEmail, handleEnquiry } from "../../../lib/enquiry-server";

export async function POST(request: Request) {
  const bindings = env as unknown as {
    ENQUIRY_EMAIL?: { send(message: EmailMessage): Promise<unknown> };
    ENQUIRY_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
    ENQUIRY_TO?: string;
  };
  const recipient = bindings.ENQUIRY_TO;
  // Local email bindings are simulated; never tell visitors that a simulated email was sent.
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname);
  return handleEnquiry(request, {
    ready: !local && Boolean(bindings.ENQUIRY_EMAIL && bindings.ENQUIRY_RATE_LIMITER && recipient),
    limit: (key) => bindings.ENQUIRY_RATE_LIMITER!.limit({ key }),
    send: async (message) => {
      const from = "support@coilo.de";
      await bindings.ENQUIRY_EMAIL!.send(new EmailMessage(from, recipient!, createRawEmail(from, recipient!, message)));
    },
  });
}
