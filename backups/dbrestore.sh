#!/bin/bash

zcat database_db.gz | psql -h localhost -p 5432 -U postgres -W database_db
