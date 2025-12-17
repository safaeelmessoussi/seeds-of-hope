import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackLink({ to = "/admin", label = "العودة", className = "" }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 text-gray-500 hover:text-primary-green transition-colors font-medium ${className}`}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </Link>
  );
}
