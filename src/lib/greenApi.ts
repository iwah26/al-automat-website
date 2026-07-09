function toChatId(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "972");
  return `${digits}@c.us`;
}

function greenApiCreds() {
  const url = process.env.GREEN_API_URL;
  const instance = process.env.GREEN_API_INSTANCE;
  const token = process.env.GREEN_API_TOKEN;
  if (!url || !instance || !token) throw new Error("Green API env vars missing");
  return { url, instance, token };
}

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const { url, instance, token } = greenApiCreds();

  const res = await fetch(`${url}/waInstance${instance}/sendMessage/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId: toChatId(phone), message }),
  });
  if (!res.ok) throw new Error(`Green API send failed: ${res.status}`);
}

export const RABANIM_GROUP_INVITE_LINK = "https://chat.whatsapp.com/IauAEmx8w1QB7ePiFwHxTb"; // סדנת Claude Code לרבנים 🧠
