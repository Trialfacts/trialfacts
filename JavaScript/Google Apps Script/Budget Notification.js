function budgetCheck() {
    // logging
    var logging = "false";
    // get all data from helper tab
    var helperData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Budget Helper").getDataRange().getValues();
    var checkTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Budget Check");
    // check tab columns
    var checkName = 1;
    var check25 = 2;
    var check50 = 3;
    var check75 = 4;
    var check85 = 5;
    var check100 = 6;
    // helper tab columns
    var helperName = 1;
    var helperType = 2;
    var helperStatus = 3;
    var helperPaid = 4 /* amount paid */ ;
    var helperBudget = 5 /* budget consumed */ ;
    var helperRef = 6 /* number of referrals */ ;
    var helperGoal = 7 /* % of referral goal */ ;
    var helperTarget = 8 /* target referrals */ ;
    var helperBCLink = 9;
    var helperXLink = 10;
    // other variables
    var messageCounter = 0;
    var pilotCompleteCounter = 0;
    var regularCompleteCounter = 0;
    var counter85 = 0;
    var counter75 = 0;
    var pilot50 = 0;
    var regular50 = 0;
    var counter25 = 0;
    var message = {
        "text": "<" + sheetURL("ts") + "|*BUDGET NOTIFICATION*>\n" + slackUser("bethany") + slackUser("andro") /* tags here show up for all notifications */
    }
    var pilot100Body = "\n\n*Budget Exhausted*";
    var pilot85Body = "\n\n*85% of Budget Consumed*";
    var pilot50Body = "\n\n*50% of Budget Consumed*";

    function goalNotification() {
        log("Start");
        checkData = checkTab.getDataRange().getValues(); /* get all data from check tab */
        lastRow = checkData.length; /* get checkData length */
        for (i in helperData) /* loop through helper rows */ {
            if ((helperData[i][helperStatus - 1] == "Active" || helperData[i][helperStatus - 1].indexOf("P - ") >= 0) && helperData[i][helperType - 1] != "Monthly" && i > 0) /* only use active, paused, pilot, minimum, and regular studies */ {
                var match = ""; /* switch for when a match is found */
                for (x in checkData) /* loop through check rows */ {
                    if (x > 0) /* don't do anything with the header rows */ {
                        if (helperData[i][helperName - 1] == checkData[x][checkName - 1]) /* check if study names match */ {
                            match = "Yes"; /* match found */
                            checkStudy(helperData[i], checkData[x], (parseInt(x, 10) + 1)); /* call checkStudy function */
                            break;
                        } else {
                            match = "No"; /* no match found */
                        }
                    } else {
                        match = "No"; /* no match found */
                    }
                }
                if (match == "No") {
                    checkStudy(helperData[i]); /* call checkStudy function */
                }
            }
        }
        if (messageCounter > 0) {
            sendMessage();
        }
    }

    function checkStudy(helper, check, row) /* check a study if it's completed a goal or used all of its budget */ {
        var check = check || false; /* assign boolean false to "check" parameter if none is supplied */
        var row = row || ++lastRow; /* assign boolean false to row parameter if none is supplied */
        if (helper[helperType - 1] == "Pilot") {
            checkPilot(helper, check, row);
        } else if (helper[helperType - 1] == "Minimum") {
            checkMinimum(helper, check, row);
        } else {
            // checkRegular(helper, check, row);
        }
    }

    function pilotNumber(helper) {
        if (helper[helperTarget - 1]) {
            return helper[helperTarget - 1];
        } else if (helper[helperType - 1] == "Pilot") {
            return ((helper[helperPaid - 1] <= 1000) ? 30 : Math.round(((((helper[helperPaid - 1] - 1000) / 500) * 10) + 30)));
        } else {
            return "none";
        }
    }

    function checkPilot(helper, check, row) {
        var pilotTarget = pilotNumber(helper);
        if (check) /* check if "check" isn't false */ {
            if (check[check100 - 1] == "Y") /* check if "complete" notification is already sent */ {
                if (helper[helperBudget - 1] < 0.9) {
                    checkTab.getRange(row, check100).setValue("");
                }
                if (helper[helperBudget - 1] < 0.85) {
                    checkTab.getRange(row, check85).setValue("");
                }
                if (helper[helperBudget - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                return;
            } else if (helper[helperBudget - 1] >= 0.9) {
                messageCounter++;
                pilotCompleteCounter++;
                pilot100Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[helperXLink - 1] + "|$" + helper[helperPaid - 1] + ">\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                checkTab.getRange(row, check100).setValue("Y");
            } else if (check[check85 - 1] == "Y") /* check if 85% notification is already sent */ {
                if (helper[helperBudget - 1] < 0.85) {
                    checkTab.getRange(row, check85).setValue("");
                }
                if (helper[helperBudget - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                return;
            } else if (helper[helperBudget - 1] >= 0.85) {
                messageCounter++;
                counter85++;
                pilot85Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[helperXLink - 1] + "|$" + helper[helperPaid - 1] + ">\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                checkTab.getRange(row, check85).setValue("Y");
            } else if (check[check50 - 1] == "Y") /* check if 50% notification is already sent */ {
                if (helper[helperBudget - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                return;
            } else if (helper[helperBudget - 1] >= 0.5) {
                messageCounter++;
                pilot50++;
                pilot50Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[helperXLink - 1] + "|$" + helper[helperPaid - 1] + ">\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                checkTab.getRange(row, check50).setValue("Y");
            }
        } else {
            checkTab.appendRow([helper[helperName - 1]]);
            if (helper[helperBudget - 1] >= 0.9) {
                messageCounter++;
                pilotCompleteCounter++;
                pilot100Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[helperXLink - 1] + "|$" + helper[helperPaid - 1] + ">\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                checkTab.getRange(row, check100).setValue("Y");
                checkTab.getRange(row, check85).setValue("Y");
                checkTab.getRange(row, check50).setValue("Y");
            } else if (helper[helperBudget - 1] >= 0.85) {
                messageCounter++;
                counter85++;
                pilot85Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[helperXLink - 1] + "|$" + helper[helperPaid - 1] + ">\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                checkTab.getRange(row, check85).setValue("Y");
                checkTab.getRange(row, check50).setValue("Y");
            } else if (helper[helperBudget - 1] >= 0.5) {
                messageCounter++;
                pilot50++;
                pilot50Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*\n>Amount Paid: <" + helper[helperXLink - 1] + "|$" + helper[helperPaid - 1] + ">\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                checkTab.getRange(row, check50).setValue("Y");
            }
        }
    }

    function checkMinimum(helper, check, row) {
        var pilotTarget = pilotNumber(helper);
        if (check) /* check if "check" isn't false */ {
            if (check[check100 - 1] == "Y") /* check if "complete" notification is already sent */ {
                if (helper[helperBudget - 1] < 0.9) {
                    checkTab.getRange(row, check100).setValue("");
                }
                if (helper[helperBudget - 1] < 0.85) {
                    checkTab.getRange(row, check85).setValue("");
                }
                if (helper[helperBudget - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                return;
            } else if (helper[helperBudget - 1] >= 0.9) {
                messageCounter++;
                pilotCompleteCounter++;
                pilot100Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[helperRef - 1] >= pilotTarget) {
                    pilot100Body += "\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                }
                checkTab.getRange(row, check100).setValue("Y");
            } else if (check[check85 - 1] == "Y") /* check if 85% notification is already sent */ {
                if (helper[helperBudget - 1] < 0.85) {
                    checkTab.getRange(row, check85).setValue("");
                }
                if (helper[helperBudget - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                return;
            } else if (helper[helperBudget - 1] >= 0.85) {
                messageCounter++;
                counter85++;
                pilot85Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[helperRef - 1] >= Math.round(pilotTarget * 0.85)) {
                    pilot85Body += "\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                }
                checkTab.getRange(row, check85).setValue("Y");
            } else if (check[check50 - 1] == "Y") /* check if 50% notification is already sent */ {
                if (helper[helperBudget - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                return;
            } else if (helper[helperBudget - 1] >= 0.5) {
                messageCounter++;
                pilot50++;
                pilot50Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[helperRef - 1] >= Math.round(pilotTarget * 0.5)) {
                    pilot50Body += "\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                }
                checkTab.getRange(row, check50).setValue("Y");
            }
        } else {
            checkTab.appendRow([helper[helperName - 1]]);
            if (helper[helperBudget - 1] >= 0.9) {
                messageCounter++;
                pilotCompleteCounter++;
                pilot100Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[helperRef - 1] >= pilotTarget) {
                    pilot100Body += "\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                }
                checkTab.getRange(row, check100).setValue("Y");
                checkTab.getRange(row, check85).setValue("Y");
                checkTab.getRange(row, check50).setValue("Y");
            } else if (helper[helperBudget - 1] >= 0.85) {
                messageCounter++;
                counter85++;
                pilot85Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[helperRef - 1] >= Math.round(pilotTarget * 0.85)) {
                    pilot85Body += "\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                }
                checkTab.getRange(row, check85).setValue("Y");
                checkTab.getRange(row, check50).setValue("Y");
            } else if (helper[helperBudget - 1] >= 0.5) {
                messageCounter++;
                pilot50++;
                pilot50Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Budget Used: *" + Math.round(helper[helperBudget - 1] * 100) + "%*";
                if (pilotTarget != "none" && helper[helperRef - 1] >= Math.round(pilotTarget * 0.5)) {
                    pilot50Body += "\n>Referrals Sent: *" + helper[helperRef - 1] + "* of " + pilotTarget;
                }
                checkTab.getRange(row, check50).setValue("Y");
            }
        }
    }

    function checkRegular(helper, check, row) {
        if (check) /* check if "check" isn't false */ {
            if (check[check100 - 1] == "Y") /* check if "complete" notification is already sent */ {
                if (helper[helperGoal - 1] < 1) {
                    checkTab.getRange(row, check100).setValue("");
                }
                if (helper[helperGoal - 1] < 0.75) {
                    checkTab.getRange(row, check75).setValue("");
                }
                if (helper[helperGoal - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                if (helper[helperGoal - 1] < 0.25) {
                    checkTab.getRange(row, check25).setValue("");
                }
                return;
            } else if (helper[helperGoal - 1] >= 1) {
                messageCounter++;
                regularCompleteCounter++;
                regular100Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check100).setValue("Y");
            } else if (check[check75 - 1] == "Y") /* check if 75% notification is already sent */ {
                if (helper[helperGoal - 1] < 0.75) {
                    checkTab.getRange(row, check75).setValue("");
                }
                if (helper[helperGoal - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                if (helper[helperGoal - 1] < 0.25) {
                    checkTab.getRange(row, check25).setValue("");
                }
                return;
            } else if (helper[helperGoal - 1] >= 0.75) {
                messageCounter++;
                counter75++;
                regular75Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check75).setValue("Y");
            } else if (check[check50 - 1] == "Y") /* check if 50% notification is already sent */ {
                if (helper[helperGoal - 1] < 0.5) {
                    checkTab.getRange(row, check50).setValue("");
                }
                if (helper[helperGoal - 1] < 0.25) {
                    checkTab.getRange(row, check25).setValue("");
                }
                return;
            } else if (helper[helperGoal - 1] >= 0.5) {
                messageCounter++;
                regular50++;
                regular50Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check50).setValue("Y");
            } else if (check[check25 - 1] == "Y") /* check if 25% notification is already sent */ {
                if (helper[helperGoal - 1] < 0.25) {
                    checkTab.getRange(row, check25).setValue("");
                }
                return;
            } else if (helper[helperGoal - 1] >= 0.25) {
                messageCounter++;
                counter25++;
                regular25Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check25).setValue("Y");
            }
        } else {
            checkTab.appendRow([helper[helperName - 1]]);
            if (helper[helperGoal - 1] >= 1) {
                messageCounter++;
                regularCompleteCounter++;
                regular100Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check100).setValue("Y");
                checkTab.getRange(row, check75).setValue("Y");
                checkTab.getRange(row, check50).setValue("Y");
                checkTab.getRange(row, check25).setValue("Y");
            } else if (helper[helperGoal - 1] >= 0.75) {
                messageCounter++;
                counter75++;
                regular75Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check75).setValue("Y");
                checkTab.getRange(row, check50).setValue("Y");
                checkTab.getRange(row, check25).setValue("Y");
            } else if (helper[helperGoal - 1] >= 0.5) {
                messageCounter++;
                regular50++;
                regular50Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check50).setValue("Y");
                checkTab.getRange(row, check25).setValue("Y");
            } else if (helper[helperGoal - 1] >= 0.25) {
                messageCounter++;
                counter25++;
                regular25Body += "\n\n><" + helper[helperBCLink - 1] + "|" + escapeHtml(helper[helperName - 1]) + ">\n>Referrals Sent: *" + Math.round(helper[helperGoal - 1] * 100) + "%*";
                checkTab.getRange(row, check25).setValue("Y");
            }
        }
    }

    function sendMessage() {
        // additional tags below
        if (pilotCompleteCounter > 0 || regularCompleteCounter > 0) {
            message.text += slackUser("ragnar");
            message.text += slackUser("franz");
        }
        if (counter85 > 0) {
            message.text += slackUser("elyssa");
        }
        // studies below
        if (pilotCompleteCounter > 0) {
            message.text += pilot100Body;
        }
        if (regularCompleteCounter > 0) {
            message.text += regular100Body;
        }
        if (counter85 > 0) {
            message.text += pilot85Body;
        }
        if (counter75 > 0) {
            message.text += regular75Body;
        }
        if (pilot50 > 0) {
            message.text += pilot50Body;
        }
        if (regular50 > 0) {
            message.text += regular50Body;
        }
        if (counter25 > 0) {
            message.text += regular25Body;
        }
        /*  Make a POST request with a JSON payload. */
        var options = {
            'method': 'post',
            'contentType': 'application/json',
            /*  Convert the JavaScript object to a JSON string. */
            'payload': JSON.stringify(message)
        }
        UrlFetchApp.fetch(slackChannel("recruitment"), options);
    }

    function test() {
        Logger.log("Test Start");
        // Logger.log(helperData);
        Logger.log("Test End");
    }

    function escapeHtml(text) {
        /* escape special characters */
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };
        return text.replace(/[&<>]/g, function (m) {
            return map[m];
        });
    }

    function log(item) {
        if (logging == true) {
            Logger.log(item);
        }
    }

    function parseNumbers(helper) {
        helper[helperPaid - 1] = parseInt(helper[helperPaid - 1], 10);
        helper[helperBudget - 1] = parseFloat(helper[helperBudget - 1]);
        helper[helperRef - 1] = parseInt(helper[helperRef - 1], 10);
        helper[helperGoal - 1] = parseFloat(helper[helperGoal - 1]);
        return helper;
    }

    goalNotification();
}