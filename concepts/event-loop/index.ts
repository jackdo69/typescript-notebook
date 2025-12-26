// ============================================
// 1. Basic Event Loop - Order of Execution
// ============================================
console.log("1. Synchronous code - Start");

setTimeout(() => {
  console.log("2. setTimeout (Macrotask)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Promise (Microtask)");
});

console.log("4. Synchronous code - End");

// Output order:
// 1. Synchronous code - Start
// 4. Synchronous code - End
// 3. Promise (Microtask)
// 2. setTimeout (Macrotask)

// ============================================
// 2. Call Stack Example
// ============================================
function first() {
  console.log("Inside first");
  second();
  console.log("First finished");
}

function second() {
  console.log("Inside second");
  third();
  console.log("Second finished");
}

function third() {
  console.log("Inside third");
}

first();
// Output:
// Inside first
// Inside second
// Inside third
// Second finished
// First finished

// ============================================
// 3. Microtasks vs Macrotasks
// ============================================
console.log("Start");

// Macrotasks
setTimeout(() => console.log("setTimeout 1"), 0);
setImmediate(() => console.log("setImmediate")); // Node.js only

// Microtasks
Promise.resolve().then(() => console.log("Promise 1"));
Promise.resolve().then(() => console.log("Promise 2"));
queueMicrotask(() => console.log("queueMicrotask"));

setTimeout(() => console.log("setTimeout 2"), 0);

console.log("End");

// Output order:
// Start
// End
// Promise 1
// Promise 2
// queueMicrotask
// setTimeout 1
// setTimeout 2
// setImmediate

// ============================================
// 4. Nested Timers and Promises
// ============================================
setTimeout(() => {
  console.log("Timeout 1");

  Promise.resolve().then(() => {
    console.log("Promise inside Timeout 1");
  });

  setTimeout(() => {
    console.log("Timeout 2 (nested)");
  }, 0);
}, 0);

Promise.resolve().then(() => {
  console.log("Promise 1");

  setTimeout(() => {
    console.log("Timeout inside Promise 1");
  }, 0);
});

// Output order:
// Promise 1
// Timeout 1
// Promise inside Timeout 1
// Timeout 2 (nested)
// Timeout inside Promise 1

// ============================================
// 5. Process.nextTick (Node.js) - Highest Priority
// ============================================
console.log("Script start");

setTimeout(() => console.log("setTimeout"), 0);

Promise.resolve().then(() => console.log("Promise"));

process.nextTick(() => console.log("nextTick"));

console.log("Script end");

// Output order:
// Script start
// Script end
// nextTick (runs before microtasks!)
// Promise
// setTimeout

// ============================================
// 6. Async/Await and Event Loop
// ============================================
async function asyncFunction() {
  console.log("Async start");

  await Promise.resolve();
  console.log("After await"); // This is a microtask

  return "Done";
}

console.log("Before async");
asyncFunction().then((result) => console.log(result));
console.log("After async");

// Output order:
// Before async
// Async start
// After async
// After await
// Done

// ============================================
// 7. Multiple Promise Chains
// ============================================
Promise.resolve()
  .then(() => console.log("Promise chain 1.1"))
  .then(() => console.log("Promise chain 1.2"));

Promise.resolve()
  .then(() => console.log("Promise chain 2.1"))
  .then(() => console.log("Promise chain 2.2"));

// Output order:
// Promise chain 1.1
// Promise chain 2.1
// Promise chain 1.2
// Promise chain 2.2

// ============================================
// 8. Practical Example - API Request Simulation
// ============================================
function fetchUser(id: number): Promise<{ id: number; name: string }> {
  console.log(`Fetching user ${id}...`);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`User ${id} fetched`);
      resolve({ id, name: `User ${id}` });
    }, 100);
  });
}

async function getUserData() {
  console.log("Start fetching users");

  const user1Promise = fetchUser(1);
  const user2Promise = fetchUser(2);

  // Both requests start immediately (parallel)
  const [user1, user2] = await Promise.all([user1Promise, user2Promise]);

  console.log("All users fetched:", user1, user2);
}

getUserData();

// Output:
// Start fetching users
// Fetching user 1...
// Fetching user 2...
// (after ~100ms)
// User 1 fetched
// User 2 fetched
// All users fetched: { id: 1, name: 'User 1' } { id: 2, name: 'User 2' }

// ============================================
// 9. Common Pitfall - Blocking the Event Loop
// ============================================
function blockingOperation() {
  console.log("Blocking start");

  // CPU-intensive synchronous operation
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // Blocks for 3 seconds
  }

  console.log("Blocking end");
}

setTimeout(() => console.log("This will be delayed!"), 0);

// blockingOperation(); // Uncomment to see blocking in action

console.log("After blocking call");

// ============================================
// 10. Event Loop Phases Visualization
// ============================================
function demonstratePhases() {
  // 1. Call Stack (Synchronous)
  console.log("1. Call Stack");

  // 2. Microtask Queue (Promises, queueMicrotask, process.nextTick)
  process.nextTick(() => console.log("2a. nextTick"));
  queueMicrotask(() => console.log("2b. Microtask"));
  Promise.resolve().then(() => console.log("2c. Promise"));

  // 3. Macrotask Queue (setTimeout, setInterval, setImmediate)
  setTimeout(() => console.log("3a. setTimeout"), 0);
  setImmediate(() => console.log("3b. setImmediate"));

  // 4. More synchronous code
  console.log("4. More sync code");
}

demonstratePhases();

// Output order:
// 1. Call Stack
// 4. More sync code
// 2a. nextTick
// 2b. Microtask
// 2c. Promise
// 3a. setTimeout
// 3b. setImmediate

export {};
