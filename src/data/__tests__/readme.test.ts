import { describe, expect, it } from "vitest";
import { FEATURES, PERSONAS } from "../readme";

describe("requirements traceability (peer-review Should item)", () => {
  const personaIds = new Set(PERSONAS.map((p) => p.id));

  it("every feature serves at least one persona that exists", () => {
    for (const f of FEATURES) {
      expect(f.personas.length, f.name).toBeGreaterThan(0);
      for (const id of f.personas)
        expect(personaIds.has(id), `${f.name} -> ${id}`).toBe(true);
    }
  });

  it("every persona is served by at least one feature", () => {
    for (const p of PERSONAS) {
      expect(
        FEATURES.some((f) => f.personas.includes(p.id)),
        p.name,
      ).toBe(true);
    }
  });
});
