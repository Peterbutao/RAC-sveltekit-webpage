# Member Profile Editing Feature

## Overview

Members can now edit their own profile information through a dedicated profile page. This feature allows logged-in members to update safe, non-critical fields while maintaining data integrity through Supabase Row Level Security (RLS) policies.

## Features

### Editable Fields
- **Phone Number** - Contact information (optional, max 20 chars)
- **Occupation** - Professional role or job title (optional, max 100 chars)
- **Skills** - Comma-separated list of professional skills (optional, max 500 chars)

### Read-Only Fields (Displayed for Reference)
- RAC Number
- Full Name
- Email
- Member Status

### Security Features
- **RLS Policies**: Members can only update their own profile data
- **Input Validation**: All fields are validated on the server side
- **Input Sanitization**: XSS protection through HTML character removal
- **Character Limits**: Enforced on both client and server sides
- **Pattern Validation**: Special character filtering for data integrity

## Technical Implementation

### Database Changes
**File**: `supabase/migrations/20260521_add_skills_and_update_policies.sql`

1. Added `skills` column to the `members` table (TEXT type)
2. Added RLS UPDATE policy allowing authenticated users to update their own records

```sql
CREATE POLICY "Users can update their own member record"
  ON public.members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### File Structure

```
src/routes/profile/
├── +page.server.js      # Server-side logic (load & actions)
└── +page.svelte         # UI component
```

### Server-Side Handler
**File**: `src/routes/profile/+page.server.js`

#### Load Function (`load()`)
- Requires authenticated session
- Fetches current member profile data from database
- Returns profile data or error message if member record not found

#### Server Actions (`updateProfile`)
- Validates all input fields with specific rules
- Sanitizes input to prevent XSS attacks
- Updates only the current user's record (user_id check)
- Returns success/error feedback

### Validation Rules

| Field | Max Length | Valid Characters | Required |
|-------|-----------|------------------|----------|
| phone | 20 | digits, spaces, `-+().` | No |
| occupation | 100 | letters, numbers, spaces, `-&.` | No |
| skills | 500 | letters, numbers, spaces, `,\.&-` | No |

### Client-Side Component
**File**: `src/routes/profile/+page.svelte`

Features:
- Responsive design (mobile-first)
- Real-time character count for skills field
- Field-level error display
- Success/error message feedback
- Loading state indicators
- Accessible form controls

## Usage

### Accessing the Profile Page
1. User logs in at `/login`
2. Dashboard displays with navigation
3. Click "👤 Profile" button in navbar
4. Or navigate directly to `/profile`

### Updating Profile
1. Fill in desired fields (all optional)
2. Click "Save Changes" button
3. Success message appears and auto-dismisses after 3 seconds
4. Page remains for further edits

### Error Handling
- Validation errors display below relevant fields
- General errors display in alert box at top
- Users can retry without losing entered data

## Security Considerations

### RLS Policy
The UPDATE policy ensures:
- `auth.uid() = user_id` - User can only update their own record
- No administrative bypass on update (unlike read policies)
- Service role can still manage via backend

### Input Validation
- All inputs are validated on **both client and server**
- Server validation is authoritative (client can be bypassed)
- Sanitization removes dangerous characters before storage

### Data Access
- Members can only view their own profile
- Existing RLS SELECT policy ensures:
  ```sql
  CREATE POLICY "Users can view their own member record"
    ON public.members
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  ```

## API Reference

### GET `/profile`
Returns member's own profile data

**Response** (success):
```javascript
{
  profile: {
    id: 1,
    user_id: "uuid",
    rac_number: "RAC001026",
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+265 1 234 5678",
    occupation: "Software Engineer",
    skills: "JavaScript, Python, Leadership",
    status: "active"
  },
  error: null
}
```

**Response** (not authenticated):
Redirects to `/login`

**Response** (not a member):
```javascript
{
  profile: null,
  error: "Profile not found. You may need to be added as a member first."
}
```

### POST `/profile?/updateProfile`
Updates profile fields (multipart form data)

**Form Parameters**:
- `phone` (text, optional)
- `occupation` (text, optional)
- `skills` (text, optional)

**Response** (success):
```javascript
{
  success: true,
  message: "Profile updated successfully!"
}
```

**Response** (validation error):
```javascript
{
  message: "Validation failed",
  errors: {
    phone: "phone cannot exceed 20 characters",
    skills: "skills contains invalid characters"
  }
}
```

**Response** (authentication error):
```javascript
{
  message: "Not authenticated"
}
```

## Styling

The profile page uses the existing design system:
- **Primary Color**: `var(--primary)` (#E8175D)
- **Font**: Plus Jakarta Sans
- **Responsive**: Mobile-first breakpoint at 640px
- **Icons**: Lucide Svelte icons for visual feedback

### CSS Classes
- `.profile-container` - Main wrapper
- `.profile-header` - Title section
- `.info-section` - Read-only information display
- `.edit-section` - Editable form area
- `.message-box` - Success/error feedback
- `.form-group` - Form input wrapper
- `.submit-btn` - Primary action button

## Testing Checklist

### Functional Tests
- [ ] Logged-out user redirects to login
- [ ] Non-member user gets appropriate error
- [ ] Empty form submission succeeds (all fields optional)
- [ ] Phone number accepts valid formats
- [ ] Occupation accepts various job titles
- [ ] Skills accepts comma-separated list
- [ ] Character limits enforced
- [ ] Special characters rejected with error
- [ ] Success message displays for 3 seconds
- [ ] Form retains entered data on error

### Security Tests
- [ ] SQL injection attempts rejected
- [ ] XSS payloads sanitized
- [ ] User cannot update another user's profile
- [ ] Admin cannot use update policy (only authenticated)
- [ ] Form data validated server-side
- [ ] Rate limiting not bypassed

### UI/UX Tests
- [ ] Mobile responsive (320px, 640px, desktop)
- [ ] Loading state visible during submission
- [ ] Error messages clear and actionable
- [ ] Read-only fields properly distinguished
- [ ] Accessible keyboard navigation
- [ ] Form labels associated with inputs

## Deployment Notes

### Database Migration
Before deploying, run the migration:
```sql
-- In Supabase SQL Editor or migration system
-- File: supabase/migrations/20260521_add_skills_and_update_policies.sql
```

### Environment Requirements
- Supabase project with Auth enabled
- Service role key available in environment
- Members table must exist with user_id foreign key

### Rollback Procedure
If issues occur:
```sql
-- Remove UPDATE policy
DROP POLICY IF EXISTS "Users can update their own member record" ON public.members;

