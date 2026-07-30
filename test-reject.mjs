import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// Simulate the action
async function run() {
  console.log("Starting test-reject...");
  try {
    // 1. Initialize Firebase
    const serviceAccount = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);
    console.log("Firebase initialized.");

    // 2. Fetch a pending certificate
    const snapshot = await db.collection("certificates").where("status", "==", "PENDING").limit(1).get();
    if (snapshot.empty) {
      console.log("No pending certificates found! Let's fetch ANY certificate.");
      const anySnap = await db.collection("certificates").limit(1).get();
      if (anySnap.empty) {
        console.log("No certificates found at all!");
        return;
      }
      const doc = anySnap.docs[0];
      console.log("Found certificate:", doc.id, doc.data().status);
      
      // Let's manually set it to PENDING so we can test rejecting it
      await db.collection("certificates").doc(doc.id).update({ status: "PENDING" });
      console.log("Set certificate to PENDING.");
      await testReject(db, doc.id);
    } else {
      const doc = snapshot.docs[0];
      console.log("Found pending certificate:", doc.id);
      await testReject(db, doc.id);
    }
  } catch (err) {
    console.error("Fatal Error:", err);
  }
}

async function testReject(db, id) {
  console.log("Attempting to reject certificate:", id);
  try {
    const reason = "Testing rejection reason";
    // Simulate updateCertificateStatus
    await db.collection("certificates").doc(id).update({
      status: "REJECTED",
      rejectionReason: reason,
      updatedAt: new Date()
    });
    console.log("Successfully updated Firestore!");
  } catch (err) {
    console.error("Error updating Firestore:", err);
  }
}

run();
