import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { main } from './script';

admin.initializeApp();

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '1GB' as const,
};

exports.updateRound = functions
  .region('europe-west1')
  .runWith(runtimeOpts)
  .https.onRequest(main);
