import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.bqvnnvvanyrdhgiecxiq
const supabaseKey = import.meta.env.sb_publishable_YsMgDvBFh_R4HsxQ02I3ag_Tr38lSWV

export const supabase = createClient(supabaseUrl, supabaseKey)