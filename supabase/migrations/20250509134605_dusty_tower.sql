/*
  # Initial Schema Setup

  1. New Tables
    - profiles
      - User profiles with roles and skills
    - team_requests
      - Team formation requests for hackathons
    - resources
      - Educational resources shared by users
    - likes
      - Track resource likes by users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text CHECK (role IN ('student', 'senior', 'alumni')),
  skills text[],
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_requests table
CREATE TABLE IF NOT EXISTS team_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event text NOT NULL,
  skills_needed text[],
  spots_available integer NOT NULL DEFAULT 1,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  likes integer DEFAULT 0,
  downloads integer DEFAULT 0,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create likes table for tracking resource likes
CREATE TABLE IF NOT EXISTS likes (
  user_id uuid REFERENCES profiles(id) NOT NULL,
  resource_id uuid REFERENCES resources(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, resource_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Team requests policies
CREATE POLICY "Team requests are viewable by everyone"
  ON team_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create team requests"
  ON team_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own team requests"
  ON team_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Resources are viewable by everyone"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage their likes"
  ON likes FOR ALL
  USING (auth.uid() = user_id);