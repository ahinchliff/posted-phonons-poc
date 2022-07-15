import Joi from 'joi';
import { UnAuthRequestHandler } from '../route-wrapper';
import { badRequest, validationBadRequest } from '../../utils/errors';
import { validate, ValidationSchema } from '../../utils/validate';

const bodyValidation: ValidationSchema<http.CreateInboxRequestBody> = {
	inboxName: Joi.string().required(),
	currentNonce: Joi.number().required(),
	publicKey: Joi.string().required(),
};

const createInbox: UnAuthRequestHandler<
	void,
	void,
	http.CreateInboxRequestBody,
	http.Inbox
> = async ({ body, services }) => {
	const bodyValidationResult = validate(body, bodyValidation);

	if (bodyValidationResult.isInvalid) {
		return validationBadRequest(bodyValidationResult.errors);
	}

	const existingInbox = await services.data.inboxes.findOne({
		inboxName: body.inboxName,
	});

	if (existingInbox) {
		return badRequest('Inbox name taken');
	}

	const newInbox = await services.data.inboxes.create({
		inboxName: body.inboxName,
		initialNonce: body.currentNonce,
		publicKey: body.publicKey,
	});

	return {
		inboxName: newInbox.inboxName,
		phonons: [],
	};
};

export default createInbox;
