declare namespace http {
	type GeneralApiErrorResponseReasonType = 'unauthorized' | 'forbidden';

	type ApiErrorBase = {
		statusCode: number;
		message: string;
	};

	type GeneralApiErrorResponse = {
		reason: GeneralApiErrorResponseReasonType;
	} & ApiErrorBase;

	type BadRequestGeneralResponse = {
		reason: 'bad_request';
		type: 'general';
	} & ApiErrorBase;

	type BadRequestValidationResponse = {
		reason: 'bad_request';
		type: 'validation';
		validationErrors: ValidationError[];
	} & ApiErrorBase;

	type NotFoundResponse = {
		reason: 'not_found';
		resource: string;
	} & ApiErrorBase;

	type ValidationError = {
		property: string;
		message: string;
	};

	type ErrorResponse =
		| GeneralApiErrorResponse
		| BadRequestGeneralResponse
		| BadRequestValidationResponse
		| NotFoundResponse;
}
