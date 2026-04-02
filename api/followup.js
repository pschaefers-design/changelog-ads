import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Alle offenen Wiedervorlagen
      const { data: fuData, error: fuErr } = await supabase
        .from('followups')
        .select('*, log:chg_id(id, platform, account, campaign, description, notes, tags, entry_type)')
        .in('status', ['offen', 'erinnert'])
        .eq('fu_type', 'wiedervorlage')
        .order('followup_date');

      if (fuErr) throw fuErr;

      const followups = fuData.map(f => ({
        fuId: f.id,
        chgId: f.chg_id,
        followupDate: f.followup_date,
        status: f.status,
        log: f.log || {}
      }));

      return res.status(200).json({ success: true, followups });
    }

    if (req.method === 'POST') {
      const { fuId, chgId, followupDate, observation, result, learning, fuType } = req.body;

      // ── Neue Wiedervorlage anlegen ──────────────────────────
      if (chgId && followupDate && !fuId) {
        const { data: existing } = await supabase
          .from('followups').select('id');
        const nextNum = (existing ? existing.length : 0) + 1;
        const id = 'FU-' + String(nextNum).padStart(3, '0');

        const { error } = await supabase.from('followups').insert({
          id,
          chg_id: chgId,
          followup_date: followupDate,
          status: 'offen',
          fu_type: 'wiedervorlage'
        });
        if (error) throw error;
        return res.status(200).json({ success: true, fuId: id });
      }

      // ── Neue Zwischennotiz anlegen (kein Datum nötig) ───────
      if (chgId && fuType === 'note' && !fuId) {
        const { data: existing } = await supabase
          .from('followups').select('id');
        const nextNum = (existing ? existing.length : 0) + 1;
        const id = 'FU-' + String(nextNum).padStart(3, '0');

        const { error } = await supabase.from('followups').insert({
          id,
          chg_id: chgId,
          followup_date: null,
          status: 'abgeschlossen',   // Notizen sind sofort "done"
          fu_type: 'note',
          observation,
          result: result || null,
          learning: learning || null
        });
        if (error) throw error;
        return res.status(200).json({ success: true, fuId: id });
      }

      // ── Bestehende Wiedervorlage abschließen ─────────────────
      if (fuId && !chgId) {
        const { error } = await supabase
          .from('followups')
          .update({ observation, result, learning, status: 'abgeschlossen' })
          .eq('id', fuId);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
    }

    // ── Suche nach CHG/OBS-Einträgen für Zwischennotiz-Modal ──
    if (req.method === 'GET' && req.query?.search !== undefined) {
      const q = req.query.search.toLowerCase();
      const { data, error } = await supabase
        .from('log')
        .select('id, description, date, platform, account, entry_type')
        .or(`id.ilike.%${q}%,description.ilike.%${q}%,account.ilike.%${q}%`)
        .order('date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return res.status(200).json({ success: true, results: data });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
}
