// GLOBAL OBJECT FOR VARIABLES
var goalVars = {
    // logging
    "logging": false,
    // get all data from helper tab
    "helperData": SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Budget & Referral Goal Helper").getDataRange().getValues(),
    "checkTab": SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Budget & Referral Goal Check"),
    // check tab columns
    "checkName": 1,
    "check25": 2,
    "check50": 3,
    "check75": 4,
    "check85": 5,
    "check100": 6,
    // helper tab columns
    "helperName": 1,
    "helperType": 2,
    "helperStatus": 3,
    "helperPaid": 4 /* amount paid */ ,
    "helperBudget": 5 /* budget consumed */ ,
    "helperRef": 6 /* number of referrals */ ,
    "helperGoal": 7 /* % of referral goal */ ,
    "helperTarget": 8 /* target referrals */ ,
    "helperBCLink": 9,
    "helperXLink": 10,
    // other variables
    "messageCounter": 0,
    "pilotCompleteCounter": 0,
    "regularCompleteCounter": 0,
    "counter85": 0,
    "counter75": 0,
    "pilot50": 0,
    "regular50": 0,
    "counter25": 0,
    "message": {
        "text": "<" + sheetURL("ts") + "|*BUDGET &amp; REFERRAL GOALS*>\n" + slackUser("bethany") + slackUser("andro") /* tags here show up for all notifications */
    },
    "pilot100Body": "\n\n*Recruitment Complete*",
    "regular100Body": "\n\n*Referral Goal Reached*",
    "pilot85Body": "\n\n*Study at 85% Progress*",
    "regular75Body": "\n\n*75% of Referral Goal Reached*",
    "pilot50Body": "\n\n*Study at 50% Progress*",
    "regular50Body": "\n\n*50% of Referral Goal Reached*",
    "regular25Body": "\n\n*25% of Referral Goal Reached*"
}

