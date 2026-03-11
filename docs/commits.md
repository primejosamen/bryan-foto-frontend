# Commits and Changelog

All commit messages **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is enforced via **commitlint** + **husky** on every commit.

## Format

```
type(scope): description
```

- **type**: Required. One of the allowed types below.
- **scope**: Optional. Area affected (e.g. `home`, `api`, `models`).
- **description**: Required. Imperative mood, lowercase.

## Allowed Types

| Type       | When to Use                                          |
|------------|------------------------------------------------------|
| `feat`     | A new feature                                        |
| `fix`      | A bug fix                                            |
| `docs`     | Documentation only changes                           |
| `style`    | Formatting, whitespace (no logic changes)            |
| `refactor` | Code restructuring without changing behavior         |
| `perf`     | Performance improvements                             |
| `test`     | Adding or fixing tests                               |
| `build`    | Build tooling, dependencies                          |
| `ci`       | CI/CD pipeline changes                               |
| `chore`    | Maintenance tasks                                    |
| `revert`   | Reverting a previous commit                          |

## Examples

```bash
feat(home): add rotating slot carousel
fix(api): handle null response from Strapi
refactor(models): extract interfaces to separate files
docs: add architecture documentation
build: configure commitlint and husky
chore: update dependencies
```

## Validation Rules

Defined in `commitlint.config.mjs`:

- **type** and **subject** are required.
- **type** must be one of the allowed types.
- **header** cannot exceed 100 characters.
