import {
  Book,
  Calendar,
  Check,
  Clock3,
  CloudRain,
  FileUp,
  Flag,
  SunMedium,
  Users2,
} from "lucide-react";
import styles from "./styles.module.scss";
import { TextLink } from "../secondary/typography";
import CountUp from "@/utils/countUp";

function Tooltip({ text }: { text: string }) {
  return (
    <div
      className={`hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity ${styles.tooltip}`}
    >
      <p>{text}</p>
    </div>
  );
}

export function AdvisorStatsCards({
  totalStudents,
  newStudents,
  uploadedResults,
  recentResults,
  classLevel,
  pendingReviews,
}: {
  totalStudents: number;
  newStudents: number;
  uploadedResults: number;
  recentResults: number;
  classLevel: number;
  pendingReviews: number;
}) {
  return (
    <div>
      {/* STats card container */}
      <div className="cardGrid">
        {/* Stata cards */}

        {/* Card 1 */}
        <div className={`dashboard-container ${styles.advisorStatsCard} group`}>
          <div>
            <div>
              <TextLink>Total Students</TextLink>
              <p>
                <CountUp end={totalStudents} />
              </p>
            </div>
            <div className="text-[var(--color-primary)]  bg-[var(--color-blue-background)]">
              <Users2 size={22} />
            </div>
          </div>
          {newStudents > 0 && (
            <p className="text-[var(--color-text-passive)]">
              <span className="text-[var(--color-text-green)]">
                &#43;{newStudents}&nbsp;
              </span>
              this session
            </p>
          )}

          <Tooltip text="Total number of students assigned to you for this academic session" />
        </div>

        {/* Card 2 */}
        <div className={`dashboard-container ${styles.advisorStatsCard} group`}>
          <div>
            <div>
              <TextLink>Uploaded Results</TextLink>
              <p>
                <CountUp end={uploadedResults} />
              </p>
            </div>
            <div className="bg-[var(--color-green-background)]">
              <FileUp size={22} className="text-[var(--color-text-green)]" />
            </div>
          </div>
          {recentResults > 0 && (
            <p className="text-[var(--color-text-passive)]">
              <span className="text-[var(--color-text-green)]">
                &#43;{recentResults}&nbsp;
              </span>
              this month
            </p>
          )}
          <Tooltip text="Number of total uploaded results batches" />
        </div>

        {/* Card 3 */}
        <div className={`dashboard-container ${styles.advisorStatsCard} group`}>
          <div>
            <div>
              <TextLink>Pending Reviews</TextLink>
              <p>
                <CountUp end={pendingReviews} />
              </p>
            </div>
            <div className="bg-[var(--color-brown-background)]">
              <Clock3 size={22} className="text-[var(--color-brown)]" />
            </div>
          </div>
          <p className="text-[var(--color-brown)]">Review needed</p>
          <Tooltip text="Number of pending result batches for review" />
        </div>

        {/* Card 4 */}
        <div className={`dashboard-container ${styles.advisorStatsCard} group`}>
          <div>
            <div>
              <TextLink>Class level</TextLink>
              <p>
                <CountUp end={classLevel} />
              </p>
            </div>
            <div className="text-[var(--color-purple)]  bg-[var(--color-purple-background)]">
              <Calendar size={22} className="text-[var(--color-purple)]" />
            </div>
          </div>
          <p className="text-[var(--color-purple)]">Currently active</p>
          <Tooltip text="Current class level" />
        </div>
      </div>
    </div>
  );
}

function CardTemplate({
  children,
  title,
  count,
  theme,
  bg,
  toolTipText = "",
}: {
  children: React.ReactNode;
  title: string;
  count: number;
  theme: string;
  bg: string;
  toolTipText?: string;
}) {
  return (
    <div
      className={`dashboard-container ${styles.advisorStudentsStatsCard} group`}
    >
      <div>
        <TextLink>{title}</TextLink>
        <p style={{ color: theme }}>
          <CountUp end={count} />
        </p>
      </div>
      <div style={{ color: theme, backgroundColor: bg }}>{children}</div>

      <Tooltip text={toolTipText} />
    </div>
  );
}

const iconSize = 17;
export function AdvisorStudentsStatsCards({
  totalStudents,
  verified,
  pending,
  flagged,
}: {
  totalStudents: number;
  verified: number;
  pending: number;
  flagged: number;
}) {
  return (
    <div className="cardGrid ">
      {/* Card 1 */}
      <CardTemplate
        title="Total Students"
        count={totalStudents}
        theme="var(--color-primary)"
        bg="var(--color-blue-background)"
        toolTipText="Total students in your class"
      >
        <Users2 size={iconSize} />
      </CardTemplate>

      {/* Card 2 */}
      <CardTemplate
        title="Verified"
        count={verified}
        theme="var(--color-green)"
        bg="var(--color-green-background)"
        toolTipText="Students that have signed up and registered"
      >
        <Check size={iconSize} />
      </CardTemplate>

      {/* Card 3 */}
      <CardTemplate
        title="Pending"
        count={pending}
        theme="var(--color-brown)"
        bg="var(--color-brown-background)"
        toolTipText="Students yet to sign up"
      >
        <Clock3 size={iconSize} />
      </CardTemplate>

      {/* Card 4 */}
      <CardTemplate
        title="Flagged"
        count={flagged}
        theme="var(--color-red)"
        bg="var(--color-red-background)"
        toolTipText="Students flagged for review"
      >
        <Flag size={iconSize} />
      </CardTemplate>
    </div>
  );
}

export function AdvisorCoursesStats({
  totalCourses,
  totalCredits,
  harmattan,
  rain,
}: {
  totalCourses: number;
  totalCredits: number;
  harmattan: number;
  rain: number;
}) {
  return (
    <div className="cardGrid ">
      {/* Card 1 */}
      <CardTemplate
        title="Total Courses"
        count={totalCourses}
        theme="var(--color-primary)"
        bg="var(--color-blue-background)"
        toolTipText="Total number of courses offered for the selected academic session"
      >
        <Book size={iconSize} />
      </CardTemplate>
      {/* Card 2 */}
      <CardTemplate
        title="Total Credits"
        count={totalCredits}
        theme="var(--color-green)"
        bg="var(--color-green-background)"
        toolTipText="Total number of credits for the selected academic session"
      >
        <Check size={iconSize} />
      </CardTemplate>
      {/* Card 3 */}
      <CardTemplate
        title="Rain Semester"
        count={rain}
        theme="var(--color-purple)"
        bg="var(--color-purple-background)"
        toolTipText="Number of courses offered in the Rain semester"
      >
        <CloudRain size={iconSize} />
      </CardTemplate>
      {/* Card 4 */}
      <CardTemplate
        title="Harmattan Semester"
        count={harmattan}
        theme="var(--color-brown)"
        bg="var(--color-brown-background)"
        toolTipText="Number of courses offered in the Harmattan semester"
      >
        <SunMedium size={iconSize} />
      </CardTemplate>
    </div>
  );
}
