declare namespace data {
	interface IClientBase<Entity, NewEntity> {
		create(data: NewEntity, t?: data.DBTransaction): Promise<Entity>;
		createMany(data: NewEntity[], t?: data.DBTransaction): Promise<Entity[]>;
		delete(where: Partial<Entity>, t?: data.DBTransaction): Promise<number>;
		update(
			where: Partial<Entity>,
			data: Partial<Entity>,
			t?: data.DBTransaction,
		): Promise<Entity[]>;
		findOne(
			where: Partial<Entity>,
			t?: data.DBTransaction,
		): Promise<Entity | undefined>;
		findMany(where: Partial<Entity>, t?: data.DBTransaction): Promise<Entity[]>;
		search(
			where: Partial<Entity>,
			pagination: data.Pagination,
			t?: data.DBTransaction,
		): Promise<data.SearchResults<Entity>>;
	}
}
