import * as React from 'react';
import { usePhononStore } from '../stores/PhononStore';

type Props = {
	children: React.ReactNode | React.ReactNode[];
};

const ConnectCardWrapper: React.FC<Props> = (props) => {
	const {
		sessions,
		isSelectedSessionUnlocked,
		noCardDetected,
		noClientDetected,
		selectedSession,
		unlockSession,
		selectSession,
		fetchSessions,
		createMockCard,
	} = usePhononStore();

	React.useEffect(() => {
		fetchSessions();
	}, [fetchSessions]);

	const content = (() => {
		if (!!noClientDetected) {
			return <NoClient />;
		}

		if (!!noCardDetected) {
			return <NoCards onCreateMockCard={createMockCard} />;
		}

		if (!isSelectedSessionUnlocked && selectedSession) {
			return <Unlock onSubmit={unlockSession} />;
		}

		if (!isSelectedSessionUnlocked && sessions && sessions.length > 1) {
			return (
				<Sessions
					sessions={sessions}
					onSelectSession={(session: string) => selectSession(session)}
				/>
			);
		}

		return props.children;
	})();

	return <div>{content}</div>;
};

export default ConnectCardWrapper;

const NoClient: React.FC = () => {
	return (
		<div>
			<h3>No phonon client detected.</h3>
			<p>
				This app requires a forked version of the{' '}
				<a href='https://github.com/ahinchliff/phonon-client'>phonon client</a>{' '}
				to be running locally at port 8080. Please start the client without any
				phonon cards connected.
			</p>
			<div className='mockup-code'>
				<pre data-prefix='$'>
					<code>git clone https://github.com/ahinchliff/phonon-client</code>
				</pre>
				<pre data-prefix='$'>
					<code>cd phonon-client</code>
				</pre>
				<pre data-prefix='$'>
					<code>git checkout posted-phonons</code>
				</pre>
				<pre data-prefix='$'>
					<code>go run main/phonon.go webUI</code>
				</pre>
			</div>
		</div>
	);
};

const NoCards: React.FC<{ onCreateMockCard: () => Promise<void> }> = (
	props,
) => {
	return (
		<div>
			<h3>No phonon cards detected.</h3>
			<p>
				Creating and sending posted phonons is currently on supported on mock
				cards. The pin for mock cards is always "111111". Please create a mock
				card below.
			</p>
			<button className='btn btn-primary' onClick={props.onCreateMockCard}>
				Create mock card
			</button>
		</div>
	);
};

const Sessions: React.FC<{
	sessions: string[];
	onSelectSession: (session: string) => void;
}> = (props) => {
	return (
		<div>
			<h3>Select a card</h3>
			<ul>
				{props.sessions.map((session) => (
					<li key={session}>
						<button
							className='anchor'
							onClick={() => props.onSelectSession(session)}
						>
							{session}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

const Unlock: React.FC<{
	onSubmit: (pin: string) => Promise<void>;
}> = (props) => {
	const [pin, setPin] = React.useState('');

	return (
		<div>
			<h3>Unlock your card</h3>
			<input
				type='text'
				value={pin}
				onChange={(e) => setPin(e.target.value)}
				placeholder='Pin'
				className='input input-bordered w-full'
			/>
			<button
				className='btn btn-primary w-full mt-5'
				onClick={() => props.onSubmit(pin)}
				disabled={pin.length === 0}
			>
				Unlock
			</button>
		</div>
	);
};
