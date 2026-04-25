import Link from "next/link";
import styles from "./unauthorizedPage.module.scss";

export default function UnauthorizedPage() {
  return (
    <main className={styles.unauthorizedPage}>
      <section className={styles.unauthorizedCard}>
        <div className={styles.statusBadge}>Access denied</div>
        <h1 className={styles.title}>Unauthorized access</h1>
        <p className={styles.subtitle}>
          You do not have permission to view this section of the advisor portal.
          Please return to the home page or sign in with the correct account.
        </p>
        <p className={styles.description}>
          If you reached this page by mistake, your session may have expired or
          you may be trying to access a protected area without the right role.
          Use the options below to continue safely.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.buttonPrimary}>
            Return home
          </Link>
          <Link href="/" className={styles.buttonSecondary}>
            Go to sign in
          </Link>
        </div>

        <p className={styles.note}>
          Need help? Contact your portal administrator or sign in with an
          advisor account to continue.
        </p>
      </section>
    </main>
  );
}
