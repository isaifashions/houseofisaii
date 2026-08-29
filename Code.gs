/**
 * ISAI FASHIONS — Google Apps Script backend
 *
 * What this does:
 *   Receives an order (as JSON) from script.js and writes one row
 *   per product ordered into a sheet named "Orders" — with order
 *   number, product name, size, quantity, contact number, etc.
 *
 * Setup: see SETUP.md in the project folder for the full walkthrough.
 * Quick version:
 *   1. Create a Google Sheet, rename a tab to "Orders".
 *   2. In the sheet: Extensions > Apps Script, delete the placeholder
 *      code, and paste this whole file in.
 *   3. Click Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Copy the Web app URL and paste it into GOOGLE_SCRIPT_URL
 *      near the top of script.js.
 */

const SHEET_NAME = "Orders";

function doPost(e) {
  try {
    const sheet = getOrdersSheet_();
    const data = JSON.parse(e.postData.contents);

    const timestamp = new Date();

    data.items.forEach(function (item) {
      sheet.appendRow([
        timestamp,
        data.orderId,
        data.customerName,
        data.phone,
        data.address,
        item.name,
        item.size,
        item.quantity,
        item.price,
        item.quantity * item.price,
        data.orderTotal,
        data.notes || ""
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Isai Fashions order API is running.");
}

/** Gets the Orders sheet, creating it with headers if it doesn't exist yet. */
function getOrdersSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Order Number",
      "Customer Name",
      "Contact Number",
      "Delivery Address",
      "Product Name",
      "Size",
      "Quantity",
      "Price (Each)",
      "Line Total",
      "Order Total",
      "Notes"
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}
