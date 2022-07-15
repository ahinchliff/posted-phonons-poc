import { Pool } from 'pg';
import sql, { gte, lt, select } from 'sql-bricks';
import ClientBase, { prepareObjectForSql } from './EntityClientBase';
export default class SlotsClient
	extends ClientBase<data.Slot, data.NewSlot>
	implements data.ISlotsClient
{
	public constructor(pool: Pool, logger: core.backend.Logger) {
		super('slot', pool, logger);
	}

	public getLastNonce = (
		inboxName: string,
		t?: data.DBTransaction,
	): Promise<data.LastNonceResult> => {
		const statement = select(`MAX (nonce) AS "lastNonce"`)
			.from(this.tableName)
			.where(prepareObjectForSql({ inboxName }));

		return this.queryOne(
			statement,
			t,
		) as unknown as Promise<data.LastNonceResult>;
	};

	public waitingForConsumption = (
		inboxName: string,
		t?: data.DBTransaction,
	): Promise<data.Slot[]> => {
		const statement = select()
			.from(this.tableName)
			.where(prepareObjectForSql({ inboxName }))
			.and(sql(`"packet" IS NOT NULL`))
			.and(sql(`"consumed" = false`))
			.order('nonce ASC');

		return this.queryMany(statement, t);
	};

	public getMostRecentBlocking = (
		inboxName: string,
		consumableSlotsIndex: number,
		currentTime: Date,
		t?: data.DBTransaction,
	): Promise<data.Slot | undefined> => {
		const statement = select()
			.from(this.tableName)
			.where(prepareObjectForSql({ inboxName }))
			.and(sql(`"packet" IS NULL`))
			.and(lt('nonce', consumableSlotsIndex))
			.and(gte('expiresAt', currentTime.toUTCString()))
			.order('nonce DESC');

		return this.queryOne(statement, t);
	};
}
