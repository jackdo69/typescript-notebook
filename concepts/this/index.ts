// ============================================
// 1. Basic 'this' in objects
// ============================================
const person = {
  name: "Alice",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  },
};

person.greet(); // "Hello, I'm Alice"

// ============================================
// 2. 'this' loses context when assigned
// ============================================
// const greetFunction = person.greet;
// greetFunction(); // Error or undefined - 'this' is lost!

// ============================================
// 3. bind() - Creates new function with fixed 'this'
// ============================================
const boundGreet = person.greet.bind(person);
boundGreet(); // "Hello, I'm Alice" - 'this' is preserved

// Example with parameters
interface Person {
  name: string;
}

function introduce(this: Person, greeting: string, punctuation: string) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const boundIntroduce = introduce.bind(person, "Hi");
boundIntroduce("!"); // "Hi, I'm Alice!"

// ============================================
// 4. call() - Invokes immediately with specified 'this'
// ============================================
introduce.call(person, "Hey", "!!!"); // "Hey, I'm Alice!!!"

const anotherPerson = { name: "Bob" };
introduce.call(anotherPerson, "Hello", "."); // "Hello, I'm Bob."

// ============================================
// 5. apply() - Like call() but takes array of arguments
// ============================================
introduce.apply(person, ["Greetings", "..."]); // "Greetings, I'm Alice..."

const args: [string, string] = ["Welcome", "!"];
introduce.apply(anotherPerson, args); // "Welcome, I'm Bob!"

// ============================================
// 6. Arrow functions - Don't have their own 'this'
// ============================================
const team = {
  name: "Dev Team",
  members: ["Alice", "Bob", "Charlie"],

  // Regular function - 'this' refers to team
  printMembers() {
    // Arrow function inherits 'this' from printMembers
    this.members.forEach((member) => {
      console.log(`${member} is in ${this.name}`);
    });
  },

  // Wrong way - regular function in forEach loses context
  printMembersWrong() {
    this.members.forEach(function (_member) {
      // console.log(`${_member} is in ${this.name}`); // Error! 'this' is undefined
    });
  },
};

team.printMembers();
// "Alice is in Dev Team"
// "Bob is in Dev Team"
// "Charlie is in Dev Team"

// ============================================
// 7. TypeScript - Explicit 'this' parameter
// ============================================
interface User {
  name: string;
}

function sayName(this: User) {
  console.log(`My name is ${this.name}`);
}

const user: User = { name: "Dave" };
sayName.call(user); // "My name is Dave"
// sayName(); // TypeScript error: 'this' is not assignable

// ============================================
// 8. Practical comparison: bind vs call vs apply
// ============================================
interface Calculator {
  multiplier: number;
}

function multiply(this: Calculator, a: number, b: number, c: number) {
  return a * b * c * (this.multiplier || 1);
}

const calculator: Calculator = { multiplier: 10 };

// call - execute immediately with individual arguments
const result1 = multiply.call(calculator, 2, 3, 4); // 240

// apply - execute immediately with array of arguments
const result2 = multiply.apply(calculator, [2, 3, 4]); // 240

// bind - create new function for later use
const boundMultiply = multiply.bind(calculator, 2); // Partial application
const result3 = boundMultiply(3, 4); // 240

console.log({ result1, result2, result3 });

export {};
