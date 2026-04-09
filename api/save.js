import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    const { type = 'CHG', date, platform, account, campaign, description, notes, tags } = req.body;

    const prefix = type === 'OBS' ? 'OBS' : 'CHG';

    // Nächste ID nur für diesen Prefix zählen
    const { data: existing } = await supabase
      .from('log')
      .select('id')
      .like('id', prefix + '-%');

    const maxNum = existing && existing.length > 0
      ? Math.max(...existing.map(r => parseInt(r.id.split('-')[1]) || 0))
      : 0;
    const id = prefix + '-' + String(maxNum + 1).padStart(3, '0');

    const campaignNorm = campaign
      ? campaign.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_')
      : '';

    const { error } = await supabase.from('log').insert({
      id, date, platform, account,
      campaign, campaign_norm: campaignNorm,
      description, notes, tags,
      entry_type: prefix   // Spalte in Supabase hinzufügen (siehe Migrationsanleitung)
    });

    if (error) throw error;

    res.status(200).json({ success: true, id });
  } catch (e) {
    const errDetail = e?.message || e?.details || e?.hint || JSON.stringify(e);
    res.status(500).json({ success: false, error: errDetail });
  }
}
