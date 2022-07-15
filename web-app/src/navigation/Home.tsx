import * as React from 'react';
import ConnectCardWrapper from '../components/ConnectCardWapper';
import Inbox from '../components/Inbox';
import OnCardList from '../components/OnCard';

const Home: React.FC = () => {
	return (
		<div>
			<h1>Posted Phonons POC</h1>
			<ConnectCardWrapper>
				<div className='grid grid-cols-2 gap-20'>
					<OnCardList />
					<Inbox />
				</div>
			</ConnectCardWrapper>
		</div>
	);
};

export default Home;
