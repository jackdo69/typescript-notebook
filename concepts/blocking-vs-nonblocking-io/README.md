# Blocking vs Non-Blocking I/O

## What's the Difference?

**Blocking I/O:** Code waits (blocks) until the operation completes before continuing.

**Non-Blocking I/O:** Code continues executing immediately. The operation completes in the background.

## Simple Comparison

### Blocking (Synchronous)

```typescript
console.log("1. Start");

const data = fs.readFileSync("file.txt"); // Waits here
console.log("2. File read");

console.log("3. End");

// Output: 1 → 2 → 3 (in order, always)
```

### Non-Blocking (Asynchronous)

```typescript
console.log("1. Start");

fs.readFile("file.txt", (err, data) => {
  console.log("3. File read"); // Runs later
});

console.log("2. End"); // Runs immediately

// Output: 1 → 2 → 3 (different order!)
```

## Visual Example

```
Blocking:
─────────────────────────────────
Code → Wait → Wait → Wait → Continue
       (blocked)

Non-Blocking:
─────────────────────────────────
Code → Continue immediately
       ↓
       Wait in background → Callback runs later
```

## Why Non-Blocking Matters

### Blocking Example (Server)
```typescript
// BAD: Server can only handle one request at a time
server.on('request', (req, res) => {
  const data = readFileSync('file.txt'); // Blocks!
  res.end(data);
});

// Request 1: Reading... (Request 2 waits)
// Request 2: Waiting... (Request 3 waits)
// Request 3: Waiting...
```

### Non-Blocking Example (Server)
```typescript
// GOOD: Server handles multiple requests concurrently
server.on('request', (req, res) => {
  readFile('file.txt', (err, data) => { // Doesn't block!
    res.end(data);
  });
});

// Request 1, 2, 3: All reading simultaneously!
```

## Types of Operations

### I/O Operations (Should be Non-Blocking)
- File system operations
- Network requests
- Database queries
- API calls

```typescript
// Non-blocking I/O
await readFile("file.txt");
await fetch("https://api.example.com");
await db.query("SELECT * FROM users");
```

### CPU Operations (Blocking is OK, or use Worker Threads)
- Calculations
- Data processing
- Parsing
- Compression

```typescript
// CPU-bound: Use worker threads for heavy work
const worker = new Worker('./calculate.js');
worker.postMessage(data);
```

## Async Patterns

### Callbacks
```typescript
fs.readFile("file.txt", (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

### Promises
```typescript
readFileAsync("file.txt")
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Async/Await
```typescript
try {
  const data = await readFileAsync("file.txt");
  console.log(data);
} catch (err) {
  console.error(err);
}
```

## Sequential vs Parallel

### Sequential (One after another)
```typescript
const file1 = await readFile("1.txt");
const file2 = await readFile("2.txt"); // Waits for file1
const file3 = await readFile("3.txt"); // Waits for file2

// Total time = time1 + time2 + time3
```

### Parallel (All at once)
```typescript
const [file1, file2, file3] = await Promise.all([
  readFile("1.txt"),
  readFile("2.txt"),
  readFile("3.txt")
]);

// Total time ≈ max(time1, time2, time3)
```

## Common Mistake

```typescript
// Wrong: Blocks the event loop
setTimeout(() => console.log("Timer"), 0);

const start = Date.now();
while (Date.now() - start < 3000) {} // CPU-bound blocking!

console.log("Done");

// "Timer" won't fire until while loop finishes!
```

## Node.js Sync Methods

Methods ending in `Sync` are blocking:

```typescript
fs.readFileSync()      // Blocking ✗
fs.writeFileSync()     // Blocking ✗
fs.readdirSync()       // Blocking ✗

fs.readFile()          // Non-blocking ✓
fs.writeFile()         // Non-blocking ✓
fs.readdir()           // Non-blocking ✓
```

## When to Use Blocking

✓ Startup/initialization (before server starts)
✓ CLI tools (one-time operations)
✓ Build scripts
✓ Simple scripts where concurrency doesn't matter

**Never use blocking I/O in:**
✗ HTTP servers
✗ Real-time applications
✗ Event handlers
✗ Long-running processes

## Key Takeaways

- **Blocking** = Wait for operation to complete
- **Non-blocking** = Continue immediately, handle result later
- Node.js is designed for non-blocking I/O
- Use async/await for non-blocking operations
- Avoid `Sync` methods in servers
- Use `Promise.all()` for parallel operations
- Use Worker Threads for CPU-intensive tasks
