# neverthrow

## The Problem with `throw`

Using `throw` in JavaScript/TypeScript is **not type-safe**. It's as dangerous as using `any`.

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero"); // Bypasses type system!
  }
  return a / b;
}

// TypeScript can't warn you about the error
const result = divide(10, 0); // Runtime error!
```

Problems:
- Compiler doesn't enforce error handling
- No way to know what errors a function might throw
- Documentation can become outdated
- Runtime surprises

## The Solution: Result Type

neverthrow encodes errors **in the type system** using `Result<T, E>`:

```typescript
import { Result, ok, err } from "neverthrow";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return err("Division by zero"); // Type-safe error!
  }
  return ok(a / b);
}

// TypeScript forces you to handle both paths
const result = divide(10, 0);
result.match(
  (value) => console.log(value),
  (error) => console.error(error) // Must handle error
);
```

## Two Variants

### Ok<T, E> - Success
Contains a value of type `T`

```typescript
const success: Result<number, string> = ok(42);
```

### Err<T, E> - Failure
Contains an error of type `E`

```typescript
const failure: Result<number, string> = err("Something failed");
```

## Type Safety Benefits

### Self-Documenting
The function signature tells you everything:

```typescript
function fetchUser(id: number): Promise<Result<User, Error>>
```

This says:
- It's async (Promise)
- It can succeed with a User
- It can fail with an Error

No need to read documentation that might be outdated.

### Compiler Enforcement
TypeScript forces you to handle errors:

```typescript
const result = fetchUser(1);

// Compiler error if you only handle success:
// result.map(user => console.log(user)); // What about errors?

// Must handle both:
result.match(
  (user) => console.log(user),
  (error) => console.error(error)
);
```

## Core API

### Check result type
```typescript
result.isOk();   // true if success
result.isErr();  // true if error
```

### Unwrap values
```typescript
result.unwrapOr(defaultValue);  // Get value or default
result.match(onOk, onErr);      // Handle both cases
```

### Transform success
```typescript
ok(10)
  .map(n => n * 2)
  .map(n => n + 5); // ok(25)
```

### Transform errors
```typescript
err("Not found")
  .mapErr(msg => ({ code: 404, message: msg }));
```

### Chain operations
```typescript
findUser(id)
  .andThen(validateUser)
  .andThen(saveUser)
  .match(
    (user) => console.log("Success:", user),
    (error) => console.error("Failed:", error)
  );
```

## Type Aliases for Clarity

Instead of repeating `Result<T, DbError>`, create aliases:

```typescript
type DbResult<T> = Result<T, DbError>;

function findUser(id: number): DbResult<User> { ... }
function saveUser(user: User): DbResult<void> { ... }
```

This is clearer and more semantic.

## Async Operations

```typescript
import { ResultAsync } from "neverthrow";

function fetchUser(id: number): ResultAsync<User, string> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${id}`).then(r => r.json()),
    (error) => `Failed: ${error}`
  );
}

// Chain async operations
await fetchUser(1)
  .map(user => user.name)
  .mapErr(error => console.error(error));
```

## Handling Network Errors

The error mapper function (second parameter) catches **ALL thrown exceptions**, including network errors:

```typescript
type ApiError =
  | { type: 'network'; message: string }
  | { type: 'http'; status: number }
  | { type: 'parse'; message: string };

function fetchData(url: string): ResultAsync<Data, ApiError> {
  return ResultAsync.fromPromise(
    fetch(url).then(async (res) => {
      if (!res.ok) throw { status: res.status };
      return res.json();
    }),
    (error) => {
      // Network errors: timeout, DNS failure, no connection
      if (error instanceof TypeError) {
        return { type: 'network', message: error.message };
      }

      // HTTP errors: 404, 500, etc.
      if (error.status) {
        return { type: 'http', status: error.status };
      }

      // Parse errors
      return { type: 'parse', message: String(error) };
    }
  );
}

// Handle all error types uniformly
result.match(
  (data) => console.log('Success:', data),
  (error) => {
    switch (error.type) {
      case 'network':
        console.error('Connection failed:', error.message);
        break;
      case 'http':
        console.error('Server error:', error.status);
        break;
      case 'parse':
        console.error('Invalid response:', error.message);
        break;
    }
  }
);
```

**Key point:** Network errors (runtime exceptions) are converted to `Err` values through the mapper. No try/catch needed.

## Combining Results

```typescript
const r1 = ok(1);
const r2 = ok(2);
const r3 = ok(3);

Result.combine([r1, r2, r3]); // ok([1, 2, 3])

// If any fails, whole thing fails
const r4 = err("failed");
Result.combine([r1, r2, r4]); // err("failed")
```

## Handle Throwing Functions

```typescript
import { fromThrowable } from "neverthrow";

const safeParse = fromThrowable(
  JSON.parse,
  (error) => `Parse error: ${error}`
);

safeParse('{"valid": "json"}');  // ok(...)
safeParse('invalid');             // err("Parse error: ...")
```

## Real-World Example

```typescript
type ApiError = { code: number; message: string };

async function createUser(
  email: string,
  password: string
): Promise<Result<User, ApiError>> {
  return validateEmail(email)
    .andThen(() => validatePassword(password))
    .asyncAndThen(async (valid) => {
      return ResultAsync.fromPromise(
        api.createUser(valid),
        (error) => ({ code: 500, message: String(error) })
      );
    });
}

// Usage
const result = await createUser("user@example.com", "password123");

result.match(
  (user) => console.log("Created:", user),
  (error) => console.error(`Error ${error.code}: ${error.message}`)
);
```

## Key Takeaways

- `throw` bypasses the type system (unsafe)
- `Result<T, E>` makes errors part of the type (safe)
- Compiler enforces error handling
- Code is self-documenting
- No runtime surprises
- Chainable and composable

## When to Use

✓ Functions that can fail predictably
✓ API calls
✓ Database operations
✓ File I/O
✓ Validation
✓ Parsing

## Installation

```bash
npm install neverthrow
```
