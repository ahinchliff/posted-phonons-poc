type TVL = {
	tag: number;
	value: number[];
};

export default class TVLCollection {
	public tvls: TVL[];

	constructor(bytes: number[]) {
		let index = 0;
		const results: TVL[] = [];
		while (index < bytes.length) {
			const tag = bytes[index];
			const length = bytes[index + 1];
			const dataEndingIndex = index + 2 + length;
			const value = bytes.slice(index + 2, dataEndingIndex);
			results.push({ tag, value });
			index = dataEndingIndex;
		}
		this.tvls = results;
	}

	public getValues = (tag: number): number[][] =>
		this.tvls.filter((tvl) => tvl.tag === tag).map((tvl) => tvl.value);

	public getValue = (tag: number): number[] => this.getValues(tag)[0];
}
