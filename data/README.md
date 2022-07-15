## Local Development

When creating a new migration or editing test data run `docker-compose down & docker-compose up` to see the changes reflected locally.

To add seed data for local development edit `ZDEV-dev-data`.

## Migrations

Migration files can be found in `./src/migrations`. These files need to follow a strict naming convention to ensure migrations are run in the correct order and it is clear in which environments they have been run. The naming convention also keeps the the files listed in a sensible order in your editor.

1. Files show be prefixed with `AProduction`, `BUAT` or `CNEW` to indicate where they have been applied.
2. After the environment prefix, a number is used to indicate the ordering within that environment.

For example if we had the following migration files

- `AProduction-01-initial-schema`
- `AProduction-02-add-phone-number-to-user`
- `BUAT-01-add-user-email-index`
- `CNew-01-rename-assets-tables`

And we applied `BUAT-01-add-user-email-index` to production we would end up with

- `AProduction-01-initial-schema`
- `AProduction-02-add-phone-number-to-user`
- `AProduction-03-add-user-email-index`
- `CNew-01-rename-assets-tables`
