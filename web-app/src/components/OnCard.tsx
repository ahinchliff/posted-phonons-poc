import * as React from 'react';
import { usePhononStore } from '../stores/PhononStore';
import { truncateAddress } from '../utils/format';
import SendModal from './SendModal';

const OnCardList: React.FC = () => {
	const { isSelectedSessionUnlocked, phonons, createPhonon } = usePhononStore();

	const [phononToSendIndex, setPhononToSendIndex] = React.useState<
		number | undefined
	>();

	const showLoading = isSelectedSessionUnlocked && !phonons;

	return (
		<div>
			<div className='flex justify-between items-end'>
				<h2 className='m-0'>On Card</h2>
				<button onClick={createPhonon}>
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
							d='M12 4v16m8-8H4'
						/>
					</svg>
				</button>
			</div>
			{showLoading && <span>loading...</span>}
			{phonons && !!phonons.length && (
				<table className='table table-compact'>
					<tbody>
						{phonons.map((phonon, index) => {
							return (
								<tr key={phonon.PubKey}>
									<td>{index}</td>
									<td>{truncateAddress(phonon.PubKey, 5, 5)}</td>
									<td className='text-right'>
										<button
											className='anchor'
											onClick={() => setPhononToSendIndex(phonon.KeyIndex)}
										>
											Send
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}
			{phonons && !phonons.length && (
				<>
					<p>
						You don't have any phonons. Either create one or get a phren to
						"post" you one.
					</p>
				</>
			)}
			<SendModal
				phononIndex={phononToSendIndex}
				onClose={() => setPhononToSendIndex(undefined)}
			/>
		</div>
	);
};

export default OnCardList;