// GLOBAL OBJECT FOR FUNCTIONS
var goalFuncs = {
    "goalNotification": function () {
        goalFuncs.log("Start");
        goalVars.checkData = goalVars["checkTab"].getDataRange().getValues(); /* get all data from check tab */
        goalVars.lastRow = goalVars.checkData.length; /* get checkData length */
        for (i in goalVars.helperData) /* loop through helper rows */ {
            if ((goalVars.helperData[i][goalVars.helperStatus - 1] == "Active" || goalVars.helperData[i][goalVars.helperStatus - 1].indexOf("P - ") >= 0) && goalVars.helperData[i][goalVars.helperType - 1] != "Monthly" && i > 0) /* only use active, paused, pilot, minimum, and regular studies */ {
                var match = ""; /* switch for when a match is found */
                for (x in goalVars.checkData) /* loop through check rows */ {
                    if (x > 0) /* don't do anything with the header rows */ {
                        if (goalVars.helperData[i][goalVars.helperName - 1] == goalVars.checkData[x][goalVars.checkName - 1]) /* check if study names match */ {
                            match = "Yes"; /* match found */
                            goalFuncs.checkStudy(goalVars.helperData[i], goalVars.checkData[x], (parseInt(x, 10) + 1)); /* call goalFuncs.checkStudy function */
                            break;
                        } else {
                            match = "No"; /* no match found */
                        }
                    } else {
                        match = "No"; /* no match found */
                    }
                }
                if (match == "No") {
                    goalFuncs.checkStudy(goalVars.helperData[i]); /* call goalFuncs.checkStudy function */
                }
            }
        }
        if (goalVars.messageCounter > 0) {
            goalFuncs.sendMessage();
        }
    },
    "checkStudy": function (helper, check, row) /* check a study if it's completed a goal or used all of its budget */ {
        var check = check || false; /* assign boolean false to "check" parameter if none is supplied */
        var row = row || ++goalVars.lastRow; /* assign boolean false to row parameter if none is supplied */
        if (helper[goalVars.helperType - 1] == "Pilot") {
            goalFuncs.checkPilot(helper, check, row);
        } else if (helper[goalVars.helperType - 1] == "Minimum") {
            goalFuncs.checkMinimum(helper, check, row);
        } else {
            goalFuncs.checkRegular(helper, check, row);
        }
    },
    "pilotNumber": function (helper) {
        if (helper[goalVars.helperTarget - 1]) {
            return helper[goalVars.helperTarget - 1];
        } else if (helper[goalVars.helperType - 1] == "Pilot") {
            return ((helper[goalVars.helperPaid - 1] <= 1000) ? 30 : Math.round(((((helper[goalVars.helperPaid - 1] - 1000) / 500) * 10) + 30)));
        } else {
            return "none";
        }
    },
    "checkPilot": function (helper, check, row) {
        var pilotTarget = goalFuncs.pilotNumber(helper);
        if (check) /* check if "check" isn't false */ {
            if (check[goalVars.check100 - 1] == "Y") /* check if "complete" notification is already sent */ {
                if (helper[goalVars.helperRef - 1] < pilotTarget && helper[goalVars.helperBudget - 1] < 0.9) {
                    goalVars.checkTab.getRange(row, goalVars.check100).setValue("");
                }
                if (helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.85) && helper[goalVars.helperBudget - 1] < 0.85) {
                    goalVars.checkTab.getRange(row, goalVars.check85).setValue("");
                }
                if (helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.5) && helper[goalVars.helperBudget - 1] < 0.5) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                return;
            } else if (helper[goalVars.helperRef - 1] >= pilotTarget || helper[goalVars.helperBudget - 1] >= 0.9) {
                goalVars.messageCounter++;
                goalVars.pilotCompleteCounter++;
                goalVars.pilot100Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[goalVars.helperXLink - 1] + "|$" + helper[goalVars.helperPaid - 1] + ">\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                goalVars.checkTab.getRange(row, goalVars.check100).setValue("Y");
            } else if (check[goalVars.check85 - 1] == "Y") /* check if 85% notification is already sent */ {
                if (helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.85) && helper[goalVars.helperBudget - 1] < 0.85) {
                    goalVars.checkTab.getRange(row, goalVars.check85).setValue("");
                }
                if (helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.5) && helper[goalVars.helperBudget - 1] < 0.5) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                return;
            } else if (helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.85) || helper[goalVars.helperBudget - 1] >= 0.85) {
                goalVars.messageCounter++;
                goalVars.counter85++;
                goalVars.pilot85Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[goalVars.helperXLink - 1] + "|$" + helper[goalVars.helperPaid - 1] + ">\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                goalVars.checkTab.getRange(row, goalVars.check85).setValue("Y");
            } else if (check[goalVars.check50 - 1] == "Y") /* check if 50% notification is already sent */ {
                if (helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.5) && helper[goalVars.helperBudget - 1] < 0.5) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                return;
            } else if (helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.5) || helper[goalVars.helperBudget - 1] >= 0.5) {
                goalVars.messageCounter++;
                goalVars.pilot50++;
                goalVars.pilot50Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[goalVars.helperXLink - 1] + "|$" + helper[goalVars.helperPaid - 1] + ">\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            }
        } else {
            goalVars.checkTab.appendRow([helper[goalVars.helperName - 1]]);
            if (helper[goalVars.helperRef - 1] >= pilotTarget || helper[goalVars.helperBudget - 1] >= 0.9) {
                goalVars.messageCounter++;
                goalVars.pilotCompleteCounter++;
                goalVars.pilot100Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[goalVars.helperXLink - 1] + "|$" + helper[goalVars.helperPaid - 1] + ">\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                goalVars.checkTab.getRange(row, goalVars.check100).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check85).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            } else if (helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.85) || helper[goalVars.helperBudget - 1] >= 0.85) {
                goalVars.messageCounter++;
                goalVars.counter85++;
                goalVars.pilot85Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[goalVars.helperXLink - 1] + "|$" + helper[goalVars.helperPaid - 1] + ">\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                goalVars.checkTab.getRange(row, goalVars.check85).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            } else if (helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.5) || helper[goalVars.helperBudget - 1] >= 0.5) {
                goalVars.messageCounter++;
                goalVars.pilot50++;
                goalVars.pilot50Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[goalVars.helperXLink - 1] + "|$" + helper[goalVars.helperPaid - 1] + ">\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            }
        }
    },
    "checkMinimum": function (helper, check, row) {
        var pilotTarget = goalFuncs.pilotNumber(helper);
        if (check) /* check if "check" isn't false */ {
            if (check[goalVars.check100 - 1] == "Y") /* check if "complete" notification is already sent */ {
                if (helper[goalVars.helperBudget - 1] < 0.9 && (pilotTarget == "none" || helper[goalVars.helperRef - 1] < pilotTarget)) {
                    goalVars.checkTab.getRange(row, goalVars.check100).setValue("");
                }
                if (helper[goalVars.helperBudget - 1] < 0.85 && (pilotTarget == "none" || helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.85))) {
                    goalVars.checkTab.getRange(row, goalVars.check85).setValue("");
                }
                if (helper[goalVars.helperBudget - 1] < 0.5 && (pilotTarget == "none" || helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.5))) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                return;
            } else if (helper[goalVars.helperBudget - 1] >= 0.9 || (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= pilotTarget)) {
                goalVars.messageCounter++;
                goalVars.pilotCompleteCounter++;
                goalVars.pilot100Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= pilotTarget) {
                    goalVars.pilot100Body += "\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                }
                goalVars.checkTab.getRange(row, goalVars.check100).setValue("Y");
            } else if (check[goalVars.check85 - 1] == "Y") /* check if 85% notification is already sent */ {
                if (helper[goalVars.helperBudget - 1] < 0.85 && (pilotTarget == "none" || helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.85))) {
                    goalVars.checkTab.getRange(row, goalVars.check85).setValue("");
                }
                if (helper[goalVars.helperBudget - 1] < 0.5 && (pilotTarget == "none" || helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.5))) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                return;
            } else if (helper[goalVars.helperBudget - 1] >= 0.85 || (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.85))) {
                goalVars.messageCounter++;
                goalVars.counter85++;
                goalVars.pilot85Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.85)) {
                    goalVars.pilot85Body += "\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                }
                goalVars.checkTab.getRange(row, goalVars.check85).setValue("Y");
            } else if (check[goalVars.check50 - 1] == "Y") /* check if 50% notification is already sent */ {
                if (helper[goalVars.helperBudget - 1] < 0.5 && (pilotTarget == "none" || helper[goalVars.helperRef - 1] < Math.round(pilotTarget * 0.5))) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                return;
            } else if (helper[goalVars.helperBudget - 1] >= 0.5 || (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.5))) {
                goalVars.messageCounter++;
                goalVars.pilot50++;
                goalVars.pilot50Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.5)) {
                    goalVars.pilot50Body += "\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                }
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            }
        } else {
            goalVars.checkTab.appendRow([helper[goalVars.helperName - 1]]);
            if (helper[goalVars.helperBudget - 1] >= 0.9 || (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= pilotTarget)) {
                goalVars.messageCounter++;
                goalVars.pilotCompleteCounter++;
                goalVars.pilot100Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= pilotTarget) {
                    goalVars.pilot100Body += "\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                }
                goalVars.checkTab.getRange(row, goalVars.check100).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check85).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            } else if (helper[goalVars.helperBudget - 1] >= 0.85 || (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.85))) {
                goalVars.messageCounter++;
                goalVars.counter85++;
                goalVars.pilot85Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.85)) {
                    goalVars.pilot85Body += "\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                }
                goalVars.checkTab.getRange(row, goalVars.check85).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            } else if (helper[goalVars.helperBudget - 1] >= 0.5 || (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.5))) {
                goalVars.messageCounter++;
                goalVars.pilot50++;
                goalVars.pilot50Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[goalVars.helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[goalVars.helperRef - 1] >= Math.round(pilotTarget * 0.5)) {
                    goalVars.pilot50Body += "\n>Referrals Sent: *" + helper[goalVars.helperRef - 1] + "* of " + pilotTarget;
                }
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            }
        }
    },
    "checkRegular": function (helper, check, row) {
        if (check) /* check if "check" isn't false */ {
            if (check[goalVars.check100 - 1] == "Y") /* check if "complete" notification is already sent */ {
                if (helper[goalVars.helperGoal - 1] < 1) {
                    goalVars.checkTab.getRange(row, goalVars.check100).setValue("");
                }
                if (helper[goalVars.helperGoal - 1] < 0.75) {
                    goalVars.checkTab.getRange(row, goalVars.check75).setValue("");
                }
                if (helper[goalVars.helperGoal - 1] < 0.5) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                if (helper[goalVars.helperGoal - 1] < 0.25) {
                    goalVars.checkTab.getRange(row, goalVars.check25).setValue("");
                }
                return;
            } else if (helper[goalVars.helperGoal - 1] >= 1) {
                goalVars.messageCounter++;
                goalVars.regularCompleteCounter++;
                goalVars.regular100Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check100).setValue("Y");
            } else if (check[goalVars.check75 - 1] == "Y") /* check if 75% notification is already sent */ {
                if (helper[goalVars.helperGoal - 1] < 0.75) {
                    goalVars.checkTab.getRange(row, goalVars.check75).setValue("");
                }
                if (helper[goalVars.helperGoal - 1] < 0.5) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                if (helper[goalVars.helperGoal - 1] < 0.25) {
                    goalVars.checkTab.getRange(row, goalVars.check25).setValue("");
                }
                return;
            } else if (helper[goalVars.helperGoal - 1] >= 0.75) {
                goalVars.messageCounter++;
                goalVars.counter75++;
                goalVars.regular75Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check75).setValue("Y");
            } else if (check[goalVars.check50 - 1] == "Y") /* check if 50% notification is already sent */ {
                if (helper[goalVars.helperGoal - 1] < 0.5) {
                    goalVars.checkTab.getRange(row, goalVars.check50).setValue("");
                }
                if (helper[goalVars.helperGoal - 1] < 0.25) {
                    goalVars.checkTab.getRange(row, goalVars.check25).setValue("");
                }
                return;
            } else if (helper[goalVars.helperGoal - 1] >= 0.5) {
                goalVars.messageCounter++;
                goalVars.regular50++;
                goalVars.regular50Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
            } else if (check[goalVars.check25 - 1] == "Y") /* check if 25% notification is already sent */ {
                if (helper[goalVars.helperGoal - 1] < 0.25) {
                    goalVars.checkTab.getRange(row, goalVars.check25).setValue("");
                }
                return;
            } else if (helper[goalVars.helperGoal - 1] >= 0.25) {
                goalVars.messageCounter++;
                goalVars.counter25++;
                goalVars.regular25Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check25).setValue("Y");
            }
        } else {
            goalVars.checkTab.appendRow([helper[goalVars.helperName - 1]]);
            if (helper[goalVars.helperGoal - 1] >= 1) {
                goalVars.messageCounter++;
                goalVars.regularCompleteCounter++;
                goalVars.regular100Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check100).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check75).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check25).setValue("Y");
            } else if (helper[goalVars.helperGoal - 1] >= 0.75) {
                goalVars.messageCounter++;
                goalVars.counter75++;
                goalVars.regular75Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check75).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check25).setValue("Y");
            } else if (helper[goalVars.helperGoal - 1] >= 0.5) {
                goalVars.messageCounter++;
                goalVars.regular50++;
                goalVars.regular50Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check50).setValue("Y");
                goalVars.checkTab.getRange(row, goalVars.check25).setValue("Y");
            } else if (helper[goalVars.helperGoal - 1] >= 0.25) {
                goalVars.messageCounter++;
                goalVars.counter25++;
                goalVars.regular25Body += "\n\n><" + helper[goalVars.helperBCLink - 1] + "|" + goalFuncs.escapeHtml(helper[goalVars.helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[goalVars.helperGoal - 1] * 100) + "%*";
                goalVars.checkTab.getRange(row, goalVars.check25).setValue("Y");
            }
        }
    },
    "sendMessage": function () {
        // additional tags below
        if (goalVars.pilotCompleteCounter > 0 || goalVars.regularCompleteCounter > 0) {
            goalVars.message.text += slackUser("ragnar");
        }
        // studies below
        if (goalVars.pilotCompleteCounter > 0) {
            goalVars.message.text += goalVars.pilot100Body;
        }
        if (goalVars.regularCompleteCounter > 0) {
            goalVars.message.text += goalVars.regular100Body;
        }
        if (goalVars.counter85 > 0) {
            goalVars.message.text += goalVars.pilot85Body;
        }
        if (goalVars.counter75 > 0) {
            goalVars.message.text += goalVars.regular75Body;
        }
        if (goalVars.pilot50 > 0) {
            goalVars.message.text += goalVars.pilot50Body;
        }
        if (goalVars.regular50 > 0) {
            goalVars.message.text += goalVars.regular50Body;
        }
        if (goalVars.counter25 > 0) {
            goalVars.message.text += goalVars.regular25Body;
        }
        /*  Make a POST request with a JSON payload. */
        var options = {
            'method': 'post',
            'contentType': 'application/json',
            /*  Convert the JavaScript object to a JSON string. */
            'payload': JSON.stringify(goalVars.message)
        }
        UrlFetchApp.fetch(slackChannel("recruitment"), options);
    },
    "test": function () {
        Logger.log("Test Start");
        // Logger.log(goalVars.helperData);
        Logger.log("Test End");
    },
    "escapeHtml": function (text) {
        /* escape special characters */
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };
        return text.replace(/[&<>]/g, function (m) {
            return map[m];
        });
    },
    "log": function (item) {
        if (goalVars.logging == true) {
            Logger.log(item);
        }
    },
    "parseNumbers": function (helper) {
        helper[goalVars.helperPaid - 1] = parseInt(helper[goalVars.helperPaid - 1], 10);
        helper[goalVars.helperBudget - 1] = parseFloat(helper[goalVars.helperBudget - 1]);
        helper[goalVars.helperRef - 1] = parseInt(helper[goalVars.helperRef - 1], 10);
        helper[goalVars.helperGoal - 1] = parseFloat(helper[goalVars.helperGoal - 1]);
        return helper;
    }
}

function goalCheck() {
    goalFuncs.goalNotification();
}