# Advisor Dashboard - Query Functions & React Query Hooks

## Summary

I've created a comprehensive set of query functions and React Query hooks for the advisor dashboard. This allows you to replace hardcoded mock data with real database queries while maintaining excellent performance through intelligent caching.

---

## 📁 Files Created

### Query Functions (Internal - do not import directly)

#### 1. **src/lib/queries/advisorDashboard.ts**
Query functions for dashboard statistics and activity data:
- `fetchAdvisorDashboardStats()` - Total students, new students, uploaded results, recent results, active sessions, pending reviews
- `fetchUploadActivity()` - Monthly upload activity (last 5 months)
- `fetchRecentBatches()` - Recent result batches with course info
- `fetchCourseOfferingsByTerm()` - Course offerings for a term
- `fetchAllCourses()` - Master course list (global)
- `fetchActiveTerms()` - Active academic terms

#### 2. **src/lib/queries/courseOfferings.ts**
Query functions for CRUD operations on course offerings:
- `fetchAdvisorCourseOfferings()` - Offerings for advisor + term
- `fetchCourseOfferingById()` - Single offering details
- `checkCourseOfferingExists()` - Validate before creating
- `createCourseOffering()` - Add new offering (enforces UNIQUE constraint)
- `deleteCourseOffering()` - Delete offering + cascading deletes
- `fetchAllCourseOfferingsByTerm()` - Admin view of all offerings
- `fetchCourseOfferingsStats()` - Statistics about offerings

### React Query Hooks (Use these in components)

#### 3. **src/lib/hooks/useAdvisorDashboard.ts**
Read-only hooks for dashboard data:
```tsx
// Fetch dashboard stats (totalStudents, newStudents, etc.)
const { data: stats, isLoading } = useAdvisorDashboardStats(
  advisorId,
  departmentId,
  admissionYear
);

// Fetch upload activity (last 5 months)
const { data: activity } = useUploadActivity(advisorId);

// Fetch recent batches
const { data: batches } = useRecentBatches(advisorId, 5);

// Fetch course offerings for a term
const { data: offerings } = useCourseOfferingsByTerm(termId);

// Fetch all available courses
const { data: courses } = useAllCourses();

// Fetch active academic terms
const { data: terms } = useActiveTerms();
```

#### 4. **src/lib/hooks/useCourseOfferings.ts**
Hooks for querying and mutating course offerings:
```tsx
// Query: Get advisor's offerings for a term
const { data: offerings } = useAdvisorCourseOfferings(advisorId, termId);

// Query: Get single offering by ID
const { data: offering } = useGetCourseOffering(offeringId);

// Query: Get all offerings in term (admin)
const { data: allOfferings } = useAllCourseOfferingsByTerm(termId);

// Query: Get offering stats
const { data: stats } = useCourseOfferingsStats(termId);

// Query: Check if offering exists
const { data: exists } = useCheckOfferingExists(advisorId, termId, courseId);

// Mutation: Create new offering
const createMutation = useCreateCourseOffering();
await createMutation.mutateAsync({
  advisorId: "...",
  termId: "...",
  courseId: "..."
});

// Mutation: Delete offering
const deleteMutation = useDeleteCourseOffering();
await deleteMutation.mutateAsync({
  offeringId: "...",
  advisorId: "...",
  termId: "..." // For cache invalidation
});
```

#### 5. **src/lib/hooks/index.ts**
Barrel export for clean imports:
```tsx
import {
  useAdvisorDashboardStats,
  useUploadActivity,
  useAdvisorCourseOfferings,
  useCreateCourseOffering,
} from "@/lib/hooks";
```

---

## 🎯 Key Features

### 1. **Intelligent Caching**
Each hook is configured with optimal cache times:
- Dashboard stats: 5 min stale, 30 min cache
- Upload activity: 10 min stale, 60 min cache
- Course offerings: 1 min stale, 10 min cache
- Static data (courses, terms): 30-60 min stale

### 2. **Automatic Retry**
- 2 automatic retries on failure
- Exponential backoff (1s, 2s, 4s...)
- Refetch on window focus

### 3. **Error Handling**
- Errors show as toast notifications via `errorToastHandler()`
- No need to manually handle errors in mutations
- Network errors detected and displayed appropriately

### 4. **Cache Invalidation**
- Mutations automatically invalidate related caches
- No stale data after CRUD operations
- Multiple related caches invalidated together

### 5. **Type Safety**
- All functions are TypeScript with proper types
- Query keys are constant/immutable
- Component props are strictly typed

---

## 💻 How to Use in Components

### Example: Updated Dashboard

```tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAdvisorDashboardStats, useUploadActivity } from "@/lib/hooks";

export default function AdvisorDashboard() {
  const { advisorData } = useAuth();
  const assignment = advisorData?.advisor_assignments?.[0];

  // Fetch real data
  const { data: stats, isLoading } = useAdvisorDashboardStats(
    advisorData?.id || "",
    assignment?.department_id || "",
    assignment?.admission_year || 0
  );

  if (isLoading) return <DashboardSkeleton />;

  return (
    <AdvisorStatsCards
      totalStudents={stats?.totalStudents || 0}
      newStudents={stats?.newStudents || 0}
      uploadedResults={stats?.uploadedResults || 0}
      recentResults={stats?.recentResults || 0}
      activeSessions={stats?.activeSessions || 0}
      pendingReviews={stats?.pendingReviews || 0}
    />
  );
}
```

### Example: Add Course Form

```tsx
"use client";

import { useCreateCourseOffering, useAllCourses } from "@/lib/hooks";

export function AddCourseForm({ advisorId, termId, toggleModal }) {
  const { data: courses } = useAllCourses();
  const createMutation = useCreateCourseOffering();

  const handleSubmit = async (courseId) => {
    try {
      await createMutation.mutateAsync({
        advisorId,
        termId,
        courseId,
      });
      toggleModal();
    } catch (error) {
      // Error already shown as toast
    }
  };

  return (
    <div>
      <select onChange={(e) => handleSubmit(e.target.value)}>
        <option>Select a course...</option>
        {courses?.map((course) => (
          <option key={course.id} value={course.id}>
            {course.course_code} - {course.course_title}
          </option>
        ))}
      </select>
      {createMutation.isPending && <p>Adding course...</p>}
    </div>
  );
}
```

---

## 📝 Important Notes

### Data Source
All data comes from real database queries with RLS (Row Level Security) enforced:
- Students can only see their own data
- Advisors can only see their assigned students/courses
- Admins have full access
- No service role needed on client side

### Cache Invalidation
When you create/update/delete:
1. Mutation executes on server
2. Success automatically invalidates related caches
3. Components re-render with fresh data
4. No manual cache clearing needed

### Performance
- Queries only execute if dependencies are provided
- Automatic deduplication (same query runs once)
- Background refetches don't block UI
- Stale UI is shown while refetching

### Error Handling
- Network errors show standardized message
- Supabase errors show specific details
- All errors appear as toast notifications
- Components should still render with empty states

---

## 🔄 Next Steps

### For Dashboard
Update the dashboard page to use these hooks - see INTEGRATION_GUIDE.md for complete example.

### For Other Pages

Once dashboard is working, apply same pattern to:

1. **Courses Page** (/advisor/(dashboard)/courses/page.tsx)
   - Use `useAdvisorCourseOfferings()`
   - Use `useCreateCourseOffering()` for modal
   - Use `useDeleteCourseOffering()` for delete
   - Use `useCourseOfferingsStats()` for cards

2. **Students Page** (/advisor/(dashboard)/students/page.tsx)
   - Queries already exist in lib/queries/students.ts
   - Create similar hooks in lib/hooks/useAdvisorStudents.ts
   - Follow same pattern

3. **Upload Results Page** (/advisor/(dashboard)/upload-results/page.tsx)
   - Create hooks for result_batches and result_entries
   - Handle file upload and processing
   - Show progress and status

---

## 🎓 Architecture Overview

```
Component (e.g., AdvisorDashboard.tsx)
    ↓
React Query Hook (useAdvisorDashboardStats)
    ↓
Query Function (fetchAdvisorDashboardStats)
    ↓
Supabase Client (createSupabaseClient)
    ↓
Database (RLS enforced)
```

**Benefits of this structure:**
- Separation of concerns
- Easy to test (mock query functions)
- Easy to cache (React Query handles it)
- Easy to update (one place to change query logic)
- Easy to reuse (hooks across components)

---

## 📚 Comment Structure

All functions are extensively documented with:
- **Purpose**: What the function does
- **Business Logic**: Why it works that way
- **Parameters**: What inputs are needed
- **Returns**: What data structure is returned
- **Throws**: What errors can occur
- **Cache behavior**: How React Query caches it
- **Usage examples**: How to use in components

This makes it easy to understand and maintain the code.

---

## ✅ Code Quality

All code follows:
- TypeScript strict mode
- No `any` types (all properly typed)
- Comprehensive comments
- Consistent naming conventions
- DRY (Don't Repeat Yourself) principles
- React Query best practices
- Supabase client pattern
- Error handling standards

---

## 🚀 Ready to Use

The hooks are production-ready and can be integrated immediately into the advisor dashboard. All error handling, caching, and performance optimization is built-in.

The foundation is set for easy expansion to other pages and features.
