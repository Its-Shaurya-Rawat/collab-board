import { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LABELS = ['Design','Frontend','Backend','Bug','Feature','Research'];
const LABEL_COLORS = { Design:'#7c5cfc', Frontend:'#22d3a5', Backend:'#3b82f6', Bug:'#f87171', Feature:'#f59e0b', Research:'#ec4899' };

const iStyle = { width:'100%', background:'#ffffff06', border:'1px solid #ffffff0f', borderRadius:8, padding:'10px 14px', color:'#e8e6f0', fontSize:14, outline:'none', boxSizing:'border-box' };
const lStyle = { display:'block', fontSize:11, color:'#6b6880', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 };

export default function TaskModal({ modal, allUsers, onClose, onCreate, onUpdate, onDelete, onUpload }) {
  const { user } = useAuth();
  const isNew = modal === 'new';
  const [form, setForm] = useState(isNew ? { title:'', description:'', priority:'medium', label:'Feature', assigneeId:'', dueDate:'', progress:0 } : { ...modal });
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const getAI = async () => {
    setAiLoading(true); setAiText('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:200,
          messages:[{ role:'user', content:`Give a 2-sentence actionable suggestion for this task: "${form.title}". Description: "${form.description}".` }] })
      });
      const data = await res.json();
      setAiText(data.content?.[0]?.text || 'No suggestion.');
    } catch { setAiText('AI unavailable.'); }
    setAiLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file || isNew) return;
    setUploading(true);
    try { await onUpload(form.id, file); toast.success('File uploaded!'); } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const addComment = async () => {
    if (!comment.trim() || isNew) return;
    await api.post(`/tasks/${form.id}/comment`, { text: comment });
    setComment('');
    toast.success('Comment added!');
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, backdropFilter:'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:540, maxHeight:'90vh', background:'#16161f', border:'1px solid #ffffff0f', borderRadius:16, overflow:'auto', boxShadow:'0 32px 80px #000a' }}>
        <div style={{ padding:'28px 28px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:700 }}>{isNew ? 'New Task' : 'Edit Task'}</h2>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#6b6880', fontSize:24, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={lStyle}>Title</label>
            <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Task title…" style={iStyle}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lStyle}>Description</label>
            <textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Add description…" rows={3} style={{...iStyle, resize:'vertical'}}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div>
              <label style={lStyle}>Priority</label>
              <select value={form.priority} onChange={e=>set('priority',e.target.value)} style={{...iStyle, background:'#111118'}}>
                {['low','medium','high'].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>Label</label>
              <select value={form.label} onChange={e=>set('label',e.target.value)} style={{...iStyle, background:'#111118'}}>
                {LABELS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>Assignee</label>
              <select value={form.assigneeId} onChange={e=>set('assigneeId',e.target.value)} style={{...iStyle, background:'#111118'}}>
                <option value="">Unassigned</option>
                {allUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lStyle}>Due Date</label>
              <input value={form.dueDate} onChange={e=>set('dueDate',e.target.value)} placeholder="e.g. Mar 15" style={iStyle}/>
            </div>
          </div>

          {!isNew && (
            <>
              <div style={{ marginBottom:16 }}>
                <label style={lStyle}>Progress — {form.progress}%</label>
                <input type="range" min="0" max="100" value={form.progress} onChange={e=>set('progress',Number(e.target.value))} style={{ width:'100%', accentColor:'#7c5cfc' }}/>
              </div>

              {/* File attachment */}
              <div style={{ marginBottom:16, borderTop:'1px solid #ffffff0f', paddingTop:16 }}>
                <label style={lStyle}>Attachments</label>
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 16px', background:'#ffffff08', border:'1px solid #ffffff0f', borderRadius:8, cursor:'pointer', fontSize:13, color:'#e8e6f0' }}>
                  📎 {uploading ? 'Uploading…' : 'Attach file'}
                  <input type="file" onChange={handleFileUpload} style={{ display:'none' }} disabled={uploading}/>
                </label>
                {form.attachments?.length > 0 && (
                  <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
                    {form.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#7c5cfc', textDecoration:'none' }}>📄 {a.filename}</a>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments */}
              <div style={{ marginBottom:16, borderTop:'1px solid #ffffff0f', paddingTop:16 }}>
                <label style={lStyle}>Comments ({form.comments?.length || 0})</label>
                {form.comments?.map((c, i) => (
                  <div key={i} style={{ background:'#ffffff06', borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
                    <div style={{ fontSize:11, color:'#7c5cfc', fontWeight:600, marginBottom:4 }}>{c.userName}</div>
                    <div style={{ fontSize:13 }}>{c.text}</div>
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment…" style={{...iStyle, flex:1}} onKeyDown={e=>e.key==='Enter'&&addComment()}/>
                  <button onClick={addComment} style={{ padding:'10px 16px', background:'#7c5cfc', border:'none', borderRadius:8, color:'#fff', cursor:'pointer', fontWeight:600, fontSize:13 }}>Send</button>
                </div>
              </div>
            </>
          )}

          {/* AI Suggestion */}
          <div style={{ marginBottom:20, borderTop:'1px solid #ffffff0f', paddingTop:16 }}>
            <button onClick={getAI} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'#7c5cfc18', border:'1px solid #7c5cfc44', borderRadius:8, color:'#7c5cfc', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:aiText||aiLoading?12:0 }}>
              ✦ {aiLoading ? 'Generating…' : 'AI Suggestion'}
            </button>
            {aiText && !aiLoading && <div style={{ background:'#7c5cfc0d', border:'1px solid #7c5cfc22', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#e8e6f0', lineHeight:1.6 }}>{aiText}</div>}
          </div>
        </div>

        <div style={{ padding:'0 28px 24px', display:'flex', gap:10 }}>
          {!isNew && <button onClick={() => onDelete(form.id)} style={{ padding:'10px 18px', background:'#f8717118', border:'1px solid #f8717133', borderRadius:8, color:'#f87171', fontSize:13, cursor:'pointer', fontWeight:600 }}>Delete</button>}
          <button onClick={() => isNew ? onCreate(form) : onUpdate(form.id, form)}
            style={{ marginLeft:'auto', padding:'10px 28px', background:'linear-gradient(135deg,#7c5cfc,#9b7cff)', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {isNew ? 'Create Task' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}