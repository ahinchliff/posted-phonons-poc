import axios from 'axios';

export type Phonon = {
	KeyIndex: number;
	PubKey: string;
	Value: number;
	CurrencyType: number;
};

export default class PhononClient {
	constructor(private baseUrl: string) {}

	public fetchSessions = async (): Promise<string[]> => {
		const sessionsResponse = await axios.get<{ Id: string }[]>(
			`${this.baseUrl}/listSessions`,
		);

		return sessionsResponse.data.map((session) => session.Id);
	};

	public selectSession = async (
		session: string,
		pin: string,
	): Promise<void> => {
		await axios.post(`${this.baseUrl}/cards/${session}/unlock`, {
			pin,
		});
	};

	public fetchPhonons = async (session: string): Promise<Phonon[]> => {
		const response = await axios.get(
			`${this.baseUrl}/cards/${session}/listPhonons`,
		);

		return response.data === null ? [] : response.data;
	};

	public createPostedPhononPacket = async (
		session: string,
		phononKeyIndex: number,
		receipientsPublicKey: string,
		nonce: number,
	): Promise<string> => {
		const result = await axios.post<{ Packet: string }>(
			`${this.baseUrl}/cards/${session}/phonon/post`,
			{
				RecipientsPublicKey: receipientsPublicKey,
				Nonce: nonce,
				KeyIndexes: [phononKeyIndex],
			},
		);

		return result.data.Packet;
	};

	public fetchNonce = async (session: string): Promise<number> => {
		const sessionsResponse = await axios.get<{ Nonce: number }>(
			`${this.baseUrl}/cards/${session}/postedPhononNonce`,
		);
		return sessionsResponse.data.Nonce;
	};

	public fetchIdentity = async (session: string): Promise<string> => {
		const sessionsResponse = await axios.get<{ PublicKey: string }>(
			`${this.baseUrl}/cards/${session}/identity/nonce`,
		);
		return sessionsResponse.data.PublicKey;
	};

	public consumePostedPhononPacket = async (
		session: string,
		packet: string,
	): Promise<void> => {
		await axios.post(`${this.baseUrl}/cards/${session}/receivePostedPhonons`, {
			Packet: packet,
		});
	};

	public createPhonon = async (session: string): Promise<void> => {
		await axios.post(`${this.baseUrl}/cards/${session}/phonon/create`);
	};

	public createMockCard = async (): Promise<void> => {
		await axios.get(`${this.baseUrl}/genMock`);
	};
}
