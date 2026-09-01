import { createClient } from '@supabase/supabase-js';
import envVarsConfig from './envvars.config';
console.log("Supabase URL:", envVarsConfig.supabaseUrl);
const supabase = createClient(envVarsConfig.supabaseUrl, envVarsConfig.supabaseKey);

export default supabase;