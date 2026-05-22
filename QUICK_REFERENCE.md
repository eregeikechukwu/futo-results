# Quick Reference - Advisor Dashboard Hooks

## All Available Hooks

### Dashboard Statistics Hooks

```tsx
// Get all dashboard stats in one query
const { data: stats, isLoading } = useAdvisorDashboardStats(
  advisorId,
  departmentId,
  admissionYear
);
// Returns: { totalStudents, newStudents, uploadedResults, recentResults, activeSessions, pendingReviews }

// Get monthly upload activity (last 5 months)
const { data: activity } = useUploadActivity(advisorId);
// Returns: [{ month, uploaded, total, date }, ...]

// Get recent result batches
const { data: batches } = useRecentBatches(advisorId, 5); // limit default 5
// Returns: [{ id, status, title, courseTitle, items, color, statusLabel }, ...]

// Get course offerings for a term
const { data: offerings } = useCourseOfferingsByTerm(termId, advisorId?);
// Returns: [{ id, course_code, course_title, unit, session, semester }, ...]

// Get all available courses (global master list)
const { data: courses } = useAllCourses();
// Returns: [{ id, course_code, course_title, unit }, ...]

// Get active academic terms
const { data: terms } = useActiveTerms();
// Returns: [{ id, session, semester, is_active }, ...]
```

### Course Offerings Hooks

```tsx
// Get advisor's course offerings for a term
const { data: offerings } = useAdvisorCourseOfferings(advisorId, termId);
// Returns: [{ id, courseCode, courseTitle, unit, totalBatches, publishedBatches, draftBatches, lastBatchAt }, ...]

// Get a single offering by ID
const { data: offering } = useGetCourseOffering(offeringId);
// Returns: { id, course_id, term_id, courses: {...}, result_batches: [...] }

// Get all offerings in a term (admin view)
const { data: allOfferings } = useAllCourseOfferingsByTerm(termId);
// Returns: [{ id, courseCode, courseTitle, advisor: {...} }, ...]

// Get offering statistics
const { data: stats } = useCourseOfferingsStats(termId);
// Returns: { totalOfferings, totalUnits, byAdvisor: { advisorId: count } }

// Check if offering exists before creating
const { data: exists } = useCheckOfferingExists(advisorId, termId, courseId);
// Returns: boolean

// Create new offering
const createMutation = useCreateCourseOffering();
const result = await createMutation.mutateAsync({
  advisorId: "...",
  termId: "...",
  courseId: "..."
});
// Returns: { id, course_id, term_id, advisor_id }

// Delete offering
const deleteMutation = useDeleteCourseOffering();
const result = await deleteMutation.mutateAsync({
  offeringId: "...",
  advisorId: "...",
  termId: "..."
});
// Returns: { success: true }
```

---

## Usage Patterns

### Pattern 1: Simple Data Display

```tsx
"use client";

import { useAdvisorDashboardStats } from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardStats() {
  const { advisorData } = useAuth();
  const assignment = advisorData?.advisor_assignments?.[0];

  const { data: stats, isLoading } = useAdvisorDashboardStats(
    advisorData?.id || "",
    assignment?.department_id || "",
    assignment?.admission_year || 0
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Total Students: {stats?.totalStudents}</p>
      <p>Uploaded Results: {stats?.uploadedResults}</p>
    </div>
  );
}
```

### Pattern 2: Form with Mutation

```tsx
"use client";

import { useCreateCourseOffering, useAllCourses } from "@/lib/hooks";
import { useState } from "react";

export function AddCourseForm({ advisorId, termId }) {
  const { data: courses } = useAllCourses();
  const createMutation = useCreateCourseOffering();
  const [selectedCourse, setSelectedCourse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        advisorId,
        termId,
        courseId: selectedCourse,
      });
      setSelectedCourse(""); // Reset form
    } catch (error) {
      // Error already shown as toast
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
      >
        <option value="">Select a course...</option>
        {courses?.map((course) => (
          <option key={course.id} value={course.id}>
            {course.course_code} - {course.course_title}
          </option>
        ))}
      </select>
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Adding..." : "Add Course"}
      </button>
    </form>
  );
}
```

### Pattern 3: Table with Data

```tsx
"use client";

import { useAdvisorCourseOfferings } from "@/lib/hooks";

export function CoursesTable({ advisorId, termId }) {
  const { data: offerings, isLoading } = useAdvisorCourseOfferings(
    advisorId,
    termId
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Course Title</th>
          <th>Unit</th>
          <th>Batches</th>
        </tr>
      </thead>
      <tbody>
        {offerings?.map((offering) => (
          <tr key={offering.id}>
            <td>{offering.courseCode}</td>
            <td>{offering.courseTitle}</td>
            <td>{offering.unit}</td>
            <td>{offering.totalBatches}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Pattern 4: Delete with Confirmation

```tsx
"use client";

import { useDeleteCourseOffering } from "@/lib/hooks";

