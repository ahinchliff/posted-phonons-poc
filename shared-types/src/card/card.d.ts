declare namespace card {
	type PokemonType =
		| 'Psychic'
		| 'Water'
		| 'Colorless'
		| 'Fire'
		| 'Fighting'
		| 'Lightning'
		| 'Grass'
		| 'Trainer'
		| 'Energy';

	type Card = {
		cardNumber: number;
		publicKey: string;
		name: string;
		type: PokemonType;
		image: string;
	};

	type BoosterPack = {
		packNumber: number;
		hash: string;
	};

	type Phonon = {
		KeyIndex: number;
		PubKey: string;
		Value: number;
		CurrencyType: number;
	};
}
