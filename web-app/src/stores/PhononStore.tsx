import { AxiosError } from 'axios';
import * as React from 'react';
import PhononClient, { Phonon } from '../clients/PhononClient';
import config from '../config';

type PhononStore = {
	sessions: string[] | undefined;
	isSelectedSessionUnlocked: boolean;
	noClientDetected: boolean;
	noCardDetected: boolean;
	selectedSession: string | undefined;
	nonce: number | undefined;
	publicKey: string | undefined;
	phonons: Phonon[] | undefined;
	fetchSessions: () => Promise<void>;
	selectSession: (session: string) => void;
	unlockSession: (pin: string) => Promise<void>;
	fetchPhonons: () => Promise<void>;
	createPostedPhononPacket: (
		keyIndex: number,
		recipientsPublicKey: string,
		nonce: number,
	) => Promise<string>;
	consumePosted: (packet: string) => Promise<void>;
	createMockCard: () => Promise<void>;
	createPhonon: () => Promise<void>;
};

const PhononStoreContext = React.createContext<PhononStore | undefined>(
	undefined,
);

const phononClient = new PhononClient(config.phononClientUrl);

export const PhononStoreProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [sessions, setSessions] = React.useState<string[]>();
	const [noClientDetected, setNoClientDetected] = React.useState<boolean>(true);
	const [noCardDetected, setNoCardDetected] = React.useState<boolean>(true);
	const [selectedSession, setSelectedSession] = React.useState<string>();
	const [isSelectedSessionUnlocked, setIsSelectedSessionUnlocked] =
		React.useState<boolean>(false);
	const [phonons, setPhonons] = React.useState<card.Phonon[]>();
	const [nonce, setNonce] = React.useState<number>();
	const [publicKey, setPublicKey] = React.useState<string>();

	const fetchSessions = React.useCallback(async () => {
		setNoClientDetected(false);
		try {
			const sessions = await phononClient.fetchSessions();
			setSessions(sessions);
			if (sessions.length === 1) {
				setSelectedSession(sessions[0]);
			}
			setNoClientDetected(false);
			setNoCardDetected(false);
		} catch (e) {
			const err = e as AxiosError;
			console.log(err.code);
			if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
				setNoClientDetected(true);
			}

			if (err.response?.status === 404) {
				setNoCardDetected(true);
			}
		}
	}, []);

	const unlockSession = React.useCallback(
		async (pin: string) => {
			if (!selectedSession) {
				throw new Error('No session selected');
			}

			await phononClient.selectSession(selectedSession, pin);
			setIsSelectedSessionUnlocked(true);
		},
		[selectedSession],
	);

	const fetchPhonons = React.useCallback(async () => {
		if (!selectedSession) {
			throw new Error('No session selected');
		}

		try {
			const newPhonons = await phononClient.fetchPhonons(selectedSession);
			setPhonons(newPhonons);
		} catch (e) {
			console.error(e);
			setSelectedSession(undefined);
			setIsSelectedSessionUnlocked(false);
			setPhonons(undefined);
			throw e;
		}
	}, [selectedSession]);

	const createPostedPhononPacket = React.useCallback(
		async (keyIndex: number, recipientsPublicKey: string, nonce: number) => {
			if (!selectedSession) {
				throw new Error('No session selected');
			}
			const packet = await phononClient.createPostedPhononPacket(
				selectedSession,
				keyIndex,
				recipientsPublicKey,
				nonce,
			);

			await fetchPhonons();

			return packet;
		},
		[selectedSession, fetchPhonons],
	);

	const fetchNonce = React.useCallback(async () => {
		if (!selectedSession) {
			return;
		}

		const nonce = await phononClient.fetchNonce(selectedSession);
		setNonce(nonce);
	}, [selectedSession]);

	const fetchIdentity = React.useCallback(async () => {
		if (!selectedSession) {
			return;
		}

		const publicKey = await phononClient.fetchIdentity(selectedSession);
		setPublicKey(publicKey);
	}, [selectedSession]);

	const createMockCard = React.useCallback(async () => {
		await phononClient.createMockCard();
		await fetchSessions();
	}, [fetchSessions]);

	const createPhonon = React.useCallback(async () => {
		if (!selectedSession) {
			return;
		}
		await phononClient.createPhonon(selectedSession);
		await fetchPhonons();
	}, [selectedSession, fetchPhonons]);

	const consumePosted = React.useCallback(
		async (packet: string) => {
			if (!selectedSession) {
				return;
			}
			await phononClient.consumePostedPhononPacket(selectedSession, packet);
			await fetchPhonons();
		},
		[selectedSession, fetchPhonons],
	);

	React.useEffect(() => {
		if (!selectedSession || !isSelectedSessionUnlocked) {
			return;
		}

		fetchPhonons();
		fetchNonce();
		fetchIdentity();
	}, [
		selectedSession,
		isSelectedSessionUnlocked,
		fetchPhonons,
		fetchIdentity,
		fetchNonce,
	]);

	const value = React.useMemo(
		() => ({
			sessions,
			isSelectedSessionUnlocked,
			noClientDetected,
			noCardDetected,
			selectedSession,
			nonce,
			publicKey,
			phonons,
			fetchSessions,
			unlockSession,
			selectSession: setSelectedSession,
			fetchPhonons,
			createPostedPhononPacket,
			createMockCard,
			createPhonon,
			consumePosted,
		}),
		[
			sessions,
			isSelectedSessionUnlocked,
			noClientDetected,
			noCardDetected,
			selectedSession,
			nonce,
			publicKey,
			phonons,
			fetchSessions,
			unlockSession,
			setSelectedSession,
			fetchPhonons,
			createPostedPhononPacket,
			createMockCard,
			createPhonon,
			consumePosted,
		],
	);

	return (
		<PhononStoreContext.Provider value={value}>
			{children}
		</PhononStoreContext.Provider>
	);
};

export const usePhononStore = () => {
	const context = React.useContext(PhononStoreContext);

	if (context === undefined) {
		throw new Error('usePhononStore must be used within a PhononStoreProvider');
	}
	return context;
};
