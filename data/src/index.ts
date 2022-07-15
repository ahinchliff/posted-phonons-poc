import { Pool, PoolClient } from 'pg';
import InboxesClient from './clients/InboxesClient';
import DBTransactionsClient from './clients/DBTransactionsClient';
import SlotsClient from './clients/SlotsClient';

export const getDBConnection = async (
	config: data.Config,
	logger: core.backend.Logger,
): Promise<Pool> => {
	return new Promise<Pool>((resolve): void => {
		logger.debug('Establishing DB connection');
		const pool = new Pool({
			user: config.user,
			host: config.host,
			database: config.database,
			password: config.password,
			port: config.port,
			ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
		});

		pool.connect().then(
			(conn: PoolClient): void => {
				conn.release();
				logger.debug('Successfully connected to DB');
				resolve(pool);
			},
			(err: Error): void => {
				logger.error('Error establishing DB connection. Retrying...', err);
				setTimeout(() => resolve(getDBConnection(config, logger)), 5000);
			},
		);
	});
};

export const getDBClients = (
	pool: Pool,
	logger: core.backend.Logger,
): data.DataClients => ({
	inboxes: new InboxesClient(pool, logger),
	slots: new SlotsClient(pool, logger),
	dbTransactions: new DBTransactionsClient(pool, logger),
});
