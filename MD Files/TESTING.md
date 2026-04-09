# HeartBites — Testing & QA

## Test Cases

| # | Module | Test Case | Expected Result | Status |
|---|--------|-----------|-----------------|--------|
| 1 | Auth | Signup with valid data | Account created, JWT cookie set | ✅ Pass |
| 2 | Auth | Signup with duplicate email | 400 "Email already exists" | ✅ Pass |
| 3 | Auth | Login with correct credentials | 200, user data returned | ✅ Pass |
| 4 | Auth | Login with wrong password | 400 "Invalid Credentials" | ✅ Pass |
| 5 | Auth | Access protected route without token | 401 Unauthorized | ✅ Pass |
| 6 | Profile | Update profile with photo upload | Photo uploaded to Cloudinary, profile saved | ✅ Pass |
| 7 | Match | Get filtered user feed | Excludes self, liked, disliked, matched users | ✅ Pass |
| 8 | Match | Swipe right with mutual like | Match created, isMatch: true | ✅ Pass |
| 9 | Match | Swipe left on a user | User added to dislikes, hidden from feed | ✅ Pass |
| 10 | Chat | Send message to matched user | Message saved and delivered | ✅ Pass |
| 11 | Chat | Send message to unmatched user | 403 Forbidden | ✅ Pass |
| 12 | Chat | Real-time message via Socket.IO | Receiver gets message instantly | ✅ Pass |

## Summary

| Category | Tests | Passed |
|----------|-------|--------|
| Authentication | 5 | 5 |
| Profile | 1 | 1 |
| Matching | 3 | 3 |
| Messaging | 3 | 3 |
| **Total** | **12** | **12** |
