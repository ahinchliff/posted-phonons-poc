import { AxiosError } from 'axios';
import classNames from 'classnames';
import * as React from 'react';
import * as moment from 'moment';
import { inboxClient, useInboxStore } from '../stores/InboxStore';
import { usePhononStore } from '../stores/PhononStore';
import { truncateAddress } from '../utils/format';

const Inbox: React.FC = () => {
	const { inbox, noInbox, registerInbox, fetchInbox } = useInboxStore();
	const { nonce, publicKey, consumePosted } = usePhononStore();
	const showLoading = !inbox && (!noInbox || nonce === undefined || !publicKey);

	const consume = React.useCallback(async () => {
		if (!publicKey) {
			return;
		}
		const packet = await inboxClient.getNextConsumableSlot({ publicKey });
		await consumePosted(packet.packet);
		await inboxClient.markSlotAsConsumed({ publicKey, nonce: packet.nonce });
		await fetchInbox(publicKey);
	}, [publicKey, consumePosted, fetchInbox]);

	return (
		<div>
			<div className='flex justify-between items-end'>
				<h2 className='m-0'>Inbox {inbox && `(${inbox.inboxName})`}</h2>

				{!!inbox && !!publicKey && (
					<button onClick={() => fetchInbox(publicKey)}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth={2}
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
							/>
						</svg>
					</button>
				)}
			</div>
			{showLoading && <span>loading...</span>}
			{inbox && !inbox.phonons.length && (
				<p>
					You don't have any phonons in your inbox. Get a phren to send you one
					(you can send to yourself if you dont have any).
				</p>
			)}
			{inbox && !!inbox.phonons.length && (
				<table className='table table-compact'>
					<tbody>
						{inbox.phonons.map((phonon, index) => {
							return (
								<tr key={phonon.nonce}>
									<td>{index}</td>
									<td>{truncateAddress(phonon.phononPublicKey, 5, 5)}</td>
									<td className='text-right'>
										{index === 0 && (
											<ConsumeButton phonon={phonon} onClick={consume} />
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}
			{noInbox && nonce !== undefined && publicKey && (
				<Register
					nonce={nonce}
					publicKey={publicKey}
					registerInbox={registerInbox}
				/>
			)}
		</div>
	);
};

export default Inbox;

const Register: React.FC<{
	nonce: number;
	publicKey: string;
	registerInbox: (data: http.CreateInboxRequestBody) => Promise<void>;
}> = (props) => {
	const [username, setUsername] = React.useState<string>('');
	const [usernameTaken, setUsernameTaken] = React.useState<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(false);

	const registerInbox = async () => {
		setLoading(true);
		try {
			await props.registerInbox({
				inboxName: username,
				currentNonce: props.nonce,
				publicKey: props.publicKey,
			});
		} catch (error) {
			const err = error as AxiosError;
			if (err.response?.status === 400) {
				// assume username is taken
				setUsernameTaken(true);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<p>There is no phonon inbox assoicated with your card. Register below.</p>{' '}
			<p>
				A phonon inbox allows you to receive phonons while your card isn't
				online. It provides your card's public key and nonce to senders and
				stores the sent phonons until you are ready to load them onto your card.
			</p>
			<h4>Register</h4>
			<input
				type='text'
				placeholder='Desired username'
				className='input input-bordered w-full'
				onChange={(e) => {
					setUsernameTaken(false);
					setUsername(e.target.value);
				}}
				value={username}
			/>
			{usernameTaken && <p className='text-red-500'>Username taken</p>}
			<p>Card Nonce: {props.nonce}</p>
			<p>Card Public Key: {truncateAddress(props.publicKey)}</p>
			<button
				className={classNames('btn btn-primary w-full mt-5', {
					loading,
				})}
				disabled={username.length === 0}
				onClick={registerInbox}
			>
				Register
			</button>
		</div>
	);
};

const ConsumeButton: React.FC<{
	phonon: http.SlotReadyForConsumption;
	onClick: () => Promise<void>;
}> = (props) => {
	if (props.phonon.consumableAt) {
		const blockedUntil = moment.utc(props.phonon.consumableAt);

		return <span>Consumable in {blockedUntil.toNow()}</span>;
	}

	return (
		<button className='anchor' onClick={props.onClick}>
			Consume
		</button>
	);
};
