# DB Migration Commands

## Export

```cmd
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres -h localhost -p 5432 --inserts -d consultant_chat > consultant_chat.sql
```

## Import

```shell
 sudo -u postgres psql -U postgres -d expert_matcher_footanstey -f consultant_chat.sql
```

## Create database

```sql
CREATE DATABASE expert_matcher_footanstey
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
```