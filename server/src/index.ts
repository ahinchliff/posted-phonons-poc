import express from 'express';
import setupRoutes from './routes';
import cors from 'cors';
import getConfig from './config';
import getServices from './services';
import { getDBConnection } from '../../data/src';
import Logger from '../../core-backend/src/logger';

(async () => {
	const config = getConfig();

	const logger = new Logger(config.env, 'api-init');

	const dbConnection = await getDBConnection(
		{ ...config.postgres, env: config.env },
		logger,
	);

	const services = getServices(dbConnection);

	const app = express();

	// Configure CORS.
	app.use(cors());

	// Request parsing.
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());

	app.use('/', setupRoutes(config, services));

	app.listen(config.port);
	logger.debug(`Listening on port:${config.port}`);
})();
