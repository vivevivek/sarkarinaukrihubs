'use client';
import { useState, useEffect } from 'react';
import Header from '../components/Header';

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'sarkari@admin2024';

export default function AdminPage() {
  const [auth, setAuth]       = useState(false);
  const [pass, setPass]       = useState('');
  const [jobs, setJobs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  const login = () => {
    if (pass === ADMIN_PASS) { setAuth(true); localStorage.setItem('snh_admin', '1'); }
    else alert('Wrong password');
  };

  useEffect(() => {
    if (localStorage.getItem('snh_admin') === '1') setAuth(true);
  }, []);

  useEffect(() => {
    if (!auth) return;
    loadJobs();
  }, [auth, page, search]);

  async function loadJobs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?page=${page}&search=${search}&limit=30`);
      const d   = await res.json();
      setJobs(d.jobs || []);
      setTotal(d.total || 0);
    } finally { setLoading(false); }
  }

  function startEdit(job) {
    setEditing(job.id);
    setEditData({
      title:           job.title || '',
      organization:    job.organization || '',
      last_date:       job.last_date || job.lastDate || '',
      vacancies:       job.vacancies || '',
      salary:          job.salary || '',
      qualification:   job.qualification || '',
      age_limit:       job.age_limit || job.ageLimit || '',
      application_fee: job.application_fee || '',
      apply_link:      job.apply_link || job.link || '',
      description:     job.description || '',
    });
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing, fields: editData }),
      });
      const d = await res.json();
      if (d.ok) { setMsg('✅ Saved!'); setEditing(null); loadJobs(); }
      else setMsg('❌ Error: ' + d.error);
    } finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
  }

  if (!auth) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f8f6f2' }}>
      <div style={{ background:'#fff', padding:40, borderRadius:12, boxShadow:'0 4px 24px rgba(0,0,0,0.1)', width:340 }}>
        <h1 style={{ fontFamily:'serif', color:'#0d2137', marginBottom:24, textAlign:'center' }}>🏛️ Admin Panel</h1>
        <input type="password" placeholder="Admin Password" value={pass} onChange={e=>setPass(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&login()}
          style={{ width:'100%', padding:'12px 16px', borderRadius:8, border:'1.5px solid #e5e0d8', fontSize:15, marginBottom:16, boxSizing:'border-box' }} />
        <button onClick={login} style={{ width:'100%', background:'#0d2137', color:'#fff', border:'none', padding:'12px', borderRadius:8, fontSize:15, fontWeight:700, cursor:'pointer' }}>Login</button>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h1 style={{ fontFamily:'serif', color:'#0d2137', fontSize:24 }}>Admin Panel — {total} Jobs</h1>
          <button onClick={()=>{localStorage.removeItem('snh_admin');setAuth(false);}} style={{ background:'#ef4444', color:'#fff', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer' }}>Logout</button>
        </div>

        {msg && <div style={{ background:'#e8f5e9', border:'1px solid #a5d6a7', borderRadius:8, padding:'10px 16px', marginBottom:16, fontWeight:600 }}>{msg}</div>}

        <div style={{ display:'flex', gap:12, marginBottom:20 }}>
          <input type="text" placeholder="Search jobs..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            style={{ flex:1, padding:'10px 16px', borderRadius:8, border:'1.5px solid #e5e0d8', fontSize:14 }} />
          <button onClick={loadJobs} style={{ background:'#FF9933', color:'#0d2137', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:700, cursor:'pointer' }}>Refresh</button>
        </div>

        {loading ? <p>Loading...</p> : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {jobs.map(job => (
              <div key={job.id} style={{ background:'#fff', borderRadius:8, padding:'14px 16px', border:'1px solid #e5e0d8', borderLeft:`4px solid ${job.manually_edited ? '#4caf50' : '#FF9933'}` }}>
                {editing === job.id ? (
                  <div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                      {Object.entries(editData).map(([key, val]) => (
                        <div key={key}>
                          <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', display:'block', marginBottom:4 }}>{key.replace(/_/g,' ')}</label>
                          <input value={val} onChange={e=>setEditData(p=>({...p,[key]:e.target.value}))}
                            style={{ width:'100%', padding:'8px 12px', borderRadius:6, border:'1.5px solid #e5e0d8', fontSize:13, boxSizing:'border-box' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={saveEdit} disabled={saving} style={{ background:'#138808', color:'#fff', border:'none', padding:'8px 20px', borderRadius:6, fontWeight:700, cursor:'pointer' }}>{saving ? 'Saving...' : '✅ Save Changes'}</button>
                      <button onClick={()=>setEditing(null)} style={{ background:'#6b7280', color:'#fff', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                        {job.manually_edited && <span style={{ fontSize:10, background:'#e8f5e9', color:'#1b5e20', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>✏️ Edited</span>}
                        {job.pdf_parsed && <span style={{ fontSize:10, background:'#e3f2fd', color:'#1565c0', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>📄 PDF Parsed</span>}
                        <span style={{ fontSize:11, color:'#9ca3af' }}>{job.category} · {job.section} · {job.source}</span>
                      </div>
                      <div style={{ fontWeight:600, color:'#0d2137', fontSize:14, marginBottom:4 }}>{job.title}</div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>
                        {job.vacancies && `👥 ${job.vacancies} vacancies  `}
                        {job.last_date && `📅 Last date: ${job.last_date}  `}
                        {job.salary && `💰 ${job.salary}`}
                      </div>
                    </div>
                    <button onClick={()=>startEdit(job)} style={{ background:'#0d2137', color:'#fff', border:'none', padding:'8px 16px', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>✏️ Edit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:20 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{ padding:'8px 16px', borderRadius:6, border:'1.5px solid #e5e0d8', cursor:'pointer' }}>← Prev</button>
          <span style={{ padding:'8px 16px', fontWeight:600 }}>Page {page}</span>
          <button onClick={()=>setPage(p=>p+1)} style={{ padding:'8px 16px', borderRadius:6, border:'1.5px solid #e5e0d8', cursor:'pointer' }}>Next →</button>
        </div>
      </div>
    </>
  );
}
