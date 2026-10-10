-- Preliminary cleanup to prevent duplicate errors on re-execution
DELETE FROM counters_services;
DELETE FROM tickets;
DELETE FROM services;
DELETE FROM counters;

-- 1. Insert 6 Counters
INSERT INTO counters (id, number) VALUES (1, 1);
INSERT INTO counters (id, number) VALUES (2, 2);
INSERT INTO counters (id, number) VALUES (3, 3);
INSERT INTO counters (id, number) VALUES (4, 4);
INSERT INTO counters (id, number) VALUES (5, 5);
INSERT INTO counters (id, number) VALUES (6, 6);

-- 2. Insert 10 Services (processing_time in minutes)
-- Note: Service ID 10 ('Historical Archives') is intentionally not associated with any counter
INSERT INTO services (id, name, processing_time) VALUES (1, 'Parcel Shipping', 5);
INSERT INTO services (id, name, processing_time) VALUES (2, 'Bill Payment', 3);
INSERT INTO services (id, name, processing_time) VALUES (3, 'Registered Mail Pickup', 4);
INSERT INTO services (id, name, processing_time) VALUES (4, 'Change of Address', 10);
INSERT INTO services (id, name, processing_time) VALUES (5, 'Account Opening', 15);
INSERT INTO services (id, name, processing_time) VALUES (6, 'Mortgage Consultation', 20);
INSERT INTO services (id, name, processing_time) VALUES (7, 'Digital ID Issuance', 8);
INSERT INTO services (id, name, processing_time) VALUES (8, 'ID Card Request', 6);
INSERT INTO services (id, name, processing_time) VALUES (9, 'General Information', 2);
INSERT INTO services (id, name, processing_time) VALUES (10, 'Historical Archives', 12);

-- 3. Association between Counters and Services
-- Counter 1: provides multiple services (1, 2, 3, 7)
INSERT INTO counters_services (id_counter, id_service) VALUES (1, 1);
INSERT INTO counters_services (id_counter, id_service) VALUES (1, 2);
INSERT INTO counters_services (id_counter, id_service) VALUES (1, 3);
INSERT INTO counters_services (id_counter, id_service) VALUES (1, 7);

-- Counter 2: provides a single service (4)
INSERT INTO counters_services (id_counter, id_service) VALUES (2, 4);

-- Counters 3, 4, 5, 6: provide mixed configurations
INSERT INTO counters_services (id_counter, id_service) VALUES (3, 5);
INSERT INTO counters_services (id_counter, id_service) VALUES (3, 6);
INSERT INTO counters_services (id_counter, id_service) VALUES (4, 8);
INSERT INTO counters_services (id_counter, id_service) VALUES (5, 9);
INSERT INTO counters_services (id_counter, id_service) VALUES (6, 1);
INSERT INTO counters_services (id_counter, id_service) VALUES (6, 9);

-- 4. Insert 60 Tickets
-- (40 SERVED tickets, 5 SERVING tickets currently at counters, 15 WAITING tickets)

