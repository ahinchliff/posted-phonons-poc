import express, { Request } from 'express';
import Logger from '../../../core-backend/src/logger';

import { notAuthorized } from '../utils/errors';

export type HandlerPayload<User, Params = {}, QueryString = {}, Body = {}> = {
	user: User;
	params: Params;
	queryString: QueryString;
	headers: Request['headers'];
	body: Body;
	config: Config;
	services: Services;
	logger: core.backend.Logger;
};

type AuthRequestHandlerPayload<Params, QueryString, Body> = HandlerPayload<
	data.Inbox,
	Params,
	QueryString,
	Body
>;

type UnAuthRequestHandlerPayload<Params, QueryString, Body> = HandlerPayload<
	data.Inbox | undefined,
	Params,
	QueryString,
	Body
>;

type RequestHandler<Payload, Result> = (
	payload: Payload,
) => Promise<Result | http.ErrorResponse>;

export type AuthRequestHandler<Params, QueryString, Body, Result> =
	RequestHandler<AuthRequestHandlerPayload<Params, QueryString, Body>, Result>;

export type UnAuthRequestHandler<Params, QueryString, Body, Result> =
	RequestHandler<
		UnAuthRequestHandlerPayload<Params, QueryString, Body>,
		Result
	>;

export const requestHandlerWrapper =
	(
		fn:
			| AuthRequestHandler<any, any, any, any>
			| UnAuthRequestHandler<any, any, any, any>,
		config: Config,
		getServices: (logger: core.backend.Logger) => Services,
		requiresAuth: boolean,
	) =>
	async (request: express.Request, response: express.Response) => {
		const logger = new Logger(config.env);
		const start = Date.now();
		logger.debug(`----> ${request.method} ${request.url}`, {
			method: request.method,
			url: request.url,
		});

		let responseStatus: number;
		let responseBody: object;

		try {
			const services = getServices(logger);

			let user: data.Inbox | undefined;

			// const authToken = getAuthHeader(request);

			// if (authToken) {
			// 	const decodedToken = await services.auth.decodeJWT(authToken);

			// 	if (decodedToken) {
			// 		user = await services.data.inboxes.findOne({
			// 			userId: decodedToken.userId,
			// 		});
			// 		if (user) {
			// 			logger.setUserId(user.userId);

			// 			logger.debug(`Authenticated user`, {
			// 				method: request.method,
			// 				url: request.url,
			// 				userId: user.userId,
			// 			});
			// 		}
			// 	}
			// }

			if (!user && requiresAuth) {
				responseStatus = 401;
				responseBody = notAuthorized();
			} else {
				const payload: HandlerPayload<data.Inbox | undefined> = {
					user,
					params: request.params,
					queryString: request.query,
					headers: request.headers,
					body: request.body || {},
					config,
					services,
					logger,
				};

				const result = await fn(payload as any);
				responseStatus = result.statusCode || 200;
				if (result.statusCode) {
					responseBody = { ...result, incidentId: logger.getIncidentId() };
				} else {
					responseBody = result;
				}
			}
		} catch (err) {
			logger.error('Failed to process request', err);
			responseStatus = 500;
			responseBody = {
				status: 500,
				message: 'Internal Error',
				incidentId: logger.getIncidentId(),
			};
		}

		const end = Date.now();
		logger.debug(
			`<---- ${request.method} ${request.url} ${responseStatus} ${
				end - start
			}ms`,
			{
				method: request.method,
				url: request.url,
				duration: end - start,
			},
		);
		response.status(responseStatus);
		response.send(responseBody);
	};

const authWrapper = (
	fn: AuthRequestHandler<any, any, any, any>,
	config: Config,
	services: (logger: core.backend.Logger) => Services,
) => requestHandlerWrapper(fn, config, services, true);

const unAuthWrapper = (
	fn: UnAuthRequestHandler<any, any, any, any>,
	config: Config,
	services: (logger: core.backend.Logger) => Services,
) => requestHandlerWrapper(fn, config, services, false);

const adminAuthWrapper = (
	fn: AuthRequestHandler<any, any, any, any>,
	config: Config,
	services: (logger: core.backend.Logger) => Services,
) => requestHandlerWrapper(fn, config, services, true);

export default (
	config: Config,
	services: (logger: core.backend.Logger) => Services,
) => ({
	authWrapper: (fn: AuthRequestHandler<any, any, any, any>) =>
		authWrapper(fn, config, services),
	unAuthWrapper: (fn: UnAuthRequestHandler<any, any, any, any>) =>
		unAuthWrapper(fn, config, services),
	adminAuthWrapper: (fn: AuthRequestHandler<any, any, any, any>) =>
		adminAuthWrapper(fn, config, services),
});
