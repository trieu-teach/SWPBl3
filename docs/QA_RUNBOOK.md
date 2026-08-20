# AI Study Hub — Local QA Runbook

## 1. Purpose

Shared source of truth for local QA of AI Study Hub.

Use it to:
- start FE + BE locally;
- select the correct QA role;
- reuse stable QA documents;
- decide when API/Swagger is sufficient and when browser QA is required;
- avoid exposing credentials, tokens, cookies, signed URLs, or secrets;
- produce consistent QA reports across Chat, Community, Moderator, and Admin.

## 2. Project Roots

### Frontend
`C:\Users\user\Desktop\SWP391_B3\SWPBl3`

### Backend
`C:\Users\user\Desktop\SWP391_B3\SWPBL3_BE\backend`

## 3. Local Runtime

### Frontend
Command:

```bash
npm run dev
```

Expected local URL:

`http://localhost:5173`

### Backend
Command:

```bash
npm run start
```

Local API base:

`http://localhost:3000/api`

There is no confirmed dedicated health endpoint. Verify backend startup by confirming it does not crash and by calling a known read-only endpoint.

## 4. Deployed Backend / Swagger

### Deployed Backend
`https://ai-study-hub-backend-24be.onrender.com`

### Swagger
`https://ai-study-hub-backend-24be.onrender.com/api/docs`

Use deployed Swagger/API for contract inspection, DTO/enum verification, and quick read-only checks. Do not call deployed BE and report the result as local full-stack QA.

## 5. Frontend API Configuration

Local QA must use:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The frontend HTTP layer also accepts `http://localhost:3000` and appends `/api`, but for consistency use the full `/api` value above.

The project uses `.env.local` for local overrides. `.env.local` is Git ignored.

After changing Vite env values:
1. stop the FE dev server;
2. restart `npm run dev`.

During local full-stack QA, confirm browser Network requests go to:

`http://localhost:3000/api/...`

If they still go to:

`https://ai-study-hub-backend-24be.onrender.com/api/...`

the run is **not** local full-stack QA.

### Known Config Debt

The source fallback currently uses `http://localhost:3001/api` while the actual local BE is `http://localhost:3000/api`. Do not rely on the fallback during QA.

## 6. Local QA Credentials

Credentials must be stored locally only at:

`.qa/credentials.local.md`

This file must never be committed.

Recommended local-only format:

```md
# LOCAL QA CREDENTIALS

DO NOT COMMIT.
LOCAL TESTING ONLY.

## USER
Email:
<local-user-email>

Password:
<local-user-password>

Expected role:
USER

## MODERATOR
Email:
<local-moderator-email>

Password:
<local-moderator-password>

Expected role:
MODERATOR

## ADMIN
Email:
<local-admin-email>

Password:
<local-admin-password>

Expected role:
ADMIN
```

Recommended local Git exclusion:

```powershell
Add-Content .git\info\exclude ".qa/credentials.local.md"
```

### Credential Safety Rules

Agents may read `.qa/credentials.local.md` only for local authenticated QA.

Never:
- copy credentials into source code;
- copy credentials into `.env`;
- create committed fixtures containing credentials;
- print passwords in final reports;
- log Firebase ID tokens, access tokens, cookies, or Authorization headers;
- commit browser session storage;
- expose signed URLs.

Use normal login UI when browser QA is required.

## 7. Standard QA Roles

### USER
Use for My Library, Community, document save/preview, document reporting, AI Chat, Chat scroll/streaming/citations, and USER route guards.

### MODERATOR
Use for `/moderator/reports`, report queue/review, admin document detail/preview, hide/unhide, resolve/dismiss, and Moderator authorization.

### ADMIN
Use for Admin access verification, Moderator route compatibility, Audit Logs, and role/permission comparison.

Use only the minimum role(s) needed for each task.

## 8. Stable QA Documents

### QA-DOC-01 — USER-owned / Private

- Document ID: `622331df-2566-468a-8a6e-05a99f728a4b`
- Title: `Biên nhan ori`
- File type: `DOCX`
- Owner: `Nguyễn Đức Anh`
- Owned by current USER: `true`
- Saved by current USER: `false`
- Visibility: `PRIVATE`
- Status: `ACTIVE`
- Moderation: `APPROVED`
- Extraction: `COMPLETED`
- Content: `COMPLETED`
- Quality: `READY`
- Chunks: `1`

Recommended QA: owned/private filtering, My Library, ownership behavior, preview.

Mutation policy: **READ-ONLY fixture**. Do not delete, change ownership, visibility, or moderation state.

