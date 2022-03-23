# fetch-attendance
Script to fetch event attendance from Portal

## How to use
Set up:
```
npm install
npm run build
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/acm-core/key.json
```
Run:
```
# attendance info will be sent to stdut
npm --silent run start <event ID>
```
Use shell redirection to output to a file:
```
# attendance info will be sent to out.csv
npm --silent run start <event ID> > out.csv
```

