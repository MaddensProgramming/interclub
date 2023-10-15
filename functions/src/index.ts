import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { main } from './script';

admin.initializeApp();

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

exports.updateRound = functions
  .region('europe-west1')
  .runWith(runtimeOpts)
  .https.onRequest(main);
