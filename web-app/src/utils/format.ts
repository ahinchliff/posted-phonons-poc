export const truncateAddress = (
	address: string,
	startChars: number = 6,
	endChars: number = 4,
) => {
	return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};
