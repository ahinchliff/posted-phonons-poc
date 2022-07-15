declare namespace data {
	type Config = {
		env: 'development' | 'uat' | 'production';
		host: string;
		port: number;
		database: string;
		user: string;
		password: string;
	};
}
