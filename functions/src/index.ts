/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {HttpsError, onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
import * as admin from "firebase-admin";
import {getAuth} from "firebase-admin/auth";

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

const levelsCollection = "quiz_levels";
const questionsCollection = "questions";
const answersCollection = "answers";

export const updateQuizLevel = onCall(async (request) => {
  const {docId, payload} = request.data;
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }
  if (!docId) {
    throw new Error("Missing docId");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid request: payload is required.");
  }

  if ("question_num" in payload) {
    if (typeof payload.question_num !== "number" || payload.question_num <= 0) {
      throw new Error("Invalid value: question_num must be > 0");
    }
  }

  if ("pass_score" in payload) {
    if (typeof payload.pass_score !== "number" || payload.pass_score <= 0) {
      throw new Error("Invalid value: pass_score must be > 0");
    }
  }

  try {
    const levelRef = db.collection(levelsCollection).doc(docId);
    await levelRef.update({
      ...payload,
      updated_at: Timestamp.now(),
      updated_by: uid,
    });
    logger.info(`Quiz Level ${docId} updated by user ${uid}`);
  } catch (err) {
    logger.error("Error updating quiz level", err);
    throw new Error("Failed to update quiz level.");
  }
});

export const createQuizQuestion = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorised: User must be logged in.");
  }

  const {docId, payload} = request.data;
  if (!docId) {
    throw new Error("Missing docId");
  }
  if (!payload) {
    throw new Error("Invalid parameter: empty payload");
  }
  if (!Array.isArray(payload.answers) || payload.answers.length < 2) {
    throw new Error("Invalid parameter: Must at least 2 answers in a question");
  }

  try {
    const questionsCol = db.collection(levelsCollection)
      .doc(docId).collection(questionsCollection);
    const questionRef = questionsCol.doc();
    const batch = db.batch();
    const now = Timestamp.now();

    batch.set(questionRef, {
      question: payload.question,
      explanation: payload.explanation,
      createdBy: uid,
      createdAt: now,
    });
    for (const a of payload.answers) {
      const ansRef = questionRef.collection(answersCollection).doc();
      batch.set(ansRef, {
        answer: a.answer,
        is_true: a.is_true,
        createdBy: uid,
        createdAt: now,
      });
    }

    await batch.commit();
    logger.info(
      `Question ${questionRef.id} created by ${uid} under level ${docId}`
    );
    return {status: "ok", questionId: questionRef.id};
  } catch (err: any) {
    logger.error("Create question error", err);
    return {status: "error", message: err?.message || "Unknown error"};
  }
});

export const updateQuizQuestion = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }

  const {levelId, questionId, payload} = request.data;
  if (!levelId) {
    throw new Error("Invalid parameter: missing levelId");
  }
  if (!questionId) {
    throw new Error("Invalid parameter: missing questionId");
  }
  if (!payload) {
    throw new Error("Invalid parameter: empty payload");
  }
  if (!Array.isArray(payload.answers) || payload.answers.length < 2) {
    if (!Array.isArray(payload.answers) || payload.answers.length < 2) {
      throw new Error(
        "Invalid parameter: Must at least 2 answers in a question"
      );
    }
  }

  try {
    const questionRef = db.collection(levelsCollection)
      .doc(levelId)
      .collection(questionsCollection)
      .doc(questionId);
    const batch = db.batch();
    const now = Timestamp.now();
    batch.update(questionRef, {
      question: payload.question,
      explanation: payload.explanation,
      updatedBy: uid,
      updatedAt: now,
    });
    const answerSnap = await questionRef.collection(answersCollection).get();
    answerSnap.forEach((doc) => {
      batch.delete(doc.ref);
    });
    for (const a of payload.answers) {
      const ansRef = questionRef.collection(answersCollection).doc();
      batch.set(ansRef, {
        answer: a.answer,
        is_true: a.is_true,
        updatedBy: uid,
        updatedAt: now,
      });
    }

    await batch.commit();
    logger.info(
      `Question ${questionId} updated by ${uid} under level ${levelId}`
    );
    return {status: "ok", questionId: questionId};
  } catch (err) {
    logger.error("Create question error", err);
    throw new Error("Failed to update quiz question.");
  }
});

export const deleteQuizQuestion = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }

  const {levelId, questionId} = request.data;
  if (!levelId) {
    throw new Error("Invalid parameter: missing levelId");
  }
  if (!questionId) {
    throw new Error("Invalid parameter: missing questionId");
  }

  const levelRef = db.collection(levelsCollection).doc(levelId);
  const levelSnap = await levelRef.get();
  if (!levelSnap.exists) {
    throw new Error("Not found: quiz level not found");
  }

  const questionNum = levelSnap.get("question_num");
  const questionsSnap = await levelRef.collection(questionsCollection).get();
  const totalQuestions = questionsSnap.size;
  if (totalQuestions <= questionNum) {
    throw new Error(
      "Cannot delete. Total # of questions cannot less than the question_num"
    );
  }

  await levelRef.collection(questionsCollection).doc(questionId).delete();
  logger.info(`Level ${levelId}, Question ${questionId} deleted by ${uid}`);

  return {status: "ok", message: "Question deleted successfully"};
});

