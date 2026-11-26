# Backend setup (Google Sheet + Apps Script), about 10 minutes

Free, no card, never pauses. RSVPs go to a Google Sheet; photo-booth pictures go to a Google Drive folder.

## 1. Create the sheet and script
1. Go to sheets.google.com and create a blank sheet named **Pooja Rahul Wedding**.
2. Menu **Extensions → Apps Script**.
3. Delete the sample code and paste all of `Code.gs`. Click **Save**.

## 2. Set the admin password
1. In Apps Script, click **Project Settings** (gear icon on the left).
2. Under **Script properties**, click **Add script property**.
3. Property: `ADMIN_PASSWORD`, Value: your password (12+ characters). Save.

## 3. Run setup once
1. Back in **Editor**, choose the function `setup` in the toolbar and click **Run**.
2. Approve the permissions (Google warns "unverified app" because it's your own script: click **Advanced → Go to project**).
3. The sheet now has **RSVPs** and **Photos** tabs, and Drive has a folder **Pooja-Rahul Photo Booth**.

## 4. Deploy as a web app
1. Click **Deploy → New deployment**, type: **Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).

## 5. Connect the website
Open `js/config.js` and paste the URL:
```js
API_URL: "https://script.google.com/macros/s/XXXX/exec",
```

## 6. Test
- Open the site, send a test RSVP, and check the **RSVPs** tab in the sheet.
- Open `yoursite.com/admin/`, enter your password, and you should see it.
- Delete test rows from the sheet before sharing the link.

## Updating the script later
Edit the code, then **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The URL stays the same.

## Notes
- Only you can open the sheet and Drive folder. The admin password is checked on Google's server, not in the page.
- 10 wrong passwords lock the admin page for 15 minutes.
- Photo files are "anyone with the link can view" so the dashboard can show thumbnails; the links are random and not listed anywhere public.
