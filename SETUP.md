# Isai Fashions — Setup Guide

## 1. Open the project in VS Code
Unzip the folder and open it in VS Code. You should see:

```
isai-fashions/
├── index.html
├── style.css
├── script.js
├── product.js
├── Code.gs          ← goes into Google Apps Script, not your website
├── SETUP.md          ← this file
└── images/
    ├── logo.png
    └── product-1.svg … product-8.svg   (placeholders — swap for real photos)
```

Install the "Live Server" extension in VS Code, right-click `index.html`, and choose
**Open with Live Server** to preview the site as you edit.

## 2. Connect orders to Google Sheets

Orders (order number, product name, size, quantity, contact number, address, totals)
are sent to a **Google Sheet** through a small Google Apps Script "web app" — this is
the standard free way to do this without running your own server.

### Step A — Create the sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it something like **Isai Fashions Orders**.
3. You don't need to create the "Orders" tab yourself — the script creates it
   automatically the first time an order comes in.

### Step B — Add the script
1. In the sheet, go to **Extensions → Apps Script**.
2. Delete any placeholder code in `Code.gs`.
3. Open `Code.gs` from this project folder, copy everything, and paste it in.
4. Click the **Save** icon (💾).

### Step C — Deploy it as a web app
1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**. The first time, Google will ask you to authorize the script —
   click through the "Advanced" / "Go to project (unsafe)" prompts (this warning
   appears because it's your own unpublished script, not because anything is wrong).
5. Copy the **Web app URL** it gives you — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

### Step D — Connect it to the website
1. Open `script.js` in this project.
2. Near the top, find:
   ```js
   const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace the placeholder with the URL you copied. Save the file.

That's it — place a test order on the site and a new row (or rows, one per item)
should appear in the **Orders** tab of your sheet, with columns for order number,
customer name, contact number, address, product name, size, quantity, price,
line total, order total, and notes.

### If a redeploy is needed later
Any time you edit `Code.gs`, use **Deploy → Manage deployments → edit (pencil) →
New version → Deploy** rather than creating a brand-new deployment — this keeps
the same web app URL so you don't have to update `script.js` again.

## 3. Add your real product photos
Replace the files in `images/` (`product-1.svg` through `product-8.svg`) with
your own product photos — keep the same filenames, or update the `image` path
for each product inside `product.js`. A portrait-ish photo (3:4 ratio) looks
best in the grid.

## 4. Edit your product catalogue
Everything about what you sell lives in `product.js`, at the top, in the
`PRODUCTS` array — name, category, price, sizes, and image. Add, remove, or
edit entries there; the shop grid and filters update automatically.

## 5. Update your contact details
In `index.html`, search for the **Contact** and **Footer** sections and swap in
your real phone number, email, and Instagram handle.

## Notes on how checkout works
- Customers add items to a cart (saved in their browser, so it survives a
  refresh) and can adjust quantity or size from the cart drawer.
- At checkout they enter name, contact number, and delivery address; an order
  number like `ISAI-3K9F2` is generated automatically.
- The order is sent to your Google Sheet; you and the customer then usually
  confirm payment over WhatsApp/Instagram, as is common for small Instagram
  and D2C fashion sellers in India — you can change this workflow anytime as
  the business grows.
