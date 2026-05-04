// Email verification component: handles manual trigger and code entry.
import { useState } from 'react';
import { Key, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export default function EmailVerification() {
    const [step, setStep] = useState('request'); // 'request', 'verify', or 'change'
    const [code, setCode] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const { verifyEmail, resendVerification, updateProfile, isLoading, user, logout } = useAuthStore();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSendCode = async () => {
        try {
            await resendVerification();
            setStep('verify');
            toast('success', 'Code Sent!', `A 6-digit code has been sent to ${user?.email}`);
        } catch (err) {
            toast('error', 'Failed to send code', err?.response?.data?.message || 'Please try again.');
        }
    };

    const handleSubmitCode = async (e) => {
        e.preventDefault();
        try {
            await verifyEmail(code);
            toast('success', 'Email Verified!', 'Your account is now fully active.');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            toast('error', 'Verification failed', err?.response?.data?.message || 'Invalid code.');
        }
    };

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({ email: newEmail });
            toast('success', 'Email Updated!', `Please verify your new email: ${newEmail}`);
            setStep('request');
        } catch (err) {
            toast('error', 'Update failed', err?.response?.data?.message || 'Could not update email.');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="w-full max-w-sm space-y-8 py-4">
            {/* Header Section */}
            <div className="space-y-3 text-center">
                <div className="mx-auto w-16 h-16 rounded-[24px] bg-surface shadow-neu flex items-center justify-center border border-orange/10">
                    {step === 'request' ? (
                        <Mail className="text-orange" size={28} />
                    ) : (
                        <ShieldCheck className="text-orange" size={28} />
                    )}
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase">
                        {step === 'request' ? 'Verification Required' : 'Enter Code'}
                    </h1>
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-60">
                        {step === 'change' 
                            ? 'Enter your correct email address'
                            : step === 'request' 
                                ? 'Please verify your email to access your account' 
                                : `We sent a code to ${user?.email}`}
                    </p>
                </div>
            </div>

            {/* Step 1: Request Code */}
            {step === 'request' && (
                <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-surface/50 border border-white/5 space-y-2">
                        <p className="text-xs text-text-secondary leading-relaxed font-medium">
                            To ensure the security of your account, we need to verify your email address. 
                            Click the button below to receive a 6-digit verification code.
                        </p>
                    </div>

                    <Button 
                        variant="primary" 
                        className="w-full h-14" 
                        onClick={handleSendCode}
                        isLoading={isLoading}
                    >
                        Send Verification Code
                    </Button>

                    <button 
                        type="button"
                        onClick={() => {
                            setNewEmail(user?.email || '');
                            setStep('change');
                        }}
                        className="w-full text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-orange transition-all"
                    >
                        Typo in email? Change it
                    </button>
                </div>
            )}

            {/* Step 2: Verify Code */}
            {step === 'verify' && (
                <form onSubmit={handleSubmitCode} className="space-y-6">
                    <Input 
                        label="6-Digit Code" 
                        type="text" 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        icon={<Key size={18}/>} 
                        placeholder="123456" 
                        maxLength={6}
                        required
                        className="text-center tracking-[0.5em] font-black text-lg"
                    />

                    <div className="space-y-4">
                        <Button type="submit" variant="primary" className="w-full h-14" isLoading={isLoading}>
                            Confirm Code
                        </Button>
                        
                        <button 
                            type="button"
                            onClick={handleSendCode}
                            className="w-full text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-orange transition-all"
                            disabled={isLoading}
                        >
                            Resend Email
                        </button>
                    </div>
                </form>
            )}

            {/* Step 3: Change Email */}
            {step === 'change' && (
                <form onSubmit={handleChangeEmail} className="space-y-6">
                    <Input 
                        label="New Email Address" 
                        type="email" 
                        value={newEmail} 
                        onChange={(e) => setNewEmail(e.target.value)} 
                        icon={<Mail size={18}/>} 
                        placeholder="your@email.com" 
                        required
                    />

                    <div className="space-y-4">
                        <Button type="submit" variant="primary" className="w-full h-14" isLoading={isLoading}>
                            Update Email
                        </Button>
                        
                        <button 
                            type="button"
                            onClick={() => setStep('request')}
                            className="w-full text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-orange transition-all"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Logout/Back Option */}
            <div className="pt-4 border-t border-white/5 text-center">
                <button 
                    onClick={handleLogout}
                    className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-red-400 transition-all"
                >
                    Sign out and use another account
                </button>
            </div>
        </div>
    );
}
