// Candidate Report Generator
// This script converts CSV data to multiple HTML reports using the template

const fs = require('fs');
const path = require('path');

// Helper function to generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<span style="color: #F59E0B; font-size: 16px;">★</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        html += '<span style="color: #d1d5db; font-size: 16px;">★</span>';
    }
    return html;
}

// Helper function to calculate percentile text
function getPercentile(score) {
    if (score >= 90) return "Top 5% nationally";
    if (score >= 80) return "Top 15% nationally";
    if (score >= 70) return "Top 25% nationally";
    if (score >= 60) return "Top 40% nationally";
    return "Above average";
}

// Helper function to get communication status
function getCommunicationStatus(rating) {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Interview-ready";
    if (rating >= 3) return "Good";
    return "Needs improvement";
}

// Helper function to get badge styling based on TR1 bucket
function getBadgeStyle(tr1Bucket) {
    if (tr1Bucket.toLowerCase().includes('strong hire')) {
        return {
            gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            shadow: 'rgba(16, 185, 129, 0.3)',
            color: '#10B981'
        };
    } else if (tr1Bucket.toLowerCase().includes('medium hire')) {
        return {
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            shadow: 'rgba(245, 158, 11, 0.3)',
            color: '#F59E0B'
        };
    } else {
        return {
            gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
            shadow: 'rgba(107, 114, 128, 0.3)',
            color: '#6B7280'
        };
    }
}

// Helper function to calculate percentage for progress rings
function getScorePercentage(score, max = 100) {
    if (score === '-' || isNaN(parseFloat(score))) return 0;
    return Math.min(100, Math.max(0, (parseFloat(score) / max) * 100));
}

// Helper function to generate initials
function getInitials(name) {
    if (!name) return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Helper function to create list HTML
function createListItem(text, icon = '✓', color = '#10B981') {
    return `<div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
        <span style="color: ${color};">${icon}</span>
        <p style="margin: 0; color: ${color === '#10B981' ? '#065F46' : '#92400E'}; font-size: 14px;">${text}</p>
    </div>`;
}

// Parse CSV line (handles quoted fields with commas)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    // Use comma as separator since candidates.csv is comma-separated
    const separator = ',';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Minimalistic Remark Formatter
// Simply ensures the text is properly capitalized and ends with a period
function rephraseRemark(raw) {
    let text = (raw || '').trim();
    if (!text || text.toLowerCase() === 'n/a' || text.length < 3) {
        return 'Assessment completed with focused technical execution.';
    }

    // Remove any trailing periods and then add one
    text = text.replace(/\.+$/, '');

    // Capitalize first letter if it's not
    if (text.length > 0) {
        text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    return text + '.';
}

// Generates a professional 2-3 line summary based on the entire candidate profile
function generateDetailedRemark(data) {
    const codingScore = parseFloat(data['Coding user score']) || 0;
    const comm = parseInt(data['Communication']) || 0;
    const dsaTheory = parseInt(data['DSA Theory']) || 0;
    const csTheory = parseInt(data['Core CS Theory']) || 0;
    const tr1Bucket = (data['TR1\nBucket'] || data['TR1 Bucket'] || 'Hire');
    const college = data['College Name'] || '';

    const sentences = [];

    // Sentence 1: Performance-based variability
    if (codingScore >= 115) {
        sentences.push(`The candidate demonstrated masterful problem-solving skills, achieving a near-perfect coding score of ${Math.round(codingScore)}/120 with high industrial precision.`);
    } else if (codingScore >= 95) {
        sentences.push(`Exhibited strong technical command and efficient algorithmic thinking, reflected in a high-caliber coding performance during the assessment.`);
    } else if (codingScore >= 75) {
        sentences.push(`Successfully navigated the coding challenges with a solid logical approach, maintaining consistent implementation quality.`);
    } else if (codingScore >= 50) {
        sentences.push(`Showcased reliable technical fundamentals and the ability to solve core engineering problems with clear, functional code.`);
    } else {
        sentences.push(`Demonstrated foundational programming knowledge and successfully implemented the basic requirements of the technical assessment.`);
    }

    // Sentence 2: Combined profile variability
    const theoryAvg = (dsaTheory + csTheory) / 2;
    if (theoryAvg >= 4.5 && comm >= 4.5) {
        sentences.push(`Beyond pure coding, they possess an exceptional theoretical foundation and highly professional communication skills.`);
    } else if (theoryAvg >= 4 && comm >= 4) {
        sentences.push(`This technical baseline is well-supported by a strong understanding of CS fundamentals and effective communication.`);
    } else if (comm >= 4.5) {
        sentences.push(`Throughout the evaluation, the candidate was particularly articulate, explaining their thought process with great clarity.`);
    } else if (theoryAvg >= 4.5) {
        sentences.push(`Their theoretical depth in DSA and Core CS is significant, indicating a strong conceptual grasp of software engineering.`);
    } else {
        sentences.push(`The candidate maintains a balanced profile with consistent performance across both theoretical concepts and professional communication.`);
    }

    // Sentence 3: Role fit / Career potential
    if (tr1Bucket.toLowerCase().includes('strong hire')) {
        sentences.push(`They are a premium fit for high-intensity engineering environments requiring both technical depth and leadership potential.`);
    } else if (tr1Bucket.toLowerCase().includes('medium hire') || tr1Bucket.toLowerCase().includes('hire')) {
        sentences.push(`With their current skill set and professional readiness, they are well-prepared for roles such as SDE or Full-stack Developer.`);
    } else {
        sentences.push(`Overall, the candidate exhibits a promising technical baseline and is ready for entry-level engineering challenges.`);
    }

    return sentences.join(' ');
}


// Enterprise-grade CSV Parser (handles newlines and quotes correctly)
function parseCSV(content) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    const separator = ',';

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++; // Skip escape quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            }
            if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
        } else {
            currentField += char;
        }
    }
    // Add last row if exists
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }
    return rows;
}


