/*
  # Add seating plan and activity points tables

  1. New Tables
    - `seating_plans`: Stores classroom layout configuration
    - `student_seats`: Tracks student seat assignments
    - `activities`: Stores activity definitions
    - `activity_points`: Tracks points per student per activity

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated teachers
*/

-- Seating Plans Table
CREATE TABLE IF NOT EXISTS seating_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  rows integer NOT NULL,
  cols integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Seats Table
CREATE TABLE IF NOT EXISTS student_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seating_plan_id uuid REFERENCES seating_plans ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students ON DELETE CASCADE NOT NULL,
  row_num integer NOT NULL,
  col_num integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(seating_plan_id, row_num, col_num)
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity Points Table
CREATE TABLE IF NOT EXISTS activity_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students ON DELETE CASCADE NOT NULL,
  points integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, student_id)
);

-- Enable RLS
ALTER TABLE seating_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_points ENABLE ROW LEVEL SECURITY;

-- Policies for seating_plans
CREATE POLICY "Teachers can manage their seating plans"
  ON seating_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = seating_plans.class_id
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = seating_plans.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policies for student_seats
CREATE POLICY "Teachers can manage student seats"
  ON student_seats
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seating_plans
      JOIN classes ON classes.id = seating_plans.class_id
      WHERE seating_plans.id = student_seats.seating_plan_id
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seating_plans
      JOIN classes ON classes.id = seating_plans.class_id
      WHERE seating_plans.id = student_seats.seating_plan_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policies for activities
CREATE POLICY "Teachers can manage their activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = activities.class_id
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = activities.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policies for activity_points
CREATE POLICY "Teachers can manage activity points"
  ON activity_points
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM activities
      JOIN classes ON classes.id = activities.class_id
      WHERE activities.id = activity_points.activity_id
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM activities
      JOIN classes ON classes.id = activities.class_id
      WHERE activities.id = activity_points.activity_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policy for Student viewing points function
CREATE POLICY "Students can view activity points"
  ON activity_points
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seating_plans_class_id ON seating_plans(class_id);
CREATE INDEX IF NOT EXISTS idx_student_seats_seating_plan_id ON student_seats(seating_plan_id);
CREATE INDEX IF NOT EXISTS idx_student_seats_student_id ON student_seats(student_id);
CREATE INDEX IF NOT EXISTS idx_activities_class_id ON activities(class_id);
CREATE INDEX IF NOT EXISTS idx_activity_points_activity_id ON activity_points(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_points_student_id ON activity_points(student_id);