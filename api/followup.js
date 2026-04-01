import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('followups')
        .select('*, log:chg_id(platform, account, campaign, description, notes, tags)')
        .in('status', ['offen', 'erinnert'])
        .order('followup_date');

      if (error) throw error;

      const followups = data.map(f => ({
        fuId: f.id,
        chgId: f.chg_id,
        followupDate: f.followup_date,
        status: f.status,
        log: f.log || {}
      }));

      return res.status(200).json({ success: true, followups });
    }

    if (req.method === 'POST') {
      const { fuId, chgId, followupDate, observation, result, learning } = req.body;

      // Neues Followup anlegen
      if (chgId && followupDate) {
        const { count } = await supabase
          .from('followups')
          .select('*', { count: 'exact', head: true });

        const id = 'FU-' + String((count || 0) + 1).padStart(3, '0');

        const { error } = await supabase.from('followups').insert({
          id,
          chg_id: chgId,
          followup_date: followupDate,
          status: 'offen'
        });

        if (error) throw error;
        return res.status(200).json({ success: true, fuId: id });
      }

      // Bestehendes Followup abschließen
      if (fuId) {
        const { error } = await supabase
          .from('followups')
          .update({ observation, result, learning, status: 'abgeschlossen' })
          .eq('id', fuId);

        if (error) throw error;
        return res.status(200).json({ success: true });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
}
