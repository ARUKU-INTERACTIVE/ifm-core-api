[Back To Index](/README.md)

# Project Structure

The project follows the directory and file structure as shown below:

```plaintext
src/
└── module/
    └── {module-name}/
        ├── application/
        │   ├── dto/
        │   ├── service/
        │   ├── adapter/
        │   ├── mapper/
        │   ├── policy/
        │   └── enum/
        ├── domain/
        │   ├── entity.ts
        │   ├── entity-name.ts
        │   └── entity.spec.ts
        ├── infrastructure/
        │   ├── database/
        │   │   ├── repository.postgresql.repository.ts
        │   │   ├── schema.ts
        │   │   └── exception/
        │   └── exception/
        ├── interface/
        │   └── controller.ts
        └── tests/
            ├── fixture/
            │   ├── entity-fixture.yml
            │   ├── User.yml
            └── (other test files)
            └── e2e.spec.ts
```
