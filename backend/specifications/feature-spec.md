## Functional Elements (feature specs)

### 1.1 Create Project (Host)
- Inputs: title, description, what_it_does, inputs/deps, desired_outputs, tags
- Output: new project visible in feed and detail page

### 1.2 Browse / Search Projects
- Search keyword + filter by tags + sort
- Pagination required

### 1.3 Submit Contribution (Contributor)
- Requires: auth, project Open, not host
- Creates PENDING contribution with body + links

### 1.4 Accept / Decline (Host)
- Host-only
- Accept:
  - sets status ACCEPTED
  - awards credits (atomic, unique per project/user)
- Decline:
  - sets status DECLINED
  - does not appear in accepted contributor list

### 1.5 Accepted Contributors List
- Shows unique accepted contributors on project page
- Only accepted contributions count; declined excluded

### 1.6 Credits on Profile
- Show total credits
- Ledger provides auditability and future dispute handling

### 1.7 Moderation (MVP-light)
- Soft delete abusive content
- Ban user accounts
- Reverse fraudulent credit awards (ledger reversal entry)