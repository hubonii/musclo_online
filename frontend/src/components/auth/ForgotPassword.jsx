import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const { forgotPassword, isLoading } = useAuthStore();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword(email);
            toast('success', 'Reset code sent!', 'Check your email for the 6-digit code.');
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            toast('error', 'Request failed', err?.response?.data?.message || 'Could not send reset code.');
        }
    };

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase">Reset Password</h1>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-60">Enter your email to receive a code</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Email Address" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    icon={<Mail size={18}/>} 
                    placeholder="you@example.com" 
                    required
                />

                <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
                    Send Code
                </Button>
            </form>

            <Link to="/login" className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-orange transition-all">
                <ArrowLeft size={14}/> Back to login
            </Link>
        </div>
    );
}
