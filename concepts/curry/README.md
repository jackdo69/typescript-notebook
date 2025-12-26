# Currying

## What is Currying?

Currying transforms a function with multiple arguments into a sequence of functions, each taking a single argument.

## Normal vs Curried

**Normal function:**
```typescript
function add(a: number, b: number, c: number) {
  return a + b + c;
}

add(1, 2, 3); // 6
```

**Curried function:**
```typescript
function addCurried(a: number) {
  return function(b: number) {
    return function(c: number) {
      return a + b + c;
    };
  };
}

addCurried(1)(2)(3); // 6
```

## Why Use Currying?

### 1. **Reusability** - Create specialized functions

```typescript
const buildURL = (protocol: string) => (domain: string) => (path: string) =>
  `${protocol}://${domain}/${path}`;

const https = buildURL("https");
const httpsGoogle = https("google.com");

httpsGoogle("search"); // "https://google.com/search"
httpsGoogle("maps");   // "https://google.com/maps"
```

### 2. **Partial Application** - Pre-fill arguments

```typescript
const greet = (greeting: string) => (name: string) =>
  `${greeting}, ${name}!`;

const sayHello = greet("Hello");

sayHello("Alice"); // "Hello, Alice!"
sayHello("Bob");   // "Hello, Bob!"
```

### 3. **Configuration** - Set up once, use many times

```typescript
const log = (level: string) => (module: string) => (message: string) =>
  `[${level}] [${module}] ${message}`;

const infoLog = log("INFO");
const authInfo = infoLog("Auth");

authInfo("User logged in");
authInfo("User logged out");
```

## Syntax

### Function Declaration
```typescript
function curry(a: number) {
  return function(b: number) {
    return a + b;
  };
}
```

### Arrow Functions (Cleaner)
```typescript
const curry = (a: number) => (b: number) => a + b;
```

## Common Patterns

### Generic Curry Helper
```typescript
function curry2<A, B, R>(fn: (a: A, b: B) => R) {
  return (a: A) => (b: B) => fn(a, b);
}

const sum = (a: number, b: number) => a + b;
const curriedSum = curry2(sum);

curriedSum(5)(10); // 15
```

### Discount Calculator
```typescript
const calculatePrice = (tax: number) => (discount: number) => (price: number) =>
  price * (1 - discount) * (1 + tax);

const usCalculator = calculatePrice(0.08); // 8% tax
const usBlackFriday = usCalculator(0.3);   // 30% off

usBlackFriday(100); // $75.60
```

## When to Use

✓ When you need to reuse function logic with different configurations
✓ When building specialized versions of generic functions
✓ When creating function factories
✓ When working with functional programming patterns

## When Not to Use

✗ Simple one-time operations
✗ When all arguments are always available at once
✗ When it makes code harder to read
