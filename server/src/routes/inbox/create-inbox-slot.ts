import Joi from 'joi';
import moment from 'moment';
import { UnAuthRequestHandler } from '../route-wrapper';
import { notFound, validationBadRequest } from '../../utils/errors';
import { validate, ValidationSchema } from '../../utils/validate';

const bodyValidation: ValidationSchema<http.CreateSlotRequestBody> = {
	inboxName: Joi.string().required(),
};

const createInboxSlot: UnAuthRequestHandler<
	void,
	void,
	http.CreateSlotRequestBody,
	http.Slot
> = async ({ body, services }) => {
	const bodyValidationResult = validate(body, bodyValidation);

	if (bodyValidationResult.isInvalid) {
		return validationBadRequest(bodyValidationResult.errors);
	}

	const inbox = await services.data.inboxes.findOne({
		inboxName: body.inboxName,
	});

	if (!inbox) {
		return notFound('Inbox');
	}

	const lastNonceResult = await services.data.slots.getLastNonce(
		inbox.inboxName,
	);

	const nonce = (lastNonceResult.lastNonce || inbox.initialNonce) + 1;

	const newSlot = await services.data.slots.create({
		inboxName: inbox.inboxName,
		nonce,
		expiresAt: moment.utc().add(1, 'hour').toDate(),
	});

	return {
		inboxName: inbox.inboxName,
		cardPublicKey: inbox.publicKey,
		nonce,
		expiresAt: newSlot.expiresAt,
	};
};

export default createInboxSlot;
