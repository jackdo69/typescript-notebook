import { readFile, readFileSync } from "node:fs";
import { promisify } from "node:util";

const readFileAsync = promisify(readFile);

// ============================================
// 1. Blocking I/O - Synchronous Operations
// ============================================
console.log("1. Start");

try {
  // Blocks until file is completely read
  const data = readFileSync("./package.json", "utf8");
  console.log("2. File read (blocking):", data.substring(0, 50));
} catch (err) {
  console.error("Error:", err);
}

console.log("3. End");

// Output order is always:
// 1. Start
// 2. File read (blocking)
// 3. End

// ============================================
// 2. Non-Blocking I/O - Callback Style
// ============================================
console.log("1. Start");

// Returns immediately, doesn't wait for file read
readFile("./package.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("3. File read (non-blocking):", data.substring(0, 50));
});

console.log("2. End");

// Output order:
// 1. Start
// 2. End (executes before file is read!)
// 3. File read (non-blocking)

// ============================================
// 3. Non-Blocking I/O - Promise Style
// ============================================
async function readFileNonBlocking() {
  console.log("1. Start");

  // Doesn't block - returns a Promise
  const promise = readFileAsync("./package.json", "utf8");

  console.log("2. Reading initiated");

  const data = await promise; // Waits here without blocking event loop
  console.log("3. File read:", data.substring(0, 50));

  console.log("4. End");
}

readFileNonBlocking();

// ============================================
// 4. Comparison - CPU-Bound vs I/O-Bound
// ============================================

// CPU-Bound: Blocking (computation)
function calculateFibonacci(n: number): number {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

console.log("Computing...");
const result = calculateFibonacci(40); // Blocks for several seconds
console.log("Result:", result);

// I/O-Bound: Non-blocking (network, disk)
console.log("Fetching...");
fetch("https://jsonplaceholder.typicode.com/todos/1")
  .then((res) => res.json())
  .then((data) => console.log("Fetched:", data))
  .catch((err) => console.error("Fetch error:", err));
console.log("Fetch initiated (non-blocking)");

// ============================================
// 5. Multiple Blocking Operations
// ============================================
function multipleBlockingOps() {
  console.log("Start blocking ops");

  const file1 = readFileSync("./package.json", "utf8");
  console.log("File 1 size:", file1.length);

  const file2 = readFileSync("./tsconfig.json", "utf8");
  console.log("File 2 size:", file2.length);

  const file3 = readFileSync("./README.md", "utf8");
  console.log("File 3 size:", file3.length);

  console.log("End blocking ops");
}

// Each file read waits for the previous one to complete
// Total time = time1 + time2 + time3
// multipleBlockingOps();

// ============================================
// 6. Multiple Non-Blocking Operations (Sequential)
// ============================================
async function multipleNonBlockingSequential() {
  console.log("Start non-blocking sequential");

  const file1 = await readFileAsync("./package.json", "utf8");
  console.log("File 1 size:", file1.length);

  const file2 = await readFileAsync("./tsconfig.json", "utf8");
  console.log("File 2 size:", file2.length);

  const file3 = await readFileAsync("./README.md", "utf8");
  console.log("File 3 size:", file3.length);

  console.log("End non-blocking sequential");
}

// Still sequential, but doesn't block the event loop
// Other events can be processed while waiting
// multipleNonBlockingSequential();

// ============================================
// 7. Multiple Non-Blocking Operations (Parallel)
// ============================================
async function multipleNonBlockingParallel() {
  console.log("Start non-blocking parallel");

  // Start all reads simultaneously
  const [file1, file2, file3] = await Promise.all([
    readFileAsync("./package.json", "utf8"),
    readFileAsync("./tsconfig.json", "utf8"),
    readFileAsync("./README.md", "utf8"),
  ]);

  console.log("File 1 size:", file1.length);
  console.log("File 2 size:", file2.length);
  console.log("File 3 size:", file3.length);

  console.log("End non-blocking parallel");
}

// All reads happen in parallel
// Total time ≈ max(time1, time2, time3)
// multipleNonBlockingParallel();

// ============================================
// 8. Blocking vs Non-Blocking Visualization
// ============================================
function demonstrateBlocking() {
  console.log("=== Blocking Example ===");
  console.log("Task 1 start");

  // Simulates blocking I/O (bad practice)
  const start = Date.now();
  while (Date.now() - start < 2000) {
    // Blocks for 2 seconds
  }

  console.log("Task 1 done");
  console.log("Task 2 can now run");
}

function demonstrateNonBlocking() {
  console.log("=== Non-Blocking Example ===");
  console.log("Task 1 start");

  // Non-blocking I/O
  setTimeout(() => {
    console.log("Task 1 done");
  }, 2000);

  console.log("Task 2 runs immediately");
}

// demonstrateBlocking();
// demonstrateNonBlocking();

// ============================================
// 9. Real-World Example - HTTP Server
// ============================================

// Blocking (BAD - blocks entire server!)
/*
const http = require('http');
const server = http.createServer((req, res) => {
  const data = readFileSync('./large-file.txt'); // BLOCKS!
  res.end(data);
});
*/

// Non-Blocking (GOOD - handles multiple requests)
/*
const http = require('http');
const server = http.createServer((req, res) => {
  readFile('./large-file.txt', (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('Error');
    } else {
      res.end(data);
    }
  });
});
*/

// ============================================
// 10. Worker Threads for CPU-Intensive Tasks
// ============================================
import { Worker } from "node:worker_threads";

function runCPUIntensiveTask(data: number) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      `
      const { parentPort, workerData } = require('worker_threads');

      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }

      const result = fibonacci(workerData);
      parentPort.postMessage(result);
    `,
      {
        eval: true,
        workerData: data,
      }
    );

    worker.on("message", resolve);
    worker.on("error", reject);
  });
}

// Doesn't block the main thread
async function demonstrateWorker() {
  console.log("Starting worker for CPU-intensive task");

  const result = await runCPUIntensiveTask(40);

  console.log("Worker result:", result);
}

// demonstrateWorker();

// ============================================
// 11. Performance Comparison
// ============================================
async function comparePerformance() {
  const files = ["./package.json", "./tsconfig.json", "./README.md"];

  // Blocking
  console.time("Blocking");
  files.forEach((file) => {
    try {
      readFileSync(file);
    } catch {
      // Ignore errors
    }
  });
  console.timeEnd("Blocking");

  // Non-blocking sequential
  console.time("Non-blocking Sequential");
  for (const file of files) {
    try {
      await readFileAsync(file, "utf8");
    } catch {
      // Ignore errors
    }
  }
  console.timeEnd("Non-blocking Sequential");

  // Non-blocking parallel
  console.time("Non-blocking Parallel");
  await Promise.all(
    files.map((file) =>
      readFileAsync(file, "utf8").catch(() => {
        // Ignore errors
      })
    )
  );
  console.timeEnd("Non-blocking Parallel");
}

// comparePerformance();

export {};
