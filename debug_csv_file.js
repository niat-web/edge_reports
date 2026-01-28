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
const firstDataRow = allRows[1];

let out = '--- HEADERS ---\n';
headers.forEach((h, i) => {
    out += `${i}: [${h.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}]\n`;
});

out += '\n--- FIRST DATA ROW ---\n';
firstDataRow.forEach((v, i) => {
    out += `${i}: [${v.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}]\n`;
});

fs.writeFileSync('debug_out.txt', out);
console.log('Done writing to debug_out.txt');
