import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "פספסת את הוובינר | על אוטומט",
  description: "פספסת את הוובינר? עדיין אפשר להירשם לסדנה",
};

const WEBINAR_BUNNY_LIBRARY_ID = "695009";
const WEBINAR_BUNNY_VIDEO_ID = "005981f0-2ed2-4797-a02a-f96b34637cf0";

export default function WebinarMissedPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center text-right mb-16">
          <h1 className="text-4xl font-black text-white leading-snug mb-4">
            וובינר — מה זה Claude Code ואיך זה יכול לעזור לרבנים
          </h1>
          <div className="rounded-2xl overflow-hidden border border-brand-accent/20 mb-10" style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src={`https://iframe.mediadelivery.net/embed/${WEBINAR_BUNNY_LIBRARY_ID}/${WEBINAR_BUNNY_VIDEO_ID}?autoplay=false&responsive=true`}
              loading="lazy"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            />
          </div>
          <p className="text-xl text-slate-300 leading-relaxed mb-10">
            אבל ממש לא נורא — אתה עדיין יכול להירשם ישירות לסדנה עצמה,
            &quot;קלוד קוד לרבנים&quot;, ולקבל את כל התוכן במפגשים חיים.
          </p>
          <Link
            href="/sednah-rabanim-round2"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity"
          >
            להרשמה לסדנה ←
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
