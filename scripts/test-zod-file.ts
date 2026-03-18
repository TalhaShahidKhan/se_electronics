import { z } from "zod";

// Create a mock File-like object
const mockFile = {
    name: "test.jpg",
    size: 1024,
    type: "image/jpeg",
    arrayBuffer: async () => new ArrayBuffer(1024)
};

const schema = z.object({
    file: (z as any).file()
});

console.log("Parsing mock file:", schema.safeParse({ file: mockFile }));
console.log("Parsing null:", schema.safeParse({ file: null }));
console.log("Parsing string:", schema.safeParse({ file: "not a file" }));
