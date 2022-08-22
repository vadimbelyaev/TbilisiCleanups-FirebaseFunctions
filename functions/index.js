"use strict";
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendPushToAuthorWhenReportStatusChanges = functions.firestore
    .document("reports/{docId}")
    .onUpdate((change, context) => {
      const newValue = change.after.data();
      const previousValue = change.before.data();
      const newStatus = newValue["status"];
      const oldStatus = previousValue["status"];
      if (newStatus != oldStatus) {
        functions.logger.log(
            "Status of the document ",
            context.params.docId,
            " has changed from ",
            oldStatus,
            " to ",
            newStatus
        );
        const userProviderId = newValue["userProviderId"];
        const userId = newValue["userId"];

        return admin.database()
            .ref(`/userProviders/${userProviderId}/users/${userId}`)
            .once("value")
            .then(function(snapshot) {
              const tokens = snapshot["tokens"];
              return new Promise((resolve, reject) => resolve(tokens));
            })
            .then(function(tokens) {
              const payload = {
                notification: {
                  title: newValue["description"],
                  body: "The status of your report has " +
                    `changed to ${newStatus}.`,
                  // icon: someURL
                },
              };

              return admin.messaging().sendToDevice(tokens, payload);
            });
      }
    });
