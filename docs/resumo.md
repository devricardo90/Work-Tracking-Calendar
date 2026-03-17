# Project Summary: Work Tracking Calendar

## 1. Objective
App to record worked days, hours, locations, and notes.

**Key Features:**
- Calendar view for entries.
- Month-to-month navigation.
- Historic record consultation.
- Monthly hour calculation.
- PDF export for email reporting.

## 2. App Structure
The app is divided into 4 main areas:
- **Calendar:** monthly view, touch a day to view/edit, change months, identify worked days.
- **Add Entry:** select date, insert hours worked, location, and notes.
- **Monthly Summary:** total monthly hours, worked days count, list of locations, PDF export.
- **History / Records:** specific day search, old records view, filters (month, location, period).

## 3. User Flow
1. Open app to **Calendar**.
2. Tap a day.
3. **Add Entry** or **Day Details** screen opens.
4. Fill in: `Date`, `Hours Worked`, `Location`, `Notes`.
5. Click **Save**.
6. Day is marked on calendar.
7. End of month: View **Monthly Summary** (totals and PDF export).

## 4. Main Fields (English)
| Field | Context |
| :--- | :--- |
| **Date** | Entry date |
| **Hours Worked** | Duration for the day |
| **Location** | Where the work happened |
| **Notes** | Additional observations |
| **Save / Edit / Delete** | Actions |
| **Month** | Current summary month |
| **Total Monthly Hours** | Sum of hours in the month |
| **Total Worked Days** | Count of days with entries |
| **Work Locations** | List of locations for the month |
| **Export as PDF** | Export action |
| **Send by Email** | Sharing action |

## 5. Data Logic
- **Daily Entry:** Date, Hours Worked, Location, Notes, Created At, Updated At.
- **Current MVP rule:** one record per user per day, with one main location.
- **Future evolution:** support for "Work Blocks" can be added later if multiple locations per day become necessary.

## 6. Screens
- Calendar
- Day Details
- Add Work Entry
- Edit Entry
- Monthly Summary
- History
- Export PDF
- Profile

## 7. Data Structure
- **User:** `name`, `email`
- **Work Entry:** `id`, `date`, `hoursWorked`, `location`, `notes`, `month`, `year`
- **Monthly Report:** `month`, `year`, `totalHours`, `totalWorkedDays`

## 8. UX Recommendations
- **Autocomplete Location:** Suggest previously used sites.
- **Duplicate Entry:** "Copy Previous Day" button.
- **Visual Status:** Different colors for empty vs. full vs. special notes days.