export const deleteRevisionKeyPoint = onCall(async (request) => {
  const revisionKeyPointsCollection = "revision_key_points";
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorised: User must be logged in.");
  }

  const {docId} = request.data;
  if (!docId) {
    throw new Error("Missing docId");
  }

  const snapshot = await db.collection(revisionKeyPointsCollection).get();
  const totalDocs = snapshot.size;
  if (totalDocs <= 1) {
    throw new Error(
      "Cannot delete. At least 1 revision key point must remain."
    );
  }

  await db.collection(revisionKeyPointsCollection).doc(docId).delete();
  logger.info(`Revision key point ${docId} deleted by ${uid}`);

  return {success: true, message: "Document deleted successfully"};
});

const adminCollection = "admins";
const usersCollection = "users";
const unlockedQuizzesSubcollection = "unlocked_quizzes";
const unlockedChaptersSubcollection = "unlocked_chapters";
const firstQuizLevelId = "QL001";
const firstChapterId = "SC001";

/**
 * Help to apply custom claims to auth token
 * @param {string} uid the current user uid.
 */
async function applyCustomClaims(uid: string) {
  const adminDoc = await db.collection(adminCollection).doc(uid).get();
  const data = adminDoc.data();

  const isSuperadmin = !!data?.is_superadmin;
  const isFirstLogin = !!data?.is_first_login;

  await admin.auth().setCustomUserClaims(
    uid,
    {is_superadmin: isSuperadmin, is_first_login: isFirstLogin}
  );
}

export const setCustomClaims = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }

  await applyCustomClaims(uid);
});

export const getAdminList = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }

  const token = request.auth?.token;
  if (!token?.is_superadmin) {
    throw new Error("Permission denied: not a superadmin");
  }

  try {
    const snapshot = await db.collection(adminCollection).get();
    const admins = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    return {admins};
  } catch (err) {
    throw new Error("Failed to fetch admin list.");
  }
});

export const createAdmin = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }

  const token = request.auth?.token;
  if (!token?.is_superadmin) {
    throw new Error("Permission denied: not a superadmin");
  }

  const {password, payload} = request.data;
  if (!password || !payload) {
    throw new Error("Invalid parameter");
  }

  try {
    const newUser = await admin.auth().createUser({
      email: payload.email,
      password: password,
      displayName: payload.username,
    });
    await db.collection(adminCollection).doc(newUser.uid).set({
      username: payload.username,
      email: payload.email,
      is_superadmin: payload.is_superadmin,
      disabled: payload.disabled,
      failed_attempts: payload.failed_attempts,
      is_first_login: payload.is_first_login,
      created_by: uid,
      created_at: Timestamp.now(),
    });
    await db.collection(usersCollection).doc(newUser.uid).set({
      username: payload.username,
      email: payload.email,
      register_date: Timestamp.now(),
      streak_day: 0,
    });
    const userDocRef = db.collection(usersCollection).doc(newUser.uid);
    await userDocRef.collection(unlockedQuizzesSubcollection)
      .doc(firstQuizLevelId).set({
        unlocked_at: Timestamp.now(),
      });
    await userDocRef.collection(unlockedChaptersSubcollection)
      .doc(firstChapterId).set({
        unlocked_at: Timestamp.now(),
      });
    return {status: "ok", message: "Admin account created.", uid: uid};
  } catch (err) {
    throw new Error("Failed to create admin");
  }
});

export const deleteAdmin = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }

  const token = request.auth?.token;
  if (!token?.is_superadmin) {
    throw new Error("Permission denied: not a superadmin");
  }

  const {targetUid} = request.data;
  if (!targetUid) {
    throw new Error("Invalid parameter");
  }
  if (targetUid === uid) {
    throw new Error("Internal error: cannot delete user itself");
  }

  try {
    await db.collection(adminCollection).doc(targetUid).delete();
    await db.collection(usersCollection).doc(targetUid).delete();
    await admin.auth().deleteUser(targetUid);
    logger.info(`User admin ${targetUid} deleted by ${uid}`);
    return {
      status: "ok",
      message: `Superadmin ${uid} delete user admin ${targetUid}`,
    };
  } catch (err) {
    throw new Error("Failed to delete admin.");
  }
});

export const updatePassword = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new Error("Unauthorized: User must be logged in.");
  }

  const {password} = request.data;
  if (!password) {
    throw new Error("Invalid parameter: empty payload");
  }

  try {
    await admin.auth().updateUser(uid, {password: password});

    const token = request.auth?.token;
    const docRef = await db.collection(adminCollection).doc(uid);
    if (token?.is_first_login) {
      await docRef.update({
        is_first_login: false,
        updated_at: Timestamp.now(),
        updated_by: uid,
      });
      await applyCustomClaims(uid);
    } else {
      await docRef.update({
        updated_at: Timestamp.now(),
        updated_by: uid,
      });
    }
    logger.info(`User admin ${uid} updated password`);
    return {status: "ok", message: "Password updated successfully"};
  } catch (err) {
    throw new Error("Failed to update password.");
  }
});

export const checkAdminEmailExists = onCall(async (request) => {
  const {email} = request.data;

  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "Email address is required");
  }

  try {
    await getAuth().getUserByEmail(email);
    logger.info(`Successfully searched user with email address ${email}`);
    return {
      status: "ok", message: "The email address is existed", exists: true,
    };
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return {
        status: "ok",
        message: "The email address is not existed",
        exists: false,
      };
    }
    logger.error("Error checkAdminEmailExists: ", error);
    throw new HttpsError("internal", "Failed to check user existence");
  }
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
