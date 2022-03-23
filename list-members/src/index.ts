import { Firestore } from '@google-cloud/firestore'
import { createObjectCsvWriter } from "csv-writer"
import { CsvWriter } from 'csv-writer/src/lib/csv-writer'

interface PastEvent {
  name: string,
  submitted_at: string,
}

interface Application {
  name: string
  submitted_at: string
}

interface Profile {
  classification: string,
  email: string
  first_name: string
  last_name: string
  major: string
  net_id: string
  past_applications: Application[]
  past_events?: PastEvent[]
  sub: string
  university: string
  utd_student: boolean
}

type CsvRow = Pick<Profile, "email" | "first_name" | "last_name"> 
            & { events_attended: number }

function toCsvRow(profile: Profile): CsvRow {
  return {
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    // TODO: filter past_events to only include events in a given semester (maybe filter by submitted_at?)
    events_attended: profile.past_events?.length ?? 0,
  };
}

async function main() {
  const firestore = new Firestore();
  
  const profiles = await firestore.collection("profile_data").listDocuments()

  // FIXME: I think this might be making a TON of requests, could be really bad... not sure :D
  const profilesData = await Promise.all(profiles.map(async (doc) => (await doc.get()).data() as Profile))

  const writer: CsvWriter<CsvRow> = createObjectCsvWriter({
    // @ts-ignore: path typed as a string, but a file descriptor is valid, because it uses writeFile
    path: process.stdout.fd,
    header: [
        {id: 'email', title: 'email'},
        {id: 'first_name', title: 'first_name'},
        {id: 'last_name', title: 'last_name'},
        {id: 'events_attended', title: 'events_attended'},
    ]
  });

  await writer.writeRecords(profilesData.map(toCsvRow));
}

main()
