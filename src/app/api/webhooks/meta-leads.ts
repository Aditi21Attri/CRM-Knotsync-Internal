import { addLeadAction } from '@/lib/actions/leadActions';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Meta sends leadgen_id, page_id, form_id, field_data, etc.
  const { field_data, ...meta } = req.body;
  const name = field_data?.find((f: any) => f.name === 'full_name')?.values?.[0] || 'Unknown';
  const email = field_data?.find((f: any) => f.name === 'email')?.values?.[0] || '';
  const phoneNumber = field_data?.find((f: any) => f.name === 'phone_number')?.values?.[0] || '';
  const message = field_data?.find((f: any) => f.name === 'message')?.values?.[0] || '';
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    await addLeadAction({ name, email, phoneNumber, message, source: 'instagram', meta });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add lead' });
  }
} 