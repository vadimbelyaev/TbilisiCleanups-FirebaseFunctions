"use strict";
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendPushToAuthorWhenReportStatusChanges = functions.firestore
    .document("reports/{docId}")
    .onUpdate(async (change, context) => {
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
            newStatus,
        );
        const userProviderId = newValue["user_provider_id"];
        const userId = newValue["user_id"];

        functions.logger.log(
            "userProviderId = ",
            userProviderId,
            ", userId = ",
            userId,
        );

        const preferencesSnapshot = await admin.firestore()
            .doc(`/user_providers/${userProviderId}/users/${userId}`)
            .get();

        const data = preferencesSnapshot.data();
        functions.logger.log(
            "Fetched user preferences: ",
            data,
        );
        const notificationsEnabled = data[
            "report_status_change_notifications_enabled"
        ];
        if (!notificationsEnabled) {
          functions.logger.log(
              "User has notifications disabled, not sending.",
          );
          return 0;
        }
        const tokens = data["fcm_tokens"];
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
      }
    });
