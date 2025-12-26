# Streams

## What are Streams?

Streams are a way to process data piece by piece (chunks) instead of loading everything into memory at once. Think of it like a water pipe - data flows through continuously.

## Why Use Streams?

**Without streams:**
```typescript
// Loads entire 1GB file into memory
const data = fs.readFileSync("huge-file.txt");
```

**With streams:**
```typescript
// Processes 1GB file in small chunks (e.g., 64KB at a time)
const stream = fs.createReadStream("huge-file.txt");
```

Benefits:
- Memory efficient (only holds chunks, not entire data)
- Time efficient (start processing immediately)
- Composable (chain operations together)

## Types of Streams

### 1. Readable - Source of data

```typescript
const readable = fs.createReadStream("input.txt");

readable.on("data", (chunk) => {
  console.log("Got chunk:", chunk);
});

readable.on("end", () => {
  console.log("Done reading");
});
```

**Examples:** Reading files, HTTP requests, stdin

### 2. Writable - Destination for data

```typescript
const writable = fs.createWriteStream("output.txt");

writable.write("First line\n");
writable.write("Second line\n");
writable.end();
```

**Examples:** Writing files, HTTP responses, stdout

### 3. Transform - Modify data as it passes

```typescript
class Uppercase extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}
```

**Examples:** Compression, encryption, data parsing

### 4. Duplex - Both readable and writable

```typescript
const duplex = new Duplex({
  read() { /* source */ },
  write(chunk, encoding, callback) { /* destination */ }
});
```

**Examples:** TCP sockets, WebSockets

## Basic Usage

### Reading
```typescript
const stream = createReadStream("file.txt");

stream.on("data", chunk => console.log(chunk));
stream.on("end", () => console.log("Done"));
stream.on("error", err => console.error(err));
```

### Writing
```typescript
const stream = createWriteStream("file.txt");

stream.write("Hello\n");
stream.write("World\n");
stream.end(); // Close stream
```

## Piping - Chain Streams

```typescript
source
  .pipe(transform1)
  .pipe(transform2)
  .pipe(destination);
```

**Example: Compress a file**
```typescript
fs.createReadStream("input.txt")
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream("output.txt.gz"));
```

## Backpressure

When the destination can't keep up with the source, the stream pauses automatically.

```typescript
const ok = writable.write(chunk);

if (!ok) {
  // Buffer full, wait for drain
  writable.once("drain", () => {
    // Continue writing
  });
}
```

Piping handles this automatically.

## Pipeline - Safe Piping

`pipeline()` handles errors and cleanup better than `.pipe()`.

```typescript
import { pipeline } from "stream";

pipeline(
  source,
  transform,
  destination,
  (err) => {
    if (err) console.error("Pipeline failed:", err);
    else console.log("Success");
  }
);
```

## Async Iteration (Node.js 10+)

```typescript
for await (const chunk of readableStream) {
  console.log(chunk);
}
```

Cleaner than `.on("data")` for simple cases.

## Common Events

| Event   | Description                    |
|---------|--------------------------------|
| `data`  | New chunk available            |
| `end`   | No more data                   |
| `error` | Error occurred                 |
| `close` | Stream closed                  |
| `drain` | Writable buffer emptied        |
| `finish`| All data written (writable)    |

## Custom Stream Example

```typescript
class NumberStream extends Readable {
  private count = 0;

  _read() {
    if (this.count < 10) {
      this.push(String(this.count++));
    } else {
      this.push(null); // End
    }
  }
}

const numbers = new NumberStream();
numbers.on("data", chunk => console.log(chunk));
```

## When to Use

✓ Large files (don't load all into memory)
✓ Real-time data processing
✓ Network communication
✓ Data transformation pipelines
✓ When you need backpressure handling

## When Not to Use

✗ Small data that fits in memory
✗ Need random access to data
✗ Simple one-time operations
