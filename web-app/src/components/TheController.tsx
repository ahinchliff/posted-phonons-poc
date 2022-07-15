import * as React from 'react';
import { usePhononStore } from '../stores/PhononStore';
import { useInboxStore } from '../stores/InboxStore';

// Do all cross store reactions here so it is easier to track and optimize.
const TheController: React.FC = () => {
	const { publicKey } = usePhononStore();
	const { fetchInbox } = useInboxStore();

	React.useEffect(() => {
		if (publicKey) {
			fetchInbox(publicKey);
		}
	}, [publicKey, fetchInbox]);

	return <React.Fragment />;
};

export default TheController;
