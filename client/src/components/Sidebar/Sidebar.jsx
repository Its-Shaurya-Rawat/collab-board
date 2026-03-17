export default function Sidebar({ user, activeUsers, allUsers, connected, tasks, columns, logout }) {
  const done = tasks.filter(t => {
    const doneCol = columns.find(c => c.title === 'Done');
    return doneCol && t.columnId === doneCol.id;
  }).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div style={{ width:260, background:'#111118', borderRight:'1px solid #ffffff0f', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #ffffff0f' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#7c5cfc,#ec4899)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🫵</div>
          <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:15 }}>CollabBoard</span>
        </div>
      </div>

      <div style={{ padding:16, borderBottom:'1px solid #ffffff0f' }}>
        <div style={{ fontSize:11, color:'#6b6880', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Sprint Progress</div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:13 }}>Overall</span>
          <span style={{ fontSize:13, color:'#7c5cfc', fontWeight:600 }}>{progress}%</span>
        </div>
        <div style={{ height:6, background:'#ffffff0a', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#7c5cfc,#22d3a5)', borderRadius:3, transition:'width .3s' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12, color:'#6b6880' }}>
          <span>{done} done</span><span>{tasks.length - done} remaining</span>
        </div>
      </div>

      <div style={{ padding:16, borderBottom:'1px solid #ffffff0f', flex:1, overflow:'auto' }}>
        <div style={{ fontSize:11, color:'#6b6880', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
          Team ({activeUsers.length} online)
        </div>
        {allUsers.map(u => {
          const isOnline = activeUsers.some(a => a.userId === u.id);
          return (
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:(u.color||'#7c5cfc')+'33', border:`2px solid ${u.color||'#7c5cfc'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:u.color||'#7c5cfc' }}>
                  {u.name.slice(0,2).toUpperCase()}
                </div>
                <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:isOnline?'#22d3a5':'#6b6880', border:'2px solid #111118' }}/>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{u.name}{u.id===user.id?' (you)':''}</div>
                <div style={{ fontSize:11, color:'#6b6880' }}>{isOnline ? '🟢 Online' : 'Offline'}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding:16, borderTop:'1px solid #ffffff0f' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'#7c5cfc33', border:'2px solid #7c5cfc44', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#7c5cfc' }}>
            {user.name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600 }}>{user.name}</div>
            <div style={{ fontSize:11, color:'#6b6880' }}>{user.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width:'100%', padding:'9px', background:'#ffffff06', border:'1px solid #ffffff0f', borderRadius:8, color:'#6b6880', fontSize:13, cursor:'pointer' }}>Sign Out</button>
      </div>
    </div>
  );
}