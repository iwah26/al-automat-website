import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CourseSidebar } from "@/components/CourseSidebar";
import { SESSIONS } from "@/data/sessions";
import { verifySession, COURSE_COOKIE } from "@/lib/courseSession";

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COURSE_COOKIE)?.value;
  if (!verifySession(token)) {
    redirect("/course-login");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 flex flex-row-reverse bg-course-bg">
        <CourseSidebar sessions={SESSIONS} />
        <main className="flex-1 px-6 py-8 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
