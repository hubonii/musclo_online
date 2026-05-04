import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Key, Lock as LockIcon, Mail } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { resetPassword, isLoading } = useAuthStore();
    const { toast } = useToast();

    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    useEffect(() => {
        if (!email) {
            toast('error', 'Missing email', 'Please start the reset process again.');
            navigate('/forgot-password');
        }
    }, [email, navigate, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            toast('error', 'Mismatch', 'Passwords do not match.');
            return;
        }

        try {
            await resetPassword(email, code, password);
            toast('success', 'Success!', 'Your password has been reset. Please login.');
            navigate('/login');
        } catch (err) {
            toast('error', 'Reset failed', err?.response?.data?.message || 'Invalid or expired code.');
        }
    };

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase">Verify Code</h1>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-60">Enter the 6-digit code sent to {email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Verification Code" 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    icon={<Key size={18}/>} 
                    placeholder="123456" 
                    maxLength={6}
                    required
                />

                <Input 
                    label="New Password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    icon={<LockIcon size={18}/>} 
                    placeholder="••••••••" 
                    required
                />

                <Input 
                    label="Confirm New Password" 
                    type="password" 
                    value={passwordConfirm} 
                    onChange={(e) => setPasswordConfirm(e.target.value)} 
                    icon={<LockIcon size={18}/>} 
                    placeholder="••••••••" 
                    required
                />

                <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
                    Reset Password
                </Button>
            </form>
        </div>
    );
}
