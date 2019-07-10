//FUNCTIONS

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

function scheduled() {
    /* scheduled to run once every Monday */
    checkFunnel(true);
}

function monitor() {
    /* runs once daily except on Mondays */
    checkFunnel(false);
}

function checkFunnel(scheduled) {
    /* VARIABLES */
    var funnelSheet = 'Enrolment Funnel Check'; /* tab name of enrolment funnel check */
    var name = 0; /* column number of study name (column numbering starts at 0 (column A)) */
    var sheetLink = 1; /* column of sheet links */
    var referrals = 6; /* column of referral count */
    var prescreen = 8; /* column of prescreen A/B */
    var contact = 9; /* column of contact A/B */
    var phone = 10; /* column of phone A/B */
    var attendance = 11; /* column of attendance A/B */
    var scriptProperties = PropertiesService.getScriptProperties(); /* Properties Service */

    /* check for off track studies */
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(funnelSheet); /* assign funnelSheet to sheet */
    var data = sheet.getDataRange().getValues(); /* get all the data */
    var message = {
        'text': 'No study is off track! 😎' /* default message if no study is off track */
    }
    var offTrack = []; /* array for off track rows */
    var totalOffTrack = 0; /* storage for total off track */
    var newOffTrack = 0; /* number of new off track studies */
    var studyStatus = {} /* object for properties */
    var offTrackStatus = {} /* object from PropertiesService */
    for (i in data) {
        /* loop through each row */
        var row = data[i]; /* assign data row to variable row */
        row[name] = escapeHtml(row[name]); /* escape special characters from name */
        studyStatus[row[name]] = 'ON'; /* register study as on track */
        row['status'] = 'ON'; /* set status of current row to on track */
        if (row[referrals] > 4 && (row[prescreen] <= -0.2 || row[contact] <= -0.2 || row[phone] <= -0.2 || row[attendance] <= -0.2)) {
            /*  check if more than 5 referrals and check columns H - K if off track */
            if (Object.keys(offTrackStatus).length === 0 && offTrackStatus.constructor === Object) {
                /* check if object is empty */
                offTrackStatus = scriptProperties.getProperties(); /* grab all properties */
            }
            studyStatus[row[name]] = 'OFF'; /* register study as off track */
            if (offTrackStatus.hasOwnProperty(row[name])) {
                /* check if property exists */
                if (offTrackStatus[row[name]] == 'ON') {
                    /* check if on track before */
                    newOffTrack += 1; /* add 1 to new off track count */
                    row['status'] = 'NEW OFF'; /* register current row as new off track */
                } else {
                    row['status'] = 'OFF'; /* register current row as off track */
                }
            } else {
                row['status'] = 'NEW OFF'; /* register current row as new off track */
                newOffTrack += 1; /* add 1 to new off track count */
            }
            totalOffTrack = offTrack.push(row); /* append off track row to array and return new array length */
        }
    }
    if (offTrack.length) {
        /* check if any studies are in array */
        var offTrackNumber = 'Total New Off Track: ' + newOffTrack; /* default number is number of new off track studies */
        for (j in offTrack) {
            /* loop through each row */
            var row = offTrack[j]; /* assign data row to variable row */
            var pass = false; /* default value false */
            if (scheduled == true) {
                pass = true;
                offTrackNumber = 'Total Off Track: ' + totalOffTrack; /* show total number of off track studies */
            } else if (row.status == 'NEW OFF') {
                /* check if new off track study */
                pass = true;
            } else if (scheduled == false && j == (totalOffTrack - 1)) {
                /* check if on last iteration */
                if (message.text == 'No study is off track! 😎') {
                    /* check if still on default message */
                    message.text = 'No new study is off track!';
                }
            }
            if (pass) {
                if (message.text == 'No study is off track! 😎') {
                    /* check if still on default message */
                    if (scheduled == true) {
                        message.text = '<a href="https://docs.google.com/spreadsheets/d/1ufU-ZgFT_wkQdPUn_qSgNicKIOYyw7qUl3jK1CNyVss/edit?usp=sharing"><strong>OFF TRACK STUDIES</strong></a><br>￼<bc-attachment sgid="BAh7CEkiCGdpZAY6BkVUSSIpZ2lkOi8vYmMzL1BlcnNvbi8xNjM2ODkzMT9leHBpcmVzX2luBjsAVEkiDHB1cnBvc2UGOwBUSSIPYXR0YWNoYWJsZQY7AFRJIg9leHBpcmVzX2F0BjsAVDA=--01e70c2351433318f29bd97422f2ac44bd371732"></bc-attachment><bc-attachment sgid="BAh7CEkiCGdpZAY6BkVUSSIpZ2lkOi8vYmMzL1BlcnNvbi8yMzA0MTEyNj9leHBpcmVzX2luBjsAVEkiDHB1cnBvc2UGOwBUSSIPYXR0YWNoYWJsZQY7AFRJIg9leHBpcmVzX2F0BjsAVDA=--3f8241add4dddacdcd942a64575a4a556ac33e23"></bc-attachment>￼<bc-attachment sgid="BAh7CEkiCGdpZAY6BkVUSSIpZ2lkOi8vYmMzL1BlcnNvbi8xODcxNDE5OT9leHBpcmVzX2luBjsAVEkiDHB1cnBvc2UGOwBUSSIPYXR0YWNoYWJsZQY7AFRJIg9leHBpcmVzX2F0BjsAVDA=--a8813b2b7574cd03d0fc5560965ca64950262f51"></bc-attachment><br>' + offTrackNumber + '<br><br>'; /* message title */
                    } else {
                        message.text = '<https://docs.google.com/spreadsheets/d/1ufU-ZgFT_wkQdPUn_qSgNicKIOYyw7qUl3jK1CNyVss/edit?usp=sharing|*OFF TRACK STUDIES*>\n<@UFDC56ZM2><@U8GLHM3U5><@UAB5PS4RG>\n' + offTrackNumber + '\n\n'; /* message title */
                    }
                }
                /* first line of study */
                if (scheduled == true) {
                    message.text += 'Sheet: <a href="' + row[sheetLink] + '">' + row[name] + '</a><br>'; /* study hyperlink */
                } else {
                    message.text += '>Sheet: <' + row[sheetLink] + '|' + row[name] + '>\n'; /* study hyperlink */
                }
                /* second line of study */
                var prescreenAB = Math.round(100 * row[prescreen]); /* convert to integer */
                if (row[prescreen] <= -0.2) {
                    /* check if off track */
                    if (scheduled == true) {
                        message.text += 'Prescreen A/B:    <strong>' + prescreenAB + '%</strong><br>';
                    } else {
                        message.text += '>Prescreen A/B:    *' + prescreenAB + '%*\n';
                    }
                }
                /* third line of study */
                var contactAB = Math.round(100 * row[contact]); /* convert to integer */
                if (row[contact] <= -0.2) {
                    /* check if off track */
                    if (scheduled == true) {
                        message.text += 'Contact A/B:       <strong>' + contactAB + '%</strong><br>';
                    } else {
                        message.text += '>Contact A/B:       *' + contactAB + '%*\n';
                    }
                }
                /* fourth line of study */
                var phoneAB = Math.round(100 * row[phone]); /* convert to integer */
                if (row[phone] <= -0.2) {
                    /* check if off track */
                    if (scheduled == true) {
                        message.text += 'Phone A/B:          <strong>' + phoneAB + '%</strong><br>';
                    } else {
                        message.text += '>Phone A/B:          *' + phoneAB + '%*\n';
                    }
                }
                /* fifth line of study */
                var attendanceAB = Math.round(100 * row[attendance]); /* convert to integer */
                if (row[attendance] <= -0.2) {
                    /* check if off track */
                    if (scheduled == true) {
                        message.text += 'Attendance A/B: <strong>' + attendanceAB + '%</strong><br>';
                    } else {
                        message.text += '>Attendance A/B: *' + attendanceAB + '%*\n';
                    }
                }
                if (scheduled == true) {
                    message.text += '<br>'; /* extra line break */
                } else {
                    message.text += '\n'; /* extra line break */
                }
            }
        }
    }
    if (scheduled == false) {
        /*  Make a POST request with a JSON payload. */
        var options = {
            'method': 'post',
            'contentType': 'application/json',
            /*  Convert the JavaScript object to a JSON string. */
            'payload': JSON.stringify(message)
        }
        UrlFetchApp.fetch(slackChannel("recruitment"), options);
        scriptProperties.setProperties(studyStatus);
    }
    if (scheduled == true) {
        /*  Make a POST request with a JSON payload. */
        var options = {
            'method': 'post',
            'contentType': 'application/json',
            /*  Convert the JavaScript object to a JSON string. */
            'payload': JSON.stringify(message)
        }
        UrlFetchApp.fetch(zapHooks("funnel"), options);
        scriptProperties.setProperties(studyStatus);
    }
}