// /api/gps — GPS_Daily tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('GPS_Daily');
    const byPlayer = {};
    const posMap = {};
    const ageMap = {};
    rows.forEach(row => {
      const player = row['Name'];
      if (!player || isAggregateRow(player)) return;
      const pos = row['Position'] || '';
      const age = row['Age Group'] || '';
      if (pos) posMap[player] = normalizePos(pos);
      if (age) ageMap[player] = age.trim();
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:    row['Date']                              || null,
        session: row['Session Type']                      || null,
        md:      row['MD (-)']                            || null,
        pos:     row['Position']                          || null,
        age:     row['Age Group']                         || null,
        dist:    toNum(row['Distance (m)']),
        hsr:     toNum(row['Distance (HSR) (m)']),
        vhsr:    toNum(row['Distance (VHSR) (m)']),
        sprint:  toNum(row['Distance(speed |Sprinting) (m)']),
        dpm:     toNum(row['Distance / min (m)']),
        maxspd:  toNum(row['Speed (max.) (m/s)']),
        expl:    toNum(row['Explosive Distance (m)']),
        acc:     toNum(row['Accelerations (high)']),
        dec:     toNum(row['Decelerations (high)']),
        hml:     toNum(row['HMLD (m)']),
        mins:    toNum(row['Session Length (Mins)']),
      });
    });
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => parseD(a.date) - parseD(b.date));
    });
    const latest = {};
    Object.keys(byPlayer).forEach(p => {
      const sessions = byPlayer[p].filter(s => s.dist);
      if (sessions.length) latest[p] = { ...sessions[sessions.length - 1], player: p, pos: posMap[p] || 'MF' };
    });
    res.status(200).json({
      players: Object.keys(byPlayer).sort(),
      pos_map: posMap,
      age_map: ageMap,
      gps: byPlayer,
      latest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
function isAggregateRow(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return true;
  return n.startsWith('ø') || n.includes('all player') || n.includes('squad') || n.includes('average') || n.includes(' avg') || n === 'avg';
}
function parseD(s) {
  if (s === null || s === undefined || s === '') return 0;
  if (typeof s === 'number') return new Date((s - 25569) * 86400000);
  if (s.includes('-')) return new Date(s);
  const [m, d, y] = s.split('/');
  if (!y) return 0;
  return new Date(+y < 100 ? 2000 + +y : +y, +m - 1, +d);
}
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
function normalizePos(pos) {
  const p = String(pos).trim().toUpperCase();
  if (p.includes('GK') || p.includes('GOAL')) return 'GK';
  if (p.includes('CB') || p.includes('CENTER BACK') || p.includes('CENTRE BACK')) return 'CB';
  if (p.includes('FB') || p.includes('FULL') || p.includes('BACK')) return 'FB';
  if (p.includes('MF') || p.includes('MID')) return 'MF';
  if (p.includes('FW') || p.includes('FOR') || p.includes('ATT')) return 'FW';
  return String(pos).trim();
}
