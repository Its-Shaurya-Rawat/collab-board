import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>✦ CollabBoard</div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your workspace</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['Email','email','email'],['Password','password','password']].map(([label, name, type]) => (
            <div key={name} style={{ marginBottom: 16 }}>
              <label style={styles.label}>{label}</label>
              <input type={type} value={form[name]} onChange={e => setForm(f => ({...f, [name]: e.target.value}))}
                style={styles.input} placeholder={`Enter your ${label.toLowerCase()}`} required />
            </div>
          ))}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={styles.switch}>Don't have an account? <Link to="/register" style={{ color: '#7c5cfc' }}>Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
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