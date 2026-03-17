const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/attorneys.json'), 'utf8'));

const filtered = data.filter(a => a.website && a.website.trim() !== '');

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const headers = ['name', 'firm', 'address', 'city', 'county', 'phone', 'website'];
const rows = filtered.map(a => [
  csvEscape(a.name),
  csvEscape(a.name),
  csvEscape(a.address),
  csvEscape(a.city),
  csvEscape(a.source_county),
  csvEscape(a.phone),
  csvEscape(a.website),
]);

const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
fs.writeFileSync(path.join(__dirname, '../attorneys-export.csv'), csv, 'utf8');
console.log(`Exported ${filtered.length} attorneys with websites out of ${data.length} total.`);
