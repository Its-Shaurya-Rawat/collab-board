import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    setLoading(false);
  };

  const s = {
    page: { minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', sans-serif" },
    card: { background:'#111118', border:'1px solid #ffffff0f', borderRadius:16, padding:40, width:380 },
    logo: { fontFamily:'monospace', fontWeight:700, fontSize:20, color:'#7c5cfc', marginBottom:24 },
    title: { fontSize:26, fontWeight:700, color:'#e8e6f0', marginBottom:6 },
    sub: { color:'#6b6880', fontSize:14, marginBottom:28 },
    error: { background:'#f8717118', border:'1px solid #f8717144', borderRadius:8, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:16 },
    label: { display:'block', fontSize:12, color:'#6b6880', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 },
    input: { width:'100%', background:'#ffffff06', border:'1px solid #ffffff0f', borderRadius:8, padding:'12px 14px', color:'#e8e6f0', fontSize:14, outline:'none', boxSizing:'border-box' },
    btn: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#7c5cfc,#9b7cff)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:8 },
    switch: { textAlign:'center', color:'#6b6880', fontSize:13, marginTop:20 },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🫵 CollabBoard</div>
        <h1 style={s.title}>Create account</h1>
        <p style={s.sub}>Join your team's workspace</p>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['Full Name','name','text'],['Email','email','email'],['Password','password','password']].map(([label, name, type]) => (
            <div key={name} style={{ marginBottom:16 }}>
              <label style={s.label}>{label}</label>
              <input type={type} value={form[name]} onChange={e => setForm(f=>({...f,[name]:e.target.value}))}
                style={s.input} placeholder={`Enter your ${label.toLowerCase()}`} required />
            </div>
          ))}
          <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p style={s.switch}>Already have an account? <Link to="/login" style={{ color:'#7c5cfc' }}>Sign in</Link></p>
      </div>
    </div>
  );
}