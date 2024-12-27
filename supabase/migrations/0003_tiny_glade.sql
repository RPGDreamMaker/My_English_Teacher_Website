/*
  # Add wheel activities support
  
  1. New Tables
    - `wheel_activities`
      - `id` (uuid, primary key)
      - `class_id` (uuid, references classes)
      - `name` (text)
      - `created_at` (timestamp)
    - `wheel_activity_states`
      - `id` (uuid, primary key) 
      - `activity_id` (uuid, references wheel_activities)
      - `student_id` (uuid, references students)
      - `status` (text) - Either 'available', 'selected', or 'absent'
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated teachers
*/

-- Create wheel_activities table
CREATE TABLE IF NOT EXISTS wheel_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create wheel_activity_states table
CREATE TABLE IF NOT EXISTS wheel_activity_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES wheel_activities ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'selected', 'absent')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, student_id)
);

-- Enable RLS
ALTER TABLE wheel_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_activity_states ENABLE ROW LEVEL SECURITY;

-- Policies for wheel_activities
CREATE POLICY "Teachers can manage their wheel activities"
  ON wheel_activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = wheel_activities.class_id
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = wheel_activities.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policies for wheel_activity_states
CREATE POLICY "Teachers can manage wheel activity states"
  ON wheel_activity_states
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wheel_activities
      JOIN classes ON classes.id = wheel_activities.class_id
      WHERE wheel_activities.id = wheel_activity_states.activity_id
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wheel_activities
      JOIN classes ON classes.id = wheel_activities.class_id
      WHERE wheel_activities.id = wheel_activity_states.activity_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wheel_activities_class_id ON wheel_activities(class_id);
CREATE INDEX IF NOT EXISTS idx_wheel_activity_states_activity_id ON wheel_activity_states(activity_id);
CREATE INDEX IF NOT EXISTS idx_wheel_activity_states_student_id ON wheel_activity_states(student_id);