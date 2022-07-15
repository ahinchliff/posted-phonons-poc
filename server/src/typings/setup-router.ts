import express from 'express';

export type SetupRouterFunction = (
	config: Config,
	services: (logger: core.backend.Logger) => Services,
) => express.Router;
