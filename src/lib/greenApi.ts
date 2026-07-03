function toChatId(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "972");
  return `${digits}@c.us`;
}

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const url = process.env.GREEN_API_URL;
  const instance = process.env.GREEN_API_INSTANCE;
  const token = process.env.GREEN_API_TOKEN;
  if (!url || !instance || !token) throw new Error("Green API env vars missing");

  const res = await fetch(`${url}/waInstance${instance}/sendMessage/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId: toChatId(phone), message }),
  });
  if (!res.ok) throw new Error(`Green API send failed: ${res.status}`);
}
