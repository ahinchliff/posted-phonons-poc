import { Pool, PoolClient, QueryResult } from 'pg';
import { select, SelectStatement, Statement } from 'sql-bricks';

export type PGTransaction = data.DBTransaction & {
	connection: PoolClient;
};

export default class PGClientBase {
	constructor(private pool: Pool, private logger: core.backend.Logger) {}

	public async beginTransaction(): Promise<PGTransaction> {
		const connection = await this.pool.connect();
		await connection.query('START TRANSACTION');

		return {
			connection,
			end: (): Promise<void> => this.endTransaction(connection),
			rollback: (): Promise<void> => this.rollBack(connection),
		};
	}

	public async endTransaction(connection: PoolClient): Promise<void> {
		await connection.query('COMMIT');
		connection.release();
	}

	public async rollBack(connection: PoolClient): Promise<void> {
		await connection.query('ROLLBACK');
		await connection.release();
	}

	public async query(
		statement: Statement,
		dbTransaction: PGTransaction | undefined,
		limit?: number,
	): Promise<QueryResult> {
		const sql = statement.toParams();
		const sqlText = limit ? `${sql.text} LIMIT ${limit}` : sql.text;

		return this.execute(sqlText, sql.values, dbTransaction);
	}

	public async mutate(
		statement: Statement,
		dbTransaction: PGTransaction | undefined,
	): Promise<QueryResult> {
		const sql = statement.toParams();
		return this.execute(`${sql.text} returning *`, sql.values, dbTransaction);
	}

	public async searchBase<T>(
		itemSelect: SelectStatement,
		statementConstructor: (select: SelectStatement) => Statement,
		pagination: data.Pagination,
		dbTransaction: PGTransaction | undefined,
	): Promise<data.SearchResults<T>> {
		const countStatement = statementConstructor(select('COUNT(*)'));
		const countResultPromise = this.query(countStatement, dbTransaction);

		const itemSql = statementConstructor(itemSelect).toParams();
		const offset = (pagination.page - 1) * pagination.pageSize;

		const itemStatementWithPagination = `${itemSql.text} OFFSET ${offset} LIMIT ${pagination.pageSize}`;

		const itemsResultPromise = this.execute(
			itemStatementWithPagination,
			itemSql.values,
			dbTransaction,
		);

		const { rows: countRows } = await countResultPromise;
		const { rows: itemRows } = await itemsResultPromise;

		return {
			totalCount: countRows[0].count,
			items: itemRows,
		};
	}

	private execute = async (
		query: string,
		values: any[],
		transaction: PGTransaction | undefined,
	): Promise<QueryResult> => {
		try {
			const start = Date.now();
			const connOrPool = transaction ? transaction.connection : this.pool;
			const result = await connOrPool.query(query, values);
			const end = Date.now();
			this.logger.debug('sql executed', {
				sql: query,
				time: `${end - start}ms`,
			});
			return result;
		} catch (err) {
			this.logger.error(`error executing sql: ${query}`, err);
			throw err;
		}
	};
}
