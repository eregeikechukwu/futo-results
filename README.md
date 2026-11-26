# FUTO Student Results Portal

A web platform for the Department of Mechatronics Engineering at the Federal University of Technology, Owerri (FUTO). Advisors upload and manage student results, and students securely access their own grades.

Built to replace the manual process of distributing results, with OCR-assisted entry so advisors don't have to retype scores from result sheets.

## Features

**For students**
- Sign up with a pre-registration check, so only enrolled students can create accounts
- Email confirmation before first login
- View personal results by semester and session
- Account recovery via email

**For advisors**
- Two-step login: email and password, then a one-time code
- Manage students assigned by department and admission year
- Upload photos of result sheets and review OCR output in an editable table before publishing
- Student level is calculated automatically from admission year

**For administrators**
- Advisor accounts are created through Supabase invites

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, SCSS
- **Backend and database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **OCR:** Google Cloud Vision API, Sharp for image preprocessing
- **Email:** Resend as custom SMTP provider for Supabase Auth

## How the OCR Pipeline Works

1. An advisor uploads a photo of a result sheet.
2. The API stores the image and queues a background job.
3. A worker preprocesses the image with Sharp and sends it to Google Cloud Vision.
4. A spatial parser uses the bounding box coordinates from Vision to group text into rows and columns. This handles tables with uneven spacing and slightly skewed scans.
5. The frontend polls the job and displays the extracted results in an editable table.
6. The advisor reviews and corrects the data, then saves it.

Key parsing considerations:
- Header rows are identified separately from data rows, so headers aren't mistaken for data.
- Registration numbers are handled as all-numeric strings, preserving leading digits.
- Rows are grouped by vertical position, with tolerance for scan skew.

## Project Structure

```
.
├── app/                 # Next.js routes (student, advisor, auth)
│   └── auth/confirm/    # Email confirmation route handler
├── components/          # Shared UI components
├── lib/
│   ├── supabase/        # Supabase clients (browser, server)
│   └── ocr/             # Vision client and spatial parser
├── supabase/
│   ├── migrations/      # Database schema, RLS policies, indexes
│   └── functions/       # Edge Functions (account recovery)
└── public/
```

Adjust this tree to match your repository.

## Database Overview

- **Student pre-registrations:** gates student signup
- **Advisor assignments:** maps advisors to students by department and admission year
- **Results:** stored per student, course, and session
- Row Level Security policies restrict each user to the data they're allowed to see

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Supabase project
- A Google Cloud project with the Vision API enabled
- A Resend account (for production email)

### Installation

```bash
git clone https://github.com/<your-username>/futo-results-portal.git
cd futo-results-portal
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLOUD_VISION_API_KEY=your-vision-api-key
```

Never commit this file. The service role key must stay server-side only.

### Database Setup

Apply the migrations in `supabase/migrations/` to your Supabase project, using the Supabase CLI or the SQL editor.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Email Configuration

For production, configure Resend as the custom SMTP provider in Supabase Auth settings and verify your sending domain with SPF, DKIM, and DMARC records. Set the site URL in Supabase to your production domain so confirmation links don't point to localhost.

## Deployment

The app is designed for deployment on Vercel with a Supabase backend. Set the same environment variables in your hosting dashboard.

## Roadmap

- Automated result notifications via SMS and WhatsApp
- Faculty-level bulk upload workflow
- Academic performance tracking across semesters (CGPA)
- Mobile-friendly advisor tools

## Contributing

Contributions are welcome. Open an issue first to discuss significant changes, then submit a pull request against `main`.

## License

<!-- Choose a license, e.g. MIT, and add a LICENSE file -->

## Author

**Nelson Erege** — Undergraduate, Department of Mechatronics Engineering, FUTO
