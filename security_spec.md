# Pustaka Digital Security Specification

## Data Invariants
1. A borrowing record cannot exist without a valid user ID and book ID.
2. A return record must reference a valid borrowing ID.
3. Users can only see their own borrowing history unless they are an admin.
4. Admins have full CRUD access to all collections.
5. Members can read the book catalog and categories.
6. Members can "create" a borrowing request (or write to it if the system allows client-side borrowing). In this app, we'll allow members to create their own borrowings for books that are available.
7. `stock` and `available` counts must be updated when a book is borrowed or returned (atomicity).

## The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Spoofing**: Attempt to create a user profile with `role: 'admin'` as a normal user.
2. **Identity Spoofing**: Attempt to create a borrowing for another user's ID.
3. **Identity Spoofing**: Attempt to update another user's profile.
4. **ID Poisoning**: Attempt to use a 2MB string as a category ID.
5. **State Shortcutting**: Attempt to update a borrowing status from 'borrowed' to 'returned' without a corresponding return record (if enforcing atomicity).
6. **Resource Poisoning**: High-frequency creation of category documents.
7. **Terminal State Break**: Attempt to update a return record once it's marked as 'ok'.
8. **Shadow Field Injection**: Adding `isVerified: true` to a book document update.
9. **Blanket Read**: Querying the entire `users` collection as a member.
10. **Orphaned Writes**: Creating a return record that points to a non-existent borrowing.
11. **Timestamp Spoofing**: Providing a manual `createdAt` date instead of `request.time`.
12. **Negative Stock**: Attempting to borrow a book when `available <= 0`.

## Test Runner Logic
The `firestore.rules` will be designed to block these via `isValid[Entity]` helpers and `affectedKeys().hasOnly()` gates.
