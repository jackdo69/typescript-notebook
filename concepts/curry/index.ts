// ============================================
// 1. Basic Currying - Breaking down a multi-argument function
// ============================================
// Normal function
function add(a: number, b: number, c: number): number {
  return a + b + c;
}

console.log(add(1, 2, 3)); // 6

// Curried version - each function takes one argument
function addCurried(a: number) {
  return function (b: number) {
    return function (c: number) {
      return a + b + c;
    };
  };
}

console.log(addCurried(1)(2)(3)); // 6

// ============================================
// 2. Practical Example - URL Builder
// ============================================
function buildURL(protocol: string) {
  return function (domain: string) {
    return function (path: string) {
      return `${protocol}://${domain}/${path}`;
    };
  };
}

// Create reusable builders
const https = buildURL("https");
const httpsGoogle = https("google.com");

console.log(httpsGoogle("search")); // "https://google.com/search"
console.log(httpsGoogle("maps")); // "https://google.com/maps"

const httpsGithub = https("github.com");
console.log(httpsGithub("user/repo")); // "https://github.com/user/repo"

// ============================================
// 3. Arrow Function Syntax (Cleaner)
// ============================================
const multiply = (a: number) => (b: number) => (c: number) => a * b * c;

const multiplyBy2 = multiply(2);
const multiplyBy2And3 = multiplyBy2(3);

console.log(multiplyBy2And3(4)); // 24
console.log(multiply(2)(3)(4)); // 24

// ============================================
// 4. Partial Application - Pre-fill some arguments
// ============================================
const greet = (greeting: string) => (name: string) => `${greeting}, ${name}!`;

const sayHello = greet("Hello");
const sayHi = greet("Hi");

console.log(sayHello("Alice")); // "Hello, Alice!"
console.log(sayHi("Bob")); // "Hi, Bob!"

// ============================================
// 5. Real-World Example - Discount Calculator
// ============================================
const calculatePrice =
  (tax: number) => (discount: number) => (price: number) => {
    const afterDiscount = price * (1 - discount);
    return afterDiscount * (1 + tax);
  };

// Create calculators for different regions
const usCalculator = calculatePrice(0.08); // 8% tax
const ukCalculator = calculatePrice(0.2); // 20% VAT

// Create discount tiers
const usBlackFriday = usCalculator(0.3); // 30% off
const usRegular = usCalculator(0);

console.log(usBlackFriday(100)); // $75.60
console.log(usRegular(100)); // $108

// ============================================
// 6. Generic Curry Helper Function
// ============================================
type CurriedFunction2<A, B, R> = (a: A) => (b: B) => R;
type CurriedFunction3<A, B, C, R> = (a: A) => (b: B) => (c: C) => R;

function curry2<A, B, R>(fn: (a: A, b: B) => R): CurriedFunction2<A, B, R> {
  return (a: A) => (b: B) => fn(a, b);
}

function curry3<A, B, C, R>(
  fn: (a: A, b: B, c: C) => R
): CurriedFunction3<A, B, C, R> {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
}

// Use the helper
const sum = (a: number, b: number) => a + b;
const curriedSum = curry2(sum);

console.log(curriedSum(5)(10)); // 15

const add3 = (a: number, b: number, c: number) => a + b + c;
const curriedAdd3 = curry3(add3);

console.log(curriedAdd3(1)(2)(3)); // 6

// ============================================
// 7. Practical Use Case - Event Handlers
// ============================================
const handleClick =
  (action: string) => (id: number) => (event: { type: string }) => {
    console.log(`Action: ${action}, ID: ${id}, Event: ${event.type}`);
  };

// Create specific handlers
const deleteHandler = handleClick("delete");
const deleteUser = deleteHandler(123);

deleteUser({ type: "click" }); // "Action: delete, ID: 123, Event: click"

// ============================================
// 8. Logger Example with Timestamps
// ============================================
const log =
  (level: "info" | "warn" | "error") => (module: string) => (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`);
  };

const infoLog = log("info");
const authInfo = infoLog("Auth");
const dbInfo = infoLog("Database");

authInfo("User logged in"); // [timestamp] [INFO] [Auth] User logged in
dbInfo("Connection established"); // [timestamp] [INFO] [Database] Connection established

const errorLog = log("error");
const authError = errorLog("Auth");
authError("Invalid credentials"); // [timestamp] [ERROR] [Auth] Invalid credentials

export {};
