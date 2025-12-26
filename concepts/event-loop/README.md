# Event Loop

## What is the Event Loop?

The event loop is how JavaScript handles asynchronous operations in a single-threaded environment. It continuously checks if the call stack is empty and processes tasks from queues.

## Execution Order

```
1. Call Stack (Synchronous code)
   ↓
2. Microtask Queue (Promises, process.nextTick)
   ↓
3. Macrotask Queue (setTimeout, setInterval, setImmediate)
   ↓
4. Repeat
```

## Basic Example

```typescript
console.log("1. Start");

setTimeout(() => console.log("3. setTimeout"), 0);

Promise.resolve().then(() => console.log("2. Promise"));

console.log("1. End");

// Output:
// 1. Start
// 1. End
// 2. Promise (microtask - runs first!)
// 3. setTimeout (macrotask - runs after microtasks)
```

## Key Concepts

### Call Stack
Executes synchronous code immediately. Last-In-First-Out (LIFO).

```typescript
function a() {
  b();
  console.log("a");
}
function b() {
  console.log("b");
}
a();
// Output: b, a
```

### Microtask Queue
High priority queue. Runs **after** current script, **before** macrotasks.

**Microtasks include:**
- `Promise.then()`, `Promise.catch()`, `Promise.finally()`
- `queueMicrotask()`
- `process.nextTick()` (Node.js - runs before other microtasks)

### Macrotask Queue
Lower priority queue. Runs **after** all microtasks complete.

**Macrotasks include:**
- `setTimeout()`
- `setInterval()`
- `setImmediate()` (Node.js)
- I/O operations

## Execution Flow

```typescript
console.log("Start");              // 1. Call Stack

setTimeout(() =>
  console.log("Macrotask"), 0);    // 4. Macrotask Queue

Promise.resolve().then(() =>
  console.log("Microtask"));       // 3. Microtask Queue

console.log("End");                // 2. Call Stack

// Output: Start → End → Microtask → Macrotask
```

## Process.nextTick (Node.js Only)

Runs **before** all other microtasks. Highest priority.

```typescript
Promise.resolve().then(() => console.log("Promise"));
process.nextTick(() => console.log("nextTick"));

// Output:
// nextTick (runs first!)
// Promise
```

## Async/Await

`await` creates a microtask for code after it.

```typescript
async function example() {
  console.log("1. Before await");
  await Promise.resolve();
  console.log("3. After await"); // Microtask
}

example();
console.log("2. Synchronous");

// Output: 1 → 2 → 3
```

## Common Pitfall - Blocking

Synchronous operations **block** the event loop.

```typescript
setTimeout(() => console.log("Timer"), 0);

// Blocks for 3 seconds
const start = Date.now();
while (Date.now() - start < 3000) {}

console.log("Done blocking");

// "Timer" won't run until blocking finishes!
```

## Visual Mental Model

```
┌─────────────────────────┐
│     Call Stack          │ ← Execute sync code
└──────────┬──────────────┘
           │ Empty?
           ↓
┌─────────────────────────┐
│   Microtask Queue       │ ← Promises, nextTick
│   - nextTick (Node.js)  │
│   - Promises            │
│   - queueMicrotask      │
└──────────┬──────────────┘
           │ Empty?
           ↓
┌─────────────────────────┐
│   Macrotask Queue       │ ← setTimeout, setImmediate
│   - setTimeout          │
│   - setInterval         │
│   - setImmediate        │
└──────────┬──────────────┘
           │
           └──→ Repeat
```

## Priority Order (Highest to Lowest)

1. Synchronous code (Call Stack)
2. `process.nextTick()` (Node.js)
3. Microtasks (Promises, queueMicrotask)
4. Macrotasks (setTimeout, setImmediate)

## Key Takeaways

- JavaScript is single-threaded
- Event loop manages async operations
- Microtasks run before macrotasks
- Never block the event loop with long synchronous operations
- Use async/await for cleaner asynchronous code
