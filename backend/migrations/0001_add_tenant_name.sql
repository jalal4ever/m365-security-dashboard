-- Migration: add a friendly tenant_name to azure_config so multiple Azure apps can be identified
-- Run this against your database before starting the server (psql/sqlite3/your client).

ALTER TABLE azure_config ADD COLUMN tenant_name TEXT;
UPDATE azure_config
SET tenant_name = 'Tenant ' || id
WHERE tenant_name IS NULL OR tenant_name = '';
