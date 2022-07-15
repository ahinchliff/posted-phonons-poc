import classNames from 'classnames';
import * as React from 'react';
import { inboxClient, useInboxStore } from '../stores/InboxStore';
import { usePhononStore } from '../stores/PhononStore';
import { truncateAddress } from '../utils/format';

const SendModal: React.FC<{
	phononIndex: number | undefined;
	onClose: () => void;
}> = (props) => {
	const { publicKey, phonons, createPostedPhononPacket } = usePhononStore();
	const { fetchInbox, inbox } = useInboxStore();

	const [inboxName, setInboxName] = React.useState<string>('');
	const [sending, setSending] = React.useState<boolean>(false);
	const [error, setError] = React.useState<boolean>(false);

	const phonon = phonons?.find((p) => p.KeyIndex === props.phononIndex);

	React.useEffect(() => {
		if (!phonon && props.phononIndex) {
			props.onClose();
		}
	}, [props, phonon]);

	const onSend = React.useCallback(async () => {
		if (props.phononIndex === undefined) {
			return;
		}

		setSending(true);

		try {
			const slot = await inboxClient.createSlot({ inboxName });

			const packet = await createPostedPhononPacket(
				props.phononIndex,
				slot.cardPublicKey,
				slot.nonce,
			);

			await inboxClient.fillSlot({
				inboxName,
				packet,
			});

			if (inbox?.inboxName === inboxName && publicKey) {
				await fetchInbox(publicKey);
			}

			props.onClose();
		} catch (error) {
			// going to assume username doesnt exist
			console.log(error);
			setError(true);
		} finally {
			setSending(false);
		}
	}, [
		props,
		inboxName,
		inbox,
		publicKey,
		fetchInbox,
		createPostedPhononPacket,
	]);

	if (props.phononIndex === undefined || !phonon) {
		return null;
	}

	return (
		<div className='modal modal-open'>
			<div className='modal-box relative'>
				<label
					className='btn btn-sm btn-circle absolute right-2 top-2'
					onClick={props.onClose}
				>
					✕
				</label>
				<h3 className='text-lg font-bold'>Send Phonon</h3>
				<p>{truncateAddress(phonon.PubKey, 10, 10)}</p>
				<input
					type='text'
					placeholder="Recipient's username"
					className='input input-bordered w-full'
					onChange={(e) => {
						setError(false);
						setInboxName(e.target.value);
					}}
					value={inboxName}
				/>
				{!!error && <p className='text-red-500'>Cant find user</p>}
				<button
					className={classNames('btn btn-primary w-full mt-5', {
						loading: sending,
					})}
					disabled={inboxName.length === 0}
					onClick={onSend}
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default SendModal;
