/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

initializeApp();

const db = getFirestore();

export const deleteFilterForceMessage = onCall(async (request) => {
  const messagesCollection = "MG001_messages";
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorised: User must be logged in.");
  }

  const {docId} = request.data;
  if (!docId) {
    throw new Error("Missing docId");
  }

  const snapshot = await db.collection(messagesCollection).get();
  const totalDocs = snapshot.size;
  if (totalDocs <= 10) {
    throw new Error("Cannot delete. At least 10 messages must remain.");
  }

  await db.collection(messagesCollection).doc(docId).delete();
  logger.info(`Message ${docId} deleted by ${uid}`);

  return {success: true, message: "Document deleted successfully"};
});

export const deletePhishOrFakeEmail = onCall(async (request) => {
  const emailsCollection = "MG003_emails";
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorised: User must be logged in.");
  }

  const {docId} = request.data;
  if (!docId) {
    throw new Error("Missing docId");
  }

  const snapshot = await db.collection(emailsCollection).get();
  const totalDocs = snapshot.size;
  if (totalDocs <= 10) {
    throw new Error("Cannot delete. At least 10 emails must remain.");
  }

  await db.collection(emailsCollection).doc(docId).delete();
  logger.info(`Email ${docId} deleted by ${uid}`);

  return {success: true, message: "Document deleted successfully"};
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