function generateReports(csvFilePath, templatePath, outputDir) {
    console.log('🚀 Starting report generation...\n');

    // Read CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const allRows = parseCSV(csvContent);

    if (allRows.length < 2) {
        console.error('❌ CSV file must have at least a header and one data row');
        return;
    }

    // Parse header and normalize newlines
    const headers = allRows[0].map(h => h.replace(/\r\n/g, '\n'));
    console.log(`📋 Found ${headers.length} columns in CSV`);
    console.log(`👥 Processing ${allRows.length - 1} candidates...\n`);

    // Read template
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process each candidate
    for (let i = 1; i < allRows.length; i++) {
        const values = allRows[i];

        if (values.length !== headers.length) {
            console.log(`⚠️  Skipping row ${i + 1}: column count mismatch (expected ${headers.length}, got ${values.length})`);
            continue;
        }

        // Create data object
        const data = {};
        headers.forEach((header, index) => {
            data[header] = values[index] || '';
        });

        // Extract and process data
        const candidateName = data['Candidate Name'] || 'Unknown';
        const collegeName = data['College Name'] || 'N/A';
        const codingScore = data['Coding user score'] || '0';
        // DSA score is out of 10, show raw
        const dsaScore = data['DSA user score'] || '0';
        // CS score might be empty, use '-' if empty
        const csScore = data['CS Fundamentals Student Score'] || '-';
        const communication = parseInt(data['Communication']) || 0;
        const tr1Bucket = data['TR1\nBucket'] || data['TR1 Bucket'] || 'Hire';
        const projectsType = data['Projects Type'] || 'Full-stack';
        const projectsExplanation = data['Projects Explanation'] || 'Portfolio & architecture review';
        const projectRating = parseInt(data['Project Rating']) || 50;
        const interviewLink = data['Interview Recording Link'] || '#';
        const reportLink = data['Report Link'] || '#';
        const tr1Link = data['Interview Recording Link(TR1)'] || interviewLink;
        const tr2Link = data['Interview Recording Link(TR2)'] || interviewLink;

        // Parse Coding Problems (LeetCode links)
        const codingProblemsRaw = data['Coding Problem asked(leetcode)'] || data['Coding Problem asked'] || '';
        const codingProblemLinks = codingProblemsRaw.split(/[\s,]+/).filter(link => link.startsWith('http'));

        function getProblemName(url) {
            try {
                const parts = url.split('/problems/')[1] || url.split('/problems?')[0];
                if (!parts) return "Problem Solving";
                const name = parts.split('/')[0].replace(/-/g, ' ');
                return name.charAt(0).toUpperCase() + name.slice(1);
            } catch (e) {
                return "Problem Solving";
            }
        }

        const leetcode1Link = codingProblemLinks[0] || '#';
        const leetcode1Name = codingProblemLinks[0] ? getProblemName(codingProblemLinks[0]) : 'DSA Challenge';
        const leetcode1Display = codingProblemLinks[0] ? 'block' : 'none';

        const leetcode2Link = codingProblemLinks[1] || '#';
        const leetcode2Name = codingProblemLinks[1] ? getProblemName(codingProblemLinks[1]) : 'Coding Challenge';
        const leetcode2Display = codingProblemLinks[1] ? 'block' : 'none';

        const leetcode3Link = codingProblemLinks[2] || '#';
        const leetcode3Name = codingProblemLinks[2] ? getProblemName(codingProblemLinks[2]) : 'Problem Solving';
        const leetcode3Display = codingProblemLinks[2] ? 'block' : 'none';
        const commRemarks = data['Remarks on Communication'] || '';
        const projRemarks = data['Remarks on Internships & Projects'] || '';
        const overallComments = data['Overall Comments'] || '';

        // Simple Point Generation (based on Image 2 reference)
        const summaryPoint1 = rephraseRemark(overallComments || (parseFloat(codingScore) > 70 ? 'Strong coding implementation with good problem-solving ability' : 'Solid technical execution with foundational logic'));
        const summaryPoint2 = `${projectsType} project experience${projRemarks ? ' (' + projRemarks.substring(0, 50) + ')' : ''}`;
        const summaryPoint3 = `Suitable for: Backend SDE, ${projectsType} roles`;

        // Why This Candidate? points (Direct & Data-Driven)
        const whyPoints = [
            `${parseFloat(codingScore) > 100 ? 'Perfect' : 'Professional'} implementation skills with ${Math.round(codingScore)}/120 coding score (${getPercentile(codingScore)})`,
            `${communication >= 4 ? 'Strong' : 'Good'} communication with ${getCommunicationStatus(communication).toLowerCase()} rating (${communication}/5)`,
            rephraseRemark(overallComments)
        ];


        // Calculate derived values
        const initials = getInitials(candidateName);
        const badgeStyle = getBadgeStyle(tr1Bucket);
        // Generate HTML content
        let html = template;

        // Replace all placeholders
        const replacements = {
            '{{candidate_name}}': candidateName,
            '{{college_name}}': collegeName,
            '{{initials}}': initials,
            '{{tr1_bucket}}': tr1Bucket.toUpperCase(),
            '{{badge_gradient}}': badgeStyle.gradient,
            '{{badge_shadow}}': badgeStyle.shadow,
            '{{badge_color}}': badgeStyle.color,

            // Scores
            '{{dsa_score}}': dsaScore,
            '{{coding_score}}': Math.round(codingScore),
            '{{cs_score}}': csScore,
            '{{communication}}': communication,

            // Percentiles
            '{{dsa_percentile}}': getPercentile(parseInt(dsaScore) * 10),
            '{{coding_percentile}}': getPercentile(parseFloat(codingScore)),
            '{{cs_percentile}}': csScore !== '-' ? getPercentile(parseInt(csScore)) : '',
            '{{communication_status}}': getCommunicationStatus(communication),

            // Score Percentages for Rings
            '{{dsa_percent_val}}': getScorePercentage(dsaScore, 10),
            '{{coding_percent_val}}': getScorePercentage(codingScore, 120),
            '{{cs_percent_val}}': getScorePercentage(csScore, 100),

            // Star ratings
            '{{communication_stars}}': generateStars(communication),
            '{{interview_rating_stars}}': generateStars(4),
            '{{interview_rating}}': '4.2',
            '{{project_rating_stars}}': generateStars(projectRating / 10),
            '{{project_rating}}': (projectRating / 10).toFixed(1),

            // Problem ratings
            '{{problem1_solving_rating}}': data['Problem 1 - \nProblem Solving (Rating out of 5)'] || data['Problem 1 - Problem Solving (Rating out of 5)'] || '0',
            '{{problem1_code_rating}}': data['Problem 1 - \nCode Implementation (Rating out of 5)'] || data['Problem 1 - Code Implementation (Rating out of 5)'] || '0',
            '{{problem2_solving_rating}}': data['Problem 2 - \nProblem Solving (Rating out of 5)'] || data['Problem 2 - Problem Solving (Rating out of 5)'] || '0',
            '{{problem2_code_rating}}': data['Problem 2 - \nCode Implementation (Rating out of 5)'] || data['Problem 2- Code Implementation (Rating out of 5)'] || '0',
            '{{dsa_theory}}': data['DSA Theory'] || '0',
            '{{core_cs_theory}}': data['Core CS Theory'] || '0',

            // Star displays for ratings
            '{{problem1_solving_stars}}': generateStars(parseInt(data['Problem 1 - \nProblem Solving (Rating out of 5)'] || data['Problem 1 - Problem Solving (Rating out of 5)'] || 0)),
            '{{problem1_code_stars}}': generateStars(parseInt(data['Problem 1 - \nCode Implementation (Rating out of 5)'] || data['Problem 1 - Code Implementation (Rating out of 5)'] || 0)),
            '{{problem2_solving_stars}}': generateStars(parseInt(data['Problem 2 - \nProblem Solving (Rating out of 5)'] || data['Problem 2 - Problem Solving (Rating out of 5)'] || 0)),
            '{{problem2_code_stars}}': generateStars(parseInt(data['Problem 2 - \nCode Implementation (Rating out of 5)'] || data['Problem 2- Code Implementation (Rating out of 5)'] || 0)),
            '{{dsa_theory_stars}}': generateStars(parseInt(data['DSA Theory'] || 0)),
            '{{core_cs_theory_stars}}': generateStars(parseInt(data['Core CS Theory'] || 0)),

            // Remarks
            '{{problem1_solving_remarks}}': rephraseRemark(data['Problem 1 - Remarks on Problem Solving']),
            '{{problem1_code_remarks}}': rephraseRemark(data['Problem 1 - Remarks on Code Implementation']),
            '{{problem2_solving_remarks}}': rephraseRemark(data['Problem 2 - Remarks on Problem Solving']),
            '{{problem2_code_remarks}}': rephraseRemark(data['Problem 2- Remarks on Code Implementation']),
            '{{dsa_theory_remarks}}': rephraseRemark(data['Remarks on DSA Theory']),
            '{{core_cs_theory_remarks}}': rephraseRemark(data['Remarks on Core CS Theory']),
            '{{overall_comments}}': rephraseRemark(overallComments),
            '{{dsa_cd_team_remarks}}': generateDetailedRemark(data),

            // Summary points
            '{{summary_point_1}}': summaryPoint1,
            '{{summary_point_2}}': summaryPoint2,
            '{{summary_point_3}}': summaryPoint3,

            // Best fit roles
            '{{best_fit_roles}}': `Backend Engineer · ${projectsType} Developer · SDE-1`,

            // Why candidate points
            '{{why_candidate_points}}': whyPoints.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('\n'),

            // DSA Tab Placeholders
            '{{dsa_ps_score}}': data['Problem 1 - \nProblem Solving (Rating out of 5)'] || data['Problem 1 - Problem Solving (Rating out of 5)'] || '4',
            '{{dsa_cq_score}}': data['Problem 1 - \nCode Implementation (Rating out of 5)'] || data['Problem 1 - Code Implementation (Rating out of 5)'] || '4',
            '{{dsa_comm_score}}': communication,
            '{{dsa_tm_score}}': '4',
            '{{dsa_feedback}}': rephraseRemark(data['Problem 1 - Remarks on Problem Solving']),

            // Projects Tab Placeholders
            '{{proj_td_score}}': Math.round(projectRating / 20) || '4',
            '{{proj_arch_score}}': Math.round(projectRating / 20) || '4',
            '{{proj_ps_score}}': Math.round(projectRating / 20) || '4',
            '{{proj_bp_score}}': Math.round(projectRating / 20) || '3',
            '{{proj_feedback}}': rephraseRemark(data['Projects Explanation']),



            // Strengths and growth areas
            '{{strengths_list}}': `
                ${dsaScore >= 50 ? createListItem('Strong DSA problem-solving foundation') : ''}
                ${parseFloat(codingScore) >= 75 ? createListItem('High coding accuracy and precision') : ''}
                ${communication >= 4 ? createListItem('Effective professional communication') : ''}
                ${createListItem(projectsType + ' project experience')}
            `,
            '{{growth_areas_list}}': (function () {
                const areas = [];
                if (csScore === '-' || parseInt(csScore) < 70) areas.push('Deepen understanding of Core CS Fundamentals');
                if (communication < 4) areas.push('Improve articulativeness in technical explanations');

                // Analyze problem-specific remarks for growth
                const p1Remark = (data['Problem 1 - Remarks on Problem Solving'] || '').toLowerCase();
                const p2Remark = (data['Problem 2 - Remarks on Problem Solving'] || '').toLowerCase();

                if (p1Remark.includes('help') || p1Remark.includes('hint') || p2Remark.includes('help') || p2Remark.includes('hint')) {
                    areas.push('Work on independent problem-solving without external hints');
                }
                if (p1Remark.includes('optimised') && (p1Remark.includes('some help') || p1Remark.includes('hint'))) {
                    areas.push('Improve ability to reach optimal solutions independently');
                }
                if (p2Remark.includes('brute') || p1Remark.includes('brute')) {
                    areas.push('Focus on moving from brute-force to optimized approaches');
                }
                if (parseInt(dsaScore) < 60) {
                    areas.push('Practice complex data structures and algorithmic efficiency');
                }

                // Ensure at least 3 points
                if (areas.length < 3) areas.push('Further refine architecture design in complex projects');
                if (areas.length < 3) areas.push('Enhance edge-case handling in competitive programming');

                return areas.slice(0, 3).map(a => createListItem(a, '△', '#F59E0B')).join('\n');
            })(),

            // Projects and videos
            '{{projects_type}}': projectsType,
            '{{projects_explanation}}': projectsExplanation,
            '{{interview_recording_link}}': interviewLink,
            '{{report_link}}': reportLink,
            '{{tr1_link}}': tr1Link,
            '{{tr2_link}}': tr2Link,
            '{{leetcode_1_link}}': leetcode1Link,
            '{{leetcode_1_name}}': leetcode1Name,
            '{{leetcode_1_display}}': leetcode1Display,
            '{{leetcode_2_link}}': leetcode2Link,
            '{{leetcode_2_name}}': leetcode2Name,
            '{{leetcode_2_display}}': leetcode2Display,
            '{{leetcode_3_link}}': leetcode3Link,
            '{{leetcode_3_name}}': leetcode3Name,
            '{{leetcode_3_display}}': leetcode3Display,

            // Date
            '{{evaluation_date}}': new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        // Replace all placeholders in the HTML
        for (const [placeholder, value] of Object.entries(replacements)) {
            html = html.split(placeholder).join(value);
        }

        // Generate filename (use UUID from CSV)
        const uuid = data['Roll No/User ID'] || candidateName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const outputPath = path.join(outputDir, `${uuid}_report.html`);

        // Write the file
        fs.writeFileSync(outputPath, html);
        console.log(`✅ Generated: ${uuid}_report.html`);
    }

    console.log(`\n🎉 Successfully generated ${allRows.length - 1} reports in "${outputDir}"`);
    console.log(`📂 Output directory: ${path.resolve(outputDir)}`);
}

// Main execution
if (require.main === module) {
    const csvFilePath = process.argv[2] || 'candidates.csv';
    const templatePath = process.argv[3] || 'candidate_report_template.html';
    const outputDir = process.argv[4] || 'generated_reports';

    if (!fs.existsSync(csvFilePath)) {
        console.error(`❌ Error: CSV file not found: ${csvFilePath}`);
        console.log('\nUsage: node generate_reports.js <csv_file> <template_file> <output_directory>');
        console.log('Example: node generate_reports.js candidates.csv candidate_report_template.html generated_reports');
        process.exit(1);
    }

    if (!fs.existsSync(templatePath)) {
        console.error(`❌ Error: Template file not found: ${templatePath}`);
        process.exit(1);
    }

    try {
        generateReports(csvFilePath, templatePath, outputDir);
    } catch (error) {
        console.error('❌ Error generating reports:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

module.exports = { generateReports };
