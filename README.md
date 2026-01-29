# Candidate Report Generator - Usage Guide

## 📁 Files Created

1. **`candidate_report_template.html`** - HTML template with placeholders like `{{candidate_name}}`
2. **`generate_reports.js`** - Node.js script to convert CSV → multiple HTML files
3. **`candidates.csv`** - Your CSV data file (save your CSV data here)

## 🚀 How to Use

### Step 1: Prepare Your CSV File

Save your candidate data as `candidates.csv` in the same folder. The CSV should be **tab-separated** with these columns:

```
Roll No/User ID	Candidate Name	College Name	Coding user score	DSA user score	CS Fundamentals Student Score	...
```

### Step 2: Run the Generator Script

Open PowerShell/Terminal in the `edge` folder and run:

```bash
node generate_reports.js candidates.csv candidate_report_template.html generated_reports
```

**Arguments:**
- `candidates.csv` - Your CSV file
- `candidate_report_template.html` - The template file
- `generated_reports` - Output folder name

### Step 3: View Generated Reports

The script will create individual HTML files in the `generated_reports` folder:
- `sriram_senapathi_report.html`
- `maddala_chandra_satya_sarveswara_pavan_report.html`
- `vikalp_chauhan_report.html`
- etc.

## 📊 CSV Column Mapping

The template uses these placeholders (mapped from your CSV):

| Placeholder | CSV Column |
|-------------|------------|
| `{{candidate_name}}` | Candidate Name |
| `{{college_name}}` | College Name |
| `{{coding_score}}` | Coding user score |
| `{{dsa_score}}` | DSA user score |
| `{{cs_score}}` | CS Fundamentals Student Score |
| `{{communication}}` | Communication |
| `{{tr1_bucket}}` | TR1 Bucket (Strong Hire/Medium Hire) |
| `{{problem1_solving_rating}}` | Problem 1 - Problem Solving (Rating out of 5) |
| `{{problem1_code_rating}}` | Problem 1 - Code Implementation (Rating out of 5) |
| `{{interview_recording_link}}` | Interview Recording Link |
| `{{projects_type}}` | Projects Type |
| `{{overall_comments}}` | Overall Comments |
| `{{dsa_cd_team_remarks}}` | DSA CD Team Remarks |

...and many more!

## 🎨 Customizing the Template

To modify the design:

1. Open `candidate_report_template.html`
2. Edit the HTML/CSS (all styles are inline)
3. Keep the `{{placeholders}}` intact
4. Re-run the generator script

## 💡 Tips

- **Badge Colors**: The script automatically colors the hire badge based on TR1 Bucket:
  - "Strong Hire" → Green
  - "Medium Hire" → Orange
  - Others → Gray

- **Star Ratings**: Automatically generated from numeric ratings (0-5)

- **Integrity Score**: Defaults to 95 (not in CSV, can be customized)

- **File Names**: Generated from candidate names (sanitized for filesystem)

## 🔧 Troubleshooting

**Error: CSV file not found**
- Make sure `candidates.csv` is in the same folder
- Check the file name spelling

**Error: Template file not found**
- Ensure `candidate_report_template.html` exists
- Check the path you provided

**Column mismatch**
- Your CSV might have different column counts per row
- Check for missing tabs or extra quotes

## 📝 Example Command

```bash
# Basic usage
node generate_reports.js candidates.csv candidate_report_template.html generated_reports

# Custom paths
node generate_reports.js "C:\data\my_candidates.csv" template.html output
```

## ✅ What's Generated

Each candidate gets their own HTML file with:
- ✅ Profile header with name, college, badges
- ✅ Circular score indicators (DSA, Coding, CS Fundamentals)
- ✅ Communication rating with stars
- ✅ Executive summary with strengths
- ✅ Evidence vault with video links
- ✅ Detailed scores table
- ✅ Evaluator remarks
- ✅ Professional footer

---

**Need Help?** Check that Node.js is installed: `node --version`
