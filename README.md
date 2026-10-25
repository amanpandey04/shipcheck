 <p align="center">
  <img
    src="frontend/public/shipcheck-icon.png"
    alt="ShipCheck app icon"
    width="100"
  />
</p>

<h1 align="center">ShipCheck</h1>

<p align="center">
  A full-stack release checklist application built with React, Node.js, GraphQL, and PostgreSQL.
</p>

<p align="center">
  <strong>Plan · Track · Ship</strong>
</p>

<p align="center">
  <a href="https://shipcheck-tool.vercel.app/">Live Demo</a>
</p>

<p align="center">
  <img
    src="docs/shipcheck-demo.gif"
    alt="ShipCheck walkthrough demonstrating release creation, checklist progress, and saved information"
    width="900"
  />
</p>

---

## Overview

ShipCheck is a full-stack release checklist application for organizing software releases and tracking their readiness through a predefined set of tasks.

Users can create releases, track checklist completion, save release-specific information, and monitor release status as work progresses. The application uses GraphQL for communication between the React frontend and Node.js backend, with PostgreSQL for persistent storage.

The project was built to practice full-stack development, API design, database integration, automated testing, containerization, deployment, and performance testing.

## Features

- **Release management:** Create, view, and delete software releases.
- **Release tracking:** Monitor completion progress for each release.
- **Dynamic status:** Automatically calculate whether a release is `PLANNED`, `ONGOING`, or `DONE`.
- **Interactive checklist:** Complete and uncheck individual release steps.
- **Release-specific information:** Add and update additional notes for each release.
- **Persistent storage:** Store releases and checklist progress in PostgreSQL.
- **GraphQL API:** Query release data and perform mutations through Apollo Server.
- **Automated tests:** Test release-status logic, service functions, resolvers, and GraphQL execution.
- **Containerized backend:** Run the API and PostgreSQL together using Docker Compose.
- **Performance testing:** Use k6 to simulate concurrent API traffic and measure response times.

## Tech Stack

| Area             | Technologies                 |
| ---------------- | ---------------------------- |
| Frontend         | React, JavaScript, Vite      |
| Styling          | Tailwind CSS, DaisyUI        |
| Routing          | React Router                 |
| API client       | Apollo Client                |
| Backend          | Node.js, Apollo Server       |
| API              | GraphQL                      |
| Database         | PostgreSQL                   |
| ORM              | Prisma 7, PostgreSQL adapter |
| Testing          | Vitest                       |
| Load testing     | k6                           |
| Containerization | Docker, Docker Compose       |
| Deployment       | Vercel, Render, Neon         |

## Application Architecture

```text
┌──────────────────────────────┐
│      React + Vite            │
│   Tailwind CSS + DaisyUI     │
└──────────────┬───────────────┘
               │
               │ Apollo Client
               │ GraphQL queries
               │ and mutations
               ▼
┌──────────────────────────────┐
│      Apollo Server           │
│       Node.js API            │
├──────────────────────────────┤
│   GraphQL Resolvers          │
│          ↓                   │
│     Service Layer            │
│          ↓                   │
│     Prisma Client            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       PostgreSQL             │
│   Persistent release data    │
└──────────────────────────────┘
```

The frontend communicates with the backend through GraphQL. Resolvers delegate business operations to the service layer, while Prisma handles database queries and mutations.

Docker Compose provides the local backend and PostgreSQL environment. In production, the frontend is hosted on Vercel, the backend runs on Render, and the database is hosted on Neon.

## Release Status Logic

Each release contains eight predefined checklist steps:

1. Review and merge changes
2. Update the CHANGELOG
3. Validate database migrations
4. Pass the automated test suite
5. Prepare release notes
6. Deploy to staging
7. Complete QA sign-off
8. Ship to production

A release's status is calculated from its completed checklist steps:

| Status    | Condition                              |
| --------- | -------------------------------------- |
| `PLANNED` | No steps are completed                 |
| `ONGOING` | Some, but not all, steps are completed |
| `DONE`    | Every checklist step is completed      |

Checklist step IDs are stable identifiers, so saved completion progress remains associated with the correct steps.

## Project Structure

```text
release-checklist/
├── frontend/
│   ├── public/
│   │   └── shipcheck-icon.png
│   ├── src/
│   │   ├── components/
│   │   ├── graphql/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── constants/
│   │   ├── db/
│   │   ├── graphql/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── tests/
│   │   ├── releaseStatus.test.js
│   │   ├── releaseService.test.js
│   │   ├── resolvers.test.js
│   │   └── graphqlApi.test.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── prisma7.config.js
│   └── package.json
├── load-tests/
│   ├── graphql-load-test.js
│   └── graphql-stress-test.js
├── docs/
│   └── shipcheck-demo.gif
├── docker-compose.yaml
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following tools before running ShipCheck locally:

- Node.js and npm
- Git
- Docker Desktop with Docker Compose

For performance testing, install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

### 1. Clone the repository

```bash
git clone https://github.com/amanpandey04/shipcheck.git
cd shipcheck
```

### 2. Configure the backend environment

Create `backend/.env` with the following local development connection string:

```dotenv
DATABASE_URL="postgresql://release_user:release_password@localhost:5432/release_checklist?schema=public"
```

This URL is for the local PostgreSQL instance defined in Docker Compose. Do not use it as your production database URL.

### 3. Start PostgreSQL

From the project root:

```bash
docker compose up -d postgres
```

Check the database container:

```bash
docker compose ps
```

Wait until PostgreSQL is healthy before proceeding.

### 4. Install backend dependencies

```bash
cd backend
npm install
```

Generate the Prisma Client:

```bash
npx prisma generate --config ./prisma7.config.js
```

Apply the existing database migrations:

```bash
npx prisma migrate deploy --config ./prisma7.config.js
```

Start the development server:

```bash
npm run dev
```

The GraphQL API is available at:

`http://localhost:4000/`

