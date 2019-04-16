// GLOBAL VARIABLES
var activeSheet = SpreadsheetApp.getActiveSheet(); /* assign getActiveSheet to activeSheet */
var activeSheetName = activeSheet.getSheetName(); /* get active sheet name */
var activeCell = activeSheet.getActiveCell(); /* assign getActiveCell to activeCell */
var activeCellColumn = activeCell.getColumn(); /* get active cell column */
var activeCellRow = activeCell.getRow(); /* get active cell row */
var settings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings"); /* get Settings sheet */
var OutcomeCol = settings.getRange("A4").getValue(); /* get Outcome column number */
var ReasonsCol = settings.getRange("B4").getValue(); /* get Reasons column number */
var ddr = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drop-Down Reasons"); /* get Drop-Down Reasons sheet */
var ddrHeaders = ddr.getRange("1:1").getValues(); /* get all DDR headers */

// FUNCTIONS
function depDrop_(range, sourceRange) {
    var rule = SpreadsheetApp.newDataValidation().requireValueInRange(sourceRange, true).setHelpText("Choose from an existing reason or enter a new reason.").build();
    range.setDataValidation(rule);
}

function whiteSpace(outCol) {
    // The below three lines remove the trailing and leading whitespace from all fields
    var cell = activeSheet.getActiveRange(); // Capturing the cell that is being edited
    var noLeadingOrTrailingSpaces = cell.getValue().trim(); // Trimming the content of that cell
    cell.setValue(noLeadingOrTrailingSpaces); //Updating the cell
    if (activeCellColumn == outCol) {
        ddrStartCol = 1;
        ddrNumCol = "";
        var range = activeSheet.getRange(activeCellRow, activeCellColumn + 1);
        for (i in ddrHeaders[0]) {
            if (ddrHeaders[0][i] == "") {
                ddrNumCol = (parseInt(i, 10) + 1);
                break;
            } else if (ddrHeaders[0][i] == noLeadingOrTrailingSpaces) {
                ddrStartCol = (parseInt(i, 10) + 1);
                ddrNumCol = 1;
                break;
            }
        }
        var sourceRange = ddr.getRange(2, ddrStartCol, 499, ddrNumCol);
        depDrop_(range, sourceRange);
    }
}

function checkSheet(tab1, tab2) {
    tab2 = tab2 || "!#%&(_";
    if (activeSheetName == tab1 || activeSheetName == tab2) {
        /* if sheet name is equal to parameter tab */
        return true;
    } else {
        return false;
    }
}

function checkColumn(col1, col2) {
    col2 = col2 || "!#%&(_";
    if (activeCellColumn == col1 || activeCellColumn == col2) {
        return true;
    } else {
        return false;
    }
}

function onEdit() {
    if (checkSheet("Passed")) {
        if (checkColumn(OutcomeCol, ReasonsCol)) {
            whiteSpace(OutcomeCol);
        }
    }
}