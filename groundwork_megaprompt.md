# Groundwork — Volunteer Dashboard + Full Backend Mega Prompt

## CONTEXT

You are working inside an existing Next.js 14 project called **Groundwork** — an AI-verified micro-relief fulfillment platform for disaster response in India. The project already has the following built and working:

- `/app/page.tsx` — Landing page (fully built, do not touch)
- `/app/auth/` — Auth UI pages (fully built, do not touch)
- `/app/dashboard/coordinator/` — Coordinator dashboard (fully built, do not touch)
- `/components/` — Navbar, TaskCard, StatusBadge, SubmitProofForm, HistoryEntry, motion-primitives (all exist, do not recreate)
- `/lib/dummyData.ts` — Dummy data (exists, will be replaced by real data)

**Color palette already in use across the project:**
- Forest Green: `#2D4A2D`
- Sage Green: `#87A878`
- Soft Olive: `#6B7C4A`
- Cream: `#F5F0E8`
- Antique Gold: `#C4973A`
- Wood Brown: `#8B5E3C`

**Fonts already configured:** DM Serif Display (headings), DM Sans (body)

**Tech stack already installed:** Next.js 14 App Router, Tailwind CSS, Framer Motion, Motion Primitives

---

## WHAT YOU ARE BUILDING

You are building **everything that requires a backend** — wiring up the entire application end to end. This includes:

1. Supabase setup (schema, tables, RLS policies)
2. Supabase Auth (role-based: volunteer vs coordinator)
3. Volunteer Dashboard (full UI + real data)
4. Volunteer Pledge creation (volunteer creates their own tasks)
5. Submit Proof flow (camera → FastAPI → Gemini Vision AI → blockchain write)
6. Submission History (real data from Supabase)
7. Gemini Vision API integration via FastAPI Python backend
8. Polygon blockchain integration via Thirdweb (immutable record on verification)
9. IPFS storage via Web3.storage (proof photo storage)
10. Coordinator Dashboard data wiring (volunteers list, task statuses — the UI exists, just wire data)
11. Environment config

---

## PART 1 — SUPABASE SCHEMA

Create the following tables in Supabase. Generate a `supabase/schema.sql` file with all of this:

### Table: `profiles`
```sql
id uuid references auth.users on delete cascade primary key,
role text check (role in ('volunteer', 'coordinator')) not null,
full_name text,
district text,
ward text,
aapda_mitra_id text unique,
created_at timestamptz default now()
```

### Table: `tasks`
```sql
id uuid default gen_random_uuid() primary key,
title text not null,
description text,
item_name text,               -- what is being delivered (e.g. "water bottles")
quantity integer,             -- how many
district text not null,
ward text,
assigned_to uuid references profiles(id),
assigned_by uuid references profiles(id),  -- null if self-pledged by volunteer
is_self_pledged boolean default false,     -- true if volunteer created it themselves
status text check (status in ('pending', 'submitted', 'verified', 'rejected')) default 'pending',
due_date date,
created_at timestamptz default now()
```

### Table: `submissions`
```sql
id uuid default gen_random_uuid() primary key,
task_id uuid references tasks(id) on delete cascade,
volunteer_id uuid references profiles(id),
photo_url text,           -- IPFS URL of proof photo
ipfs_cid text,            -- raw IPFS CID
geolocation jsonb,        -- { lat, lng, accuracy }
exif_geotag jsonb,        -- extracted from photo EXIF
face_detected boolean default false,
ai_verdict text check (ai_verdict in ('verified', 'rejected', 'uncertain')),
ai_confidence float,
ai_notes text,            -- Gemini's reasoning
blockchain_tx_hash text,  -- Polygon transaction hash
blockchain_status text check (blockchain_status in ('pending', 'written', 'failed')) default 'pending',
submitted_at timestamptz default now()
```

### RLS Policies

Enable RLS on all tables. Apply the following:

