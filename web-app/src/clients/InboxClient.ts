import axios from 'axios';

export default class InboxClient {
	constructor(private baseUrl: string) {}

	public fetchInbox = async (cardPublicKey: string): Promise<http.Inbox> => {
		const response = await axios.get<http.Inbox>(
			`${this.baseUrl}/inbox/${cardPublicKey}`,
		);
		return response.data;
	};

	public registerInbox = async (
		data: http.CreateInboxRequestBody,
	): Promise<http.Inbox> => {
		const response = await axios.post<http.Inbox>(
			`${this.baseUrl}/inbox`,
			data,
		);
		return response.data;
	};

	public createSlot = async (
		data: http.CreateSlotRequestBody,
	): Promise<http.Slot> => {
		const response = await axios.post<http.Slot>(
			`${this.baseUrl}/inbox/slot`,
			data,
		);
		return response.data;
	};

	public fillSlot = async (
		data: http.FillSlotRequestBody,
	): Promise<http.SuccessResponse> => {
		const response = await axios.post<http.SuccessResponse>(
			`${this.baseUrl}/inbox/slot/packet`,
			data,
		);
		return response.data;
	};

	public getNextConsumableSlot = async (
		data: http.GetInboxRequestParams,
	): Promise<http.SlotConsumable> => {
		const response = await axios.get<http.SlotConsumable>(
			`${this.baseUrl}/inbox/${data.publicKey}/slot`,
		);
		return response.data;
	};

	public markSlotAsConsumed = async (
		data: http.MarkSlotAsConsumedBody,
	): Promise<void> => {
		await axios.post<http.SlotConsumable>(
			`${this.baseUrl}/inbox/${data.publicKey}/slot/consumed`,
			data,
		);
	};
}
