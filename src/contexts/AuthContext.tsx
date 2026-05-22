"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AdvisorData, AuthContextType, Profile, StudentsData } from "./types";
import { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase/client";
import { errorThrowHandler, errorToastHandler } from "@/helpers/errorHandler";

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  studentData: null,
  advisorData: null,
  loading: true,
  isStudent: false,
  isAdvisor: false,
  isAdmin: false,
  authInitialized: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentData, setStudentData] = useState<StudentsData | null>(null);
  const [advisorData, setAdvisorData] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const loadedProfileId = useRef<string | null>(null);

  // const [instanceId] = useState(() => Math.random().toString(36).slice(2));

  // useEffect(() => {
  //   console.log("AuthProvider MOUNTED, instance:", instanceId);
  //   return () => console.log("AuthProvider UNMOUNTED, instance:", instanceId);
  // }, []);

  const fetchStudentData = async (profileId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, reg_number, admission_year, status, departments!inner (name, code)",
      )
      .eq("profile_id", profileId)
      .single();
    if (error) errorToastHandler(error);
    if (data) setStudentData(data as unknown as StudentsData);
  };

  const fetchAdvisorData = async (profileId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("advisors")
      .select(
        "id, title, advisor_assignments (id, admission_year, departments!inner (id, name, code))",
      )
      .eq("profile_id", profileId)
      .single();
    if (error) errorToastHandler(error);
    if (error) errorThrowHandler(error);
    if (data) setAdvisorData(data as unknown as AdvisorData);
  };

  const fetchProfile = useCallback(async (userId: string) => {
    if (userId === loadedProfileId.current) {
      setLoading(false);
      return;
    }

    loadedProfileId.current = userId;

    const supabase = createSupabaseClient();

    setStudentData(null);
    setAdvisorData(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .single();

    console.log("fetchProfile result:", data, error);

    if (error || !data) {
      errorToastHandler(error);
      setLoading(false);
      return;
    }

    setProfile(data);

    if (data.role === "student") {
      await fetchStudentData(userId);
    } else if (data.role === "advisor") {
      await fetchAdvisorData(userId);
    }

    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) errorThrowHandler(error);

    // router.replace("/advisor/auth");
  }, []);

  useEffect(() => {
    const supabase = createSupabaseClient();
    console.log("AuthProvider useEffect fired");

    let subscription: { unsubscribe: () => void } | null = null;

    // getSession() initializes the client's cookie storage first
    // Once it resolves, the client is fully ready for onAuthStateChange
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("getSession resolved:", session?.user?.id ?? "no user");

      // Set initial user state from session
      if (session?.user) {
        setLoading(true);
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }

      // Set auth initialized to true in order to mark that the auth has been hydrated, incalse of token refresh and temporal profile nulls
      setAuthInitialized(true);

      // NOW set up the listener — client is fully initialized at this point
      const { data, error } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(
            "onAuthStateChange:",
            event,
            session?.user?.id ?? "no user",
          );

          if (event === "TOKEN_REFRESHED") {
            if (session?.user) setUser(session.user);
            return;
          }

          if (event === "SIGNED_OUT") {
            loadedProfileId.current = null;
            setUser(null);
            setProfile(null);
            setStudentData(null);
            setAdvisorData(null);
            setLoading(false);
            return;
          }

          // INITIAL_SESSION is already handled by getSession above
          if (event === "INITIAL_SESSION") return;

          if (session?.user) {
            setLoading(true);
            setUser(session.user);
            console.log("It happeded here o");
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        },
      );

      if (error) errorThrowHandler(error);

      subscription = data.subscription;
    });

    return () => subscription?.unsubscribe();
  }, [fetchProfile]);

  const isStudent = profile?.role === "student";
  const isAdvisor = profile?.role === "advisor";
  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        studentData,
        advisorData,
        loading,
        isStudent,
        isAdvisor,
        authInitialized,
        isAdmin,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
