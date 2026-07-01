export interface AdvisorOfficeHour {
  id: string;
  advisor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdvisorOfficeHoursOverride {
  id: string;
  advisor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_cancelled: boolean;
  location: string | null;
  note: string | null;
  created_at: string;
}

export type AdvisorVisitIntentStatus = "pending" | "acknowledged" | "resolved";

export interface AdvisorVisitIntent {
  id: string;
  advisor_id: string;
  student_id: string;
  preferred_date: string;
  reason: string;
  status: AdvisorVisitIntentStatus;
  advisor_note: string | null;
  created_at: string;
  students?: {
    id: string;
    reg_number: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
  advisors?: {
    title: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
}

export interface StudentAdvisor {
  id: string;
  title: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export interface WeeklyForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  note?: string;
  is_active: boolean;
}

export interface OverrideForm {
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  note?: string;
  is_cancelled: boolean;
}