- `profiles`: Users can read and update only their own profile. Coordinators can read all profiles.
- `tasks`: Volunteers can read tasks where `assigned_to = their id`. Volunteers can insert tasks where `is_self_pledged = true` and `assigned_to = their own id`. Coordinators can read and write all tasks.
- `submissions`: Volunteers can insert and read only their own submissions. Coordinators can read all submissions.

Generate the full SQL for all policies.

---

## PART 2 — SUPABASE AUTH + PROTECTED ROUTES

### File: `/lib/supabase.ts`
Create the Supabase client using environment variables:
```ts
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Use `@supabase/supabase-js`. Export a single `supabase` client instance.

### File: `/lib/supabaseServer.ts`
Server-side Supabase client using `@supabase/ssr` for use in Server Components and API routes. Uses cookies for session.

### Auth Flow

**Signup** (`/app/auth/signup/page.tsx` — UI already exists, wire it up):
- Fields: full_name, email, password, role (volunteer/coordinator), district, ward, aapda_mitra_id (only for volunteers)
- On signup: `supabase.auth.signUp()` then insert into `profiles` table with the role and details
- After signup: redirect to `/dashboard/volunteer` if role=volunteer, `/dashboard/coordinator` if role=coordinator

**Login** (`/app/auth/login/page.tsx` — UI already exists, wire it up):
- Fields: email, password
- On login: `supabase.auth.signInWithPassword()`
- After login: fetch profile, redirect based on role

### File: `/components/AuthProvider.tsx`
React context provider that:
- Wraps the app in `layout.tsx`
- Exposes `user`, `profile`, `loading` via `useAuth()` hook
- Listens to `supabase.auth.onAuthStateChange()`
- On logout: redirect to `/`

### File: `/middleware.ts`
Protect dashboard routes:
- `/dashboard/volunteer/*` — require role = volunteer
- `/dashboard/coordinator/*` — require role = coordinator
- If not authenticated, redirect to `/auth/login`
- If wrong role, redirect to correct dashboard

---

## PART 3 — FASTAPI PYTHON BACKEND

The AI verification, IPFS upload, and blockchain write all run through a **separate FastAPI Python backend**. Next.js calls this backend via HTTP. This is a completely separate service from the Next.js app.

### Folder structure:
```
/backend/
  main.py
  routes/
    verify.py        ← POST /verify-proof
    blockchain.py    ← POST /write-blockchain
    tasks.py         ← POST /assign-task, POST /pledge-task
  requirements.txt
  .env
```

### File: `requirements.txt`
```
fastapi
uvicorn
google-generativeai
python-multipart
supabase
python-dotenv
web3storage
thirdweb
```

### File: `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import verify, blockchain, tasks

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify.router)
app.include_router(blockchain.router)
app.include_router(tasks.router)
```

Run with: `uvicorn main:app --reload --port 8000`

### File: `backend/routes/verify.py` — POST `/verify-proof`

Request body:
```python
class VerifyRequest(BaseModel):
    image_base64: str
    task_title: str
    task_description: str
    item_name: str
    quantity: int
    geolocation: dict   # { lat, lng, accuracy }
    volunteer_id: str
    task_id: str
```

Inside the route:
```python
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

image_data = base64.b64decode(image_base64)
image_part = {"mime_type": "image/jpeg", "data": image_data}

prompt = f"""You are verifying disaster relief task completion for the Aapda Mitra scheme in India.

Task: "{task_title}"
Description: "{task_description}"
Expected delivery: {quantity} {item_name}
Volunteer Location: lat {geolocation['lat']}, lng {geolocation['lng']} (accuracy: {geolocation['accuracy']}m)

Analyze this photo and determine:
1. Does the photo show evidence of the task being completed?
2. Can you see the pledged items ({item_name}) in the photo?
3. Is there a human face visible in the frame? (volunteer must be present)
4. Is the recipient or delivery site visible?
5. Does the scene appear consistent with disaster relief work?
6. Are there any signs this is a recycled or old photo?

Respond ONLY in this exact JSON format:
{{
  "verdict": "verified" | "rejected" | "uncertain",
  "confidence": 0.0 to 1.0,
  "face_detected": true | false,
  "items_visible": true | false,
  "notes": "brief explanation under 100 words"
}}"""

response = model.generate_content([image_part, prompt])
```

Parse and return JSON with `verdict`, `confidence`, `face_detected`, `items_visible`, `notes`.

### File: `backend/routes/blockchain.py` — POST `/write-blockchain`

Only called when `verdict = 'verified'`.

```python
from thirdweb import ThirdwebSDK
from thirdweb.types import SDKOptions

sdk = ThirdwebSDK.from_private_key(
    os.getenv("THIRDWEB_PRIVATE_KEY"),
    "polygon",
    SDKOptions(secret_key=os.getenv("THIRDWEB_SECRET_KEY"))
)

contract = sdk.get_contract(os.getenv("CONTRACT_ADDRESS"))
tx = contract.call("recordVerification", [
    volunteer_id,
    task_id,
    ipfs_cid,
    int(time.time()),
    verdict
])
tx_hash = tx.receipt.transaction_hash
```

Return `{ tx_hash }`. Then Next.js updates Supabase with the hash.

### File: `backend/routes/tasks.py`

**POST `/assign-task`** — coordinator assigns a task to a volunteer:
```python
# Insert into tasks table via Supabase
supabase.table("tasks").insert({
    "title": title,
    "description": description,
    "item_name": item_name,
    "quantity": quantity,
    "district": district,
    "ward": ward,
    "assigned_to": volunteer_id,
    "assigned_by": coordinator_id,
    "is_self_pledged": False,
    "status": "pending",
    "due_date": due_date
}).execute()
```

**POST `/pledge-task`** — volunteer creates their own pledge:
```python
# Volunteer pledges a task themselves
supabase.table("tasks").insert({
    "title": f"Delivering {quantity} {item_name} to {ward}",
    "description": description,
    "item_name": item_name,
    "quantity": quantity,
    "district": district,
    "ward": ward,
    "assigned_to": volunteer_id,
    "assigned_by": None,
    "is_self_pledged": True,
    "status": "pending",
    "due_date": due_date
}).execute()
```

Add `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` to `.env.local` in the Next.js project. All fetch calls from Next.js to FastAPI use this base URL.

---

## PART 4 — VOLUNTEER DASHBOARD (Full UI + Data)

### Route: `/app/dashboard/volunteer/page.tsx`

This is the volunteer home screen. Build it completely from scratch (UI + data).

**Layout:**
- Forest Green navbar at top with gold "Groundwork" wordmark (left), volunteer's name (right), logout button
- Cream background (`#F5F0E8`) for main content
- Max width `max-w-4xl mx-auto`, padding `px-4 sm:px-6 lg:px-8 py-6`

**Greeting Section:**
- `motion.div` sliding in from top: `initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}`
- `<h1>` "Good morning, [volunteer's full_name]." — DM Serif Display, `text-3xl font-bold text-[#2D4A2D]`
- Subtext: volunteer's district + ward — DM Sans, `text-sm text-[#6B7C4A]`

**Stats Bar:**
Three stat pills in a flex row showing real counts from Supabase:
- ✅ Verified — count of submissions where `ai_verdict = 'verified'`
- ⏳ Pending — count of tasks where `status = 'pending'` or `status = 'submitted'`
- ⛓ On Ledger — count of submissions where `blockchain_status = 'written'`

Each pill: rounded-full, olive-tinted background `#6B7C4A20`, border `1px solid #6B7C4A40`, DM Sans text-sm, cream text.

**Task List:**
- Fetch all tasks from Supabase where `assigned_to = current user id`
- Display using `TaskCard` component (already exists in `/components/TaskCard.tsx`)
- TaskCard props: `title`, `description`, `status`, `due_date`, `task_id`, `is_self_pledged`
- Each TaskCard shows a small label: "Self-pledged" (olive badge) or "Assigned" (sage badge) based on `is_self_pledged`
- Each TaskCard has a gold CTA button "Submit Proof →" that routes to `/dashboard/volunteer/submit?taskId=[id]`
- If no tasks: show empty state — "No tasks yet. Pledge your first relief task below." centered, sage green, DM Sans

**Pledge a Task (volunteer-created):**
- Gold "＋ New Pledge" button below the task list
- Opens a modal with fields: item name, quantity, location description, ward, due date
- On submit: POST to `${NEXT_PUBLIC_BACKEND_URL}/pledge-task` with volunteer's id and form data
- On success: close modal, new task appears in task list immediately
- Modal style: cream background, forest green headings, gold submit button, rounded-2xl, shadow-xl

**Real-time updates:**
Use Supabase Realtime to subscribe to changes on `tasks` table filtered by `assigned_to = user.id`. Update the task list live without refresh.

---

## PART 5 — SUBMIT PROOF PAGE

### Route: `/app/dashboard/volunteer/submit/page.tsx`

This is the most critical page. Full flow: Camera → FastAPI (Gemini) → IPFS → Blockchain.

**Read `taskId` from URL search params.** Fetch the task details from Supabase and display task title, description, item_name, quantity at the top.

**Step 1 — Camera Capture:**

```tsx
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' }, 
  audio: false 
})
```

- Show live `<video>` feed in a rounded container
- "Capture Photo" button (gold, DM Serif) — captures frame to `<canvas>`, converts to base64
- Show captured image preview with "Retake" option
- **Important:** Capture must happen in-browser. Do NOT allow file upload — only live camera capture. This is the primary spoofing defense.
- On capture: simultaneously capture geolocation:
```ts
navigator.geolocation.getCurrentPosition((pos) => {
  setGeolocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy })
})
```

**Step 2 — AI Verification via FastAPI:**

POST to `${NEXT_PUBLIC_BACKEND_URL}/verify-proof`:
```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-proof`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image_base64: imageBase64,
    task_title: task.title,
    task_description: task.description,
    item_name: task.item_name,
    quantity: task.quantity,
    geolocation,
    volunteer_id: user.id,
    task_id: taskId
  })
})
const { verdict, confidence, face_detected, items_visible, notes } = await res.json()
```

**Step 3 — IPFS Upload:**

Only if `verdict !== 'rejected'`. POST to `${NEXT_PUBLIC_BACKEND_URL}/upload-ipfs` with the image base64. FastAPI uploads to Web3.storage and returns `{ cid, ipfs_url }`.

**Step 4 — Supabase Insert:**

Insert into `submissions` table from the Next.js client:
```ts
await supabase.from('submissions').insert({
  task_id: taskId,
  volunteer_id: user.id,
  photo_url: ipfsUrl,
  ipfs_cid: cid,
  geolocation,
  face_detected,
  ai_verdict: verdict,
  ai_confidence: confidence,
  ai_notes: notes,
  blockchain_status: 'pending'
})
```
Also update `tasks`: set `status = 'submitted'` where `id = taskId`.

**Step 5 — Blockchain Write:**

Only if `verdict = 'verified'`. POST to `${NEXT_PUBLIC_BACKEND_URL}/write-blockchain`:
```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/write-blockchain`, {
  method: 'POST',
  body: JSON.stringify({ volunteer_id: user.id, task_id: taskId, ipfs_cid: cid, verdict })
})
const { tx_hash } = await res.json()
```
Then update `submissions`: set `blockchain_tx_hash = tx_hash`, `blockchain_status = 'written'`. Update `tasks`: set `status = 'verified'`.

**Smart Contract:** Create `/contracts/GroundworkVerification.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GroundworkVerification {
    struct VerificationRecord {
        string volunteerId;
        string taskId;
        string ipfsCid;
        uint256 timestamp;
        string verdict;
    }
    
    VerificationRecord[] public records;
    event RecordAdded(string volunteerId, string taskId, string ipfsCid, uint256 timestamp);
    
    function recordVerification(
        string memory volunteerId,
        string memory taskId,
        string memory ipfsCid,
        uint256 timestamp,
        string memory verdict
    ) public {
        records.push(VerificationRecord(volunteerId, taskId, ipfsCid, timestamp, verdict));
        emit RecordAdded(volunteerId, taskId, ipfsCid, timestamp);
    }
    
    function getRecord(uint256 index) public view returns (VerificationRecord memory) {
        return records[index];
    }
    
    function getTotalRecords() public view returns (uint256) {
        return records.length;
    }
}
```

**UI for the submit page:**

Show a multi-step progress indicator (Step 1: Capture → Step 2: AI Check → Step 3: Ledger Write):

- Step 1 (Capture): Camera feed + capture button
- Step 2 (Verifying): Loading spinner, "Analyzing photo with AI..." in gold
- Step 3 (Writing to ledger): "Recording on Polygon blockchain..." spinner
- Success state: Green checkmark, "Task verified and recorded on ledger." + truncated tx hash linking to `https://polygonscan.com/tx/[hash]`
- Rejection state: Red X, "Verification failed: [notes]" + "Try again" button
- Uncertain state: Yellow warning, "Photo unclear. Coordinator will review manually." — saves to Supabase, does NOT write to blockchain

Handle all errors gracefully: camera denied, geolocation denied, FastAPI down, blockchain failure — show user-friendly messages for each.

---

## PART 6 — SUBMISSION HISTORY PAGE

### Route: `/app/dashboard/volunteer/history/page.tsx`

**Fetch from Supabase:**
```ts
const { data } = await supabase
  .from('submissions')
  .select(`*, tasks(title, description, item_name, quantity, district, ward)`)
  .eq('volunteer_id', user.id)
  .order('submitted_at', { ascending: false })
```

**Display using `HistoryEntry` component** (already exists in `/components/HistoryEntry.tsx`).

Pass props: `taskTitle`, `submittedAt`, `aiVerdict`, `blockchainStatus`, `txHash`, `photoUrl`, `ipfsCid`

For each entry show:
- Task title + date submitted
- AI verdict badge: green "Verified" / red "Rejected" / yellow "Uncertain"
- Blockchain badge: "On Ledger ⛓" in gold if `blockchain_status = 'written'`, else "Pending" in sage
- Truncated IPFS link to the proof photo
- If txHash exists: "View on Polygonscan →" link

---

## PART 7 — COORDINATOR DASHBOARD DATA WIRING

The coordinator dashboard UI is already built. Wire it up with real Supabase data.

### File: `/app/dashboard/coordinator/page.tsx` — wire these data calls:

**Volunteers list:**
```ts
const { data: volunteers } = await supabase
  .from('profiles')
  .select('*, tasks(count)')
  .eq('role', 'volunteer')
  .eq('district', coordinatorProfile.district)
```

**Task assignment:**
POST to `${NEXT_PUBLIC_BACKEND_URL}/assign-task` from coordinator dashboard with: title, description, item_name, quantity, district, ward, volunteer_id, coordinator_id, due_date.

**Submissions overview:**
```ts
const { data: submissions } = await supabase
  .from('submissions')
  .select(`*, tasks(title, ward, item_name, quantity), profiles(full_name, aapda_mitra_id)`)
  .order('submitted_at', { ascending: false })
  .limit(50)
```

**Real-time task status updates:**
Subscribe to `submissions` table changes using Supabase Realtime. When a new verified submission comes in, update the coordinator dashboard live.

---

## PART 8 — FILE STRUCTURE TO CREATE

```
/backend/                             ← FastAPI Python service (separate from Next.js)
  main.py
  routes/
    verify.py                         ← POST /verify-proof (Gemini Vision)
    blockchain.py                     ← POST /write-blockchain (Thirdweb/Polygon)
    tasks.py                          ← POST /assign-task, POST /pledge-task, POST /upload-ipfs
  requirements.txt
  .env                                ← backend env vars (GEMINI_API_KEY, THIRDWEB keys etc.)

/supabase/
  schema.sql                          ← full schema + RLS policies

/contracts/
  GroundworkVerification.sol          ← Solidity smart contract

/lib/
  supabase.ts                         ← client-side supabase instance
  supabaseServer.ts                   ← server-side supabase instance

/components/
  AuthProvider.tsx                    ← auth context + useAuth() hook

/middleware.ts                        ← route protection

/app/
  auth/
    signup/page.tsx                   ← wire existing UI to supabase
    login/page.tsx                    ← wire existing UI to supabase
  dashboard/
    volunteer/
      page.tsx                        ← full volunteer dashboard (UI + data + pledge modal)
      submit/page.tsx                 ← full submit proof flow
      history/page.tsx                ← submission history with real data
    coordinator/
      page.tsx                        ← wire existing UI with real data
```

---

## PART 9 — DESIGN RULES

- Volunteer dashboard background: Cream `#F5F0E8`
- Navbar: Forest Green `#2D4A2D`, Gold `#C4973A` wordmark
- All CTAs / primary buttons: Antique Gold `#C4973A`, Forest Green text
- Status badges: use `StatusBadge` component already in `/components/StatusBadge.tsx`
- All text: DM Sans body, DM Serif Display headings — already in globals.css
- All loading states: skeleton loaders using `animate-pulse` Tailwind class, cream/olive tones
- All animations: Framer Motion, same spring config used on landing (`stiffness: 300, damping: 20`)
- Mobile-first, fully responsive
- `prefers-reduced-motion`: collapse all animations to instant opacity: 1

---

## PART 10 — ENV VARIABLES NEEDED

### Next.js `/env.local.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Your Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=          # Service role key (server-side only, never expose to client)

# FastAPI backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Blockchain (client-readable only — contract address is public)
NEXT_PUBLIC_CONTRACT_ADDRESS=       # Deployed GroundworkVerification contract address on Polygon
```

### FastAPI `/backend/.env`:
```env
# Gemini Vision AI
GEMINI_API_KEY=                     # Google AI Studio API key

# Web3.storage (IPFS)
WEB3_STORAGE_TOKEN=                 # Web3.storage API token

# Thirdweb + Polygon
THIRDWEB_SECRET_KEY=                # Thirdweb secret key
THIRDWEB_PRIVATE_KEY=               # Wallet private key — NEVER expose, server only

# Supabase (for backend writes)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## CRITICAL RULES

- Do NOT modify: `/app/page.tsx`, `/app/dashboard/coordinator/` UI files, any existing component files
- Do NOT add any new npm packages without checking `package.json` first
- FastAPI runs on port 8000, Next.js on port 3000 — CORS is configured in `main.py`
- Never expose `THIRDWEB_PRIVATE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client — backend only
- Submit proof must always use live camera — never a file picker
- Blockchain write only on `ai_verdict = 'verified'` — not on 'uncertain' or 'rejected'
- If Gemini returns `uncertain`: save to Supabase, flag for coordinator review, do NOT block volunteer
- Geolocation and face detection are secondary — if they fail, log it but do not block submission
- Both self-pledged and coordinator-assigned tasks go through the exact same submit proof flow

---

## DEMO FLOW (build to support this exactly)

1. Meera (volunteer, Ward 7, Wayanad) opens the app on her phone browser
2. Logs in → lands on `/dashboard/volunteer`
3. She creates a self-pledge: "Delivering 50 water bottles to Ward 7" via "＋ New Pledge" modal
4. Task appears in her list with "Self-pledged" badge
5. Taps "Submit Proof →"
6. Camera opens → she captures a photo of herself distributing water bottles
7. App captures her GPS location simultaneously
8. Next.js POSTs to FastAPI `/verify-proof` → Gemini Vision analyzes → returns `verified`, confidence 0.91, face detected, items visible
9. FastAPI uploads photo to IPFS → returns CID
10. Next.js writes submission to Supabase
11. Next.js POSTs to FastAPI `/write-blockchain` → Polygon transaction written → tx hash returned
12. Supabase updated with tx hash, task status = 'verified'
13. Dashboard updates: stats bar shows new "On Ledger ⛓" count, task card shows "Verified"
14. Org coordinator (on desktop) sees Meera's verified submission appear in real-time
