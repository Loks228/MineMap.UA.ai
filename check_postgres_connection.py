import psycopg2
from sqlalchemy import create_engine
import sys

# PostgreSQL connection parameters - same as in migrate_to_postgresql.py
PG_USER = "postgres"
PG_PASSWORD = "postgres"  # Change this to your actual password
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB_NAME = "postgres"  # Use the default postgres database to check connection

print("Starting PostgreSQL connection check...")

# Try to connect using psycopg2
print("Trying to connect using psycopg2...")
try:
    conn = psycopg2.connect(
        user=PG_USER,
        password=PG_PASSWORD,
        host=PG_HOST,
        port=PG_PORT,
        database=PG_DB_NAME
    )
    conn.close()
    print("Connection successful using psycopg2!")
except Exception as e:
    print(f"psycopg2 connection error: {e}")
    print("PostgreSQL connection failed with psycopg2.")
    
# Try to connect using SQLAlchemy
print("\nTrying to connect using SQLAlchemy...")
try:
    engine = create_engine(f'postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB_NAME}')
    connection = engine.connect()
    connection.close()
    print("Connection successful using SQLAlchemy!")
except Exception as e:
    print(f"SQLAlchemy connection error: {e}")
    print("PostgreSQL connection failed with SQLAlchemy.")
    
print("\nConnection check completed. If there were errors, please check:")
print("1. PostgreSQL is installed and running")
print("2. The connection parameters are correct")
print("3. The database 'postgres' exists (default database)")
print("4. The user has permissions to connect") 