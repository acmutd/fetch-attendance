import { Firestore } from '@google-cloud/firestore'
import { createObjectCsvWriter } from "csv-writer"
import { CsvWriter } from 'csv-writer/src/lib/csv-writer'
import { exit } from 'process';

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
  past_events: PastEvent[]
  sub: string
  university: string
  utd_student: boolean
}

type MinimalProfile = Pick<Profile, "net_id" | "first_name" | "last_name">

interface Attendee {
  email: string
  sub: string
}

interface Event {
  attendance: Attendee[]
  date: string,
  name: string,
  path_name: string,
  public: boolean
}

function toMinimalProfile(profile: Profile): MinimalProfile {
  return {
    "net_id": profile.net_id,
    "first_name": profile.first_name,
    "last_name": profile.last_name
  };
}

async function getEventAttendees(firestore: Firestore, eventId: string): Promise<Attendee[]> {
  const eventDoc = firestore.doc(`event_data/${eventId}`)
  const event = (await eventDoc.get()).data() as Event
  return event.attendance
}

async function getProfilesForAttendees(firestore: Firestore, attendees: readonly Attendee[]): Promise<Profile[]> {
  const attendeeSubs = new Set<string>(attendees.map(attendee => attendee.sub))
  const profiles = await firestore.collection("profile_data").listDocuments()

  return Promise.all(
    profiles.filter(doc => attendeeSubs.has(doc.id))
            .map(async doc => (await doc.get()).data() as Profile)
  )
}

async function writeMinimalProfiles(writer: CsvWriter<MinimalProfile>, profiles: Profile[]) {
  await writer.writeRecords(profiles.map(toMinimalProfile))
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Provide event ID as command line argument.")
    exit(1)
  }

  const firestore = new Firestore();
  const writer: CsvWriter<MinimalProfile> = createObjectCsvWriter({
    path: `out/${process.argv[2]}.csv`,
    header: [
        {id: 'net_id', title: 'NetID'},
        {id: 'first_name', title: 'first_name'},
        {id: 'last_name', title: 'last_name'}
    ]
  })

  const attendees = await getEventAttendees(firestore, process.argv[2])
  const profiles = await getProfilesForAttendees(firestore, attendees)
  await writeMinimalProfiles(writer, profiles)
}

main()