### QA-DOC-02 — Public non-owned / Moderation target

- Document ID: `a72b09b4-e5a0-458e-8e18-fb53af36270f`
- Title: `test`
- File type: `PDF`
- Owner: `Nguyễn Trần Ngọc Thiện`
- Owned by current USER: `false`
- Saved by current USER: `false`
- Visibility: `PUBLIC`
- Status: `ACTIVE`
- Moderation: `APPROVED`
- Extraction: `COMPLETED`
- Content: `COMPLETED`
- Quality: `READY`
- Chunks: `69`

Recommended QA: Community public access, non-owner preview, USER report, MODERATOR review, hide/unhide, resolve/dismiss.

Mutation policy: **MUTABLE QA fixture**.

Allowed: report, hide, unhide, resolve/dismiss related QA reports.

Cleanup rule: if QA hides this document, restore it before finishing. Expected cleanup state: `PUBLIC / ACTIVE / APPROVED`.

Before creating a new report, inspect existing report state. Do not blindly assume there is no previous report.

### QA-DOC-03 — Long AI Chat fixture

- Document ID: `4ced3afe-34f5-46ab-8488-15351ee2cf61`
- Title: `1-s2.0-S1877050924016612-main`
- File type: `PDF`
- Owner: `Khoa Lê Đăng`
- Owned by current USER: `false`
- Saved by current USER: `false`
- Visibility: `PUBLIC`
- Status: `ACTIVE`
- Moderation: `APPROVED`
- Extraction: `COMPLETED`
- Content: `COMPLETED`
- Quality: `READY`
- Chunks: `40`
- Approximate content: `37,563 characters`

Recommended QA: long AI answers, SSE streaming, citations/sources, auto-scroll, independent message scrolling, composer anchoring, Markdown rendering.

Preferred long-answer prompt:

> Hãy tóm tắt chi tiết toàn bộ tài liệu này theo từng phần, giải thích các ý chính và kết luận quan trọng.

Mutation policy: **READ-ONLY fixture**.

### QA-DOC-04 — USER-saved fixture

- Document ID: `5a2ead0e-45de-440f-96cf-397c53051943`
- Title: `Quan hệ lợi ích kinh tế`
- File type: `PPTX`
- Owner: `Le Quoc Thong (K17 HCM)`
- Owned by current USER: `false`
- Saved by current USER: `true`
- Visibility: `PUBLIC`
- Status: `ACTIVE`
- Moderation: `APPROVED`
- Extraction: `COMPLETED`
- Content: `COMPLETED`
- Quality: `READY`
- Chunks currently present: `0`

Recommended QA: Saved-document listing, filtering, sidebar selection, preview.

Important: do not use this as the primary AI answer/citation fixture while it has zero chunks.

Mutation policy: **READ-ONLY fixture**.

## 9. API vs Browser QA

### API / Swagger is sufficient for
- endpoint contract;
- request/response fields;
- DTO enums;
- pagination;
- status codes;
- role 200/403 behavior;
- read-only document discovery;
- report state;
- document moderation state;
- chat session/message retrieval.

### Browser QA is required for
- layout;
- Chat scroll ownership;
- composer anchoring;
- responsive behavior;
- drawers/dialogs;
- route navigation;
- Markdown rendering;
- source presentation;
- user interactions;
- streaming UI;
- visual regressions.

Do not claim a UI behavior PASS based only on Swagger/Postman/API.

## 10. Test Data Discovery Rule

Prefer stable fixtures above. If a fixture is unavailable, stale, deleted, hidden, or unsuitable:
1. use local backend API in read-only mode;
2. discover the closest valid replacement;
3. report the replacement;
4. do not mutate data during discovery;
5. do not expose credentials/tokens/signed URLs.

For discovered documents report only document id, title, file type, ownership, saved state, visibility, status, moderation status, AI readiness, and recommended QA purpose.

## 11. Standard Chat QA

Role: `USER`

Primary fixture: `QA-DOC-03`

Route: `/ai-chat`

Verify as relevant:
1. login through normal UI;
2. select the intended document;
3. ask a long-answer question;
4. verify streaming;
5. verify citations/sources;
6. verify Markdown;
7. verify auto-scroll;
8. verify message-list scroll ownership;
9. verify composer remains visible;
10. verify History;
11. verify New Chat;
12. verify preview;
13. verify desktop/tablet/~390px when responsive UI is affected.

