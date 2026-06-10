import { UploadResult } from "@/app/types/resultsUpload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadExcelResults } from "../queries/advisorResultsUpload";
import toast from "react-hot-toast";

export function useUploadExcelResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseOfferingId,
      advisorProfileId,
      parsedRows,
    }: {
      courseOfferingId: string;
      advisorProfileId: string;
      parsedRows: UploadResult[];
    }) => uploadExcelResults(courseOfferingId, advisorProfileId, parsedRows),

    onSuccess: (result, variables) => {
      // Invalidae reults and batches for thsi offering
      queryClient.invalidateQueries({
        queryKey: ["results", variables.courseOfferingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["batches", variables.courseOfferingId],
      });

      //   Build inofrmative success message
      /*const msg =
        result.unmatched.length > 0
          ? `${result.inserted} entries uploaded, ${result.unmatched.length} reg numbers not found: ${result.unmatched.join(",")}`
          : `${result.inserted} entries uploaded successfully.`;

      toast.success(msg, {
        duration: 10000,
      }); */
    },
  });
}
