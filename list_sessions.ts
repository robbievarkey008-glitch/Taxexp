import { db } from './app/lib/firebase.server';

async function list() {
  const snapshot = await db.collection("sessions").get();
  if (snapshot.empty) {
    console.log("No sessions found.");
    return;
  }
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
}
list().catch(console.error);
