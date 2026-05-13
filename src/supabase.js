import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.bqvnnvvanyrdhgiecxiq.supabase.co
const supabaseKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdm5udnZhbnlyZGhnaWVjeGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NDkzNTgsImV4cCI6MjA5MTIyNTM1OH0.sHCSk65JpXmkEIBnzrF6blThUFyqCv8c5Q_5eC7CKj4

export const supabase = createClient(supabaseUrl, supabaseKey)