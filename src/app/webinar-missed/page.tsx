import { redirect } from "next/navigation";

// מי שלוחץ על לינק הזום אחרי הוובינר מגיע לכאן — מפנים להקלטה
export default function WebinarMissedPage() {
  redirect("/webinar-recording");
}
