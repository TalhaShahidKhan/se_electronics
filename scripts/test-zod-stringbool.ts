import { z } from "zod";

const schema = z.object({
    val: (z as any).stringbool()
});

console.log("Parsing 'true':", schema.safeParse({ val: "true" }));
console.log("Parsing 'false':", schema.safeParse({ val: "false" }));
console.log("Parsing true:", schema.safeParse({ val: true }));
console.log("Parsing false:", schema.safeParse({ val: false }));
