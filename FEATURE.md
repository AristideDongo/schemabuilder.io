---

### Features à implémenter (par priorité)

**P0 — Core**
1. Canvas React Flow avec zoom/pan/minimap
2. Connexion DB (MySQL, PostgreSQL, MariaDB, MongoDB, SQLite) via URL ou host/port
3. Introspection automatique du schéma réel
4. Affichage tables/collections sous forme de nodes avec colonnes, types, clés
5. Relations visuelles avec crow's foot (FK auto-détectées)

**P1 — Edition**
6. Création/édition/suppression de tables et colonnes inline sur le canvas
7. Types natifs par engine (INT, VARCHAR, JSONB, ObjectId, TIMESTAMP, etc.)
8. Contraintes : PK, FK, UNIQUE, NOT NULL, DEFAULT, CHECK
9. Index simples et composites
10. Undo/Redo illimité (Zustand history middleware)

**P2 — Migration & Export**
11. Génération de migrations SQL (up/down) depuis le diff entre deux états
12. Export schéma : Prisma schema, Drizzle ORM, SQL brut
13. Export visuel : PNG, SVG, PDF
14. Génération de documentation Markdown automatique

**P3 — Collaboration**
15. Workspace multi-projets
16. Rôles : viewer, editor, admin
17. Partage par lien public (read-only)
18. Commentaires sur les tables/colonnes

---

### Patterns & Principes

- **SOLID** : chaque classe a une seule responsabilité, dépend d'abstractions (interfaces)
- **CQRS** : séparer les commandes (mutations) des queries (lectures)
- **Repository pattern** : toute la persistance derrière des interfaces injectées
- **Factory pattern** : `DbIntrospectorFactory.create(engine)` retourne le bon introspecteur
- **Strategy pattern** : `MigrationStrategy` différente par engine
- **Value Objects immutables** pour ColumnType, DbEngine, Constraint
- **Domain Events** : `TableCreated`, `RelationAdded`, `SchemaImported`

---

### Contraintes importantes

- Toutes les connexions DB passent côté serveur uniquement (jamais exposées au client)
- Credentials chiffrés en base (AES-256)
- Rate limiting sur les endpoints d'introspection
- Validation Zod sur toutes les entrées API
- Erreurs typées avec codes d'erreur métier

---