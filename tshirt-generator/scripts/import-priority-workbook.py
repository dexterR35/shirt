"""Read the user-supplied team list without modifying either source workbook."""
import collections
import hashlib
import json
from pathlib import Path
import shutil
import sys
import unicodedata
import openpyxl

source = Path(sys.argv[1])
target = Path('data/source/teams_tier-1_by-tier.xlsx')
target.parent.mkdir(parents=True, exist_ok=True)
digest = hashlib.sha256(source.read_bytes()).hexdigest()
if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != digest:
    raise ValueError('A different priority source is already saved; preserve it first.')
if source.resolve() != target.resolve():
    shutil.copyfile(source, target)
workbook = openpyxl.load_workbook(source, data_only=False)
teams = json.loads(Path('data/normalized/teams.json').read_text(encoding='utf8'))
def normalize(value):
    return ''.join(c for c in unicodedata.normalize('NFKD', value.lower()) if not unicodedata.combining(c)).strip()
rows = []
for sheet in workbook:
    headers = [c.value for c in sheet[1]]
    if headers[:2] != ['Tier 1 team', 'Tier 1 competition']:
        raise ValueError(f'Unexpected sheet: {sheet.title}')
    for cells in sheet.iter_rows(min_row=2):
        if all(c.value is None for c in cells):
            continue
        values = [c.value for c in cells]
        matches = [t for t in teams if normalize(values[0]) in [normalize(n) for n in [t['name'], *t.get('aliases', [])]]]
        if len(matches) != 1:
            raise ValueError(f'Ambiguous or unknown identity: {sheet.title}!{cells[0].coordinate}: {values[0]}')
        team = matches[0]
        rows.append({
            'team_id': team['id'], 'team_name': team['name'], 'country_name': team['country_name'],
            'priority_order': len(rows) + 1, 'requested_season': '2026/27', 'variants': ['home', 'away'],
            'source': {'sheet': sheet.title, 'row': cells[0].row, 'range': f'A{cells[0].row}:F{cells[0].row}',
                       'hidden': bool(sheet.row_dimensions[cells[0].row].hidden), 'values': dict(zip(headers, values)),
                       'hyperlinks': {c.coordinate: c.hyperlink.target for c in cells if c.hyperlink}},
            'palette_status': 'unverified_workbook_context_only',
        })
if len({r['team_id'] for r in rows}) != len(rows):
    raise ValueError('Duplicate priority team; review source rows before importing.')
output = {'schemaVersion': 1, 'source_path': str(target).replace('\\', '/'), 'source_filename': source.name,
          'source_sha256': digest, 'source_of_truth': 'https://www.footballkitarchive.com/',
          'requested_season': '2026/27', 'team_count': len(rows), 'slot_count': len(rows) * 2,
          'policy': 'Every workbook team is mandatory, independent of competition membership. Workbook colors are unverified context. Preserve literal archive seasons; do not relabel calendar-year kits as 2026/27.',
          'teams': rows}
Path('data/research/priority-teams.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
print(json.dumps({'teams': len(rows), 'slots': len(rows) * 2, 'countries': dict(collections.Counter(r['country_name'] for r in rows)), 'sha256': digest}))
