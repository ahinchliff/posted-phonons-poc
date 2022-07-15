import * as uuid from 'uuid';

export default class Logger implements core.backend.Logger {
	constructor(
		private environment: 'test' | 'development' | 'uat' | 'production',
		private userId?: string,
		private incidentId?: string,
	) {
		this.incidentId = incidentId || uuid.v4().replace(/-/g, '');
	}

	public getUserId(): string | undefined {
		return this.userId;
	}

	public getIncidentId(): string {
		return this.incidentId as string;
	}

	public setUserId = (userId: string): void => {
		this.userId = userId;
	};

	public setIncidentId = (incidentId: string): void => {
		this.incidentId = incidentId;
	};

	public setEnvironment = (
		enviroment: 'test' | 'development' | 'uat' | 'production',
	) => (this.environment = enviroment);

	public silly = (message: string, data?: any): void => {
		this.log('silly', message, null, data);
	};

	public debug = (message: string, data?: any): void => {
		this.log('debug', message, null, data);
	};

	public info = (message: string, data?: any): void => {
		this.log('info', message, null, data);
	};

	public warn = (message: string, err?: any, data?: any): void => {
		this.log('warn', message, err, data);
	};

	public error = (message: string, err: any, data?: any): void => {
		this.log('error', message, err, data);
	};

	private log = (
		level: string,
		message: string,
		err?: any,
		data?: any,
	): void => {
		if (this.environment === 'test') {
			return;
		} else if (this.environment === 'development') {
			this.logDev(level, message, err, data);
		} else {
			this.logProd(level, message, err, data);
		}
	};

	private getLogMessageDev = (
		message: string,
		includeNewLine: boolean,
	): string => {
		return `${new Date().toISOString()} - ${message}${
			includeNewLine ? '\r\n  ---' : ''
		}`;
	};

	private logDev = (
		level: string,
		message: string,
		err?: any,
		data?: any,
	): void => {
		console.log(
			level,
			this.getLogMessageDev(message, !!data || !!err),
			data ? data : '',
		);

		if (err) {
			console.log(level, err);
		}
	};

	private logProd = (
		level: string,
		message: string,
		err?: any,
		data?: any,
	): void => {
		// tslint:disable-next-line:no-console
		console.log(
			JSON.stringify({
				level,
				message,
				incidentId: this.incidentId,
				timestamp: new Date().toISOString(),
				userId: this.userId,
				error: err && {
					name: err.name,
					message: err.message,
					stack: err.stack,
					serialized: JSON.stringify(err),
				},
				data,
			}),
		);
	};
}
