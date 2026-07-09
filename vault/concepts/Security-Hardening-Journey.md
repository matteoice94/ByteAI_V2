---
type: concept
title: "Security Hardening Journey"
created: 2026-07-09
updated: 2026-07-09
tags: [security, passwords, bcrypt, jwt, flask]
complexity: basic
aliases: ["Security Fixes", "Security Migration"]
related: ["[[Password-Migration-Pattern|Password Migration Pattern]]"]
sources: ["[[incident-log-2026-07-09]]"]
summary: "Three critical security fixes applied to the MLPG project: SHA-256→bcrypt password migration, Flask debug mode removal, and JWT secret stabilization."
---

# Security Hardening Journey

Three security vulnerabilities were discovered and fixed in the MLPG project, each representing a different class of security problem.

## 1. Password Hashing: SHA-256 → bcrypt (June 26 → July 6)

**Original state (insecure)**:
```python
hashlib.sha256(f"{password}{mlpg_salt_2026_xyz}".encode()).hexdigest()
```

Problems:
- Salt was hardcoded `mlpg_salt_2026_xyz` in source code
- Same salt for all users → rainbow table attacks
- SHA-256 is designed for speed, not password hashing

**Solution**: bcrypt with per-user salt + backward compatibility:
- New users: straight bcrypt
- Legacy users: on correct login, SHA-256 hash verified first, then migrated to bcrypt transparently
- See [[Password-Migration-Pattern|Password Migration Pattern]] for full details

## 2. Flask Debug Mode (July 6)

**Original state (dangerous)**:
```python
app.run(debug=True)  # In production!
```

Problems:
- Werkzeug debugger console exposed → arbitrary code execution
- Stack traces with environment variables visible to any visitor
- Interactive debugger allows Python execution from browser

**Solution**: Environment variable control:
```python
app.run(debug=os.getenv("FLASK_DEBUG", "False").lower() == "true")
```

## 3. JWT Secret Ephemeral (July 9)

**Original state (broken)**:
```python
_secret = "mlpg-secret-" + str(hash(time.time()))  # Changes every restart!
```

Problems:
- Every Flask restart invalidated all existing tokens
- Users forced to re-login on deploy
- No real security gained from rotation (predictable via time)

**Solution**: Fixed secret for dev, env var for production:
```python
_secret = os.getenv("SECRET_KEY", "mlpg-v2-dev-secret-key-2026")
```

## Security Lesson

Each vulnerability was "obvious in hindsight" but survived weeks of development:
1. Hardcoded secrets are the most common security anti-pattern
2. Framework defaults (Flask debug=True) must be explicitly overridden
3. Secrets that change unpredictably are as harmful as secrets that are too predictable
