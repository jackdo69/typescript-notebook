import { Readable, Writable, Transform, pipeline } from "node:stream";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

// ============================================
// 1. Basic Readable Stream
// ============================================
const readableStream = new Readable({
  read() {
    this.push("Hello ");
    this.push("World!");
    this.push(null); // Signal end of stream
  },
});

readableStream.on("data", (chunk) => {
  console.log("Received:", chunk.toString());
});

readableStream.on("end", () => {
  console.log("Stream ended");
});

// Output:
// Received: Hello
// Received: World!
// Stream ended

// ============================================
// 2. Basic Writable Stream
// ============================================
const writableStream = new Writable({
  write(chunk, _encoding, callback) {
    console.log("Writing:", chunk.toString());
    callback(); // Signal write complete
  },
});

writableStream.write("First chunk\n");
writableStream.write("Second chunk\n");
writableStream.end("Final chunk\n");

// ============================================
// 3. Custom Readable Stream - Number Generator
// ============================================
class NumberStream extends Readable {
  private current = 1;
  private max: number;

  constructor(max: number) {
    super();
    this.max = max;
  }

  _read() {
    if (this.current <= this.max) {
      this.push(String(this.current));
      this.current++;
    } else {
      this.push(null); // End stream
    }
  }
}

const numbers = new NumberStream(5);

numbers.on("data", (chunk) => {
  console.log("Number:", chunk.toString());
});

// Output: Number: 1, Number: 2, ..., Number: 5

// ============================================
// 4. Transform Stream - Uppercase Converter
// ============================================
class UppercaseTransform extends Transform {
  _transform(
    chunk: Buffer,
    _encoding: string,
    callback: (error?: Error | null, data?: unknown) => void
  ) {
    const uppercased = chunk.toString().toUpperCase();
    this.push(uppercased);
    callback();
  }
}

const uppercase = new UppercaseTransform();

uppercase.on("data", (chunk) => {
  console.log("Transformed:", chunk.toString());
});

uppercase.write("hello\n");
uppercase.write("world\n");
uppercase.end();

// Output:
// Transformed: HELLO
// Transformed: WORLD

// ============================================
// 5. Piping Streams
// ============================================
const source = new Readable({
  read() {
    this.push("data chunk 1\n");
    this.push("data chunk 2\n");
    this.push(null);
  },
});

const transformer = new Transform({
  transform(chunk, _encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});

const destination = new Writable({
  write(chunk, _encoding, callback) {
    console.log("Final output:", chunk.toString());
    callback();
  },
});

// Chain streams together
source.pipe(transformer).pipe(destination);

// Output:
// Final output: DATA CHUNK 1
// Final output: DATA CHUNK 2

// ============================================
// 6. File Streams - Reading Large Files
// ============================================
function readLargeFile(filePath: string) {
  const fileStream = createReadStream(filePath, {
    encoding: "utf8",
    highWaterMark: 64 * 1024, // 64KB chunks
  });

  let lineCount = 0;

  fileStream.on("data", (chunk: string) => {
    lineCount += chunk.split("\n").length - 1;
  });

  fileStream.on("end", () => {
    console.log(`Total lines: ${lineCount}`);
  });

  fileStream.on("error", (err) => {
    console.error("Error reading file:", err);
  });
}

// readLargeFile("./large-file.txt");

// ============================================
// 7. Writing to Files with Streams
// ============================================
function writeToFile(filePath: string, data: string[]) {
  const fileStream = createWriteStream(filePath);

  data.forEach((line) => {
    fileStream.write(line + "\n");
  });

  fileStream.end();

  fileStream.on("finish", () => {
    console.log("File write completed");
  });

  fileStream.on("error", (err) => {
    console.error("Error writing file:", err);
  });
}

// writeToFile("./output.txt", ["Line 1", "Line 2", "Line 3"]);

// ============================================
// 8. Backpressure Handling
// ============================================
function writeWithBackpressure(writable: Writable, data: string[]) {
  let i = 0;

  function write() {
    let ok = true;

    while (i < data.length && ok) {
      const chunk = data[i];
      i++;

      if (i === data.length) {
        // Last chunk
        writable.write(chunk, () => console.log("Last chunk written"));
      } else {
        // Check if internal buffer is full
        ok = writable.write(chunk);
      }
    }

    if (i < data.length) {
      // Buffer full, wait for drain event
      writable.once("drain", write);
    }
  }

  write();
}

const slowWriter = new Writable({
  write(chunk, _encoding, callback) {
    setTimeout(() => {
      console.log("Slow write:", chunk.toString());
      callback();
    }, 100);
  },
});

// writeWithBackpressure(slowWriter, ["A", "B", "C", "D", "E"]);

// ============================================
// 9. Pipeline - Error Handling
// ============================================
function compressFile(inputPath: string, outputPath: string) {
  pipeline(
    createReadStream(inputPath),
    createGzip(),
    createWriteStream(outputPath),
    (err) => {
      if (err) {
        console.error("Pipeline failed:", err);
      } else {
        console.log("File compressed successfully");
      }
    }
  );
}

// compressFile("./input.txt", "./output.txt.gz");

// ============================================
// 10. Stream Events
// ============================================
function demonstrateEvents() {
  const stream = new Readable({
    read() {
      this.push("chunk");
      this.push(null);
    },
  });

  stream.on("data", (chunk) => {
    console.log("Event: data", chunk.toString());
  });

  stream.on("end", () => {
    console.log("Event: end");
  });

  stream.on("close", () => {
    console.log("Event: close");
  });

  stream.on("error", (err) => {
    console.log("Event: error", err);
  });
}

demonstrateEvents();

// ============================================
// 11. Async Iteration over Streams (Node.js 10+)
// ============================================
async function processStreamAsync() {
  const readable = new Readable({
    read() {
      this.push("A");
      this.push("B");
      this.push("C");
      this.push(null);
    },
  });

  for await (const chunk of readable) {
    console.log("Async chunk:", chunk.toString());
  }

  console.log("Async iteration complete");
}

processStreamAsync();

// ============================================
// 12. Practical Example - CSV Processor
// ============================================
class CSVParser extends Transform {
  private header: string[] | null = null;

  _transform(
    chunk: Buffer,
    _encoding: string,
    callback: (error?: Error | null, data?: unknown) => void
  ) {
    const lines = chunk.toString().split("\n");

    lines.forEach((line) => {
      if (!this.header) {
        this.header = line.split(",");
      } else if (line.trim()) {
        const values = line.split(",");
        const obj = this.header.reduce(
          (acc, key, i) => {
            acc[key.trim()] = values[i]?.trim();
            return acc;
          },
          {} as Record<string, string>
        );
        this.push(JSON.stringify(obj) + "\n");
      }
    });

    callback();
  }
}

const csvParser = new CSVParser();

csvParser.on("data", (chunk) => {
  console.log("Parsed:", chunk.toString());
});

csvParser.write("name,age,city\n");
csvParser.write("Alice,30,NYC\n");
csvParser.write("Bob,25,LA\n");
csvParser.end();

// Output:
// Parsed: {"name":"Alice","age":"30","city":"NYC"}
// Parsed: {"name":"Bob","age":"25","city":"LA"}

export {};
