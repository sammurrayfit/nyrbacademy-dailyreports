// /api/report — passcode-gated daily GPS report for a single athlete.
// PLAYER_CODES is a server-side-only env var: JSON map of passcode -> player name.
// It is never sent to the client and never stored in the sheet itself.
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.setHeader('Cache-Control', 'no-store');

  const passcode = String(
    (req.method === 'POST' ? req.body && req.body.passcode : req.query.passcode) || ''
  ).trim();

  if (!passcode) {
    return res.status(400).json({ error: 'Passcode required' });
  }

  let codeMap;
  try {
    codeMap = JSON.parse(process.env.PLAYER_CODES || '{}');
  } catch {
    codeMap = {};
  }

  const player = codeMap[passcode];
  if (!player) {
    return res.status(401).json({ error: 'Invalid passcode' });
  }

  try {
    const rows = await fetchSheet('GPS_Daily');
    const sessions = rows
      .filter(row => row['Name'] === player && toNum(row['Distance (m)']) != null)
      .map(row => ({
        date:    row['Date']                              || null,
        session: row['Session Type']                      || null,
        md:      row['MD (-)']                            || null,
        pos:     row['Position']                          || null,
        dist:    toNum(row['Distance (m)']),
        hsr:     toNum(row['Distance (HSR) (m)']),
        sprint:  toNum(row['Distance(speed |Sprinting) (m)']),
        expl:    toNum(row['Explosive Distance (m)']),
        dpm:     toNum(row['Distance / min (m)']),
        maxspd:  toNum(row['Speed (max.) (m/s)']),
        acc:     toNum(row['Accelerations (high)']),
        dec:     toNum(row['Decelerations (high)']),
        hml:     toNum(row['HMLD (m)']),
        mins:    toNum(row['Session Length (Mins)']),
      }))
      .sort((a, b) => parseD(a.date) - parseD(b.date))
      .slice(-10);

    res.status(200).json({ player, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load data' });
  }
};

function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function parseD(s) {
  if (s === null || s === undefined || s === '') return 0;
  if (typeof s === 'number') return new Date((s - 25569) * 86400000);
  if (s.includes('-')) return new Date(s);
  const [m, d, y] = s.split('/');
  if (!y) return 0;
  return new Date(+y < 100 ? 2000 + +y : +y, +m - 1, +d);
}