For Chat scroll specifically:
- browser/page must not become the primary scroll owner because the answer is long;
- message region must scroll internally;
- Chat header/context must remain visible;
- composer must remain visible at the bottom of the workspace;
- document panel must remain stable;
- long content must not create catastrophic horizontal overflow.

## 12. Standard Community Report QA

Role: `USER`

Primary fixture: `QA-DOC-02`

Expected state before report: `PUBLIC / ACTIVE / APPROVED`, not owned by USER.

Report reasons:
- `SPAM`
- `INAPPROPRIATE`
- `COPYRIGHT`
- `BAD_QUALITY`

Recommended QA reason: `COPYRIGHT`

Example harmless description: `Moderator runtime QA report.`

Verify successful report creation, duplicate report handling (`409`) when applicable, friendly FE error handling, and no crash.

## 13. Standard Moderator QA

Role: `MODERATOR`

Primary fixture: `QA-DOC-02`

Verify `/moderator/reports`, queue, report detail, document detail, preview, hide, unhide, resolve, and dismiss when a separate PENDING report exists.

Expected resolve semantics: `RESOLVED + NONE`.

Expected dismiss semantics: `DISMISSED + NONE`.

After hide/unhide QA, restore QA-DOC-02 to ACTIVE.

## 14. Standard Admin QA

Role: `ADMIN`

Verify as relevant:
- Admin can access Moderator report workflow if policy allows;
- Admin Audit endpoint returns 200;
- audit filtering follows the current backend contract.

## 15. Known Moderator Audit Debt

Prior backend audit found:
- report/document moderation endpoints allow ADMIN + MODERATOR;
- Audit Logs endpoint is ADMIN-only;
- Moderator access to `GET /api/admin/logs/audit` is expected to return `403`;
- `DOCUMENT_HIDE` is grouped under `DOCUMENT`, while report resolution/pending moderation use `MODERATION`.

Until backend changes, do not classify the Moderator audit 403 as a new FE regression and do not claim MODERATION filtering includes hide/unhide unless source/runtime confirms a later change.

Re-audit when backend HEAD changes materially.

## 16. Mutation Rules

### Allowed only on designated QA fixture
`QA-DOC-02`

Allowed mutations:
- report;
- hide;
- unhide;
- resolve/dismiss related QA reports.

### Do not mutate
`QA-DOC-01`, `QA-DOC-03`, `QA-DOC-04` unless owner explicitly approves.

### Cleanup
Before finishing QA:
- restore any hidden QA document;
- avoid leaving accidental temporary state when practical;
- report any cleanup that could not be completed.

## 17. Git Safety

Before code-related QA:

```bash
git status
git status --short
git branch --show-current
git rev-parse HEAD
```

Do not auto-rebase, auto-merge, force-push, or push unless explicitly requested. Avoid `git add .` for implementation tasks.

For pure runtime QA, final working tree should remain clean.

## 18. Validation

For FE code changes:

```bash
npm run lint
npm run build
git diff --check
```

Run relevant tests only if the project provides them. Do not install packages without following the task dependency policy.

## 19. Runtime Evidence Rules

Record:
- role used;
- route;
- method/path/status;
- expected vs actual behavior;
- console errors;
- relevant Network failures;
- screenshots when useful.

Never record passwords, tokens, Authorization headers, cookies, signed URLs, service-account data, or secrets.

## 20. Standard QA Report Header

```md
# <TASK NAME> — QA

Status:
PASS / PASS WITH QA DEBT / BLOCKED / FAIL

## Environment
FE: http://localhost:5173
BE: http://localhost:3000/api
FE using local BE: YES / NO

## Role
USER / MODERATOR / ADMIN

## Fixture
QA-DOC-01 / QA-DOC-02 / QA-DOC-03 / QA-DOC-04 / other

## Runtime
Describe executed cases.

## Network
Expected statuses:
...
Unexpected 4xx:
...
Unexpected 5xx:
...

## Console
Errors:
...
Warnings:
...

## Regression
Relevant business behavior:
UNCHANGED / issue

## Credential Safety
Credentials persisted: NO
Tokens logged: NO

## Git
Working tree:
CLEAN / issue
```

## 21. Agent Instruction

When asked to run QA:
1. read this runbook;
2. read `.qa/credentials.local.md` only if authenticated QA is required;
3. use the minimum required role;
4. prefer stable QA fixtures;
5. use API for contract/data checks;
6. use browser for visual/interaction/runtime behavior;
7. verify FE local is actually calling local BE for local full-stack QA;
8. do not expose credentials or tokens;
9. do not mutate non-designated fixtures;
10. report only cases actually executed.
