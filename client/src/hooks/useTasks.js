import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

export function useTasks(boardId = 'main') {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [colRes, taskRes] = await Promise.all([
      api.get(`/columns?boardId=${boardId}`),
      api.get(`/tasks?boardId=${boardId}`)
    ]);
    setColumns(colRes.data);
    setTasks(taskRes.data);
    setLoading(false);
  }, [boardId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Real-time socket listeners
  useEffect(() => {
    const unsubs = [
      on('task-created', task => setTasks(t => [...t, task])),
      on('task-updated', updated => setTasks(t => t.map(x => x.id === updated.id ? updated : x))),
      on('task-moved', ({ taskId, columnId }) => setTasks(t => t.map(x => x.id === taskId ? { ...x, columnId } : x))),
      on('task-deleted', ({ taskId }) => setTasks(t => t.filter(x => x.id !== taskId))),
      on('column-created', col => setColumns(c => [...c, col])),
    ];
    return () => unsubs.forEach(fn => fn && fn());
  }, [on]);

  const getColumnTasks = (colId) => tasks.filter(t => t.columnId === colId).sort((a,b) => a.order - b.order);

  return { columns, tasks, loading, getColumnTasks, refetch: fetchAll };
}