import * as dotenv from 'dotenv';

dotenv.config();

const getConfig = () => {
	const config: Config = {
		env: getEnvVariable('NODE_ENV') as Config['env'],
		port: getEnvVariable('PORT'),
		postgres: {
			host: getEnvVariable('POSTGRES_HOST'),
			database: getEnvVariable('POSTGRES_DB_NAME'),
			port: 5432,
			user: getEnvVariable('POSTGRES_USER'),
			password: getEnvVariable('POSTGRES_PASSWORD'),
		},
	};
	return config;
};

export default getConfig;

const getEnvVariable = (property: string, canBeUndefined = false): any => {
	const value = process.env[property];

	if (!canBeUndefined && !value) {
		throw new Error(`${property} environment variable is not set`);
	}

	return value;
};
