from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

# PostgreSQL connection parameters - update these with your actual credentials
PG_USER = "postgres"
PG_PASSWORD = "postgres"  # Change this to your actual password
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB_NAME = "minemap_db"

# Connection strings
sqlite_uri = 'sqlite:///minemap.db'
pg_uri = f'postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB_NAME}'

# Connect to both databases
sqlite_engine = create_engine(sqlite_uri)
pg_engine = create_engine(pg_uri)

# Create metadata objects
sqlite_meta = MetaData()
sqlite_meta.reflect(bind=sqlite_engine)
pg_meta = MetaData()

# Create PostgreSQL schema
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(255))
    email = Column(String(255))
    password = Column(String(255))
    full_name = Column(String(255))
    role = Column(String(50))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Region(Base):
    __tablename__ = 'regions'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    code = Column(String(50))
    center_lat = Column(Float)
    center_lng = Column(Float)
    zoom_level = Column(Integer)

class ExplosiveObject(Base):
    __tablename__ = 'explosive_objects'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    description = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String(50))
    priority = Column(String(50))
    region_id = Column(Integer, ForeignKey('regions.id'))
    reported_by = Column(Integer, ForeignKey('users.id'))
    photo_url = Column(String(255))
    area_size = Column(Float)
    danger_level = Column(String(50))
    is_cluster = Column(Boolean)
    reported_at = Column(DateTime)
    updated_at = Column(DateTime)

def create_postgresql_schema():
    # Drop all existing tables if they exist
    Base.metadata.drop_all(pg_engine)
    # Create all tables
    Base.metadata.create_all(pg_engine)
    print("PostgreSQL schema created successfully.")

def migrate_data():
    sqlite_conn = sqlite_engine.connect()
    pg_conn = pg_engine.connect()
    
    # Create sessions
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    PGSession = sessionmaker(bind=pg_engine)
    
    sqlite_session = SQLiteSession()
    pg_session = PGSession()
    
    try:
        # Migrate regions table
        print("Migrating regions...")
        regions_table = Table('regions', sqlite_meta, autoload_with=sqlite_engine)
        for row in sqlite_session.query(regions_table).all():
            data = {
                'id': row.id,
                'name': row.name,
                'code': row.code,
                'center_lat': row.center_lat,
                'center_lng': row.center_lng,
                'zoom_level': row.zoom_level
            }
            pg_conn.execute(pg_meta.tables['regions'].insert().values(**data))
        
        # Migrate users table
        print("Migrating users...")
        users_table = Table('users', sqlite_meta, autoload_with=sqlite_engine)
        for row in sqlite_session.query(users_table).all():
            data = {
                'id': row.id,
                'username': row.username,
                'email': row.email,
                'password': row.password,
                'full_name': row.full_name,
                'role': row.role,
                'created_at': row.created_at
            }
            pg_conn.execute(pg_meta.tables['users'].insert().values(**data))
        
        # Migrate explosive objects table
        print("Migrating explosive objects...")
        explosive_objects_table = Table('explosive_objects', sqlite_meta, autoload_with=sqlite_engine)
        for row in sqlite_session.query(explosive_objects_table).all():
            data = {
                'id': row.id,
                'title': row.title,
                'description': row.description,
                'latitude': row.latitude,
                'longitude': row.longitude,
                'status': row.status,
                'priority': row.priority,
                'region_id': row.region_id,
                'reported_by': row.reported_by,
                'photo_url': row.photo_url,
                'area_size': row.area_size,
                'danger_level': row.danger_level,
                'is_cluster': row.is_cluster,
                'reported_at': row.reported_at,
                'updated_at': row.updated_at
            }
            pg_conn.execute(pg_meta.tables['explosive_objects'].insert().values(**data))
        
        pg_conn.commit()
        print("Data migration completed successfully.")
        
    except Exception as e:
        pg_conn.rollback()
        print(f"Error during migration: {e}")
    finally:
        sqlite_session.close()
        pg_session.close()
        sqlite_conn.close()
        pg_conn.close()

def verify_migration():
    sqlite_conn = sqlite_engine.connect()
    pg_conn = pg_engine.connect()
    
    tables = ['users', 'regions', 'explosive_objects']
    
    for table in tables:
        sqlite_count = sqlite_conn.execute(f"SELECT COUNT(*) FROM {table}").scalar()
        pg_count = pg_conn.execute(f"SELECT COUNT(*) FROM {table}").scalar()
        
        print(f"Table: {table}")
        print(f"  SQLite count: {sqlite_count}")
        print(f"  PostgreSQL count: {pg_count}")
        print(f"  Status: {'✓ Matched' if sqlite_count == pg_count else '✗ Mismatch'}")
        print("")
    
    sqlite_conn.close()
    pg_conn.close()

def main():
    print("Starting migration from SQLite to PostgreSQL...")
    
    # Create PostgreSQL schema
    create_postgresql_schema()
    
    # Migrate data
    migrate_data()
    
    # Verify migration
    verify_migration()
    
    print("Migration process completed.")

if __name__ == "__main__":
    main() 