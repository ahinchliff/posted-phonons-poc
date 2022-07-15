import { AxiosError } from 'axios';
import * as React from 'react';
import InboxClient from '../clients/InboxClient';
import config from '../config';

type InboxStore = {
	inbox: http.Inbox | undefined;
	noInbox: boolean | undefined;
	fetchInbox: (cardPublicKey: string) => Promise<void>;
	registerInbox: (data: http.CreateInboxRequestBody) => Promise<void>;
};

const InboxStoreContext = React.createContext<InboxStore | undefined>(
	undefined,
);

export const inboxClient = new InboxClient(config.inboxUrl);

export const InboxStoreProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [noInbox, setNoInbox] = React.useState<boolean>();
	const [inbox, setInbox] = React.useState<http.Inbox>();

	const fetchInbox = React.useCallback(async (cardPublicKey: string) => {
		setInbox(undefined);
		setNoInbox(undefined);
		try {
			const inboxResult = await inboxClient.fetchInbox(cardPublicKey);
			setInbox(inboxResult);
		} catch (error) {
			const err = error as AxiosError;
			if (err.response?.status === 404) {
				setNoInbox(true);
			} else {
				console.error(error);
			}
		}
	}, []);

	const registerInbox = React.useCallback(
		async (data: http.CreateInboxRequestBody) => {
			const inboxResult = await inboxClient.registerInbox(data);
			setInbox(inboxResult);
			setNoInbox(false);
		},
		[],
	);

	const value = React.useMemo(
		() => ({
			inbox,
			noInbox,
			fetchInbox,
			registerInbox,
		}),
		[inbox, noInbox, registerInbox, fetchInbox],
	);

	return (
		<InboxStoreContext.Provider value={value}>
			{children}
		</InboxStoreContext.Provider>
	);
};

export const useInboxStore = () => {
	const context = React.useContext(InboxStoreContext);

	if (context === undefined) {
		throw new Error('useInboxStore must be used within a InboxStoreProvider');
	}
	return context;
};
