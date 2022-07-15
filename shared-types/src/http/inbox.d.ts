declare namespace http {
	type CreateInboxRequestBody = {
		inboxName: string;
		publicKey: string;
		currentNonce: number;
	};

	type Inbox = {
		inboxName: string;
		phonons: SlotReadyForConsumption[];
	};

	type GetInboxRequestParams = {
		publicKey: string;
	};

	type GetInboxRequestBody = {
		inboxName: string;
	};

	type CreateSlotRequestBody = {
		inboxName: string;
	};

	type FillSlotRequestBody = {
		inboxName: string;
		packet: string;
	};

	type Slot = {
		inboxName: string;
		cardPublicKey: string;
		nonce: number;
		expiresAt: Date;
	};

	type SlotReadyForConsumption = {
		nonce: number;
		phononPublicKey: string;
		consumableAt: Date | undefined;
	};

	type SlotConsumable = {
		nonce: number;
		phononPublicKey: string;
		packet: string;
	};

	type MarkSlotAsConsumedBody = {
		publicKey: string;
		nonce: number;
	};
}
