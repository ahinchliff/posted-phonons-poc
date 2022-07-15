const getEnvVariable = (property: string, canBeUndefined = false): string => {
	const value = process.env[property];
	if (!canBeUndefined && !value) {
		throw new Error(`${property} environment variable is not set`);
	}
	return value as string;
};

const config = {
	phononClientUrl: getEnvVariable('REACT_APP_PHONON_CLIENT_URL'),
	inboxUrl: getEnvVariable('REACT_APP_INBOX_URL'),
};

export default config;
