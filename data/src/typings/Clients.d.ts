declare namespace data {
	type DataClients = {
		inboxes: data.IInboxesClient;
		slots: data.ISlotsClient;
		dbTransactions: data.IDBTransactionClient;
	};
}
