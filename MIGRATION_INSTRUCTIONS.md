# Instructions for Migrating from SQLite to PostgreSQL

This guide will help you migrate your existing SQLite database to PostgreSQL.

## Prerequisites

1. Install PostgreSQL server on your machine or set up a PostgreSQL instance on a server.
2. Install Python 3.6+ and pip.
3. Install the required Python packages:

```bash
pip install -r requirements.txt
```

## Step 1: Configure PostgreSQL

1. Create a new PostgreSQL database:

```bash
# Log in to PostgreSQL
sudo -u postgres psql

# Create the database
CREATE DATABASE minemap_db;

# Create a user (optional)
CREATE USER minemap_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE minemap_db TO minemap_user;

# Exit PostgreSQL
\q
```

2. Update the PostgreSQL connection parameters in the migration script:

Open `migrate_to_postgresql.py` and update the following parameters:

```python
PG_USER = "postgres"  # Change to your PostgreSQL username
PG_PASSWORD = "postgres"  # Change to your PostgreSQL password
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB_NAME = "minemap_db"
```

## Step 2: Run the Migration

1. Make sure you have a backup of your SQLite database:

```bash
cp minemap.db minemap.db.backup
```

2. Run the migration script:

```bash
python migrate_to_postgresql.py
```

3. The script will:
   - Create the PostgreSQL schema
   - Migrate all data from SQLite to PostgreSQL
   - Verify the migration by comparing row counts

## Step 3: Update Your Application

Update your application's database connection string to use PostgreSQL instead of SQLite:

```
# Previous SQLite connection
DATABASE_URL = "sqlite:///minemap.db"

# New PostgreSQL connection
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/minemap_db"
```

## Troubleshooting

- **Migration errors**: Check that you have the correct database credentials.
- **Data type errors**: The script handles most common data type conversions, but you may need to adjust the code for specific fields.
- **Missing data**: Verify that all tables have been migrated by comparing record counts.

## Next Steps

1. Set up regular PostgreSQL backups
2. Monitor application performance with the new database
3. Consider implementing database indexes for optimal query performance 