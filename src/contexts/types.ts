import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "advisor" | "admin";
}

// SHape of the stidents table row
export interface StudentsData {
  id: string;
  reg_number: string;
  admission_year: number;
  status: string;
  departments: {
    id: string;
    name: string;
    code: string;
  };
}

// Shape of thr advisors table row with assignments
export interface AdvisorData {
  id: string;
  title: string;
  advisor_assignments: {
    id: string;
    admission_year: number;
    departments: {
      id: string;
      name: string;
      code: string;
    };
  }[];
}

// Everythin the context response / exposes
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  studentData: StudentsData | null;
  advisorData: AdvisorData | null;
  loading: boolean;
  isStudent: boolean;
  isAdvisor: boolean;
  isAdmin: boolean;
  authInitialized: boolean;
  signOut: () => Promise<void>;
}
