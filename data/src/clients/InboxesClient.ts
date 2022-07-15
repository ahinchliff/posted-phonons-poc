import { Pool } from 'pg';
import ClientBase from './EntityClientBase';
export default class InboxesClient
	extends ClientBase<data.Inbox, data.Inbox>
	implements data.IInboxesClient
{
	public constructor(pool: Pool, logger: core.backend.Logger) {
		super('inbox', pool, logger);
	}
}
