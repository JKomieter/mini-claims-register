import { createClient } from '@supabase/supabase-js';
import envVarsConfig from './envvars.config';

const supabase = createClient(envVarsConfig.supabaseUrl, envVarsConfig.supabaseKey);

export default supabase;