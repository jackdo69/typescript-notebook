// ============================================
// 1. Basic Closure - Inner function accessing outer variable
// ============================================
function outerFunction() {
  const message = "Hello from outer!";

  function innerFunction() {
    console.log(message); // Can access 'message' from outer scope
  }

  return innerFunction;
}

const myFunction = outerFunction();
myFunction(); // "Hello from outer!" - 'message' is still accessible!

// ============================================
// 2. Private Variables - Data Encapsulation
// ============================================
function createCounter() {
  let count = 0; // Private variable

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    },
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount()); // 1
// console.log(counter.count); // undefined - can't access directly!

// ============================================
// 3. Function Factory - Creating Customized Functions
// ============================================
function createMultiplier(multiplier: number) {
  return function (value: number) {
    return value * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// ============================================
// 4. Real-World Example - API Client with Base URL
// ============================================
function createAPIClient(baseURL: string, apiKey: string) {
  // Private configuration
  const config = {
    baseURL,
    apiKey,
  };

  // Private helper
  function buildURL(endpoint: string) {
    return `${config.baseURL}${endpoint}?key=${config.apiKey}`;
  }

  // Public methods
  return {
    get(endpoint: string) {
      const url = buildURL(endpoint);
      console.log(`GET ${url}`);
      return { url, method: "GET" };
    },
    post(endpoint: string, data: unknown) {
      const url = buildURL(endpoint);
      console.log(`POST ${url}`, data);
      return { url, method: "POST", data };
    },
  };
}

const api = createAPIClient("https://api.example.com", "secret123");
api.get("/users"); // GET https://api.example.com/users?key=secret123
api.post("/users", { name: "Alice" }); // POST with data
// api.config.apiKey; // Error! Can't access private config

// ============================================
// 5. Event Listeners with Closure
// ============================================
function setupClickHandler(elementId: string) {
  let clickCount = 0;

  return function handleClick() {
    clickCount++;
    console.log(`Element ${elementId} clicked ${clickCount} times`);
  };
}

const buttonHandler = setupClickHandler("submit-btn");
buttonHandler(); // "Element submit-btn clicked 1 times"
buttonHandler(); // "Element submit-btn clicked 2 times"

// ============================================
// 6. Common Pitfall - Loop with var (Wrong)
// ============================================
function createHandlersWrong() {
  const handlers = [];

  for (var i = 0; i < 3; i++) {
    handlers.push(function () {
      console.log(i); // All closures share the same 'i'
    });
  }

  return handlers;
}

const wrongHandlers = createHandlersWrong();
wrongHandlers[0](); // 3 (not 0!)
wrongHandlers[1](); // 3 (not 1!)
wrongHandlers[2](); // 3 (not 2!)

// ============================================
// 7. Fixed Version - Using let or IIFE
// ============================================
function createHandlersCorrect() {
  const handlers = [];

  for (let i = 0; i < 3; i++) {
    // 'let' creates new binding for each iteration
    handlers.push(function () {
      console.log(i);
    });
  }

  return handlers;
}

const correctHandlers = createHandlersCorrect();
correctHandlers[0](); // 0
correctHandlers[1](); // 1
correctHandlers[2](); // 2

// ============================================
// 8. Memoization - Caching Function Results
// ============================================
function createMemoizedFunction<T extends string | number, R>(
  fn: (arg: T) => R
) {
  const cache = new Map<T, R>();

  return function (arg: T): R {
    if (cache.has(arg)) {
      console.log(`Cache hit for ${arg}`);
      return cache.get(arg)!;
    }

    console.log(`Computing for ${arg}`);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

function expensiveCalculation(n: number): number {
  // Simulate expensive operation
  return n * n;
}

const memoized = createMemoizedFunction(expensiveCalculation);
console.log(memoized(5)); // "Computing for 5" -> 25
console.log(memoized(5)); // "Cache hit for 5" -> 25 (instant!)

// ============================================
// 9. Module Pattern - Creating Namespaces
// ============================================
const Calculator = (function () {
  // Private variables and functions
  let lastResult = 0;

  function log(operation: string, result: number) {
    console.log(`${operation} = ${result}`);
  }

  // Public API
  return {
    add(a: number, b: number) {
      lastResult = a + b;
      log("Addition", lastResult);
      return lastResult;
    },
    subtract(a: number, b: number) {
      lastResult = a - b;
      log("Subtraction", lastResult);
      return lastResult;
    },
    getLastResult() {
      return lastResult;
    },
  };
})();

Calculator.add(5, 3); // "Addition = 8"
Calculator.subtract(10, 4); // "Subtraction = 6"
console.log(Calculator.getLastResult()); // 6
// Calculator.lastResult; // Error! Private
// Calculator.log(); // Error! Private

// ============================================
// 10. Practical Use Case - Rate Limiter
// ============================================
function createRateLimiter(maxCalls: number, windowMs: number) {
  const calls: number[] = [];

  return function <T extends unknown[]>(fn: (...args: T) => void) {
    return function (...args: T) {
      const now = Date.now();

      // Remove old calls outside the window
      while (calls.length > 0 && calls[0] < now - windowMs) {
        calls.shift();
      }

      if (calls.length < maxCalls) {
        calls.push(now);
        return fn(...args);
      } else {
        console.log("Rate limit exceeded!");
        return null;
      }
    };
  };
}

const limiter = createRateLimiter(3, 1000); // 3 calls per second
const limitedLog = limiter(console.log);

limitedLog("Call 1"); // Works
limitedLog("Call 2"); // Works
limitedLog("Call 3"); // Works
limitedLog("Call 4"); // "Rate limit exceeded!"

export {};
