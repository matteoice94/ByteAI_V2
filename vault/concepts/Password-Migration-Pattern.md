---
type: concept
title: "Password Migration Pattern"
created: 2026-07-08
updated: 2026-07-08
tags: [security, auth, bcrypt, sha256, migration]
complexity: intermediate
aliases: ["Legacy Password Migration", "Hash Upgrade on Login"]
related: ["[[database-py-2026-07-08]]", "[[Dual Backend Abstraction]]"]
sources: ["[[database-py-2026-07-08]]"]
---

# Password Migration Pattern

Strategy for upgrading password hashing from legacy fixed-salt SHA-256 to bcrypt without forcing all users to reset their passwords.

## Problem
MLPG originally used `hashlib.sha256(password + "mlpg_salt_2026_xyz")` which had a fixed, hardcoded salt. This is vulnerable to rainbow table attacks. The fix was bcrypt with per-user random salt, but existing users' hashes still used SHA-256.

## Solution: Migrate-on-Login

```
authenticate_user(username, password):
    1. Fetch stored hash from DB
    2. Try bcrypt.checkpw(password, stored)
       → if match: user is already migrated, return success
    3. Check if stored hash is SHA-256 (64 hex chars)
       → if not: unknown format, return failure
    4. Compute legacy hash: sha256(password + fixed_salt)
       → if no match: return failure
    5. Hash password with bcrypt:
       new_hash = bcrypt.hashpw(password, bcrypt.gensalt())
    6. UPDATE users SET password = new_hash WHERE id = user_id
    7. Log migration, return success
```

## Key Design Decisions

### Detection by Length
`_is_legacy_sha256()` identifies legacy hashes by their format: exactly 64 lowercase hex characters. bcrypt hashes start with `$2b$` and are longer.

### No Forced Reset
Users never know the migration happened. One successful login automatically upgrades their hash. No email, no forced password change.

### One-Shot Migration
Once migrated, the hash is bcrypt. The `_is_legacy_sha256()` check returns False on subsequent logins, and bcrypt verification succeeds normally.

### Fixed Salt is Hardcoded
The legacy salt `"mlpg_salt_2026_xyz"` is compiled into the binary. This is acceptable because:
1. Legacy users are automatically migrated on next login
2. The salt is only used to verify (not create) legacy hashes
3. Once migrated, bcrypt provides per-user random salt
