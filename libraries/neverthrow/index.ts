import { Result, ok, err, ResultAsync, fromThrowable } from "neverthrow";

// ============================================
// 1. Basic Usage - ok() and err()
// ============================================
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return err("Division by zero");
  }
  return ok(a / b);
}

const result = divide(10, 2);

// Check result type
console.log(result.isOk()); // true
console.log(result.isErr()); // false

// Handle both cases
result.match(
  (value) => console.log("Success:", value),
  (error) => console.error("Error:", error)
);

// Unwrap with default
console.log(divide(10, 0).unwrapOr(0)); // 0

// ============================================
// 2. Chaining Operations
// ============================================
type User = { id: number; name: string; age: number };

function findUser(id: number): Result<User, string> {
  if (id === 1) {
    return ok({ id: 1, name: "Alice", age: 30 });
  }
  return err("User not found");
}

function checkAge(user: User): Result<User, string> {
  if (user.age >= 18) {
    return ok(user);
  }
  return err("User is under 18");
}

// Chain with andThen and map
const userName = findUser(1)
  .andThen(checkAge) // Only runs if findUser succeeds
  .map((user) => user.name); // Transform the value

console.log(userName.unwrapOr("Unknown")); // "Alice"

// ============================================
// 3. Async Operations - Network Requests
// ============================================
type ApiError =
  | { type: "network"; message: string }
  | { type: "http"; status: number }
  | { type: "parse"; message: string };

function fetchUser(id: number): ResultAsync<User, ApiError> {
  return ResultAsync.fromPromise(
    (async () => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/users/${id}`
      );
      if (!res.ok) throw { status: res.status };
      return (await res.json()) as User;
    })(),
    (error) => {
      // Network errors: timeout, DNS failure, no connection
      if (error instanceof TypeError) {
        return { type: "network", message: error.message };
      }

      // HTTP errors: 404, 500, etc.
      if (error && typeof error === "object" && "status" in error) {
        return { type: "http", status: error.status as number };
      }

      // Other errors
      return { type: "parse", message: String(error) };
    }
  );
}

// Chain async operations
fetchUser(1)
  .map((user) => user.name)
  .match(
    (name) => console.log("User name:", name),
    (error) => {
      switch (error.type) {
        case "network":
          console.error("Connection failed:", error.message);
          break;
        case "http":
          console.error("HTTP error:", error.status);
          break;
        case "parse":
          console.error("Parse error:", error.message);
          break;
      }
    }
  );

// ============================================
// 4. Handling Throwing Functions
// ============================================
const safeParse = fromThrowable(
  JSON.parse,
  (error) => `Parse error: ${error}`
);

const parsed = safeParse('{"name": "Alice"}');
parsed.match(
  (data) => console.log("Parsed:", data),
  (error) => console.error(error)
);

// ============================================
// 5. Practical Example - Form Validation
// ============================================
type FormData = {
  email: string;
  password: string;
};

function validateEmail(email: string): Result<string, string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
    ? ok(email)
    : err("Invalid email format");
}

function validatePassword(password: string): Result<string, string> {
  return password.length >= 8
    ? ok(password)
    : err("Password must be at least 8 characters");
}

function validateForm(email: string, password: string): Result<FormData, string> {
  return validateEmail(email).andThen((validEmail) =>
    validatePassword(password).map((validPassword) => ({
      email: validEmail,
      password: validPassword,
    }))
  );
}

const formResult = validateForm("user@example.com", "password123");
formResult.match(
  (data) => console.log("Valid form:", data),
  (error) => console.error("Validation error:", error)
);

// ============================================
// 6. Combining Multiple Results
// ============================================
const r1 = ok(1);
const r2 = ok(2);
const r3 = ok(3);

const combined = Result.combine([r1, r2, r3]);
combined.match(
  (values) => console.log("All succeeded:", values), // [1, 2, 3]
  (error) => console.log("At least one failed:", error)
);

// ============================================
// 7. Type Aliases for Clarity
// ============================================
type DbError = { code: number; message: string };
type DbResult<T> = Result<T, DbError>;

function findUserInDb(id: number): DbResult<User> {
  if (id === 1) {
    return ok({ id: 1, name: "Bob", age: 25 });
  }
  return err({ code: 404, message: "User not found" });
}

findUserInDb(1).match(
  (user) => console.log("Found:", user),
  (error) => console.error(`Error ${error.code}: ${error.message}`)
);

export {};
