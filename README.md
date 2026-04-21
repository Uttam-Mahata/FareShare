# FareShare

Offline-first expense splitter for shared commutes. You enter who paid what — FareShare handles the splitting, the running balances, and the eventual sync when someone finally gets back online.

Spring Boot backend + Expo mobile client (iOS / Android / Web) with WatermelonDB for true offline-first local storage.

---

## Stack

**Backend** — Java 21, Spring Boot 3.2.5, Spring Security (JWT), JPA / Hibernate, HikariCP, Azure SQL (via JDBC).

**Mobile / Web** — Expo SDK 54, React Native 0.81.5, React 19, WatermelonDB (SQLite on native, LokiJS/IndexedDB on web), React Navigation, Axios.

**Offline-first** — every write goes to local DB immediately; a background sync layer (`src/sync/SyncManager.js`) reconciles with the server on reconnect.

---

## Repo layout

```
.
├── backend/                  Spring Boot service
│   ├── src/main/java/com/commutesplit/
│   │   ├── controller/       REST endpoints (auth, groups, sync)
│   │   ├── service/          Business logic, balance calculation
│   │   ├── security/         JWT filter + config
│   │   ├── entity/           JPA entities
│   │   └── repository/       Spring Data repos
│   ├── src/main/resources/application.yml
│   ├── .env.example
│   └── start.sh              loads .env, runs the jar
└── mobile/                   Expo app
    ├── src/
    │   ├── api/              axios clients (auth, groups, sync)
    │   ├── db/
    │   │   ├── database.native.js   SQLiteAdapter (iOS/Android, JSI)
    │   │   ├── database.web.js      LokiJSAdapter (web)
    │   │   ├── models/              WatermelonDB models
    │   │   └── schema.js
    │   ├── screens/          Auth, Home, Group, AddExpense, History
    │   ├── navigation/
    │   ├── sync/SyncManager.js
    │   └── config.js         API_BASE_URL lives here
    └── app.json
```

---

## Running locally

### Prerequisites

- Java 21
- Maven (or use the prebuilt `backend/target/commute-split-backend-1.0.0.jar`)
- Node 18+
- An Azure SQL database (or any SQL Server instance reachable via JDBC)

### 1. Backend

```bash
cd backend
cp .env.example .env
# fill in AZURE_SQL_* and JWT_SECRET in .env
mvn package -DskipTests       # skip if the jar already exists under target/
bash start.sh
```

Server listens on `http://localhost:8080`. Schema auto-migrates on startup (`ddl-auto: update`).

Required env vars (no defaults — the app fails fast if any are missing):

| Var | Example |
|---|---|
| `AZURE_SQL_URL` | `jdbc:sqlserver://host:1433;database=...;encrypt=true` |
| `AZURE_SQL_USER` | `sqladmin` |
| `AZURE_SQL_PASSWORD` | `***` |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `PORT` | `8080` (optional) |

### 2. Mobile / Web

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --web              # browser
# or: npx expo start              # then press `a` / `i` for native (requires a dev build — see below)
```

`src/config.js` points at `http://localhost:8080` by default.

### 3. Native builds (iOS / Android)

WatermelonDB and `react-native-background-fetch` have native code not bundled into Expo Go, so you need a **dev client**:

```bash
cd mobile
npx expo install expo-dev-client
npx expo prebuild
npx expo run:android          # or run:ios
```

After the first build, `npx expo start` serves JS into your custom binary.

---

## API surface

All endpoints under `/api`. Everything except `/api/auth/**` requires `Authorization: Bearer <jwt>`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Exchange credentials for JWT |
| `POST` | `/api/groups` | Create a group |
| `POST` | `/api/groups/join` | Join an existing group by invite code |
| `GET` | `/api/groups/{id}/members` | List members of a group |
| `GET` | `/api/groups/{id}/balances` | Net balance per member |
| `POST` | `/api/sync/push` | Upload local changes (expenses, splits) |
| `GET` | `/api/sync/pull` | Download server-side changes since last cursor |

---

## Data model (mobile, WatermelonDB)

- `expenses` — `group_id`, `payer_id`, `amount`, `type`, `expense_date`, `sync_id`, `is_synced`, timestamps
- `expense_splits` — `expense_id`, `user_id`, `amount_owed`, `is_synced`

Every local row carries a `sync_id` and `is_synced` flag; the SyncManager pushes un-synced rows and pulls remote diffs.

---

## Configuration notes

- **Secrets never land in the repo** — `.env` and `.env.*` are gitignored; `application.yml` reads `${AZURE_SQL_PASSWORD}` / `${JWT_SECRET}` with no defaults so the server won't boot if you forget to set them.
- **JDK 21 only** — the pom targets 21.
- **Default bus fare** — `mobile/src/config.js` → `BUS_FARE = 12` (rupees). Edit as needed.

---

## License

MIT. See [LICENSE](LICENSE).
