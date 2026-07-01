-- Advisors recurring weekly chedule
-- e.g. Every Monday 10:00 - 12:00

CREATE TABLE advisor_office_hours (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 and 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location  TEXT,
    note       TEXT,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAUKT now(),
    CHECK (end_time > start_time)                                               
);

-- one-time specific date availbaility
-- E.g. Availablr onDEcember 5th 2025, 2pm - 4pm
CREATE TABLE advisor_office_hours_override (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id   UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  -- is_cancelled = true means this date is blocked/unavailable
  -- useful for when advisor won't be available on a normally scheduled day
  location     TEXT,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Student visit intent
CREATE TABLE advisor_visit_intents (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    preferred_date  DATE NOT NULL,
    reason   TEXT NOT NULL,
    -- Freeform: "I wat to query my MTH 201 result from 2024/2025 Harmattan"
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
    advisor_note  TEXT,  -- adisors canrespond with note
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE      (advisor_id, student_id, preferred_date)
    -- One intent per student per advisor per date
);

-- RLS POLICIES 

-- Advisor office hours: public to authentciated users
-- (students need to use their advisor's schedule)
CREATE POLICY "authenticated_view_office_hours"
    ON advisor_office_hours FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_view_office_hours_overrides"
    ON advisor_office_hours_override FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_view_office_hours_overrides"
    ON advisor_office_hours_override FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Advisors can only manage their own schedule
CREATE POLICY "advisors_manage_own_hours"
    ON advisor_office_hours FOR ALL
    USING (
        advisor_id IN (
            SELECT id FROM advisors WHERE profile_id = auth.uid()
        )
    )
    WITH CHECK (
        advisor_id IN (
            SELECT id FROM advisors WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "advisors_manage_own_overrides" 
    ON advisor_office_hours_override FOR ALL
    USING (
        advisor_id IN (
            SELECT id FROM advisors WHERE profile_id = auth.uid()
        )
    )
    WITH CHECK (
        advisor_id IN (
            SELECT id FROM advivors WHERE profile_id = auth.uid()
        )
    );


-- Visit intents: Students manage their own, advisors see theitr incoming
CREATE POLICY "students_manage_own_intents"
    ON advisor_visit_intents FOR ALL
    USING (
        student_id IN (
            SELECT id FROM students WHERE profile_id = auth.uid()
        )
    )
    WITH CHECK (
        student_id IN (
            SELECT id FROM students WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "advisors_view_incoming_intents"
    ON advisor_visit_intents FOR SELECT
    USING (
        advisor_id IN (
            SELECT id FROM students WHERE profile_id = auth.uid() 
        )
    );

-- Advisors can update intent status  and add their note
CREATE POLICY "advisors_update_intent_status"
    ON advisor_visit_intents FOR UPDATE
    USING (
        advisor_id IN (
            SELECT id FROM advisors WHERE profile_id = auth.uid()
        )
    )
    WITH CHECK (
        advisor_id IN (
            SELECT id FROM advisors WHERE profile_id = auth.uid()
        )
    );


-- INDEXES 
CREATE INDEX idx_office_hours_advisors_id 
    ON advisor_offering_hours(advisor_id);

CREATE INDEX idx_office_hours_override_advisor_date
    ON advisor_office_hours_override(advisor_id, date);

CREATE INDEX idx_visit_intents_advisor_id
    ON advisor_visit_intents(advisor_id);

CREATE INDEX idx_visit_intents_student_id 
    ON advisor_visit_intents(student_id);

CREATE INDEX idx_visit_intents_preferred_date
    ON advisor_visit_intents(preferred_date);