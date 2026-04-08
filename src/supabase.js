import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqvnnvvanyrdhgiecxiq.supabase.co'
const supabaseKey = 'sb_publishable_YsMgDvBFh_R4HsxQ02I3ag_Tr38lSWV'

export const supabase = createClient(supabaseUrl, supabaseKey)