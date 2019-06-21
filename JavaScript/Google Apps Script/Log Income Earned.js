function logIncomeEarned() {
    // VARIABLES  
    var logging = true;
    var academicTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Academic");
    var researchSiteTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Research Site");
    var sponsorTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sponsor");
    var settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getDataRange().getValues();
    var campaignColumn = settings[6][0];
    var invoiceColumn = settings[6][1];
    var incomeEarnedColumn = settings[6][2];
    var dataStartRow = settings[6][3];
    var paymentTypeColumn = settings[6][5];
    var academicData = academicTab.getDataRange().getValues();
    var researchSiteData = researchSiteTab.getDataRange().getValues();
    var sponsorData = sponsorTab.getDataRange().getValues();
    var blankColumnAcademic = (academicData[0].length + 1);
    var blankColumnResearchSite = (researchSiteData[0].length + 1);
    var blankColumnSponsor = (sponsorData[0].length + 1);
    var date = new Date();
    var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ]
    var month = months[(date.getMonth() - 1)];
    var year = date.getFullYear();

    // FUNCTIONS
    /* logging function */
    function log(item) {
        if (logging) {
            Logger.log(item);
        }
    }

    /* add ordinal suffix to number */
    function nth(n) {
        return n + (["st", "nd", "rd"][((n + 90) % 100 - 10) % 10 - 1] || "th");
    }

    // SCRIPT
    /* prepare arrays for each column */
    var academicFontWeights = [];
    var researchSiteFontWeights = [];
    var sponsorFontWeights = [];
    var academicHorizontalAlignments = [];
    var researchSiteHorizontalAlignments = [];
    var sponsorHorizontalAlignments = [];
    var academicVerticalAlignments = [];
    var researchSiteVerticalAlignments = [];
    var sponsorVerticalAlignments = [];
    var academicNumberFormats = [];
    var researchSiteNumberFormats = [];
    var sponsorNumberFormats = [];
    var horizontalAlignment = ["left", "left", "center"];
    var verticalAlignment = ["middle", "middle", "middle"];
    var fontWeight = ["normal", "normal", "normal"];
    var numberFormat = ["@", "@", "0%"];

    for (var i = (academicData.length - 1); i >= 0; i--) {
        if (i < (dataStartRow - 1)) {
            academicData.splice(i, 1);
        } else if (academicData[i][0]) {
            if (academicData[i][paymentTypeColumn - 1] == "Post Pay") {
                academicData[i][invoiceColumn - 1] = "";
            }
            for (var x = (academicData[0].length - 1); x >= 0; x--) {
                if (x != (campaignColumn - 1) && x != (invoiceColumn - 1) && x != (incomeEarnedColumn - 1)) {
                    academicData[i].splice(x, 1);
                }
            }
            academicHorizontalAlignments.push(horizontalAlignment);
            academicVerticalAlignments.push(verticalAlignment);
            academicFontWeights.push(fontWeight);
            academicNumberFormats.push(numberFormat);
        } else {
            academicData.splice(i, 1);
        }
    }
    var academicMaxRows = academicData.length;

    for (var i = (researchSiteData.length - 1); i >= 0; i--) {
        if (i < (dataStartRow - 1)) {
            researchSiteData.splice(i, 1);
        } else if (researchSiteData[i][0]) {
            if (researchSiteData[i][paymentTypeColumn - 1] == "Post Pay") {
                researchSiteData[i][invoiceColumn - 1] = "";
            }
            for (var x = (researchSiteData[0].length - 1); x >= 0; x--) {
                if (x != (campaignColumn - 1) && x != (invoiceColumn - 1) && x != (incomeEarnedColumn - 1)) {
                    researchSiteData[i].splice(x, 1);
                }
            }
            researchSiteHorizontalAlignments.push(horizontalAlignment);
            researchSiteVerticalAlignments.push(verticalAlignment);
            researchSiteFontWeights.push(fontWeight);
            researchSiteNumberFormats.push(numberFormat);
        } else {
            researchSiteData.splice(i, 1);
        }
    }
    var researchSiteMaxRows = researchSiteData.length;

    for (var i = (sponsorData.length - 1); i >= 0; i--) {
        if (i < (dataStartRow - 1)) {
            sponsorData.splice(i, 1);
        } else if (sponsorData[i][0]) {
            if (sponsorData[i][paymentTypeColumn - 1] == "Post Pay") {
                sponsorData[i][invoiceColumn - 1] = "";
            }
            for (var x = (sponsorData[0].length - 1); x >= 0; x--) {
                if (x != (campaignColumn - 1) && x != (invoiceColumn - 1) && x != (incomeEarnedColumn - 1)) {
                    sponsorData[i].splice(x, 1);
                }
            }
            sponsorHorizontalAlignments.push(horizontalAlignment);
            sponsorVerticalAlignments.push(verticalAlignment);
            sponsorFontWeights.push(fontWeight);
            sponsorNumberFormats.push(numberFormat);
        } else {
            sponsorData.splice(i, 1);
        }
    }
    var sponsorMaxRows = sponsorData.length;

    /* set headers in second row */
    academicData.unshift(["Campaign", "Invoice", "Income Earned"]);
    researchSiteData.unshift(["Campaign", "Invoice", "Income Earned"]);
    sponsorData.unshift(["Campaign", "Invoice", "Income Earned"]);
    academicHorizontalAlignments.unshift(["center", "center", "center"]);
    researchSiteHorizontalAlignments.unshift(["center", "center", "center"]);
    sponsorHorizontalAlignments.unshift(["center", "center", "center"]);
    academicVerticalAlignments.unshift(["middle", "middle", "middle"]);
    researchSiteVerticalAlignments.unshift(["middle", "middle", "middle"]);
    sponsorVerticalAlignments.unshift(["middle", "middle", "middle"]);
    academicFontWeights.unshift(["bold", "bold", "bold"]);
    researchSiteFontWeights.unshift(["bold", "bold", "bold"]);
    sponsorFontWeights.unshift(["bold", "bold", "bold"]);
    academicNumberFormats.unshift(["@", "@", "@"]);
    researchSiteNumberFormats.unshift(["@", "@", "@"]);
    sponsorNumberFormats.unshift(["@", "@", "@"]);

    /* set month & year in first row */
    academicData.unshift(["Income Earned as at end of " + month + " " + year, "", ""]);
    researchSiteData.unshift(["Income Earned as at end of " + month + " " + year, "", ""]);
    sponsorData.unshift(["Income Earned as at end of " + month + " " + year, "", ""]);
    academicHorizontalAlignments.unshift(["center", "center", "center"]);
    researchSiteHorizontalAlignments.unshift(["center", "center", "center"]);
    sponsorHorizontalAlignments.unshift(["center", "center", "center"]);
    academicVerticalAlignments.unshift(["middle", "middle", "middle"]);
    researchSiteVerticalAlignments.unshift(["middle", "middle", "middle"]);
    sponsorVerticalAlignments.unshift(["middle", "middle", "middle"]);
    academicFontWeights.unshift(["bold", "bold", "bold"]);
    researchSiteFontWeights.unshift(["bold", "bold", "bold"]);
    sponsorFontWeights.unshift(["bold", "bold", "bold"]);
    academicNumberFormats.unshift(["@", "@", "@"]);
    researchSiteNumberFormats.unshift(["@", "@", "@"]);
    sponsorNumberFormats.unshift(["@", "@", "@"]);

    /* set all values for each column */
    academicTab.getRange(1, blankColumnAcademic, (academicMaxRows + 2), 3).setValues(academicData).setHorizontalAlignments(academicHorizontalAlignments).setVerticalAlignments(academicVerticalAlignments).setFontWeights(academicFontWeights).setNumberFormats(academicNumberFormats).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    researchSiteTab.getRange(1, blankColumnResearchSite, (researchSiteMaxRows + 2), 3).setValues(researchSiteData).setHorizontalAlignments(researchSiteHorizontalAlignments).setVerticalAlignments(researchSiteVerticalAlignments).setFontWeights(researchSiteFontWeights).setNumberFormats(researchSiteNumberFormats).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    sponsorTab.getRange(1, blankColumnSponsor, (sponsorMaxRows + 2), 3).setValues(sponsorData).setHorizontalAlignments(sponsorHorizontalAlignments).setVerticalAlignments(sponsorVerticalAlignments).setFontWeights(sponsorFontWeights).setNumberFormats(sponsorNumberFormats).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    /* set column widths */
    academicTab.setColumnWidth(blankColumnAcademic, 325).setColumnWidth((blankColumnAcademic + 1), 170);
    researchSiteTab.setColumnWidth(blankColumnResearchSite, 325).setColumnWidth((blankColumnResearchSite + 1), 170);
    sponsorTab.setColumnWidth(blankColumnSponsor, 325).setColumnWidth((blankColumnSponsor + 1), 170);

    /* merge first row of three columns */
    academicTab.getRange(1, blankColumnAcademic, 1, 3).merge();
    researchSiteTab.getRange(1, blankColumnResearchSite, 1, 3).merge();
    sponsorTab.getRange(1, blankColumnSponsor, 1, 3).merge();

    /* set borders */
    academicTab.getRange(1, blankColumnAcademic, 2, 3).setBorder(true, true, true, true, true, true);
    researchSiteTab.getRange(1, blankColumnResearchSite, 2, 3).setBorder(true, true, true, true, true, true);
    sponsorTab.getRange(1, blankColumnSponsor, 2, 3).setBorder(true, true, true, true, true, true);

    academicTab.getRange(3, blankColumnAcademic, academicMaxRows, 1).setBorder(true, true, true, true, null, null);
    researchSiteTab.getRange(3, blankColumnResearchSite, researchSiteMaxRows, 1).setBorder(true, true, true, true, null, null);
    sponsorTab.getRange(3, blankColumnSponsor, sponsorMaxRows, 1).setBorder(true, true, true, true, null, null);

    academicTab.getRange(3, (blankColumnAcademic + 1), academicMaxRows, 1).setBorder(true, true, true, true, null, null);
    researchSiteTab.getRange(3, (blankColumnResearchSite + 1), researchSiteMaxRows, 1).setBorder(true, true, true, true, null, null);
    sponsorTab.getRange(3, (blankColumnSponsor + 1), sponsorMaxRows, 1).setBorder(true, true, true, true, null, null);

    academicTab.getRange(3, (blankColumnAcademic + 2), academicMaxRows, 1).setBorder(true, true, true, true, null, null);
    researchSiteTab.getRange(3, (blankColumnResearchSite + 2), researchSiteMaxRows, 1).setBorder(true, true, true, true, null, null);
    sponsorTab.getRange(3, (blankColumnSponsor + 2), sponsorMaxRows, 1).setBorder(true, true, true, true, null, null);
}

function addMenu() {
    var ui = SpreadsheetApp.getUi().createAddonMenu();
    ui.addItem('Record Income Earned', 'logIncomeEarned');
    ui.addToUi();
}