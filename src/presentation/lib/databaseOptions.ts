import { DbEngine } from "@/domain/value-objects/DbEngine";

export const DB_OPTIONS: { engine: DbEngine; label: string; color: string; description: string }[] = [
    { engine: DbEngine.PostgreSQL, label: "PostgreSQL", color: "bg-blue-500", description: "Advanced open-source RDBMS" },
    { engine: DbEngine.MySQL, label: "MySQL", color: "bg-orange-500", description: "World's most popular open-source DB" },
    { engine: DbEngine.MariaDB, label: "MariaDB", color: "bg-amber-600", description: "Community-developed MySQL fork" },
    { engine: DbEngine.SQLite, label: "SQLite", color: "bg-sky-500", description: "Lightweight embedded database" },
    { engine: DbEngine.SQLServer, label: "SQL Server", color: "bg-red-600", description: "Microsoft's enterprise RDBMS" },
    { engine: DbEngine.MongoDB, label: "MongoDB", color: "bg-green-500", description: "Leading NoSQL document database" },
];

export const ENGINE_COLORS: Record<string, string> = {
    PostgreSQL: "text-blue-700 bg-blue-50 border-blue-200",
    MySQL: "text-orange-700 bg-orange-50 border-orange-200",
    MariaDB: "text-amber-700 bg-amber-50 border-amber-200",
    SQLite: "text-sky-700 bg-sky-50 border-sky-200",
    "SQL Server": "text-red-700 bg-red-50 border-red-200",
    MongoDB: "text-green-700 bg-green-50 border-green-200",
};