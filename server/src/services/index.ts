import { getDBClients } from '../../../data/src';

const getServices =
	(dbConnection: any) =>
	(logger: core.backend.Logger): Services => {
		return {
			data: getDBClients(dbConnection, logger),
		};
	};

export default getServices;
