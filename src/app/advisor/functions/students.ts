export const handleFileInput = useCallback(
  async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e.target.files?.[0];

    if (!file) return;

    toast.loading("Uploading file...");

    setUploading(true);
    const exceldata = await excelToJson(file, "students");
    const enrichedData = exceldata.data.map((student) => {
      return {
        ...student,
        created_by: advisorData?.id,
        admission_year: advisorData?.advisor_assignments[0].admission_year,
        department_id: advisorData?.advisor_assignments[0].departments.id,
      };
    });
    console.log(enrichedData, "Enriched sgasioasoaksas");

    if (enrichedData.length > 0) {
      uploadStudentsMutation.mutate(enrichedData, {
        onSuccess: () => {
          toast.success("File uploaded successfully!");
          e.target.value = "";
          // setFile(null);
          setUploading(false);
        },
        onError: (error) => {
          errorToastHandler(error, "Failed to upload file. Please try again.");
          // setFile(null);
          e.target.value = "";
          setUploading(false);
        },
      });
    } else {
      toast.error("No valid student data found in the file.");
    }
  },
  [parseFile],
);
