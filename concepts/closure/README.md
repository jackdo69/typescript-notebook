# Closures

## What is a Closure?

A closure is a function that remembers variables from its outer scope, even after the outer function has finished executing.

## Basic Example

```typescript
function outer() {
  const message = "Hello";

  function inner() {
    console.log(message); // Accesses 'message' from outer
  }

  return inner;
}

const fn = outer();
fn(); // "Hello" - 'message' is still accessible!
```

Even though `outer()` finished executing, `inner()` still has access to `message`. This is a closure.

## Why Use Closures?

### 1. **Private Variables** - Data Encapsulation

```typescript
function createCounter() {
  let count = 0; // Private!

  return {
    increment() { return ++count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
// counter.count; // undefined - can't access directly!
```

### 2. **Function Factories** - Create Customized Functions

```typescript
function createMultiplier(multiplier: number) {
  return function(value: number) {
    return value * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

double(5); // 10
triple(5); // 15
```

### 3. **Memoization** - Cache Results

```typescript
function createMemoized(fn: (n: number) => number) {
  const cache = new Map();

  return function(n: number) {
    if (cache.has(n)) return cache.get(n);

    const result = fn(n);
    cache.set(n, result);
    return result;
  };
}
```

## How It Works

When a function is created, it captures its surrounding scope:

```typescript
function outer() {
  const x = 10;
  const y = 20;

  return function() {
    return x + y; // Captures x and y
  };
}

const fn = outer();
// x and y are "remembered" inside fn
```

## Common Patterns

### Module Pattern
```typescript
const Module = (function() {
  let private = "secret";

  return {
    getPrivate() { return private; }
  };
})();

Module.getPrivate(); // "secret"
// Module.private; // undefined
```

### Event Handlers
```typescript
function setupHandler(id: string) {
  let count = 0;

  return function() {
    count++;
    console.log(`${id} clicked ${count} times`);
  };
}

const handler = setupHandler("btn");
handler(); // "btn clicked 1 times"
handler(); // "btn clicked 2 times"
```

## Common Pitfall - Loop with var

**Wrong:**
```typescript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3 - all closures share same 'i'
```

**Correct:**
```typescript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2 - 'let' creates new binding each iteration
```

## Real-World Uses

✓ Creating private state in modules
✓ Event handlers that need to remember context
✓ Memoization and caching
✓ Function factories
✓ Partial application
✓ API clients with configuration

## Key Concept

A closure = Function + Its Captured Environment

The function "closes over" the variables it needs from outer scopes.
