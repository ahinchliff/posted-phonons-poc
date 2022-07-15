import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './navigation/Home';
import { PhononStoreProvider } from './stores/PhononStore';
import { InboxStoreProvider } from './stores/InboxStore';
import TheController from './components/TheController';

const App = () => {
	return (
		<div className='App prose container mx-auto p-5 sm:px-0'>
			<PhononStoreProvider>
				<InboxStoreProvider>
					<BrowserRouter>
						<Routes>
							<Route path='/' element={<Home />} />
						</Routes>
					</BrowserRouter>
					<TheController />
				</InboxStoreProvider>
			</PhononStoreProvider>
		</div>
	);
};

export default App;
