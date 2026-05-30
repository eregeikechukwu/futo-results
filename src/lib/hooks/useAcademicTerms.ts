import { useQuery } from "@tanstack/react-query";
import {
  fetchAcademicTerms,
  fetchActiveAcademicTerm,
} from "../queries/acdemicTerms";
import { gcTimeUni, staleTimeUni } from "./utils";

// Key managment
const academicTermsKey = {
  all: ["academic-terms"] as const,
  active: ["active-academic-term"] as const,
};

export function useAcademicTerms() {
  // REact query hook for acdeminc sessios and terms

  return useQuery({
    queryKey: academicTermsKey.all,
    queryFn: fetchAcademicTerms,
    staleTime: staleTimeUni, // 60 minutes
    gcTime: gcTimeUni, // 4 hours
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff, increase the delay between retries by 1000 up till attempIndex
  });
}

export function useActiveTerm() {
  // REact query hook for acdeminc sessios and terms

  return useQuery({
    queryKey: academicTermsKey.active,
    queryFn: fetchActiveAcademicTerm,
    staleTime: staleTimeUni, // 60 minutes
    gcTime: gcTimeUni, // 4 hours
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff, increase the delay between retries by 1000 up till attempIndex
  });
}
