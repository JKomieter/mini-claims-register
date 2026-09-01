import app from './app';
import envVarsConfig from './config/envvars.config';

app.listen(envVarsConfig.port, () => {
    console.log(`Server running on port ${envVarsConfig.port}`);
});