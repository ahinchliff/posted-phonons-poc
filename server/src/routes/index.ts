import express from 'express';
import inbox from './inbox';

import { SetupRouterFunction } from '../typings/setup-router';
import getRouterWrappers from './route-wrapper';
import { notFound } from '../utils/errors';

export default (
	config: Config,
	services: (logger: core.backend.Logger) => Services,
): express.Router => {
	const router = express.Router();

	// ensure catchAll is always last
	const subRouters: SetupRouterFunction[] = [inbox, ping, catchAll];

	subRouters.forEach((sr) => router.use(sr(config, services)));

	return router;
};

const ping: SetupRouterFunction = (config, services) => {
	const { unAuthWrapper } = getRouterWrappers(config, services);

	const router = express.Router();

	router.get(
		'/ping',
		unAuthWrapper(() => Promise.resolve({ online: true })),
	);

	return router;
};

const catchAll: SetupRouterFunction = (config, services) => {
	const { unAuthWrapper } = getRouterWrappers(config, services);

	const router = express.Router();

	router.use(
		'*',
		unAuthWrapper(() => Promise.resolve(notFound('route'))),
	);

	return router;
};
