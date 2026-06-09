# Security Policy

## Supported Versions

The following versions of `@deck-shelves/api` currently receive security updates.

| Version                 | Supported |
| ----------------------- | --------- |
| Latest published release | ✅        |
| Previous minor release   | ✅        |
| Older releases           | ❌        |

> Because the package is under active development, consumers are encouraged to
> always stay on the latest published release.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### Preferred Contact

Open a private security report through GitHub Security Advisories:

* [https://github.com/santojon/Deck-Shelves-API/security/advisories](https://github.com/santojon/Deck-Shelves-API/security/advisories)

If private advisories are unavailable, contact the maintainer directly before
publicly disclosing the issue.

---

## What to Include

Please include as much information as possible:

* Vulnerability type
* Steps to reproduce (a minimal code snippet is highly appreciated)
* Expected vs actual behavior
* Impact assessment
* Suggested mitigation or patch (optional)

---

## Disclosure Policy

* Do not publicly disclose vulnerabilities before a fix is available.
* Security issues will be investigated as quickly as possible.
* Once resolved, fixes may be documented in release notes or advisories.

---

## Scope

This package is a **dependency-free TypeScript client** that talks to the
`window.deckShelves` runtime global. In scope:

* The `register()` pending-queue logic and its `Unsubscribe` semantics
* Type-contract mismatches that could let untrusted data flow unchecked into a host
* Supply-chain integrity of the published npm artifact (provenance, lockfile)
* Prototype-pollution or global-namespace tampering via the symbol-keyed queue

Generally **out of scope** unless they lead to a practical exploit:

* Vulnerabilities in the Deck Shelves plugin runtime itself (report those at
  the [plugin repo](https://github.com/santojon/Deck-Shelves))
* Issues caused exclusively by a consumer's own bundler/runtime misconfiguration
* Theoretical-only attacks without a realistic exploitation path

---

## Security Goals

This package aims to:

* Ship **zero runtime dependencies**
* Avoid touching the global namespace beyond a single `Symbol.for` key
* Never execute arbitrary external code
* Publish with **npm provenance** so the artifact is traceable to this repo + CI

---

## Dependency Management

Dev dependencies are reviewed periodically for known CVEs, supply-chain risks,
and unmaintained packages. The published package has no runtime dependencies.
