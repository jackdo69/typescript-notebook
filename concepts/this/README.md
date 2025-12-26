# The `this` Keyword

## What is `this`?

`this` refers to the object that is executing the current function.

## The Problem

When you extract a method from an object, it loses its `this` context:

```typescript
const obj = {
  name: "Alice",
  greet() { console.log(this.name); }
};

obj.greet();           // "Alice" ✓
const fn = obj.greet;
fn();                  // undefined ✗ - 'this' is lost
```

## Solutions: `bind`, `call`, `apply`

### `bind(thisArg, ...args)`

Creates a **new function** with `this` permanently set.

```typescript
const boundFn = fn.bind(obj);
boundFn(); // "Alice" - 'this' is fixed
```

**Use when:** You need a function to use later with the correct context.

### `call(thisArg, arg1, arg2, ...)`

**Immediately invokes** the function with specified `this` and individual arguments.

```typescript
fn.call(obj, arg1, arg2); // Execute now
```

**Use when:** You want to run a function immediately with a specific context.

### `apply(thisArg, [args])`

**Immediately invokes** the function with specified `this` and an **array** of arguments.

```typescript
fn.apply(obj, [arg1, arg2]); // Execute now with array
```

**Use when:** You have arguments in an array and want to run immediately.

## Quick Comparison

| Method  | When it runs | Arguments        | Returns        |
|---------|--------------|------------------|----------------|
| `bind`  | Later        | Individual       | New function   |
| `call`  | Immediately  | Individual       | Function result|
| `apply` | Immediately  | Array            | Function result|

## Arrow Functions

Arrow functions **don't have their own `this`**. They inherit `this` from the surrounding scope.

```typescript
const obj = {
  name: "Team",
  members: ["A", "B"],

  print() {
    // Arrow function inherits 'this' from print()
    this.members.forEach(m => console.log(this.name)); // ✓
  }
};
```

**Use when:** You want to preserve the outer `this` context.

## TypeScript Feature

You can explicitly type `this` in function parameters:

```typescript
interface User {
  name: string;
}

function greet(this: User) {
  console.log(this.name);
}

greet.call({ name: "Alice" }); // ✓
greet();                        // TypeScript error ✗
```

This provides compile-time safety for `this` usage.
