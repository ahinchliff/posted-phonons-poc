declare namespace data {
	type DBTransaction = {
		end: () => Promise<void>;
		rollback: () => Promise<void>;
		connection: any;
	};

	interface IDBTransactionClient {
		create<T>(
			action: (dbTransaction: data.DBTransaction) => Promise<T>,
		): Promise<T>;
	}
}
