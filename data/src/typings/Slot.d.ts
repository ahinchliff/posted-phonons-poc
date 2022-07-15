declare namespace data {
	type Slot = {
		inboxName: string;
		nonce: number;
		expiresAt: Date;
		packet: string | undefined;
		publicKey: string | undefined;
		consumed: boolean;
	};

	type NewSlot = Omit<Slot, 'packet' | 'publicKey' | 'consumed'>;

	type LastNonceResult = { lastNonce: number | null };

	interface ISlotsClient extends data.IClientBase<Slot, NewSlot> {
		getLastNonce(
			inboxName: string,
			t?: data.DBTransaction,
		): Promise<LastNonceResult>;
		waitingForConsumption(
			inboxName: string,
			t?: data.DBTransaction,
		): Promise<Slot[]>;
		getMostRecentBlocking(
			inboxName: string,
			consumableSlotsIndex: number,
			currentTime: Date,
			t?: data.DBTransaction,
		): Promise<Slot | undefined>;
	}
}
