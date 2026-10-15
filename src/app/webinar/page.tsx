import { redirect } from "next/navigation";

// הוובינר של 8.10 עבר — מי שמגיע לקישור ההרשמה הישן מקבל את ההקלטה (קוד המקור נשמר)
export default async function WebinarPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  redirect(c ? `/webinar-recording?c=${encodeURIComponent(c)}` : "/webinar-recording");
}
