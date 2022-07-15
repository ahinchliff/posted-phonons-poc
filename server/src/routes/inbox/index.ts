import express from 'express';
import { SetupRouterFunction } from '../../typings/setup-router';
import getRouterWrappers from '../route-wrapper';
import createInbox from './create-inbox';
import getInbox from './get-inbox';
import createInboxSlot from './create-inbox-slot';
import fillSlot from './fill-slot';
import getNextSlotForConsumption from './get-next-slot-for-consumption';
import markSlotAsConsumed from './mark-slot-as-consumed';

const setupInboxRouter: SetupRouterFunction = (config, services) => {
	const { unAuthWrapper } = getRouterWrappers(config, services);

	const router = express.Router();

	router.post('/inbox', unAuthWrapper(createInbox));
	router.get('/inbox/:publicKey', unAuthWrapper(getInbox));
	router.get(
		'/inbox/:publicKey/slot',
		unAuthWrapper(getNextSlotForConsumption),
	);
	router.post(
		'/inbox/:publicKey/slot/consumed',
		unAuthWrapper(markSlotAsConsumed),
	);
	router.post('/inbox/slot', unAuthWrapper(createInboxSlot));
	router.post('/inbox/slot/packet', unAuthWrapper(fillSlot));

	return router;
};

export default setupInboxRouter;
