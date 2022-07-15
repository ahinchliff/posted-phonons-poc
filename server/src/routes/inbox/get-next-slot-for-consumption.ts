import { UnAuthRequestHandler } from '../route-wrapper';
import { notFound } from '../../utils/errors';
import moment from 'moment';

const getNextSlotForConsumption: UnAuthRequestHandler<
	http.GetInboxRequestParams,
	void,
	void,
	http.SlotConsumable
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

	if (blockingSlot) {
		return notFound('Slot');
	}

	return {
		nonce: slots[0].nonce,
		phononPublicKey: slots[0].publicKey!,
		packet: slots[0].packet!,
	};
};

export default getNextSlotForConsumption;
