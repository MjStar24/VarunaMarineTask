# AI Agent Workflow Log

## Agents Used
* Claude 3.5 Sonnet (for complex architectural scaffolding and React context).
* GitHub Copilot (for inline boilerplate and Prisma schema generation).

## Prompts & Outputs
**Example 1:**
*Prompt:* "Write a greedy algorithm in TS to allocate pooled surpluses to deficits per FuelEU Article 21. It takes an array of ships with their current CB. Sum must be >= 0."
*Output:* The agent successfully generated the descending sort and nested loop structure seen in `FuelEUCalculator.allocatePool`.

**Example 2 (Refinement):**
*Initial Output:* Copilot injected Express `req/res` objects directly into the Use Case class.
*Correction:* I instructed the agent: "Refactor this to strict Hexagonal Architecture. The Use Case must be pure TypeScript, returning objects, and the Express controller must inject the Use Case and handle HTTP separately."

## Validation / Corrections
I manually tested the domain formulas against the PDF spec (Target 89.3368). The AI hallucinated a multiplier for energy conversion; I manually corrected it to `41000`. 
In the final phase, I verified that `npm run test` failed initially due to missing configuration and relative path issues in integration tests, which I corrected.

## Observations
* **Time Saved:** Scaffolded the entire Hexagonal folder structure and Prisma schema in minutes.
* **Failures:** AI struggles with strict separation of concerns unless repeatedly prompted. It also initially missed the `/banking/records` endpoint from the spec.
* **Best Practices:** Kept the domain logic isolated and unit-testable before asking the AI to write the HTTP adapters. Used a single `AppUseCases` class to centralize business logic.

## Final Phase Actions
- Implemented missing `GET /banking/records` endpoint.
- Added 100% test coverage for domain logic and HTTP routes using Supertest.
- Unified the monorepo documentation.
