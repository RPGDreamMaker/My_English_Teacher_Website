/*
  # Add teacher profiles

  1. New Tables
    - `teacher_profiles`
      - `user_id` (uuid, primary key, references auth.users)
      - `display_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `teacher_profiles` table
    - Add policy for teachers to manage their own profile
*/

-- Create teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for teachers to manage their own profile
CREATE POLICY "Teachers can manage their own profile"
  ON teacher_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();