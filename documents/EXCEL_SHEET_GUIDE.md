# Extended Rotaract Excel Sheet Guide

## Overview

This guide explains how to generate an extended Excel sheet with all the data needed for the dashboard and admin panel.

## Prerequisites

- Python 3.7+
- `openpyxl` library (for Excel creation)

### Install openpyxl

```bash
pip install openpyxl
```

## Generate the Excel File

### Step 1: Run the Python Script

From the project root directory:

```bash
python generate_extended_sheet.py
```

This creates: **`rotaract_extended_data.xlsx`**

### Step 2: Review the Generated Sheets

The Excel file contains 8 sheets:

| Sheet | Purpose | Key Fields |
|-------|---------|-----------|
| **EVENTS** | Event schedule | title, date, time, location, tag, description |
| **PROJECTS** | Club projects | name, category, impact, status, dates, description |
| **MEMBERS** | Member data | rac_number, full_name, email, phone, occupation, joined_date, status, is_admin |
| **DUES** | Monthly dues tracking | rac_number, annual_amount, Jan-Dec payments, total_paid, status, next_due |
| **ATTENDANCE** | Meeting attendance | rac_number, Jan-Dec attendance, total_attended, total_meetings, attendance_rate |
| **VOLUNTEER_HOURS** | Volunteer tracking | rac_number, project_name, date, hours, description, verified_by |
| **COMMITTEES** | Committee assignments | committee_name, rac_number, position, start/end_date, status |
| **SKILLS** | Member skills | rac_number, skill_name, proficiency_level, years_experience |

## Import into Google Sheets

### Option 1: Copy-Paste Each Sheet (Recommended for Initial Setup)

1. Open `rotaract_extended_data.xlsx` in Excel or LibreOffice
2. Go to your Google Sheet
3. For each new sheet:
   - Select all data in the Excel sheet (Ctrl+A)
   - Copy (Ctrl+C)
   - Create a new sheet in Google Sheets with the same name
   - Paste the data (Ctrl+V)

### Option 2: Upload as CSV then Link

1. For each sheet, export as CSV:
   - File → Save As → Format: CSV UTF-8
2. In Google Sheets:
   - Use `IMPORTRANGE()` or `IMPORTDATA()` functions if files are hosted
   - Or paste directly from CSV

### Option 3: Use Google Sheets Import (if CSV hosted)

If you upload CSVs to cloud storage, use:
```
=IMPORTDATA("https://example.com/path/to/file.csv")
```

## Update Your Frontend Code

### Step 1: Update Constants to Use New Sheets

Edit `src/lib/constants.js`:

```javascript
export const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';

export const SHEET_NAMES = {
  PROJECTS: 'PROJECTS',
  EVENTS: 'EVENTS',

  MEMBERS: 'MEMBERS',
  DUES: 'DUES',
  ATTENDANCE: 'ATTENDANCE',
  VOLUNTEER_HOURS: 'VOLUNTEER_HOURS',
  COMMITTEES: 'COMMITTEES',
  SKILLS: 'SKILLS'
};
```

### Step 2: Update Login Page Server to Fetch Member Data

Edit `src/routes/login/+page.server.js`:

```javascript
import { fetchSheets } from '$lib/server/csv.js';

export async function load({ locals: { safeGetSession }, url }) {
  const { session, user } = await safeGetSession();
  
  let memberData = null;
  let memberStats = {
    dues: null,
    attendance: null,
    volunteer: null,
    committees: [],
    skills: []
  };

  if (session && user) {
    const supabase = createSupabaseAdmin();
    if (supabase) {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (member) {
        memberData = member;
        
        // Fetch Google Sheet data
        const [dues, attendance, skills, committees] = await Promise.all([
          fetchSheet(SHEET_ID, 'DUES'),
          fetchSheet(SHEET_ID, 'ATTENDANCE'),
          fetchSheet(SHEET_ID, 'SKILLS'),
          fetchSheet(SHEET_ID, 'COMMITTEES')
        ]);
        
        // Find member's data in sheets
        const memberDues = dues.find(d => d.rac_number === member.rac_number);
        const memberAttendance = attendance.find(a => a.rac_number === member.rac_number);
        const memberSkills = skills.filter(s => s.rac_number === member.rac_number);
        const memberCommittees = committees.filter(c => c.rac_number === member.rac_number);
        
        memberStats = {
          dues: memberDues ? {
            annual: parseInt(memberDues.annual_amount),
            paid: parseInt(memberDues.total_paid),
            currency: 'MWK',
            status: memberDues.status,
            nextDue: memberDues.next_due_date
          } : null,
          attendance: memberAttendance ? {
            total: parseInt(memberAttendance.total_meetings),
            attended: parseInt(memberAttendance.total_attended),
            rate: memberAttendance.attendance_rate
          } : null,
          volunteer: {
            hours: memberStats.volunteer_hours || 0,
            target: 200
          },
          committees: memberCommittees,
          skills: memberSkills
        };
      }
    }
  }

  return {
    session,
    user,
    memberData,
    memberStats,
    authError: url.searchParams.get('error') === 'auth' ? 'Authentication failed.' : null
  };
}
```

