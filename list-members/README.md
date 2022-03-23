# list-members
Script to fetch the number of events each Portal user has attended. Filter the resulting csv to determine who is an
ACM UTD member this semester!

## How to use
Set up:
```
npm install
npm run build
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/acm-core/key.json
```
Run:
```
# attendance info will be sent to stdout
npm --silent run start
```
Use shell redirection to output to a file:
```
# attendance info will be sent to out.csv
npm --silent run start > out.csv
```

## Todo
* Add ability to only include events in a given semester (or maybe add one column per semester to the csv)
* Much of this code is based on [fetch-attendance](https://github.com/acmutd/fetch-attendance). It would be beneficial
  to combine the functionality of both into a single cli.