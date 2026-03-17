const LABEL_COLORS = { Design:'#7c5cfc', Frontend:'#22d3a5', Backend:'#3b82f6', Bug:'#f87171', Feature:'#f59e0b', Research:'#ec4899' };
const PRIORITY_COLORS = { low:'#22d3a5', medium:'#f59e0b', high:'#f87171' };

export default function TaskCard({ task, onClick, allUsers }) {
  const assignee = allUsers.find(u => u.id === task.assigneeId);
  const labelColor = LABEL_COLORS[task.label] || '#7c5cfc';
  const prioColor = PRIORITY_COLORS[task.priority] || '#f59e0b';

  return (
    <div onClick={onClick} style={{ background:'#16161f', border:'1px solid #ffffff0f', borderRadius:10, padding:14, cursor:'pointer', transition:'transform .15s, box-shadow .15s, border-color .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px #0008'; e.currentTarget.style.borderColor='#ffffff18'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='#ffffff0f'; }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
        {task.label && <span style={{ fontSize:10, fontWeight:600, color:labelColor, background:labelColor+'18', padding:'2px 7px', borderRadius:4, letterSpacing:'0.04em' }}>{task.label}</span>}
        <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, color:prioColor, textTransform:'uppercase', letterSpacing:'0.06em' }}>↑ {task.priority}</span>
      </div>
      <div style={{ fontSize:14, fontWeight:600, marginBottom:6, lineHeight:1.4 }}>{task.title}</div>
      {task.description && <div style={{ fontSize:12, color:'#6b6880', lineHeight:1.5, marginBottom:10 }}>{task.description.slice(0,80)}{task.description.length>80?'…':''}</div>}
      {task.progress > 0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:11, color:'#6b6880' }}>
            <span>Progress</span><span>{task.progress}%</span>
          </div>
          <div style={{ height:4, background:'#ffffff0a', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${task.progress}%`, background:task.progress===100?'#22d3a5':'linear-gradient(90deg,#7c5cfc,#ec4899)', borderRadius:2 }}/>
          </div>
        </div>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {assignee && <div style={{ width:24, height:24, borderRadius:'50%', background:(assignee.color||'#7c5cfc')+'33', border:`1.5px solid ${assignee.color||'#7c5cfc'}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:assignee.color||'#7c5cfc' }}>{assignee.name.slice(0,2).toUpperCase()}</div>}
        {task.dueDate && <span style={{ fontSize:11, color:'#6b6880' }}>📅 {task.dueDate}</span>}
        {task.attachments?.length > 0 && <span style={{ fontSize:11, color:'#6b6880' }}>📎 {task.attachments.length}</span>}
        {task.comments?.length > 0 && <span style={{ marginLeft:'auto', fontSize:11, color:'#6b6880' }}>💬 {task.comments.length}</span>}
      </div>
    </div>
  );
}