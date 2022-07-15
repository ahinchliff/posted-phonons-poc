import Joi from 'joi';
import { UnAuthRequestHandler } from '../route-wrapper';
import { notFound, validationBadRequest } from '../../utils/errors';
import { validate, ValidationSchema } from '../../utils/validate';

const bodyValidation: ValidationSchema<http.MarkSlotAsConsumedBody> = {
	publicKey: Joi.string().required(),
	nonce: Joi.number().required(),
};

const markSlotAsConsumed: UnAuthRequestHandler<
	void,
	void,
	http.MarkSlotAsConsumedBody,
	http.SuccessResponse
> = async ({ body, services }) => {
	const bodyValidationResult = validate(body, bodyValidation);

	if (bodyValidationResult.isInvalid) {
		return validationBadRequest(bodyValidationResult.errors);
	}

	const inbox = await services.data.inboxes.findOne({
		publicKey: body.publicKey,
	});

	if (!inbox) {
		return notFound('Inbox');
	}

	const slot = await services.data.slots.findOne({
		inboxName: inbox.inboxName,
		nonce: body.nonce,
	});

	if (!slot) {
		return notFound('Slot');
	}

	await services.data.slots.update(
		{ inboxName: inbox.inboxName, nonce: slot.nonce },
		{
			consumed: true,
		},
	);

	return { success: true };
};

export default markSlotAsConsumed;
