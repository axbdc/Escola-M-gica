const { useState, useEffect, useMemo } = React;
const { 
    BookOpen, Calculator, Globe, PlayCircle, CheckCircle, ArrowLeft, 
    ShoppingBag, Trophy, Zap, User, X, Calendar, ChevronRight, 
    AlertCircle, UserPlus, Image: ImageIcon 
} = LucideReact;

// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// --- CONFIGURAÇÃO FIREBASE (Preencheremos no próximo passo) ---
const firebaseConfig = {
    apiKey: "", 
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

const appId = 'escola-magica-v6';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COMPONENTE MASCOTE ---
const RedPandaMascot = ({ size = 100, grade = 2 }) => {
    // Para usar a tua imagem AVIF:
    return (
        <img 
            src="panda.avif" 
            style={{ width: size, height: 'auto' }} 
            className="animate-bounce-slow drop-shadow-2xl"
            alt="Panda Tutor"
        />
    );
};

function App() {
    const [appState, setAppState] = useState('loading'); 
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState('');
    const [pandaName, setPandaName] = useState('Panda');
    const [grade, setGrade] = useState(null); 
    const [bambus, setBambus] = useState(150);

    useEffect(() => {
        signInAnonymously(auth);
        onAuthStateChanged(auth, (u) => setUser(u));
        setTimeout(() => setAppState('auth-choice'), 2000);
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), (d) => {
            if (d.exists()) {
                const data = d.data();
                setUserName(data.name || '');
                setPandaName(data.pandaName || 'Panda');
                setBambus(data.bambus ?? 150);
                setGrade(data.grade || null);
            }
        });
        return () => unsub();
    }, [user]);

    const saveProfile = async (updates) => {
        if (!user) return;
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), updates, { merge: true });
    };

    const handleAction = async (type) => {
        if (type === 'login' || type === 'signup') {
            await saveProfile({ name: userName, pandaName: pandaName });
            setAppState(grade ? 'dashboard' : 'grade-choice');
        }
    };

    if (appState === 'loading') return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <RedPandaMascot size={150} />
            <h1 className="text-orange-500 font-black text-2xl animate-pulse mt-4 uppercase">A carregar...</h1>
        </div>
    );

    if (['auth-choice', 'login', 'signup'].includes(appState)) return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl w-full max-w-md text-center border-b-8 border-orange-200">
                <RedPandaMascot size={120} />
                {appState === 'auth-choice' && (
                    <div className="mt-8 space-y-4">
                        <h2 className="text-3xl font-black text-slate-800">Escola Mágica</h2>
                        <button onClick={() => setAppState('login')} className="w-full bg-orange-500 text-white p-5 rounded-2xl font-black text-xl active:scale-95 transition-all">ENTRAR</button>
                        <button onClick={() => setAppState('signup')} className="w-full bg-white text-orange-600 border-4 border-orange-100 p-5 rounded-2xl font-black text-xl active:scale-95 transition-all">CRIAR CONTA</button>
                    </div>
                )}
                {appState === 'login' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleAction('login'); }} className="mt-8 space-y-4">
                        <input className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-orange-500" placeholder="Teu Nome" value={userName} onChange={e => setUserName(e.target.value)} required />
                        <button className="w-full bg-orange-500 text-white p-5 rounded-2xl font-black text-xl active:scale-95">VAMOS ESTUDAR! 🚀</button>
                    </form>
                )}
                {appState === 'signup' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleAction('signup'); }} className="mt-8 space-y-4 text-left">
                        <label className="font-black text-slate-400 text-xs uppercase ml-2">Teu Nome</label>
                        <input className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold mb-4" value={userName} onChange={e => setUserName(e.target.value)} required />
                        <label className="font-black text-slate-400 text-xs uppercase ml-2">Nome do Panda</label>
                        <input className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold" value={pandaName} onChange={e => setPandaName(e.target.value)} required />
                        <button className="w-full bg-orange-500 text-white p-5 rounded-2xl font-black text-xl mt-4 active:scale-95">COMEÇAR ✨</button>
                    </form>
                )}
            </div>
        </div>
    );

    if (appState === 'grade-choice') return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-2xl text-center">
                <h2 className="text-3xl font-black mb-8">Olá {userName}! Qual é o teu ano?</h2>
                <div className="grid grid-cols-2 gap-4">
                    {[2, 3, 4, 5].map(y => (
                        <button key={y} onClick={() => { setGrade(y); saveProfile({grade: y}); setAppState('dashboard'); }} className="p-8 rounded-[2rem] bg-orange-50 border-4 border-transparent hover:border-orange-500 active:scale-95 transition-all">
                            <span className="text-5xl font-black text-orange-500">{y}º ANO</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <header className="bg-white p-4 shadow-sm flex justify-between items-center px-6">
                <h1 className="font-black text-orange-500">ESCOLA MÁGICA</h1>
                <div className="bg-orange-100 px-4 py-2 rounded-full font-black text-orange-600">🎋 {bambus}</div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="relative pt-16">
                    <div className="absolute -top-4 left-10 z-20"><RedPandaMascot size={180} /></div>
                    <div className="bg-gradient-to-r from-orange-500 to-amber-400 p-10 pt-24 rounded-[3.5rem] text-white shadow-2xl">
                        <h2 className="text-4xl font-black">Olá, {userName}!</h2>
                        <p className="text-orange-100 font-bold text-xl mt-2 italic">O {pandaName} está pronto!</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);