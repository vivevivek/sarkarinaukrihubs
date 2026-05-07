import { adminUpdateJob } from '../../../../lib/db/supabase';
export async function POST(request) {
  try {
    const { id, fields } = await request.json();
    if (!id || !fields) return Response.json({ error: 'Missing id or fields' }, { status: 400 });
    const result = await adminUpdateJob(id, fields);
    if (!result) return Response.json({ error: 'Update failed' }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
