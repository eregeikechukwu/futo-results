import { Logo, LogoWithName } from "@/components/secondary/logo";
import Image from "next/image";
import { Newspaper, CloudUpload, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { TextAdd } from "@/components/textAdd";
import styles from "./home.module.scss";
import { useDesktopOnly } from "./hooks/useDesktopOnly";

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
      <nav className={styles.headerNav}>
        <div className={styles.headerInner}>
          <LogoWithName isLight={false} />
          <p className={styles.deptText}>
            Department of Mechatronics Engineering
          </p>
        </div>
      </nav>

      {/* Body */}
      <div>
        {/* Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={`${styles.heroTitle} animateFadeIn`}>
                Your Results,
                <span className={styles.heroAccent}>
                  <TextAdd>Anytime.</TextAdd>
                </span>
              </h1>
              <p className={styles.heroBody}>
                Access verified academic results securely from your department.
                Simple, transparent, and always available.
              </p>
              <div className={styles.heroActions}>
                <Link href="/student/auth">
                  <button
                    className={`button-primary text-white hover:bg-[var(--color-blue-light)] bg-[var(--color-primary)] heroActionButton w-full md:w-auto`}
                  >
                    I&apos;m a Student
                  </button>
                </Link>
                <Link href="/advisor/auth">
                  <button
                    className={`button-primary bg-[#f3f4f6] hover:bg-[#e2e8ec] heroActionButton w-full md:w-auto`}
                  >
                    I&apos;m an Advisor
                  </button>
                </Link>
              </div>
            </div>
            <div className={styles.heroImageWrap}>
              <Image
                alt="hero image"
                height={2000}
                width={1500}
                src={"/images/hero-option2.jpg"}
                className={styles.heroImage}
              />
            </div>
          </div>
        </section>
        {/* How it works section */}
        <section>
          <div className={styles.sectionShell}>
            <div className={styles.howHeader}>
              <h2 className={styles.howTitle}>How it Works</h2>
              <p className={styles.howSubtitle}>
                Simple steps to access your verified results
              </p>
            </div>
            <div className={styles.howGrid}>
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
        <section id="about" className={styles.aboutSection}>
          <div className={styles.aboutShell}>
            <h2 className={styles.aboutTitle}>About the Portal</h2>
            <p className={styles.aboutText}>
              Our Student Result Portal ensures complete transparency,
              convenience, and integrity in accessing academic results. Built
              with security and user experience in mind, this platform provides
              a reliable way for students to view their verified academic
              performance while maintaining the highest standards of data
              protection and authenticity.
            </p>

            <div className={styles.supportCard}>
              <p>Need help or have questions?</p>
              <a
                className={styles.supportMail}
                href="mailto:eregeikechukwu@gmail.com"
              >
                support@studentportal.edu
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <LogoWithName isLight={true} />
            <div className={styles.footerLinks}>
              {linkItems.map((item) => (
                <a
                  key={item.title}
                  href={item.link}
                  className={styles.footerLink}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
          <div className={styles.footerCopy}>
            &copy; 2025 Student Result Portal. All rights reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}
