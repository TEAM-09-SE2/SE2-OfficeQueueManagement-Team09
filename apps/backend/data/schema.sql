-- Drop existing tables to allow recreation from scratch
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS counters_services;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS counters;

-- 1. Counters Table
CREATE TABLE "counters" (
    "id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL UNIQUE,
    PRIMARY KEY("id" AUTOINCREMENT)
);

-- 2. Services Table
CREATE TABLE "services" (
    "id" INTEGER,
    "name" TEXT NOT NULL UNIQUE,
    "processing_time" NUMERIC NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

-- 3. Association Table between Counters and Services
CREATE TABLE "counters_services" (
    "id" INTEGER,
    "id_counter" INTEGER NOT NULL,
    "id_service" INTEGER NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("id_counter") REFERENCES "counters"("id") ON DELETE CASCADE,
    FOREIGN KEY("id_service") REFERENCES "services"("id") ON DELETE CASCADE
);

-- 4. Tickets Table
CREATE TABLE "tickets" (
    "id" INTEGER,
    "id_counter" INTEGER,
    "id_service" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL CHECK("status" IN ('WAITING', 'SERVED')),
    "issue_at" TEXT NOT NULL,
    "served_at" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("id_counter") REFERENCES "counters"("id") ON DELETE SET NULL,
    FOREIGN KEY("id_service") REFERENCES "services"("id") ON DELETE CASCADE
);