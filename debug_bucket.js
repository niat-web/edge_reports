const fs = require('fs');

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
                i++;
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
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }
    return rows;
}

const csvContent = fs.readFileSync('candidates.csv', 'utf-8');
const allRows = parseCSV(csvContent);
const headers = allRows[0];
const data = {};
headers.forEach((h, i) => data[h] = allRows[1][i]);
console.log('Data keys:', Object.keys(data));
console.log('Access data["TR1\\nBucket"]:', data['TR1\nBucket']);
console.log('Access data["TR1 Bucket"]:', data['TR1 Bucket']);
const bucketIndex = headers.findIndex(h => h.includes('TR1') && h.includes('Bucket'));

console.log('Bucket Index:', bucketIndex);
console.log('Bucket Header:', headers[bucketIndex]);

if (bucketIndex !== -1) {
    for (let i = 1; i < Math.min(allRows.length, 20); i++) {
        console.log(`${i}: ${allRows[i][bucketIndex]}`);
    }
} else {
    console.log('Columns found:', headers);
}
