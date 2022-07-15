import { Pool } from 'pg';
import {
	select,
	deleteFrom,
	insert,
	update,
	SelectStatement,
} from 'sql-bricks';
import PGClientBase from './PGClientBase';

export default class EntityClientBase<Entity, NewEntity> extends PGClientBase {
	constructor(
		protected tableName: string,
		pool: Pool,
		logger: core.backend.Logger,
	) {
		super(pool, logger);
	}

	public async create(
		data: NewEntity,
		transactionConnection?: data.DBTransaction,
	): Promise<Entity> {
		const sqlStatement = insert(this.tableName, prepareObjectForSql(data));
		const { rows } = await this.mutate(sqlStatement, transactionConnection);
		return rows[0];
	}

	public async createMany(
		data: NewEntity[],
		transactionConnection?: data.DBTransaction,
	): Promise<Entity[]> {
		const sqlStatement = insert(
			this.tableName,
			data.map((d) => prepareObjectForSql(d)),
		);
		const { rows } = await this.mutate(sqlStatement, transactionConnection);
		return rows;
	}

	public async delete(
		where: Partial<Entity>,
		transactionConnection?: data.DBTransaction,
	): Promise<number> {
		const sqlStatement = deleteFrom(this.tableName).where(
			prepareObjectForSql(where),
		);
		const result = await this.mutate(sqlStatement, transactionConnection);
		return result.rowCount;
	}

	public async update(
		where: Partial<Entity>,
		data: Partial<Entity>,
		transactionConnection?: data.DBTransaction,
	): Promise<Entity[]> {
		const statement = update(this.tableName)
			.set(prepareObjectForSql(data))
			.where(prepareObjectForSql(where));
		const { rows } = await this.mutate(statement, transactionConnection);
		return rows;
	}

	public async findOne(
		where: Partial<Entity>,
		transactionConnection?: data.DBTransaction,
	): Promise<Entity | undefined> {
		const statement = select()
			.from(this.tableName)
			.where(prepareObjectForSql(where));
		return this.queryOne(statement, transactionConnection);
	}

	public async findMany(where: Partial<Entity>): Promise<Entity[]> {
		const statement = select()
			.from(this.tableName)
			.where(prepareObjectForSql(where));
		return this.queryMany(statement);
	}

	public async search(
		where: Partial<Entity>,
		searchParams: data.Pagination,
		transactionConnection?: data.DBTransaction,
	): Promise<data.SearchResults<Entity>> {
		const statementConstructor = (select: SelectStatement) => {
			const statement = select
				.from(this.tableName)
				.where(prepareObjectForSql(where));

			return statement;
		};

		return this.searchBase(
			select('*'),
			statementConstructor,
			searchParams,
			transactionConnection,
		);
	}

	protected queryOne = async (
		statement: SelectStatement,
		transactionConnection?: data.DBTransaction,
	): Promise<Entity | undefined> => {
		const { rows } = await this.query(statement, transactionConnection, 1);
		return rows[0];
	};

	protected queryMany = async (
		statement: SelectStatement,
		transactionConnection?: data.DBTransaction,
		limit?: number,
	): Promise<Entity[]> => {
		const result = await this.query(statement, transactionConnection, limit);
		return result.rows;
	};
}

export const prepareObjectForSql = (object: any) => {
	const result: any = {};
	const noUndefined = removeUndefinedFromTopLayerOfObject(object);
	for (let prop in noUndefined) {
		if (Object.prototype.hasOwnProperty.call(noUndefined, prop)) {
			const rawValue = noUndefined[prop];

			const value =
				rawValue === null
					? null
					: typeof rawValue === 'object' && !(rawValue instanceof Date)
					? JSON.stringify(rawValue)
					: rawValue;
			result[prop] = value;
		}
	}

	return result;
};

const removeUndefinedFromTopLayerOfObject = <T>(value: T): T => {
	const cleansed = {
		...value,
	};
	for (const key in cleansed) {
		if (cleansed[key] === undefined) {
			delete cleansed[key];
		}
	}
	return cleansed;
};
