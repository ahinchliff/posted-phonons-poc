declare namespace data {
	type Inbox = {
		inboxName: string;
		publicKey: string;
		initialNonce: number;
	};

	type NewInbox = Inbox;

	interface IInboxesClient extends data.IClientBase<Inbox, NewInbox> {}
}
