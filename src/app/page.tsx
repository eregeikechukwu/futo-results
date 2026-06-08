"use client";

import { Logo, LogoWithName } from "@/components/secondary/logo";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TextAdd } from "@/components/textAdd";
import styles from "./home.module.scss";
import { useDesktopOnly } from "./hooks/useDesktopOnly";
import CountUp from "@/utils/countUp";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const isSmallScreen = useDesktopOnly();

  const linkItems = [
    { title: "How it works", link: "#how" },
    { title: "About", link: "#about" },
    { title: "Support", link: "mailto:eregeikechukwu@gmail.com" },
    {
      title: "Developer",
      link: "https://nelson-erege-portfolio.vercel.app/",
    },
  ];

  const steps = [
    {
      num: "01",
      colorKey: "blue",
      title: "Fill the Google Form",
      body: "Submit your academic details through the Google Form shared by your Class Representative. This is your pre-registration gate — accuracy here is essential.",
    },
    {
      num: "02",
      colorKey: "green",
      title: "Advisor Verification",
      body: "Your departmental advisor uploads and verifies all student records. Every result is authenticated before it becomes visible to any student.",
    },
    {
      num: "03",
      colorKey: "purple",
      title: "Instant Secure Access",
      body: "Sign up with your verified details and get immediate, private access to your complete academic results — from any device, anytime.",
    },
  ];

  return (
    <main>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {isSmallScreen ? (
            <Logo width={50} />
          ) : (
            <LogoWithName isLight={false} />
          )}
          <div className={styles.navLinks}>
            {linkItems.slice(0, 3).map((item) => (
              <a key={item.title} href={item.link} className={styles.navLink}>
                {item.title}
              </a>
            ))}
          </div>
          <button className={styles.navCta} onClick={() => setModalOpen(true)}>
            About the project
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.heroEyebrow}>
              <span className={styles.eyebrowDot} />
              Mechatronics Engineering · FUTO
            </div>
            <h1 className={styles.heroTitle}>
              Your results,{" "}
              <em className={styles.heroItalic}>
                <TextAdd>Anytime.</TextAdd>
              </em>
            </h1>
            <p className={styles.heroBody}>
              A secure, transparent portal for students and advisors to access
              verified academic records — no queues, no paperwork.
            </p>
            <div className={styles.heroActions}>
              <Link href="/student/auth">
                <button className={styles.btnPrimary}>
                  I&apos;m a Student
                </button>
              </Link>
              <Link href="/advisor/auth">
                <button className={styles.btnGhost}>I&apos;m an Advisor</button>
              </Link>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.cardStack}>
              {/* Main results card */}
              <div className={styles.resultsCard}>
                <div className={styles.rcInner}>
                  <p className={styles.rcLabel}>Academic Results — 2023/2024</p>
                  <div className={styles.rcScoreRow}>
                    <div className={styles.rcScore}>
                      <p className={styles.rcScoreVal}>4.51</p>
                      <p className={styles.rcScoreSub}>Current CGPA</p>
                    </div>
                    <div className={styles.rcScore}>
                      <p className={styles.rcScoreVal}>400L</p>
                      <p className={styles.rcScoreSub}>Current Level</p>
                    </div>
                  </div>
                  <div className={styles.rcCourses}>
                    {[
                      { code: "MCE 401 — Robotics", grade: "A", pass: true },
                      {
                        code: "MCE 403 — Control Systems",
                        grade: "A",
                        pass: true,
                      },
                      {
                        code: "MCE 405 — Instrumentation",
                        grade: "B+",
                        pass: false,
                      },
                      {
                        code: "MCE 407 — Fluid Mechanics",
                        grade: "A",
                        pass: true,
                      },
                      {
                        code: "GES 401 — Entrepreneurship",
                        grade: "B",
                        pass: false,
                      },
                    ].map((c) => (
                      <div key={c.code} className={styles.rcCourse}>
                        <span className={styles.rcCourseName}>{c.code}</span>
                        <span
                          className={`${styles.rcGrade} ${c.pass ? styles.rcGradeA : styles.rcGradeB}`}
                        >
                          {c.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Float badge */}
              <div className={styles.floatCard}>
                <p className={styles.fcLabel}>Verified by advisor</p>
                <p className={styles.fcVal}>Dr. Okafor</p>
                <p className={styles.fcSub}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="2"
                  >
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                  Confirmed 2 days ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <div className={styles.statsBand}>
        {[
          { num: "400", unit: "+", desc: "Students with verified access" },
          { num: "100", unit: "%", desc: "Advisor-verified records" },
          { num: "24/7", unit: "", desc: "Always available, no downtime" },
        ].map((s, i) => (
          <div key={s.num} className={styles.statsBandInner}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>
                {s.num}
                {s.unit}
              </span>
              <span className={styles.statDesc}>{s.desc}</span>
            </div>
            {i < 2 && <div className={styles.statSep} />}
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className={styles.howSection}>
        <div className={styles.howShell}>
          <div className={styles.howHeader}>
            <p className={styles.sectionLabel}>Process</p>
            <h2 className={styles.sectionTitle}>
              Three steps to{" "}
              <em className={styles.sectionItalic}>instant access</em>
            </h2>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <div
                key={step.num}
                className={`${styles.step} ${styles[`step_${step.colorKey}`]}`}
              >
                <p className={styles.stepNum}>{step.num}</p>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section id="about" className={styles.aboutTeaser}>
        <div className={styles.aboutTeaserInner}>
          <blockquote className={styles.atQuote}>
            &quot;Built with <em className={styles.atItalic}>integrity</em> — so
            your records are always exactly as your advisor verified them.&quot;
          </blockquote>
          <div className={styles.atRight}>
            <p className={styles.atBody}>
              The FUTO Student Results Portal was designed to eliminate the
              frustration of chasing printed results and unofficial
              spreadsheets. It creates a single, trusted source of truth for
              academic records in the Department of Mechatronics Engineering.
            </p>
            <p className={styles.atBody}>
              Security, transparency and simplicity aren&apos;t trade-offs here
              — they&apos;re the foundation the platform is built on.
            </p>
            <button
              className={styles.btnOutline}
              onClick={() => setModalOpen(true)}
            >
              Read the full story →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <LogoWithName isLight={true} />
            <p className={styles.footerSub}>
              Mechatronics Engineering · Federal University of Technology,
              Owerri
            </p>
          </div>
          <div className={styles.footerNav}>
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
          &copy; 2025 FUTO Student Results Portal. All rights reserved.
        </div>
      </footer>

      {/* ABOUT MODAL */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div />
              <button
                className={styles.modalClose}
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <span className={styles.modalTag}>About the portal</span>
              <h2 className={styles.modalTitle}>
                A better way to access your{" "}
                <em className={styles.modalItalic}>results.</em>
              </h2>

              <hr className={styles.modalDivider} />

              <p className={styles.modalSectionLabel}>The problem</p>
              <p className={styles.modalP}>
                In the Department of Mechatronics Engineering at FUTO, students
                had no reliable, centralised way to view their academic results.
                Results circulated informally — through spreadsheets, WhatsApp
                messages, or physical noticeboards — creating room for error,
                confusion, and lost records.
              </p>
              <p className={styles.modalP}>
                Advisors similarly had no structured system to publish and
                verify student records digitally, leading to repeated follow-ups
                and administrative overhead every semester.
              </p>

              <hr className={styles.modalDivider} />

              <p className={styles.modalSectionLabel}>The solution</p>
              <p className={styles.modalP}>
                The portal creates a secure, end-to-end verified pipeline:
                students pre-register via a class rep&apos;s Google Form,
                advisors upload and authenticate results, and students sign in
                to view their own verified records — privately and instantly.
              </p>
              <p className={styles.modalP}>
                Built on Next.js and Supabase, with row-level security ensuring
                each student only ever sees their own data. Email confirmation
                and OTP-based advisor authentication add layers of identity
                assurance that informal systems simply can&apos;t offer.
              </p>

              <hr className={styles.modalDivider} />

              <p className={styles.modalSectionLabel}>The person behind it</p>
              <div className={styles.authorCard}>
                <div className={styles.authorAvatar}>NE</div>
                <div>
                  <p className={styles.authorName}>Nelson Erege</p>
                  <p className={styles.authorRole}>
                    Full-stack developer · Mechatronics Engineering, FUTO
                  </p>
                  <a
                    className={styles.authorLink}
                    href="https://nelson-erege-portfolio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View portfolio →
                  </a>
                </div>
              </div>
              <p className={styles.modalP}>
                Nelson built this portal to solve a real problem he experienced
                as a student in the department. Beyond writing the code, he
                designed the database schema, authentication architecture, and
                user experience — with a focus on making the platform
                trustworthy and maintainable long after graduation.
              </p>
              <p className={styles.modalP}>
                Questions or issues? Reach him at{" "}
                <a
                  href="mailto:eregeikechukwu@gmail.com"
                  className={styles.modalMailLink}
                >
                  eregeikechukwu@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
