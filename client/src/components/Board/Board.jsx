import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTasks } from '../../hooks/useTasks';
import Column from './Column';
import TaskModal from '../Modal/TaskModal';
import Sidebar from '../Sidebar/Sidebar';
import api from '../../utils/api';

export default function Board() {
  const { user, logout } = useAuth();
  const { emit, activeUsers, connected } = useSocket();
  const { columns, tasks, loading, getColumnTasks, refetch } = useTasks();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [newTaskColId, setNewTaskColId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    api.get('/auth/users').then(r => setAllUsers(r.data)).catch(() => {});
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newColId = destination.droppableId;
    const colName = columns.find(c => c.id === newColId)?.title;
    try {
      await api.put(`/tasks/${draggableId}/move`, { columnId: newColId, order: destination.index, boardId: 'main' });
      emit('task-moved', { taskId: draggableId, columnId: newColId, boardId: 'main' });
      toast.success(`Moved to ${colName}`);
    } catch { toast.error('Move failed'); }
  };

  const createTask = async (data) => {
    try {
      await api.post('/tasks', { ...data, boardId: 'main', columnId: newTaskColId });
      toast.success('Task created!');
      setModal(null);
    } catch { toast.error('Failed to create task'); }
  };

  const updateTask = async (id, data) => {
    try {
      await api.put(`/tasks/${id}`, data);
      toast.success('Task updated!');
      setModal(null);
    } catch { toast.error('Failed to update'); }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      setModal(null);
    } catch { toast.error('Failed to delete'); }
  };

  const uploadFile = async (taskId, file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    const task = tasks.find(t => t.id === taskId);
    const attachments = [...(task?.attachments || []), data];
    await updateTask(taskId, { attachments });
    return data;
  };

  const filteredColumns = columns.map(col => ({
    ...col,
    tasks: getColumnTasks(col.id).filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
  }));

  if (loading) return <div style={{ background:'#0e0e10', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#42f065', fontFamily:'monospace', fontSize:40 }}>✦</div>;

  return (
    <div style={{ display:'flex', height:'100vh', background:'#0a0a0f', color:'#e8e6f0', fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap'); * { box-sizing:border-box; } ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#ffffff18;border-radius:2px}`}</style>

      {sidebarOpen && <Sidebar user={user} activeUsers={activeUsers} allUsers={allUsers} connected={connected} tasks={tasks} columns={columns} logout={logout} />}

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'14px 24px', borderBottom:'1px solid #ffffff0f', display:'flex', alignItems:'center', gap:16, background:'#111118', flexShrink:0 }}>
          <button onClick={() => setSidebarOpen(s=>!s)} style={{ background:'none', border:'none', color:'#6b6880', fontSize:18, cursor:'pointer' }}>☰</button>
          <div style={{ position:'relative', flex:1, maxWidth:300 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b6880' }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…"
              style={{ width:'100%', background:'#ffffff06', border:'1px solid #ffffff0f', borderRadius:8, padding:'8px 12px 8px 32px', color:'#e8e6f0', fontSize:13, outline:'none' }}/>
          </div>
          <div style={{ display:'flex', gap:-6, marginLeft:'auto' }}>
            {activeUsers.slice(0,5).map((u,i) => (
              <div key={u.userId} title={u.userName} style={{ width:32, height:32, borderRadius:'50%', background:'#7c5cfc33', border:'2px solid #111118', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#7c5cfc', marginLeft:i?-8:0, zIndex:10-i }}>
                {u.userName?.slice(0,2).toUpperCase()}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:connected?'#22d3a518':'#f8717118', border:`1px solid ${connected?'#22d3a533':'#f8717133'}`, borderRadius:20, fontSize:12, color:connected?'#d33c22':'#f87171' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:connected?'#072e84':'#ea1543', display:'inline-block' }}/>
            {connected ? `${activeUsers.length} online` : 'Offline'}
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ flex:1, display:'flex', gap:16, padding:'20px 24px', overflowX:'auto' }}>
            {filteredColumns.map(col => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <Column col={col} provided={provided} snapshot={snapshot}
                    onAddTask={() => { setNewTaskColId(col.id); setModal('new'); }}
                    onTaskClick={task => setModal(task)}
                    allUsers={allUsers} />
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {modal && (
        <TaskModal
          modal={modal} allUsers={allUsers}
          onClose={() => setModal(null)}
          onCreate={createTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onUpload={uploadFile}
        />
      )}
    </div>
  );
}