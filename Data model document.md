Markdown
# QuickNotes Data Model

## Entities & Schema

1. **`users`**: Stores user profile and authentication credentials.
   * `id` (UUID, Primary Key)
   * `email` (VARCHAR, Unique, Not Null)
   * `password_hash` (VARCHAR, Not Null)
   * `created_at` (TIMESTAMP)

2. **`notes`**: Stores note metadata and content.
   * `id` (UUID, Primary Key)
   * `user_id` (UUID, Foreign Key referencing `users(id)`, Not Null)
   * `title` (VARCHAR(100), Not Null)
   * `body` (TEXT)
   * `created_at` (TIMESTAMP)
   * `updated_at` (TIMESTAMP)

3. **`tags`**: Stores unique tag labels per user for organization.
   * `id` (UUID, Primary Key)
   * `user_id` (UUID, Foreign Key referencing `users(id)`, Not Null)
   * `name` (VARCHAR(50), Not Null)

4. **`note_tags`**: Junction table for the many-to-many relationship between notes and tags.
   * `note_id` (UUID, Foreign Key referencing `notes(id)` on delete cascade)
   * `tag_id` (UUID, Foreign Key referencing `tags(id)` on delete cascade)
   * **Primary Key:** (`note_id`, `tag_id`)

---

## Relationships Explanation
* **One-to-Many (`users` to `notes`):** A single user can create zero or many notes, but each note belongs to exactly one user.
* **Many-to-Many (`notes` and `tags`):** A single note can have multiple tags, and a single tag can be applied to multiple notes. This is resolved via the intermediate junction table `note_tags`.

---

## SQL DDL Statements

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT unique_user_tag UNIQUE(user_id, name)
);

CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
Example SQL Queries
1. Fetch notes with their associated tags (JOIN)
SQL
SELECT n.id, n.title, n.body, array_agg(t.name) AS tags
FROM notes n
LEFT JOIN note_tags nt ON n.id = nt.note_id
LEFT JOIN tags t ON nt.tag_id = t.id
WHERE n.user_id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY n.id, n.title, n.body;
2. Insert a new note
INSERT INTO notes (user_id, title, body)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Meeting Notes', 'Discussed Q3 milestones.')
RETURNING id, created_at;
3. Delete a note and its junction entries
DELETE FROM notes WHERE id = '789e4567-e89b-12d3-a456-426614174333';

Indexes & Justification
Index: CREATE INDEX idx_notes_user_id ON notes(user_id);

Reason: Because users frequently filter and retrieve their personal note lists (SELECT * FROM notes WHERE user_id = ?), indexing the foreign key column user_id avoids full table scans and drastically accelerates query response times.

Technology Choice Justification
We chose a Relational Database (SQL, such as PostgreSQL) over NoSQL because QuickNotes relies heavily on strict relational constraints, user data isolation, and referential integrity (e.g., cascading deletes for notes and tags). SQL databases provide robust ACID transaction support, making them ideal for managing structured metadata and complex querying via JOINs across notes, tags, and users.
