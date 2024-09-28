# ius
ius


dockerized app 

docker-compose up --build 

docker-compose down 

docker-compose down -V to remove volumes 

to export db 
pg_dump -U postgres -h localhost -W -F p -f mydb_backup_plain.sql db

copied it over to the container : 
docker cp mydb_backup_plain.sql ius_db_1:/mydb_backup_plain.sql

enable vector extension for posgres in the container : 
docker exec -it ius_db_1 psql -U postgres -d db

vector index requires increase of memory heap .. 

ALTER SYSTEM SET maintenance_work_mem = '256MB';
SELECT pg_reload_conf();
SHOW maintenance_work_mem;

CREATE EXTENSION IF NOT EXISTS vector;

import the db : 
docker exec -it ius_db_1 psql -U postgres -d db -f /mydb_backup_plain.sql

will expose prot 3000 