### 5. Configure and start the frontend

Open a second terminal and move to the frontend directory:

```bash
cd frontend
```

Create or update `frontend/.env`:

```dotenv
VITE_GRAPHQL_URL=http://localhost:4000/
```

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173/`.

The frontend now communicates with your local GraphQL backend.

## Environment Variables

| Variable           | Used by              | Purpose                                                               |
| ------------------ | -------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`     | Backend              | PostgreSQL connection used by Prisma Client                           |
| `DIRECT_URL`       | Backend / Prisma CLI | Direct PostgreSQL connection for Prisma CLI operations and migrations |
| `VITE_GRAPHQL_URL` | Frontend             | GraphQL endpoint used by Apollo Client                                |
| `PORT`             | Backend              | Port on which the API server listens                                  |
| `NODE_ENV`         | Backend              | Runtime environment, such as `production`                             |

For local development, `DIRECT_URL` can be left unset when `DATABASE_URL` points directly to the local PostgreSQL instance, as the Prisma configuration falls back to it.

For production, configure the environment variables through the relevant hosting dashboards. Use Neon's pooled connection for `DATABASE_URL` and its direct connection for `DIRECT_URL`.

**Never commit real database credentials or private connection strings to GitHub.** Local `.env` files are excluded through `.gitignore`.

## GraphQL API

The API supports queries and mutations for managing releases.

### Queries

- `releases` — Retrieve all releases.
- `release(id)` — Retrieve an individual release.

### Mutations

- `createRelease(input)` — Create a release.
- `setStepCompletion(input)` — Mark a checklist step complete or incomplete.
- `updateReleaseAdditionalInfo(input)` — Save or update release-specific information.
- `deleteRelease(id)` — Delete a release.

The local GraphQL endpoint is `http://localhost:4000/`. The deployed endpoint is available at:

`https://shipcheck-backend.onrender.com/`

### Example query

```graphql
query {
  releases {
    id
    name
    date
    status
    completedStepsCount
    totalSteps
  }
}
```

## Automated Testing

ShipCheck uses Vitest to test the backend's core logic and GraphQL execution.

Run all tests once:

```bash
cd backend
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate a coverage report:

```bash
npm run test:coverage
```

The test suite currently contains **40 automated tests across four test files**.

Coverage includes:

- Release-status calculation
- Service-layer operations and validation
- GraphQL resolver behavior
- GraphQL query and mutation execution
- Schema validation and error propagation

The current coverage report showed 100% statement, branch, function, and line coverage for the files included in that report. Coverage does not guarantee that every possible input, database condition, or deployment failure has been tested.

## Docker

The project includes a Dockerfile for the backend and a Docker Compose configuration for the backend and PostgreSQL.

From the project root, build and start the full stack:

```bash
docker compose up --build -d
```

Check container status:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs backend --tail=100
```

View PostgreSQL logs:

```bash
docker compose logs postgres --tail=50
```

Stop the containers:

```bash
docker compose down
```

The `postgres_data` named volume preserves local database data when containers are stopped or recreated.

**Warning:** `docker compose down -v` also removes named volumes and can delete the local database data. Avoid that command unless you explicitly intend to reset the local database.

## Performance Testing with k6

ShipCheck includes two k6 scripts for testing the GraphQL API.

Run the baseline test:

```bash
k6 run load-tests/graphql-load-test.js
```

Run the staged stress test:

```bash
k6 run load-tests/graphql-stress-test.js
```

Both scripts target the local Dockerized API at `http://localhost:4000/` by default. An alternative endpoint can be supplied through the `BASE_URL` environment variable.

### Recorded stress-test results

The local stress test used a staged load of up to 50 virtual users and repeatedly executed a read-only GraphQL query.

| Metric                           | Recorded result |
| -------------------------------- | --------------: |
| Maximum configured virtual users |              50 |
| Completed HTTP requests          |           1,983 |
| Average response time            |         7.54 ms |
| 95th-percentile response time    |         14.5 ms |
| Maximum response time            |       293.28 ms |
| Failed HTTP requests             |              0% |
| Successful checks                |            100% |

The test passed its configured thresholds:

- Less than 1% failed HTTP requests
- 95th-percentile response time below 500 ms
- More than 99% successful checks

These results represent a recorded run on the local Docker environment. They are not a guarantee of production capacity, and this workload tests a read-only query rather than concurrent database writes.

## Deployment

ShipCheck is deployed using the following services:

| Component | Hosting platform | URL                                                                       |
| --------- | ---------------- | ------------------------------------------------------------------------- |
| Frontend  | Vercel           | [shipcheck-tool.vercel.app](https://shipcheck-tool.vercel.app/)           |
| Backend   | Render           | [shipcheck-backend.onrender.com](https://shipcheck-backend.onrender.com/) |
| Database  | Neon             | Managed PostgreSQL                                                        |

The frontend uses `VITE_GRAPHQL_URL` to communicate with the deployed GraphQL API.

The backend receives its production PostgreSQL connection settings through Render environment variables. Prisma migrations are applied during container startup before the server launches.

The Neon production database is separate from the local Docker database. Existing local release records are not automatically copied to production.

## Future Improvements

Potential future enhancements include:

- Authentication and user-specific release management
- Customizable checklist templates
- Additional release history and audit information
- More extensive real-database integration tests
- Load testing for concurrent writes and larger workloads
- Monitoring and structured logging for production operations

---

<p align="center">
  <strong>Plan · Track · Ship</strong>
</p>
