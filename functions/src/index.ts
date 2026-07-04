import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { main } from './script';

admin.initializeApp();

// exports.sendEmailNotification = functions
//   .region('europe-west1')
//   .firestore.document('messages/{messageId}')
//   .onCreate((snapshot, context) => {
//     const messageData = snapshot.data();

//     const mailOptions = {
//       from: 'interclubschaken@hotmail.com',
//       to: 'martijn.maddens@hotmail.com',
//       subject: 'Nieuw webapp bericht',
//       text: `
//       Date: ${messageData.dateSent.toDate()}

//       Name:${messageData.name}

//       Email: ${messageData.email}

//       Message: ${messageData.message}
//     `,
//     };

//     return transporter.sendMail(mailOptions);
//   });

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '8GB' as const,
};

exports.updateRoundTimed = functions
  .region('europe-west1')
  .runWith(runtimeOpts)
  .pubsub.schedule('every 15 minutes')
  .timeZone('Europe/Brussels')
  .onRun(main);

// exports.updateOncePerYear = functions
//   .region('europe-west1')
//   .runWith(runtimeOpts)
//   .https.onRequest(main);
