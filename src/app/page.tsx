import { Logo, LogoWithName } from "@/components/secondary/logo";
import Image from "next/image";
import { Newspaper, CloudUpload, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { TextAdd } from "@/components/textAdd";

export default function Home() {
  const linkItems = [
    { title: "About", link: "#about" },
    { title: "Privacy", link: "#about" },
    { title: "Support", link: "#about" },
    {
      title: "Code by Nelson",
      link: "https://nelson-erege-portfolio.vercel.app/",
    },
  ];

  return (
    <main>
      {/* Header */}
      <nav className="h-72  center-child shadow-[0_0_6px_0_rgba(37,99,235,0.35)]">
        <div className="container flex justify-between  items-center px-34 ">
          <LogoWithName isLight={false} />
          <p className="lh-20 text-14 text-[var(--color-text-link)]">
            Department of Mechatronics Engineering
          </p>
        </div>
      </nav>

      {/* Body */}
      <div>
        {/* Hero */}
        <section className="h-screen mt-3  bg-gradient-to-br from-[var(--color-blue-background)] to-[var(--color-white)]">
          <div className="grid h-full px-32 grid-cols-2 gap-48 items-center container">
            <div className="">
              <h1 className="text-48 lh-60 font-bold mb-24 animateFadeIn">
                Your Results,
                <p className="text-[var(--color-primary)]">
                  <TextAdd>Anytime.</TextAdd>
                </p>
              </h1>
              <p className="text-20 text-[var(--color-text-link)] lh-32.5">
                Access verified academic results securely from your department.
                Simple, transparent, and always available.
              </p>
              <div className="flex gap-16 mt-32">
                <Link href="/student/auth">
                  <button className="button-primary text-white hover:bg-[var(--color-blue-light)] bg-[var(--color-primary)] shadow-lg hover:shadow-xl">
                    I'm a Student
                  </button>
                </Link>
                <Link href="/advisor/auth">
                  <button className="button-primary bg-[#f3f4f6] hover:bg-[#e2e8ec] shadow-md hover:shadow-lg">
                    I'm an Advisor
                  </button>
                </Link>
              </div>
            </div>
            <div className="shadow-2xl`">
              <Image
                alt="hero image"
                height={2000}
                width={1500}
                src={"/images/hero-option2.jpg"}
                className="w-full h-max rounded-[24px]"
              />
            </div>
          </div>
        </section>
        {/* How it works section */}
        <section>
          <div className="container  py-80 px-32 text-center">
            <div className="mb-64">
              <h2 className="text-36 mb-12 lh-40 font-bold">How it Works</h2>
              <p className="body-text text-[var(--color-text-link)]">
                Simple steps to access your verified results
              </p>
            </div>
            <div className="grid w-full gap-32 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] text-center ">
              <div className="bg-[var(--color-blue-background)]  transition-[0.7s] p-32 hover:shadow-lg group rounded-[16px] justify-between flex flex-col items-center">
                <div className="rounded-full mb-[1.5rem] bg-[var(--color-primary)] transition-[0.4s] center-child w-64 h-64 group-hover:scale-[1.09375]">
                  <Newspaper className="w-24 h-25 text-[var(--color-white)] " />
                </div>
                <p className="body-text font-[600] mb-16">
                  Fill the Google form
                </p>
                <p className="text-[var(--color-text-link)] lh-26">
                  Complete the Google Form shared by your Class Representative
                  with your accurate details.
                </p>
              </div>

              <div className="bg-[var(--color-green-background)]  transition-[0.7s] p-32 hover:shadow-lg group rounded-[16px] justify-between flex flex-col items-center">
                <div className="rounded-full mb-[1.5rem] bg-[var(--color-green)] transition-[0.4s] center-child w-64 h-64 group-hover:scale-[1.09375]">
                  <CloudUpload className="w-24 h-25 text-[var(--color-white)] " />
                </div>
                <p className="body-text font-[600] mb-16">
                  Advisor Verification
                </p>
                <p className="text-[var(--color-text-link)] lh-26">
                  Your advisor uploads and verifies all student records to
                  ensure accuracy and authenticity.
                </p>
              </div>

              <div className="bg-[var(--color-purple-background)]  transition-[0.7s] p-32 hover:shadow-lg group rounded-[16px] justify-between flex flex-col items-center">
                <div className="rounded-full mb-[1.5rem] bg-[var(--color-purple)] transition-[0.4s] center-child w-64 h-64 group-hover:scale-[1.09375]">
                  <ShieldCheckIcon className="w-24 h-25 text-[var(--color-white)] " />
                </div>
                <p className="body-text font-[600] mb-16">Instant Access</p>
                <p className="text-[var(--color-text-link)] lh-26">
                  Sign up with your verified details and gain immediate access
                  to your academic results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About section */}
        <section id="about" className="bg-[var(--color-primary)]">
          <div className="px-175 text-center center-child flex-col py-80  text-[#dbeafe] container">
            <h2 className="text-36 lh-40 font-bold mb-24">About the Portal</h2>
            <p className="text-20 lh-32 mb-32">
              Our Student Result Portal ensures complete transparency,
              convenience, and integrity in accessing academic results. Built
              with security and user experience in mind, this platform provides
              a reliable way for students to view their verified academic
              performance while maintaining the highest standards of data
              protection and authenticity.
            </p>

            <div className="bg-[#ffffff1a] rounded-[16px] w-max lh-24 p-24">
              <p>Need help or have questions?</p>
              <a
                className="text-white font-[600] mt-10"
                href="mailto:eregeikechukwu@gmail.com"
              >
                support@studentportal.edu
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#111827] text-[#9ca3af] px-32 py-48">
          <div className="flex justify-between">
            <LogoWithName isLight={true} />
            <div className="flex gap-24">
              {linkItems.map((item) => (
                <a
                  key={item.title}
                  href={item.link}
                  className=" transition hover:text-white text-16 lh-24"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
          <div className="pt-33 w-full text-center mt-36 border-t-[#1f2937] border-t-[1px]">
            &copy; 2025 Student Result Portal. All rights reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}
