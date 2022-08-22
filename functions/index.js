"use strict";
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendPushToAuthorWhenReportStatusChanges = functions.firestore
    .document("reports/{docId}")
    .onUpdate((change, context) => {
      const newValue = change.after.data();
      functions.logger.log(
          "newValue = ",
          newValue
      );
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
        const userProviderId = newValue["user_provider_id"];
        const userId = newValue["user_id"];

        functions.logger.log(
            "userProviderId = ",
            userProviderId,
            ", userId = ",
            userId
        );

        return admin.firestore()
            .doc(`/user_providers/${userProviderId}/users/${userId}`)
            .get()
            .then(function(snapshot) {
              functions.logger.log(
                  "Received snapshot = ",
                  snapshot
              );
              const data = snapshot.data();
              functions.logger.log(
                  "Fetched tokens data: ",
                  data
              );
              const tokens = data["fcm_tokens"];
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
                tokens: tokens,
              };

              return admin.messaging().sendMulticast(payload);
            });
      }
    });
