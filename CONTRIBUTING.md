# Contributing to Brave Search Scraper

Thank you for considering contributing. Please read this before opening any
issues or pull requests.

## License notice

This project is licensed under **CC BY-NC-ND 4.0** (Attribution-NonCommercial-
NoDerivatives). You may view and run the code, but modifications, alterations,
and derivative works are not permitted. This applies to all contributions.

## How to contribute

Since the license does not permit modifications, the best ways to contribute are:

### Report bugs

Open a [GitHub Issue](https://github.com/GimiRick/Brave-Search-Scraper/issues)
with a clear title and description. Include steps to reproduce, expected
behavior, and actual behavior. If applicable, include logs or screenshots.

### Suggest features

Open a [GitHub Issue](https://github.com/GimiRick/Brave-Search-Scraper/issues)
with the `enhancement` label. Describe what you need and why. The maintainer
will review and implement accepted suggestions.

### Security issues

Do not open a public issue. Follow the process described in
[SECURITY.md](SECURITY.md).

## Commit message conventions (for maintainer)

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and publish (triggered manually via GitHub Actions). Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` → patch bump (1.0.x)
- `feat:` → minor bump (1.x.0)
- `BREAKING CHANGE:` → major bump (2.0.0)
- `docs:`, `chore:`, `test:` → no release

## Development setup (for running locally)

```bash
git clone https://github.com/GimiRick/Brave-Search-Scraper.git
cd Brave-Search-Scraper
npm install
```

## Running tests

```bash
npm test
npm run coverage
```

## Code style

This project uses ESLint and Prettier:

```bash
npm run lint
npm run format
```

Thank you for helping improve this project.
