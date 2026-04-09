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

    const nextNum = (existing ? existing.length : 0) + 1;
    const id = prefix + '-' + String(nextNum).padStart(3, '0');

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
    res.status(500).json({ success: false, error: e.toString() });
  }
}
