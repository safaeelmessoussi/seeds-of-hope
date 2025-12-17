import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toWesternNumerals } from '../../utils/dateUtils';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            console.error(err);
            setError('فشل تسجيل الدخول. يرجى التحقق من البيانات.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(toWesternNumerals(e.target.value));
    };

    const handlePasswordChange = (e) => {
        setPassword(toWesternNumerals(e.target.value));
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
            {/* Back Link */}
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-primary-green transition-colors font-medium"
            >
                <ArrowLeft size={18} />
                <span>العودة</span>
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">تسجيل دخول الإدارة</h1>
                    <p className="text-gray-500 text-sm">يرجى إدخال البريد الإلكتروني وكلمة المرور</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 block">البريد الإلكتروني</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="name@example.com"
                                className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-all text-left dir-ltr placeholder:text-right"
                                dir="ltr"
                            />
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 block">كلمة المرور</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="........"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-all text-left dir-ltr placeholder:text-right"
                                dir="ltr"
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-primary-green text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                        {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                    </button>
                </form>
            </div>
        </div>
    );
}
