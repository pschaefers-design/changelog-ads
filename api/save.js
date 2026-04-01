import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    const { date, platform, account, campaign, description, notes, tags } = req.body;

    // Nächste ID berechnen
    const { count } = await supabase
      .from('log')
      .select('*', { count: 'exact', head: true });

    const id = 'CHG-' + String((count || 0) + 1).padStart(3, '0');

    const campaignNorm = campaign
      ? campaign.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_')
      : '';

    const { error } = await supabase.from('log').insert({
      id, date, platform, account,
      campaign, campaign_norm: campaignNorm,
      description, notes, tags
    });

    if (error) throw error;

    res.status(200).json({ success: true, id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
}
