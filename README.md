# ius
ius


dockerized app 

docker-compose up --build 

docker-compose down 

docker-compose down -V to remove volumes 

to export db 
pg_dump -U postgres -h localhost -W -F p -f mydb_backup_plain.sql db

copied it over to the container : 
docker cp mydb_backup_plain.sql ius-db-1:/mydb_backup_plain.sql

enable vector extension for posgres in the container : 
docker exec -it ius-db-1 psql -U postgres -d db
CREATE EXTENSION IF NOT EXISTS vector;

import the db : 
docker exec -it ius-db-1 psql -U postgres -d db -f /mydb_backup_plain.sql

will expose prot 3000 