# Security Specification - Money Me Out

## Data Invariants
1. A donation must have a valid `amount` (> 0) and `stripePaymentIntentId`.
2. A user can only read their own `user` document.
3. A creator's `balance` and `totalEarnings` can only be updated by the server (admin).
4. A creator can read their own subcollections (`donations`, `notifications`, `withdrawals`).
5. A user's `payouts` subcollection can only be read by that user.
6. A creator profile is public (read-only for others, limited update for owner).

## The Dirty Dozen Payloads

### 1. Identity Spoofing (Write other user's profile)
**Target:** `users/victim-uid`
**Actor:** `attacker-uid`
**Payload:** `{ "name": "Hacked" }`
**Expected:** `PERMISSION_DENIED`

### 2. Balance Injection (Self-update balance)
**Target:** `creators/my-creator-id`
**Actor:** `my-uid` (Owner)
**Payload:** `{ "balance": 1000000 }`
**Expected:** `PERMISSION_DENIED` (Only server should update balance)

### 3. Total Earnings Poisoning
**Target:** `creators/my-creator-id`
**Actor:** `my-uid` (Owner)
**Payload:** `{ "totalEarnings": 0 }`
**Expected:** `PERMISSION_DENIED`

### 4. Shadow Field Injection (Setting verify flag)
**Target:** `creators/my-creator-id`
**Actor:** `my-uid` (Owner)
**Payload:** `{ "isVerified": true }`
**Expected:** `PERMISSION_DENIED` (Strict schema/hasOnly)

### 5. Orphaned Donation (Create donation without payment)
**Target:** `creators/creator-id/donations/new-doc`
**Actor:** `any-uid`
**Payload:** `{ "amount": 100, "stripePaymentIntentId": "fake_id" }`
**Expected:** `PERMISSION_DENIED` (Only server/admin)

### 6. PII Leak (Read victim's private info)
**Target:** `users/victim-uid`
**Actor:** `attacker-uid`
**Expected:** `PERMISSION_DENIED`

### 7. Notification Hijack (Mark other's notification read)
**Target:** `creators/victim-creator-id/notifications/note-id`
**Actor:** `attacker-uid`
**Payload:** `{ "isRead": true }`
**Expected:** `PERMISSION_DENIED`

### 8. Withdrawal Spoofing (Create fake withdrawal)
**Target:** `creators/my-creator-id/withdrawals/fake-id`
**Actor:** `my-uid`
**Payload:** `{ "amount": 500, "status": "completed" }`
**Expected:** `PERMISSION_DENIED` (Only server/admin)

### 9. ID Poisoning (Long ID)
**Target:** `creators/A_VERY_LONG_STRING_THAT_EXCEEDS_128_CHARS...`
**Actor:** `any-uid`
**Expected:** `PERMISSION_DENIED` (isValidId check)

### 10. Type Mismatch (String as amount)
**Target:** `creators/my-creator-id`
**Actor:** `my-uid`
**Payload:** `{ "description": 123 }` (Expects string)
**Expected:** `PERMISSION_DENIED`

### 11. Immutable Field Change (Change handle)
**Target:** `creators/my-creator-id`
**Actor:** `my-uid`
**Payload:** `{ "handle": "@new_handle" }`
**Expected:** `PERMISSION_DENIED` (Handle should be immutable after claim/creation)

### 12. Unauthorized List Query
**Target:** `creators/some-creator/donations`
**Actor:** `another-user-uid` (Not the creator)
**Expected:** `PERMISSION_DENIED` (Only creator can list their donations)