### Step 3: Update Frontend to Use Real Data

Edit `src/routes/login/+page.svelte`:

```javascript
$: MEMBER = {
  name: memberFullName,
  memberId: data.memberData?.rac_number ?? memberRacId ?? 'N/A',
  role: 'Active Member',
  avatar: avatarInitials,
  memberSince: data.memberData?.created_at 
    ? new Date(data.memberData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A',
  dues: data.memberStats?.dues ?? { annual: 0, paid: 0, currency: 'MWK', nextDue: 'N/A', status: 'pending' },
  committees: data.memberStats?.committees ?? [],
  skills: data.memberStats?.skills ?? [],
  attendance: data.memberStats?.attendance ?? { total: 0, attended: 0 },
  volunteer: data.memberStats?.volunteer ?? { hours: 0, target: 200 },
  points: 0 // Calculate from dues + attendance + volunteer
};
```

## Data Structure Reference

### MEMBERS Sheet
```
rac_number      | full_name        | email                  | phone         | occupation      | joined_date | status | is_admin
rac026001       | Chisomo Banda    | chisomo@example.com    | +265999112233 | Software Eng.   | 2025-01-15  | active | No
```

### DUES Sheet
```
rac_number | full_name      | annual_amount | Jan  | Feb  | Mar | ... | total_paid | status  | next_due_date
rac026001  | Chisomo Banda  | 15000         | 5000 | 5000 | 0   | ... | 10000      | partial | 2025-07-01
```

### ATTENDANCE Sheet
```
rac_number | full_name      | Jan | Feb | Mar | Apr | May | ... | total_attended | total_meetings | attendance_rate
rac026001  | Chisomo Banda  | 1   | 1   | 1   | 1   | 1   | ... | 5              | 6              | 83%
```

### VOLUNTEER_HOURS Sheet
```
rac_number | full_name      | project_name           | date       | hours | description        | verified_by
rac026001  | Chisomo Banda  | Health Outreach Camp   | 2025-03-15 | 8     | Medical assistance | Lindiwe
```

### COMMITTEES Sheet
```
committee_name          | rac_number | full_name      | position    | start_date | end_date   | status
Community Service       | rac026001  | Chisomo Banda  | Vice-Chair  | 2025-01-15 | 2026-01-15 | active
```

### SKILLS Sheet
```
rac_number | full_name      | skill_name           | proficiency_level | years_experience
rac026001  | Chisomo Banda  | Project Management   | Expert            | 5
```

## Calculating Member Points

Suggested formula for member points:

```
Points = 
  (dues_paid / annual_dues * 100) +        // 0-100 points
  (attendance_rate * 0.75) +               // 0-75 points
  (volunteer_hours / target * 100) +       // 0-100 points
  (committees.length * 25)                 // 25 per committee
```

## Troubleshooting

### Python Script Fails
```bash
# Make sure openpyxl is installed
pip install --upgrade openpyxl
```

### Google Sheets Import Issues
- Ensure data format matches expected columns
- Check for special characters that might break CSV imports
- Use UTF-8 encoding for CSV exports

### Dashboard Shows No Data
1. Verify Google Sheet ID is correct in constants
2. Check sheet names match exactly (case-sensitive)
3. Verify data is formatted correctly (no merged cells)
4. Check browser console for fetch errors

## Next Steps

1. ✅ Generate `rotaract_extended_data.xlsx`
2. ✅ Import sheets into Google Sheets
3. ✅ Update frontend code to fetch from new sheets
4. ✅ Test dashboard displays member data correctly
5. ✅ Train admin to enter member data in DUES/ATTENDANCE/VOLUNTEER sheets

## File Maintenance

**Weekly:**
- Update ATTENDANCE sheet with meeting attendance
- Add VOLUNTEER_HOURS entries

**Monthly:**
- Update DUES sheet with payments received
- Review and validate SKILLS sheet

**Quarterly:**
- Update COMMITTEES sheet if assignments change
- Archive completed PROJECTS

---

**Created:** 2026-05-20  
**Version:** 1.0  
**Author:** Rotaract Club Admin System
