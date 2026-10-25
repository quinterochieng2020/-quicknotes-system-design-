# -quicknotes-system-design-
```markdown
# QuickNotes

## Description
QuickNotes is a high-performance, secure note-taking web application built to allow users to quickly create, organize, retrieve, and manage notes and tags with low latency.

---

## How to Run the API Client
1. Clone the repository to your local machine:
   ```bash
   git clone [https://github.com/your-username/quicknotes.git](https://github.com/your-username/quicknotes.git)
   cd quicknotes
## Documentation Links
API Design Guide

Data Model Specification

System Architecture Document

##What I Learned
Defensive API Design: Designing endpoints with predictable error response codes and payloads (400, 401, 403, 404, 500) drastically improves frontend error handling and debugging clarity.

Relational Schema Normalization: Properly separating notes and tags using a many-to-many junction table (note_tags) keeps data modular and scales efficiently with indexing.

Capacity Planning & Scalability: Estimating real-world metrics like Reads Per Second (RPS) and yearly storage helps inform critical architectural decisions, such as utilizing read replicas and caching layers early on.
