import { z } from "zod";

console.log("z methods:", Object.keys(z));
console.log("z.file:", (z as any).file);
console.log("z.stringbool:", (z as any).stringbool);