export function DeleteCourseButton({ offeringId, advisorId, termId }) {
  const deleteMutation = useDeleteCourseOffering();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        offeringId,
        advisorId,
        termId,
      });
    } catch (error) {
      // Error already shown as toast
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      style={{ color: "red" }}
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

### Pattern 5: Multiple Queries Together

```tsx
"use client";

import {
  useAdvisorCourseOfferings,
  useCourseOfferingsStats,
  useActiveTerms,
} from "@/lib/hooks";
import { useAuth } from "@/contexts/AuthContext";

export function CoursesPage() {
  const { advisorData } = useAuth();
  const { data: terms } = useActiveTerms();
  const activeTerm = terms?.[0];

  const { data: offerings, isLoading: offeringsLoading } =
    useAdvisorCourseOfferings(advisorData?.id || "", activeTerm?.id || "");

  const { data: stats, isLoading: statsLoading } = useCourseOfferingsStats(
    activeTerm?.id || ""
  );

  const isLoading = offeringsLoading || statsLoading;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>
        {stats?.totalOfferings} courses ({stats?.totalUnits} units)
      </h2>
      <table>
        {/* ... display offerings ... */}
      </table>
    </div>
  );
}
```

---

## Common Tasks

### Task: Fetch and display dashboard stats

```tsx
const { data: stats } = useAdvisorDashboardStats(advisorId, deptId, admissionYear);
return <AdvisorStatsCards {...stats} />;
```

### Task: Get list of courses for dropdown

```tsx
const { data: courses } = useAllCourses();
return (
  <select>
    {courses?.map(c => <option value={c.id}>{c.course_code}</option>)}
  </select>
);
```

### Task: Show recent activity chart

```tsx
const { data: activity } = useUploadActivity(advisorId);
return (
  <div>
    {activity?.map(month => (
      <ProgressBar title={month.month} progress={month.uploaded} total={month.total} />
    ))}
  </div>
);
```

### Task: Display recent batches

```tsx
const { data: batches } = useRecentBatches(advisorId);
return <ReportCards reports={batches || []} />;
```

### Task: Add a course offering

```tsx
const createMutation = useCreateCourseOffering();
await createMutation.mutateAsync({
  advisorId: user.id,
  termId: activeTerm.id,
  courseId: selectedCourse.id,
});
```

### Task: Delete a course offering

```tsx
const deleteMutation = useDeleteCourseOffering();
await deleteMutation.mutateAsync({
  offeringId: offering.id,
  advisorId: user.id,
  termId: offering.termId,
});
```

### Task: Check if course already exists

```tsx
const { data: exists } = useCheckOfferingExists(advisorId, termId, courseId);
if (exists) {
  setError("Course already added for this term");
}
```

---

## State Management

Each hook returns standard React Query states:

```tsx
const {
  data,           // The fetched data (undefined if loading/error)
  isLoading,      // true while first fetch in progress
  isFetching,     // true if any fetch in progress (refetch counts)
  isError,        // true if error occurred
  error,          // Error object if failed
  refetch,        // Function to manually refetch
  isPending,      // For mutations: true while mutation in progress
  mutateAsync,    // For mutations: async function to trigger mutation
} = useHook(...);
```

---

## Error Handling

All errors are automatically handled:

```tsx
const { data, error } = useAdvisorDashboardStats(...);

// Error handling already done:
// - Toast notification shown automatically
// - Component can still render with fallback UI
// - Retry happens automatically (2 times with backoff)

// Optional: Show specific error if needed
if (error) {
  return <div>Failed to load data. Please refresh.</div>;
}
```

---

## Performance Tips

1. **Avoid unnecessary rerenders**:
   ```tsx
   // ❌ Bad: Recalculates on every render
   const assignment = advisorData?.advisor_assignments?.[0];

   // ✅ Good: Memoize if used in multiple queries
   const assignment = useMemo(
     () => advisorData?.advisor_assignments?.[0],
     [advisorData]
   );
   ```

2. **Only enable queries when needed**:
   ```tsx
   // Hooks automatically disable if params missing
   const { data } = useAdvisorDashboardStats(
     advisorId, // undefined = query disabled
     departmentId,
     admissionYear
   );
   ```

3. **Leverage cache between pages**:
   ```tsx
   // If user navigates away and back, data is already cached
   // No refetch needed (will use stale cache)
   // Background refetch will update if stale
   ```

4. **Monitor with React Query DevTools** (dev only):
   ```tsx
   import { ReactQueryDevtoolsProduction } from '@tanstack/react-query-devtools/build/modern/production.js'
   // Add to app layout for debugging
   ```

---

## Debugging

### Check what data a hook returns

```tsx
const { data } = useAdvisorDashboardStats(...);
console.log("Stats data:", data); // See structure in console
```

### Check if query is being called

```tsx
const { isFetching, isLoading } = useAdvisorDashboardStats(...);
console.log("Loading:", isLoading, "Fetching:", isFetching);
```

### Check cache state

Use React Query DevTools (available in dev mode) to:
- See all queries and their cache status
- See what data is cached
- Manually refetch or invalidate cache
- See query history and timing

---

## Import Cheat Sheet

```tsx
// Dashboard stats hooks
import {
  useAdvisorDashboardStats,
  useUploadActivity,
  useRecentBatches,
  useCourseOfferingsByTerm,
  useAllCourses,
  useActiveTerms,
} from "@/lib/hooks";

// Course offerings hooks
import {
  useAdvisorCourseOfferings,
  useGetCourseOffering,
  useAllCourseOfferingsByTerm,
  useCourseOfferingsStats,
  useCreateCourseOffering,
  useDeleteCourseOffering,
  useCheckOfferingExists,
} from "@/lib/hooks";

// Or use barrel import to get everything
import { ... } from "@/lib/hooks";
```

---

## Next Steps

1. **Update ReportCards component** ✅ DONE
2. **Update dashboard page** - See INTEGRATION_GUIDE.md
3. **Update courses page** - Use useAdvisorCourseOfferings
4. **Create student hooks** - Follow same pattern
5. **Update students page** - Use student hooks
6. **Handle upload results** - Create result batch hooks

See ACTION_ITEMS.md for detailed checklist.
