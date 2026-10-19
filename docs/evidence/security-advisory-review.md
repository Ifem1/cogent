# Development dependency advisory review

**Decision: accept the residual development-tooling risk for this submission and keep the finding visible.** The full-tree audit reports five high records, all from `braces@3.0.3` through `eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch`. The GitHub advisory says versions through 3.0.3 are affected and currently lists no patched release. The production-only audit is clean.

The package is used by the ESLint toolchain; Cogent does not install it in production and its runtime does not pass user-controlled glob patterns to `braces`. The package maintainer disputes the advisory’s exploitability and argues the existing input-length guard bounds the cited nesting. The advisory remains unpatched and visible in `npm audit`; the finding is not silenced or downgraded.

For local development and CI, run ESLint only against the checked-out project with its fixed configuration. Revisit this acceptance when a patched release or authoritative advisory update appears. This is a documented engineering risk acceptance, not a claim that `braces@3.0.3` is patched.

Sources: [GitHub advisory GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [upstream braces issue #70](https://github.com/micromatch/braces/issues/70).
