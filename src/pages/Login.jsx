import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        // In a real scenario, use Firebase Auth here
        // import { signInWithEmailAndPassword } from "firebase/auth";
        // await signInWithEmailAndPassword(auth, email, password);

        // Mock Login for demonstration
        if (email === 'admin@seeds.com' && password === 'admin') {
            navigate('/admin/dashboard');
        } else {
            setError('بيانات الدخول غير صحيحة (جرب: admin@seeds.com / admin)');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">تسجيل دخول الإدارة</h1>
                    <p className="text-gray-500 text-sm mt-2">يرجى إدخال البريد الإلكتروني وكلمة المرور</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-3 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-3 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-green hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        تسجيل الدخول
                    </button>
                </form>
            </div>
        </div>
    );
}
