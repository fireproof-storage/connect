import { fireproof } from "@fireproof/core";
import { connect } from "./index.js";
import { describe, it } from "vitest";
import { smokeDB } from "../../tests/helper.js";

describe("store-register", () => {
  it("should store and retrieve data", async () => {
    const db = fireproof("my-database");
    connect(db, "ya29.a0AeXRPp4bASF7IqO0gx7MYSjgV8zMixuMR3z4rWvuqYvNUKv9pDuPumJIvmaXzmNE7k-7xArIdN9-VRippEG5ByIoqinkRlyNxunGmLq9oGZvgAiQ6_zUxHBHm1XL2Nx2lBjILtZZkJlFRNc_02wE5GZJ2VkLQar_rS-BKOqPaCgYKAfcSAQ8SFQHGX2Mia-YkdQYWm7KsWLbfF2ZwOQ0175")
    await smokeDB(db);
  });
});
