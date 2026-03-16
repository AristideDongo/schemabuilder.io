# ARCHITECTURE

Tu es un expert Next.js fullstack senior. Génère un projet complet appelé **Schema Builder** — une application web permettant de visualiser, éditer et gérer des schémas de bases de données (MySQL, PostgreSQL, MariaDB, MongoDB, SQLite, CockroachDB) avec un canvas interactif.

---

### Stack technique
- **Base de données (app)** : MongoDB via Mongoose (pour stocker les workspaces/projets)
- **Auth** : NextAuth.js v5 (credentials)
- **Canvas** : React Flow (visualisation des schémas)
- **UI** : shadcn/ui + Tailwind CSS
- **State** : Zustand (client) + React Query (server state)
- **Formulaires** : React Hook Form + Zod
- **Tests** : Vitest + React Testing Library + Playwright (e2e)

---

### Architecture : Clean Architecture + DDD

src/
├── domain/                    # Entités, value objects, repository interfaces
│   ├── schema/
│   │   ├── entities/          # Schema, Table, Column, Relation, Index
│   │   ├── value-objects/     # ColumnType, Constraint, DbEngine
│   │   ├── repositories/      # ISchemaRepository, IConnectionRepository
│   │   └── services/          # SchemaDiffService, MigrationGeneratorService
│   └── workspace/
│       ├── entities/          # Workspace, User, Member
│       └── repositories/      # IWorkspaceRepository
│
├── application/               # Use cases / Application services
│   ├── schema/
│   │   ├── commands/          # CreateTable, AddColumn, DeleteRelation...
│   │   ├── queries/           # GetSchema, ListTables, CompareSchemasQuery
│   │   └── handlers/          # CQRS handlers
│   └── connection/
│       ├── commands/          # ConnectDatabase, IntrospectSchema
│       └── queries/           # ListConnections, TestConnection
│
├── infrastructure/            # Implémentations concrètes
│   ├── db/
│   │   ├── prisma/            # PrismaSchemaRepository
│   │   └── introspection/     # MySQLIntrospector, PgIntrospector, MongoIntrospector
│   ├── migration/             # SQL generator, Prisma schema generator
│   └── export/                # PNGExporter, SVGExporter, MarkdownExporter
│
├── presentation/              # Next.js App Router
│   ├── app/
│   │   ├── (auth)/            # login, register
│   │   ├── dashboard/         # Liste des projets
│   │   ├── schema/[id]/       # Canvas principal
│   │   └── api/               # Route handlers (REST)
│   ├── components/
│   │   ├── canvas/            # ReactFlow nodes, edges, toolbar
│   │   ├── sidebar/           # Table editor, column form
│   │   └── modals/            # Connection modal, export modal
│   └── hooks/                 # useSchema, useCanvas, useIntrospect
│
└── shared/
├── types/                 # Types globaux partagés
├── errors/                # AppError, DomainError, InfraError
└── utils/                 # formatters, validators