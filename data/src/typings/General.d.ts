declare namespace data {
	type SearchResults<T> = {
		totalCount: number;
		items: T[];
	};

	type Pagination = {
		page: number;
		pageSize: number;
	};
}
