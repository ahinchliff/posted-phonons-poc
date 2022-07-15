import Joi from 'joi';
import { UnAuthRequestHandler } from '../route-wrapper';
import { notFound, validationBadRequest } from '../../utils/errors';
import { validate, ValidationSchema } from '../../utils/validate';
import { parsePostedPhononTransaction as parsePostedPhononsPacket } from '../../utils/parse-posted-phonons-packet';

const bodyValidation: ValidationSchema<http.FillSlotRequestBody> = {
	inboxName: Joi.string().required(),
	packet: Joi.string().required(),
};

const fillSlot: UnAuthRequestHandler<
	void,
	void,
	http.FillSlotRequestBody,
	http.SuccessResponse
> = async ({ body, services }) => {
	const bodyValidationResult = validate(body, bodyValidation);

	if (bodyValidationResult.isInvalid) {
		return validationBadRequest(bodyValidationResult.errors);
	}

	const packet = parsePostedPhononsPacket(body.packet);

	const inbox = await services.data.inboxes.findOne({
		inboxName: body.inboxName,
	});

	if (!inbox) {
		return notFound('Inbox');
	}

	const slot = await services.data.slots.findOne({
		inboxName: inbox.inboxName,
		nonce: packet.nonce,
	});

	if (!slot) {
		return notFound('Slot');
	}

	await services.data.slots.update(
		{ inboxName: body.inboxName, nonce: packet.nonce },
		{
			packet: body.packet,
			publicKey: packet.phonons[0].publicKey,
		},
	);

	return { success: true };
};

export default fillSlot;
