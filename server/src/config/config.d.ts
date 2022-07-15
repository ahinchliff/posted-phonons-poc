type Config = {
	env: 'development' | 'uat' | 'production';
	port: number;
	postgres: Omit<data.Config, 'env'>;
};
