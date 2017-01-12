#!/bin/bash

for f in data/*.txt; do
	`tr ";" "," < $f > data/file.csv`
	`mongoimport -d "elections" -c "votes"  --type csv --file data/file.csv -f timestamp,state,candidate --numInsertionWorkers 8`
	`rm $f data/file.csv`
done

