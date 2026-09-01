const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export async function initializeTransaction(opts: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorization_url: string; access_code: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amountNaira * 100), // kobo
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      metadata: opts.metadata,
    }),
  });

  if (!res.ok) {
    throw new Error(`Paystack initialize error: ${res.status}`);
  }

  const json = (await res.json()) as { status: boolean; message: string; data: { authorization_url: string; access_code: string; reference: string } };
  if (!json.status) throw new Error(json.message ?? "Paystack initialize failed");
  return json.data;
}

export async function chargeAuthorization(opts: {
  authorizationCode: string;
  email: string;
  amountNaira: number;
  reference: string;
  metadata: Record<string, unknown>;
}): Promise<{ status: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/charge_authorization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authorization_code: opts.authorizationCode,
      email: opts.email,
      amount: Math.round(opts.amountNaira * 100), // kobo
      reference: opts.reference,
      metadata: opts.metadata,
    }),
  });

  if (!res.ok) {
    throw new Error(`Paystack charge_authorization error: ${res.status}`);
  }

  const json = (await res.json()) as { status: boolean; message: string; data: { status: string; reference: string } };
  if (!json.status) throw new Error(json.message ?? "Paystack charge_authorization failed");
  return json.data;
}

export async function verifyTransaction(reference: string): Promise<{
  status: string;
  amount: number; // kobo
  reference: string;
}> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Paystack verify error: ${res.status}`);
  }

  const json = (await res.json()) as { status: boolean; message: string; data: { status: string; amount: number; reference: string } };
  if (!json.status) throw new Error(json.message ?? "Paystack verify failed");
  return json.data;
}
