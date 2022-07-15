export const badRequest = (
	message: string,
): http.BadRequestGeneralResponse => ({
	statusCode: 400,
	reason: 'bad_request',
	type: 'general',
	message,
});

export const validationBadRequest = (
	errors: http.ValidationError[],
): http.BadRequestValidationResponse => ({
	statusCode: 400,
	reason: 'bad_request',
	type: 'validation',
	message: 'Request had validation errors',
	validationErrors: errors,
});

export const notFound = (resource: string): http.NotFoundResponse => ({
	statusCode: 404,
	reason: 'not_found',
	resource,
	message: 'Resource could not be found.',
});

export const notAuthorized = () => {
	return error(
		401,
		'unauthorized',
		'This route requires authentication. Token may be invalid.',
	);
};

export const forbidden = () => {
	return error(403, 'forbidden', 'You do not have permission.');
};

const error = (
	statusCode: number,
	reason: http.GeneralApiErrorResponseReasonType,
	message: string,
): http.ErrorResponse => {
	return {
		statusCode,
		reason,
		message,
	};
};