-- Drop skills column (if needed)
ALTER TABLE members DROP COLUMN IF EXISTS skills;
```

## Future Enhancements

Possible improvements:
1. **Skills with Proficiency Levels**: Add proficiency ratings (beginner, intermediate, expert)
2. **Profile Picture Upload**: Allow members to upload avatar
3. **Social Links**: Add LinkedIn, GitHub, personal website fields
4. **Bio/About**: Longer text field for personal introduction
5. **Preferences**: Notification settings, privacy controls
6. **Audit Trail**: Track profile changes with timestamp history
7. **Admin Override**: Allow admins to update member profiles for others

## Troubleshooting

### "Profile not found" Error
- Member record may not exist in database
- Check if user_id is properly linked in members table
- Contact admin to ensure member record is created

### "Not authenticated" Error
- Session may have expired
- Clear browser cookies and login again
- Check if Supabase auth is properly configured

### Changes Not Saving
- Check browser console for errors
- Ensure RLS policy is properly applied in Supabase
- Verify service role key has database access

### Validation Errors
- Review error message for specific field issue
- Check character limits: phone (20), occupation (100), skills (500)
- Remove special characters if rejected

## Related Documentation
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [SvelteKit Forms](https://kit.svelte.dev/docs/form-actions)
- [Lucide Svelte Icons](https://lucide.dev/guide/packages/lucide-svelte)
