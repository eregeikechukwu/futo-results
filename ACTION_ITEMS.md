# Action Items - Advisor Dashboard Implementation

## Phase 1: Components That Need Updates

### ✅ DONE: Query & Hook Creation
- [x] Created src/lib/queries/advisorDashboard.ts
- [x] Created src/lib/queries/courseOfferings.ts
- [x] Created src/lib/hooks/useAdvisorDashboard.ts
- [x] Created src/lib/hooks/useCourseOfferings.ts
- [x] Created src/lib/hooks/index.ts (barrel export)

### 🔄 TODO: Component Integration

#### 1. **ReportCards Component** (CRITICAL)
**File**: src/components/statsCards/reportsCards.tsx
**Current**: Hardcoded static array
**Needed**: Accept `reports` prop from parent
**Change Required**:
```tsx
// BEFORE:
const reports: ReportCardProps[] = [
  { title: "2023/2024 - Harmattan", ... },
  ...
];
export function ReportCards() {
  return reports.map(...)
}

// AFTER:
export function ReportCards({ reports }: { reports: ReportCardProps[] }) {
  return reports.map(...)
}
```

#### 2. **Dashboard Page** (CRITICAL)
**File**: src/app/advisor/(dashboard)/dashboard/page.tsx
**Changes**:
- [ ] Import useAuth hook
- [ ] Import dashboard hooks
- [ ] Add loading state
- [ ] Add error state
- [ ] Replace hardcoded numbers with real data
- [ ] Pass reports prop to ReportCards
- [ ] See INTEGRATION_GUIDE.md for full example

#### 3. **Courses Page** (HIGH PRIORITY)
**File**: src/app/advisor/(dashboard)/courses/page.tsx
**Current**: Uses mock data (advisorCourses)
**Changes**:
- [ ] Remove mock imports
- [ ] Use useAdvisorCourseOfferings() hook
- [ ] Use useCourseOfferingsStats() hook
- [ ] Use useCreateCourseOffering() in modal
- [ ] Use useDeleteCourseOffering() for delete action
- [ ] Replace hardcoded session with real activeTerms

#### 4. **Students Page** (HIGH PRIORITY)
**File**: src/app/advisor/(dashboard)/students/page.tsx
**Current**: Uses mock data (advisorStudents)
**Changes**:
- [ ] Remove mock imports
- [ ] Create src/lib/hooks/useAdvisorStudents.ts
  - `useAdvisorStudentList()`
  - `useAdvisorStudentStats()`
  - `useFlagStudent()`
  - `useVerifyStudent()`
- [ ] Query functions already exist in src/lib/queries/students.ts
- [ ] Replace hardcoded student data

#### 5. **Upload Results Page** (MEDIUM PRIORITY)
**File**: src/app/advisor/(dashboard)/upload-results/page.tsx
**Changes**:
- [ ] Create src/lib/hooks/useResultBatches.ts
- [ ] Create src/lib/queries/resultBatches.ts
- [ ] Handle file upload
- [ ] Show upload progress
- [ ] Display batch status

### 🧹 TODO: Cleanup

- [ ] Remove mock data imports from components
  - src/mock/advisorCourses.ts
  - src/mock/advisorStudents.ts (after students page done)
- [ ] Remove hardcoded session values
- [ ] Remove mock API functions (if any)

---

## Phase 2: Testing Checklist

### Unit Tests
- [ ] Test fetchAdvisorDashboardStats() calculates levels correctly
- [ ] Test fetchUploadActivity() groups by month
- [ ] Test course offering existence check
- [ ] Test mutation error handling

### Integration Tests
- [ ] Dashboard loads without errors
- [ ] Stats cards show real numbers
- [ ] Charts display upload activity
- [ ] Recent batches show correct data
- [ ] Adding course offering works
- [ ] Deleting course offering works
- [ ] Cache invalidation works after mutations
- [ ] Error toast shows on failure

### Manual Testing (Browser)
- [ ] Dashboard loads and shows real data
- [ ] Numbers update when data changes
- [ ] Charts render correctly
- [ ] Can add/delete courses
- [ ] Error messages display properly
- [ ] Switching assignments updates data (if applicable)
- [ ] Performance is acceptable (no lag)

---

## Phase 3: Optimizations

- [ ] Add React Query DevTools for debugging
- [ ] Monitor query performance with DevTools
- [ ] Adjust cache times based on usage patterns
- [ ] Consider pagination for large datasets
- [ ] Add skeleton loaders for better UX
- [ ] Implement error boundaries for sections
- [ ] Add retry indicators in UI

---

## Priority Order

1. **CRITICAL** (Do first - blocks progress)
   - Update ReportCards to accept props
   - Update Dashboard page to fetch real data
   - Verify data flow works end-to-end

2. **HIGH** (Do second - completes dashboard area)
   - Update Courses page
   - Create useAdvisorStudents hooks
   - Update Students page

3. **MEDIUM** (Do third - supports upload flow)
   - Create useResultBatches hooks
   - Update Upload Results page

4. **LOW** (Do last - polish)
   - Remove mock data files
   - Cleanup old code
   - Performance tuning

---

## Quick Start Guide

### To test dashboard hooks immediately:

1. **Create a test component**:
```tsx
// src/components/TestDashboard.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAdvisorDashboardStats } from "@/lib/hooks";

export function TestDashboard() {
  const { advisorData } = useAuth();
  const assignment = advisorData?.advisor_assignments?.[0];

  const { data, isLoading, error } = useAdvisorDashboardStats(
    advisorData?.id || "",
    assignment?.department_id || "",
    assignment?.admission_year || 0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h3>Dashboard Test</h3>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
```

2. **Add to dashboard temporarily**:
```tsx
import { TestDashboard } from "@/components/TestDashboard";

// In dashboard component:
<TestDashboard />
```

3. **Check the console and data output**
4. **Verify query works before building full integration**

---

## Blocking Issues to Watch For

### 🚨 RLS Policy Issues
- If queries return empty data, check database RLS policies
- Advisor must be able to see their own students/courses
- Verify advisor_id in profiles matches advisors.profile_id

### 🚨 Missing Dependencies
- Ensure useAuth() provides advisorData correctly
- Check that advisorData includes assignments
- Verify department_id and admission_year are present

### 🚨 Query Performance
- Very large student lists may need pagination
- Consider caching before implementing
- Monitor Supabase query execution time

### 🚨 Type Mismatches
- Verify returned data types match expected shapes
- Check null/undefined handling in components
- Ensure optional chaining used correctly

---

## Notes for Future Reference

### Why this architecture?
- **Queries in lib/queries/**: Reusable, testable, data-only
- **Hooks in lib/hooks/**: Component-friendly, with caching/loading/error
- **Hooks use React Query**: Automatic caching, deduplication, refetch
- **Comments everywhere**: Easy to understand 6 months from now

### Cache keys design
- Hierarchical: [domain, feature, specifics]
- Enables invalidation at different levels
- Example: `['advisor', 'dashboard', 'stats', {advisorId, ...}]`

### Error handling strategy
- Errors always show as toasts (non-blocking)
- Components render empty states on error
- Queries retry automatically
- User can manually retry if needed

---

## Success Criteria

✅ Dashboard loads with real data from database
✅ Stats cards show accurate numbers
✅ Charts display correct upload activity
✅ Recent batches list shows current data
✅ Adding/deleting courses works
✅ No hardcoded mock data visible
✅ Error messages are user-friendly
✅ Performance is acceptable
✅ Code is well-commented and maintainable
✅ Can easily extend to other pages
