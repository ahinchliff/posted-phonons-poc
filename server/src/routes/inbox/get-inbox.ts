import { UnAuthRequestHandler } from '../route-wrapper';
import { notFound } from '../../utils/errors';
import moment from 'moment';

const getInbox: UnAuthRequestHandler<
	http.GetInboxRequestParams,
	void,
	void,
	http.Inbox
> = async ({ params, services }) => {
	const inbox = await services.data.inboxes.findOne({
		publicKey: params.publicKey,
	});

	if (!inbox) {
		return notFound('Inbox');
	}

	const slots = await services.data.slots.waitingForConsumption(
		inbox.inboxName,
	);

	const blockingSlot = !!slots.length
		? await services.data.slots.getMostRecentBlocking(
				inbox.inboxName,
				slots[0].nonce,
				moment.utc().toDate(),
		  )
		: undefined;

	const phonons = slots.map((slot, index) => {
		return {
			nonce: slot.nonce,
			phononPublicKey: slot.publicKey!,
			consumableAt: index === 0 ? blockingSlot?.expiresAt : undefined,
		};
	});

	return {
		inboxName: inbox.inboxName,
		phonons,
	};
};

export default getInbox;
