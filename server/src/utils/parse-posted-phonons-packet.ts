import TVLCollection from './TVL';

type Cert = {
	publicKey: string;
	signature: string;
};

type TransferPacket = {
	nonce: number;
	cert: Cert;
	phonons: any;
};

type Phonon = {
	publicKey: string;
};

const TAG_TRANSFER_PACKET = 67;
// const TAG_SIGNATURE = 147;
const TAG_PHONON_DESCRIPTION = 68;
const TAG_PHONON_PUBLIC_KEY = 128;
// const TAG_PHONON_PRIVATE_KEY = 129;
const TAG_CARD_CERT = 144;
const TAG_NONCE = 151;

export const parsePostedPhononTransaction = (
	packet: string,
): TransferPacket => {
	const tvl = new TVLCollection(hexToBytes(packet));

	const nonceBytes = tvl.getValue(TAG_NONCE);

	if (!nonceBytes) {
		throw new Error('No "nonce" tag found');
	}

	const cardCertBytes = tvl.getValue(TAG_CARD_CERT);

	if (!cardCertBytes) {
		throw new Error('No "card cert" tag found');
	}

	const transferPacketBytes = tvl.getValue(TAG_TRANSFER_PACKET);

	if (!transferPacketBytes) {
		throw new Error('No "transfer packet" tag found');
	}

	return {
		nonce: parseInt(nonceBytes.join(''), 16),
		cert: parseCert(cardCertBytes),
		phonons: parsePhonons(transferPacketBytes),
	};
};

const parsePhonons = (bytes: number[]): Phonon[] => {
	const tvl = new TVLCollection(bytes);

	const phononsBytes = tvl.getValues(TAG_PHONON_DESCRIPTION);

	return phononsBytes.map((phononBytes: number[]): Phonon => {
		const phononTvl = new TVLCollection(phononBytes);
		const publicKeyBytes = phononTvl.getValue(TAG_PHONON_PUBLIC_KEY);

		if (!publicKeyBytes) {
			throw new Error('No "public key" tag found');
		}

		const publicKey = bytesToHex(publicKeyBytes);

		return {
			publicKey,
		};
	});
};

const parseCert = (bytes: number[]): Cert => {
	// const certType = bytes[0];
	const certLen = bytes[1];
	// const permType = bytes[2];
	const permLen = bytes[3];
	// const permissions = bytes.slice(4, 4 + permLen);
	// const pubKeyType = bytes[4 + permLen];
	const pubKeyLen = bytes[5 + permLen];

	const publicKey = bytesToHex(
		bytes.slice(6 + permLen, 6 + permLen + pubKeyLen),
	);

	const signature = bytesToHex(bytes.slice(6 + permLen + pubKeyLen, certLen));

	return {
		publicKey,
		signature,
	};
};

const hexToBytes = (hex: string) => {
	for (var bytes = [], c = 0; c < hex.length; c += 2)
		bytes.push(parseInt(hex.substr(c, 2), 16));
	return bytes;
};

const bytesToHex = (array: number[]) =>
	Array.from(array, function (byte) {
		return ('0' + (byte & 0xff).toString(16)).slice(-2);
	}).join('');
