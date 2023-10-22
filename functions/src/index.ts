import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { main } from './script';
const nodemailer = require('nodemailer');

admin.initializeApp();
const hotmailEmail = 'interclubschaken@hotmail.com';
const hotmailPassword = 'E4c5c3!Pf6';

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: hotmailEmail,
    pass: hotmailPassword,
  },
});

exports.sendEmailNotification = functions
  .region('europe-west1')
  .firestore.document('messages/{messageId}')
  .onCreate((snapshot, context) => {
    const messageData = snapshot.data();

    const mailOptions = {
      from: 'interclubschaken@hotmail.com',
      to: 'martijn.maddens@hotmail.com',
      subject: 'Nieuw webapp bericht',
      text: `
      Date: ${messageData.dateSent.toDate()}

      Name:${messageData.name}

      Email: ${messageData.email}

      Message: ${messageData.message}
    `,
    };

    return transporter.sendMail(mailOptions);
  });

exports.sendAllExistingMessages = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    // Fetch all the messages from Firestore
    const messagesSnapshot = await admin
      .firestore()
      .collection('messages')
      .get();

    // Function to send a single email
    const sendEmail = async (messageData) => {
      const emailContent = `
        Date: ${messageData.dateSent.toDate()}

        Name: ${messageData.name}

        Email: ${messageData.email}

        Message: ${messageData.message}
        `;

      const mailOptions = {
        from: 'interclubschaken@hotmail.com',
        to: 'martijn.maddens@hotmail.com',
        subject: 'Existing Message from Webapp',
        text: emailContent,
      };

      return transporter.sendMail(mailOptions);
    };

    // Send emails one by one
    try {
      for (const doc of messagesSnapshot.docs) {
        const messageData = doc.data();
        await sendEmail(messageData); // Wait for each email to be sent before proceeding
      }
      res.send('Emails sent successfully!');
    } catch (error) {
      console.error('Error sending emails:', error);
      res.status(500).send('Error sending emails.');
    }
  });

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '8GB' as const,
};

// exports.updateRoundTimed = functions
//   .region('europe-west1')
//   .runWith(runtimeOpts)
//   .pubsub.schedule('every 15 minutes')
//   .timeZone('Europe/Brussels')
//   .onRun(main);

// exports.updateRound = functions
//   .region('europe-west1')
//   .runWith(runtimeOpts)
//   .https.onRequest(main);
