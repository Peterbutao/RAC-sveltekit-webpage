# Google Apps Script Setup Guide

This guide explains how to set up Google Apps Script to sync members from Supabase to the DB_APPROVED sheet in your Google Sheet.

## Overview

Instead of using the Google Sheets API, we use Google Apps Script which is simpler to set up and requires no external authentication. The script runs as a webhook that receives member data from your app and writes it to Google Sheets.

## Prerequisites

- A Google Account
- Access to your Google Sheet (1kN76ZIpPbE5KhKvSA0lLtrCpdechOWT1qlhHT7DtmRg)
- Your SvelteKit app deployed or running

## Step 1: Create a New Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it "Rotaract Members Sync"
4. Delete the default code and replace it with the code below

## Step 2: Create the Apps Script Code

Replace all code in the editor with this:

```javascript
// Deploy this script as a web app accessible to anyone

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    if (payload.action === 'syncMembers') {
      return syncMembers(payload.members);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Script error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function syncMembers(membersList) {
  try {
    // Get the spreadsheet and sheet
    const spreadsheetId = '1kN76ZIpPbE5KhKvSA0lLtrCpdechOWT1qlhHT7DtmRg';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Get or create the DB_APPROVED sheet
    let sheet = spreadsheet.getSheetByName('DB_APPROVED');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('DB_APPROVED');
    } else {
      // Clear existing data (keep headers)
      const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
      range.clearContent();
    }
    
    // Set headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['name', 'rac_number', 'occupation', 'age', 'phone_number']);
    }
    
    // Add member data
    const rows = membersList.map(member => [
      member.name || '',
      member.rac_number || '',
      member.occupation || '',
      member.age || '',
      member.phone_number || ''
    ]);
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Successfully synced ' + rows.length + ' members to DB_APPROVED sheet'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Sync error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy as Web App

1. Click "Deploy" → "New Deployment"
2. Select "Type" → "Web app"
3. Under "Execute as" select your Google Account
4. Under "Who has access" select "Anyone"
5. Click "Deploy"
6. A dialog will appear - click on the deployment link to get your script URL
7. Copy the URL from the address bar (it looks like: `https://script.google.com/macros/d/.../usercontent`)

**Important:** Copy the full URL that appears in the browser address bar after deployment, not the link in the dialog.

## Step 4: Configure Environment Variable

Add the Apps Script URL to your `.env` file:

```
APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercontent
```

Replace `YOUR_SCRIPT_ID` with the actual script ID from your deployment URL.

## Step 5: Create DB_APPROVED Sheet

If it doesn't already exist in your Google Sheet:

1. Open your Google Sheet
2. Click the "+" button to add a new sheet
3. Name it "DB_APPROVED"
4. The script will add headers automatically on first sync

## Step 6: Test the Integration

1. Start your app: `npm run dev`
2. Go to the Admin Dashboard (`/admin`)
3. Click "📊 Sync to Google Sheet" button
4. Check your Google Sheet - members should appear in the DB_APPROVED sheet

## Data Synced

The following columns are synced to DB_APPROVED:

| Column | Source | Notes |
|--------|--------|-------|
| name | `members.full_name` | Member's full name |
| rac_number | `members.rac_number` | Member's RAC ID (e.g., rac026001) |
| occupation | `members.occupation` | Member's job/profession |
| age | - | Currently empty (not stored in Supabase) |
| phone_number | `members.phone` | Member's contact number |

**Note:** Only active members are synced (status ≠ 'inactive')

## Troubleshooting

### "Apps Script webhook URL not configured"
- Make sure you added `APPS_SCRIPT_WEBHOOK_URL` to your `.env` file
- Restart your dev server after adding the environment variable
- Verify the URL is correct

### Script returns 403 Forbidden
- Go back to the deployment and update it:
  - Click "Deploy" → "New Deployment" again
  - Make sure "Who has access" is set to "Anyone"
  
### DB_APPROVED sheet is not created
- The script will create it on first sync
- If it still doesn't appear, check that the spreadsheet ID is correct in the script
- Verify you have edit access to the Google Sheet

### No data appears in DB_APPROVED
- Check the browser console for error messages
- Verify members exist in Supabase with status != 'inactive'
- Check that the script URL is valid by visiting it in a browser (you should see an error - that's normal)

## Updating the Script

If you need to modify the script later:

1. Go back to [script.google.com](https://script.google.com)
2. Open your "Rotaract Members Sync" project
3. Make your changes
4. Click "Deploy" → "New Deployment"
5. Select the existing deployment and update it
6. The new URL might be different - update your `.env` file if needed

## Automatic Syncing (Optional)

To sync members automatically on a schedule:

1. In the Apps Script editor, click "Triggers" (alarm icon)
2. Click "Create trigger"
3. Set up a time-based trigger (e.g., daily at 2 AM)
4. Select the `syncMembers` function
5. Create a wrapper function that calls the Members sync:

```javascript
function scheduleSync() {
  const supabase = new SupabaseClient(...); // You'd need to set up Supabase client
  syncMembers(getMembersFromSupabase());
}
```

However, Apps Script cannot directly call Supabase easily. Instead, your app should call the webhook on a schedule.

## Security Notes

1. The webhook accepts POST requests from anywhere ("Anyone" access)
2. Consider adding a secret token for additional security
3. To add a token:
   - Add `APPS_SCRIPT_SECRET_TOKEN` to your `.env`
   - Update the script to check: `if (payload.token !== 'your-secret-token') return error`
   - Update your app to send the token in requests

---

**Created:** 2026-05-21  
**Version:** 1.0
