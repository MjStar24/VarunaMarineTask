# Reflection

**What I learned using AI agents:**
AI excels at boilerplate and repetitive structural generation (like creating standard interfaces, repository methods, and Tailwind layouts). However, domain-specific math (like the FuelEU Article 20/21 compliance balance rules) requires extreme oversight. 

**Efficiency gains:**
I saved approximately 6-8 hours on setting up Vite, configuring React Query, writing basic CRUD routes, and wiring up the UI to the API.

**Improvements for next time:**
I will provide the AI with the exact mathematical formulas as pseudo-code *first*, rather than asking it to derive them from a prompt, to prevent initial hallucinations. Additionally, setting up the testing infrastructure (Jest/Supertest) should be the very first task after scaffolding, as it caught several regression errors during the expansion of the banking endpoints.
