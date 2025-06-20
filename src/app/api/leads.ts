import { addLeadAction } from '@/lib/actions/leadActions';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, email, phoneNumber, message, source = 'website', meta } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const lead = await addLeadAction({ name, email, phoneNumber, message, source, meta });
    return res.status(201).json({ lead });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add lead' });
  }
} 