-- 40 Served Tickets (served_at indica il momento della presa in carico allo sportello)
INSERT INTO tickets (id, id_counter, id_service, code, status, issue_at, served_at) VALUES 
(1, 1, 1, 'A101', 'SERVED', '2026-10-08T08:30:00Z', '2026-10-08T08:32:10Z'),
(2, 2, 4, 'B101', 'SERVED', '2026-10-08T08:31:00Z', '2026-10-08T08:35:00Z'),
(3, 1, 2, 'C101', 'SERVED', '2026-10-08T08:33:00Z', '2026-10-08T08:36:15Z'),
(4, 3, 5, 'D101', 'SERVED', '2026-10-08T08:35:00Z', '2026-10-08T08:45:20Z'),
(5, 4, 8, 'E101', 'SERVED', '2026-10-08T08:40:00Z', '2026-10-08T08:43:00Z'),
(6, 1, 3, 'F101', 'SERVED', '2026-10-08T08:42:00Z', '2026-10-08T08:47:11Z'),
(7, 5, 9, 'G101', 'SERVED', '2026-10-08T08:45:00Z', '2026-10-08T08:46:30Z'),
(8, 6, 1, 'A102', 'SERVED', '2026-10-08T08:48:00Z', '2026-10-08T08:52:00Z'),
(9, 2, 4, 'B102', 'SERVED', '2026-10-08T08:50:00Z', '2026-10-08T09:00:15Z'),
(10, 3, 6, 'H101', 'SERVED', '2026-10-08T08:55:00Z', '2026-10-08T09:10:00Z'),
(11, 1, 7, 'I101', 'SERVED', '2026-10-08T09:00:00Z', '2026-10-08T09:08:40Z'),
(12, 4, 8, 'E102', 'SERVED', '2026-10-08T09:03:00Z', '2026-10-08T09:07:25Z'),
(13, 6, 9, 'G102', 'SERVED', '2026-10-08T09:05:00Z', '2026-10-08T09:06:50Z'),
(14, 1, 1, 'A103', 'SERVED', '2026-10-08T09:10:00Z', '2026-10-08T09:15:30Z'),
(15, 2, 4, 'B103', 'SERVED', '2026-10-08T09:12:00Z', '2026-10-08T09:22:10Z'),
(16, 5, 9, 'G103', 'SERVED', '2026-10-08T09:15:00Z', '2026-10-08T09:18:00Z'),
(17, 3, 5, 'D102', 'SERVED', '2026-10-08T09:20:00Z', '2026-10-08T09:32:00Z'),
(18, 1, 2, 'C102', 'SERVED', '2026-10-08T09:25:00Z', '2026-10-08T09:29:45Z'),
(19, 4, 8, 'E103', 'SERVED', '2026-10-08T09:30:00Z', '2026-10-08T09:35:15Z'),
(20, 6, 1, 'A104', 'SERVED', '2026-10-08T09:33:00Z', '2026-10-08T09:38:00Z'),
(21, 1, 3, 'F102', 'SERVED', '2026-10-08T09:36:00Z', '2026-10-08T09:41:20Z'),
(22, 2, 4, 'B104', 'SERVED', '2026-10-08T09:40:00Z', '2026-10-08T09:50:00Z'),
(23, 5, 9, 'G104', 'SERVED', '2026-10-08T09:45:00Z', '2026-10-08T09:47:30Z'),
(24, 3, 6, 'H102', 'SERVED', '2026-10-08T09:50:00Z', '2026-10-08T10:05:00Z'),
(25, 1, 7, 'I102', 'SERVED', '2026-10-08T09:55:00Z', '2026-10-08T10:02:10Z'),
(26, 4, 8, 'E104', 'SERVED', '2026-10-08T10:00:00Z', '2026-10-08T10:06:00Z'),
(27, 6, 9, 'G105', 'SERVED', '2026-10-08T10:03:00Z', '2026-10-08T10:05:12Z'),
(28, 1, 1, 'A105', 'SERVED', '2026-10-08T10:08:00Z', '2026-10-08T10:13:40Z'),
(29, 2, 4, 'B105', 'SERVED', '2026-10-08T10:10:00Z', '2026-10-08T10:21:00Z'),
(30, 5, 9, 'G106', 'SERVED', '2026-10-08T10:15:00Z', '2026-10-08T10:17:30Z'),
(31, 3, 5, 'D103', 'SERVED', '2026-10-08T10:20:00Z', '2026-10-08T10:33:00Z'),
(32, 1, 2, 'C103', 'SERVED', '2026-10-08T10:25:00Z', '2026-10-08T10:28:50Z'),
(33, 4, 8, 'E105', 'SERVED', '2026-10-08T10:30:00Z', '2026-10-08T10:36:00Z'),
(34, 6, 1, 'A106', 'SERVED', '2026-10-08T10:35:00Z', '2026-10-08T10:40:15Z'),
(35, 2, 4, 'B106', 'SERVED', '2026-10-08T10:40:00Z', '2026-10-08T10:50:30Z'),
(36, 1, 3, 'F103', 'SERVED', '2026-10-08T10:45:00Z', '2026-10-08T10:50:00Z'),
(37, 5, 9, 'G107', 'SERVED', '2026-10-08T10:50:00Z', '2026-10-08T10:52:15Z'),
(38, 3, 6, 'H103', 'SERVED', '2026-10-08T10:55:00Z', '2026-10-08T11:10:00Z'),
(39, 1, 7, 'I103', 'SERVED', '2026-10-08T11:00:00Z', '2026-10-08T11:08:00Z'),
(40, 4, 8, 'E106', 'SERVED', '2026-10-08T11:05:00Z', '2026-10-08T11:11:20Z');

-- 5 Serving Tickets (served_at valorizzato al momento della chiamata allo sportello)
INSERT INTO tickets (id, id_counter, id_service, code, status, issue_at, served_at) VALUES 
(41, 1, 1, 'A107', 'SERVING', '2026-10-10T10:45:00Z', '2026-10-10T11:00:00Z'),
(42, 2, 4, 'B107', 'SERVING', '2026-10-10T10:50:00Z', '2026-10-10T11:02:15Z'),
(43, 3, 5, 'D104', 'SERVING', '2026-10-10T10:52:00Z', '2026-10-10T11:05:30Z'),
(44, 4, 8, 'E107', 'SERVING', '2026-10-10T10:55:00Z', '2026-10-10T11:08:00Z'),
(45, 6, 9, 'G108', 'SERVING', '2026-10-10T10:58:00Z', '2026-10-10T11:10:45Z');

-- 15 Waiting Tickets (served_at rimane NULL)
INSERT INTO tickets (id, id_counter, id_service, code, status, issue_at, served_at) VALUES 
(46, NULL, 1, 'A108', 'WAITING', '2026-10-10T11:00:00Z', NULL),
(47, NULL, 2, 'C104', 'WAITING', '2026-10-10T11:01:00Z', NULL),
(48, NULL, 3, 'F104', 'WAITING', '2026-10-10T11:03:00Z', NULL),
(49, NULL, 4, 'B108', 'WAITING', '2026-10-10T11:05:00Z', NULL),
(50, NULL, 6, 'H104', 'WAITING', '2026-10-10T11:06:00Z', NULL),
(51, NULL, 7, 'I104', 'WAITING', '2026-10-10T11:08:00Z', NULL),
(52, NULL, 9, 'G109', 'WAITING', '2026-10-10T11:09:00Z', NULL),
(53, NULL, 10, 'J101', 'WAITING', '2026-10-10T11:10:00Z', NULL),
(54, NULL, 10, 'J102', 'WAITING', '2026-10-10T11:11:00Z', NULL),
(55, NULL, 1, 'A109', 'WAITING', '2026-10-10T11:12:00Z', NULL),
(56, NULL, 2, 'C105', 'WAITING', '2026-10-10T11:13:00Z', NULL),
(57, NULL, 3, 'F105', 'WAITING', '2026-10-10T11:14:00Z', NULL),
(58, NULL, 5, 'D105', 'WAITING', '2026-10-10T11:15:00Z', NULL),
(59, NULL, 7, 'I105', 'WAITING', '2026-10-10T11:16:00Z', NULL),
(60, NULL, 8, 'E108', 'WAITING', '2026-10-10T11:17:00Z', NULL);