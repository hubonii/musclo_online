import { useState } from 'react';
import { Lock as LockIcon, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export default function ChangePasswordModal({ isOpen, onClose }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { changePassword, isLoading } = useAuthStore();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast('error', 'Mismatch', 'New passwords do not match.');
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            toast('success', 'Success!', 'Your password has been updated.');
            onClose();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast('error', 'Update failed', err?.response?.data?.message || 'Current password incorrect.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-surface shadow-neu-lg rounded-[40px] overflow-hidden relative border border-white/10"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-orange/10 flex items-center justify-center text-orange shadow-neu-sm">
                                        <ShieldCheck size={20}/>
                                    </div>
                                    <h2 className="text-xl font-black text-text-primary tracking-tighter uppercase">Change Password</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-divider/10 rounded-xl transition-all">
                                    <X size={20}/>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input 
                                    label="Current Password" 
                                    type="password" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    icon={<LockIcon size={18}/>} 
                                    placeholder="••••••••" 
                                    required
                                />

                                <Input 
                                    label="New Password" 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    icon={<LockIcon size={18}/>} 
                                    placeholder="••••••••" 
                                    required
                                />

                                <Input 
                                    label="Confirm New Password" 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    icon={<LockIcon size={18}/>} 
                                    placeholder="••••••••" 
                                    required
                                />

                                <Button type="submit" variant="primary" className="w-full mt-6" isLoading={isLoading}>
                                    Update Password
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
