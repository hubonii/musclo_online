// Settings page: Unified profile editing, account security, and app preferences.
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    User, Mail, Lock, Camera, Globe, Save, 
    Download, Shield, CheckCircle2, AlertCircle, Trash2, X
} from 'lucide-react';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { useAuthStore } from '../stores/useAuthStore';
import { MOTION } from '../lib/motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../api/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { compressImage } from '../lib/imageCompression';

export default function SettingsPage() {
    const { data: settings, isLoading: loadingSettings } = useSettings();
    const { 
        user, updateProfile, updateAvatar, changePassword, 
        requestEmailChange, verifyEmailChange, deleteAccount,
        isLoading: isAuthLoading 
    } = useAuthStore();
    const updateSettingsHook = useUpdateSettings();
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    // Profile state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    
    // UI state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    
    // Preferences state
    const [unitSystem, setUnitSystem] = useState('metric');
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isExporting, setIsExporting] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setBio(user.bio || '');
        }
        if (settings) {
            setUnitSystem(settings.unit_system || 'metric');
        }
    }, [user, settings]);

    const handleSaveProfile = async () => {
        try {
            // 1. Upload Avatar if pending
            if (pendingAvatar) {
                setIsUploadingAvatar(true);
                await updateAvatar(pendingAvatar);
                setPendingAvatar(null);
                setAvatarPreview(null);
                setIsUploadingAvatar(false);
            }

            // 2. Update Profile (Name/Email/Bio)
            await updateProfile({ name, email, bio });
            
            // 3. Update Settings (Units)
            updateSettingsHook.mutate({ unit_system: unitSystem });
            
            toast('success', 'Profile and settings updated!');
        } catch (err) {
            toast('error', 'Update failed', err.response?.data?.message || err.message);
            setIsUploadingAvatar(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast('error', 'File too large', 'Maximum photo size is 5MB.');
                return;
            }
            
            try {
                // Compress the image locally before showing preview
                const compressedFile = await compressImage(file, { maxWidth: 800, quality: 0.8 });
                setPendingAvatar(compressedFile);
                setAvatarPreview(URL.createObjectURL(compressedFile));
            } catch (err) {
                toast('error', 'Processing failed', err.message);
            }
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast('error', 'Passwords do not match');
        }
        try {
            await changePassword(currentPassword, newPassword);
            toast('success', 'Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast('error', 'Change failed', err.response?.data?.message || err.message);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await apiClient.get('/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `musclo_data_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast('success', 'Data exported successfully.');
        } catch (err) {
            toast('error', 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const handleRequestEmailChange = async () => {
        try {
            await requestEmailChange(email);
            setShowEmailModal(true);
            toast('success', 'Verification code sent to your new email.');
        } catch (err) {
            toast('error', 'Failed to send code', err.response?.data?.message || err.message);
        }
    };

    const handleVerifyEmail = async () => {
        try {
            await verifyEmailChange(verificationCode);
            setShowEmailModal(false);
            setVerificationCode('');
            toast('success', 'Email updated successfully!');
        } catch (err) {
            toast('error', 'Verification failed', err.response?.data?.message || err.message);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount(deletePassword);
            toast('success', 'Account deleted.');
            navigate('/login');
        } catch (err) {
            toast('error', 'Deletion failed', err.response?.data?.message || err.message);
        }
    };

    const isEmailChanged = email !== user?.email;

    if (loadingSettings) {
        return (
            <div className="min-h-screen bg-app flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-text-muted italic font-medium">Loading your account...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <motion.div {...MOTION.pageEnter} className="space-y-8">
                
                <header>
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">Account & Profile</h1>
                    <p className="text-text-secondary mt-1 text-sm">Manage your identity, security, and preferences.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Profile Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-divider/10 pb-4">
                                <User className="text-orange" size={22}/>
                                <h2 className="font-black text-xl uppercase tracking-tighter">Edit Profile</h2>
                            </div>

                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group">
                                    <Avatar name={name} src={avatarPreview || user?.avatar_url} size="lg" className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-neu" />
                                    
                                    {isUploadingAvatar ? (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-xl">
                                            <LoadingSpinner size="sm" color="white" />
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <Camera size={24} />
                                            <span className="text-[10px] font-black uppercase mt-1">Change</span>
                                        </button>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,image/heic,image/heif" onChange={handleAvatarUpload} />
                                </div>
                                <div className="flex-1 text-center sm:text-left space-y-1">
                                    <h3 className="font-black text-text-primary text-lg">{name || 'Your Name'}</h3>
                                    <p className="text-xs text-text-muted uppercase tracking-widest font-bold">{email}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input 
                                    label="Full Name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    icon={<User size={18}/>}
                                    placeholder="Enter your name"
                                />
                                <Input 
                                    label="Email Address" 
                                    type="email"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={<Mail size={18}/>}
                                    placeholder="your@email.com"
                                    disabled={!!user?.google_id}
                                    suffix={isEmailChanged && !user?.google_id && (
                                        <button 
                                            onClick={handleRequestEmailChange}
                                            className="px-3 py-1 bg-orange text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-neu active:scale-95 transition-all"
                                        >
                                            Verify
                                        </button>
                                    )}
                                />
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Bio / Motivation</label>
                                    <textarea 
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-app shadow-neu-inset rounded-2xl p-4 text-sm font-medium text-text-primary outline-none min-h-[100px] border border-transparent focus:border-orange/20 transition-all"
                                        placeholder="What drives you to train?"
                                    />
                                </div>
                            </div>

                            {/* Unit System */}
                            <div className="pt-4">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted mb-4 ml-1">
                                    <Globe size={14}/> Unit System
                                </label>
                                <div className="flex bg-divider/10 rounded-2xl p-1 shadow-neu-inset w-full max-w-xs">
                                    <button 
                                        onClick={() => setUnitSystem('metric')} 
                                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${unitSystem === 'metric' ? 'bg-app shadow-neu text-orange' : 'text-text-muted hover:text-text-secondary'}`}
                                    >
                                        Metric (kg)
                                    </button>
                                    <button 
                                        onClick={() => setUnitSystem('imperial')} 
                                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${unitSystem === 'imperial' ? 'bg-app shadow-neu text-orange' : 'text-text-muted hover:text-text-secondary'}`}
                                    >
                                        Imperial (lbs)
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    className="w-full sm:w-auto"
                                    onClick={handleSaveProfile}
                                    isLoading={isAuthLoading || updateSettingsHook.isPending}
                                >
                                    <Save size={18} className="mr-2"/> Save Profile Changes
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar: Security & Data */}
                    <div className="space-y-8">
                        
                        {/* Security Card */}
                        {!user?.google_id && (
                            <Card className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-divider/10 pb-4">
                                    <Lock className="text-orange" size={20}/>
                                    <h2 className="font-black text-lg uppercase tracking-tighter">Security</h2>
                                </div>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <Input 
                                        label="Current Password" 
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        icon={<Shield size={16}/>}
                                        required
                                    />
                                    <Input 
                                        label="New Password" 
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        icon={<Lock size={16}/>}
                                        required
                                    />
                                    <Input 
                                        label="Confirm New Password" 
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        icon={<CheckCircle2 size={16}/>}
                                        required
                                    />
                                    <Button 
                                        type="submit" 
                                        variant="secondary" 
                                        className="w-full"
                                        isLoading={isAuthLoading}
                                    >
                                        Update Password
                                    </Button>
                                </form>
                            </Card>
                        )}


                        {/* Data Card */}
                        <Card className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-divider/10 pb-4">
                                <Download className="text-orange" size={20}/>
                                <h2 className="font-black text-lg uppercase tracking-tighter">My Data</h2>
                            </div>
                            <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                                Export your entire workout logging history as a CSV spreadsheet for backup or analysis.
                            </p>
                            <Button 
                                variant="ghost" 
                                className="w-full border border-divider/10"
                                onClick={handleExport}
                                isLoading={isExporting}
                            >
                                <Download size={16} className="mr-2"/> Export Data (.csv)
                            </Button>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="space-y-4 border-2 border-danger/20 bg-danger/5">
                            <div className="flex items-center gap-3 border-b border-danger/10 pb-4">
                                <Trash2 className="text-danger" size={20}/>
                                <h2 className="font-black text-lg uppercase tracking-tighter text-danger">Danger Zone</h2>
                            </div>
                            <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                                Once you delete your account, there is no going back. All your data and photos will be permanently wiped.
                            </p>
                            <Button 
                                variant="danger" 
                                className="w-full"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash2 size={16} className="mr-2"/> Delete My Account
                            </Button>
                        </Card>
                    </div>

                </div>
            </motion.div>

            {/* Email Verification Modal */}
            <Modal
                open={showEmailModal}
                onOpenChange={setShowEmailModal}
                title="Verify New Email"
                description={`Enter the code sent to ${email}`}
                isLoading={isAuthLoading}
            >
                <div className="space-y-6 pt-4">
                    <Input 
                        label="Verification Code"
                        placeholder="6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="text-center text-2xl tracking-[0.5em]"
                        maxLength={6}
                    />
                    <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={handleVerifyEmail}
                        disabled={verificationCode.length !== 6}
                    >
                        Verify & Update Email
                    </Button>
                </div>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                title="Are you absolutely sure?"
                description="This action cannot be undone. Please enter your password to confirm account deletion."
                isLoading={isAuthLoading}
            >
                <div className="space-y-6 pt-4">
                    <Input 
                        label="Your Password"
                        type="password"
                        placeholder="Confirm password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        icon={<Lock size={18}/>}
                    />
                    <div className="flex flex-col gap-3">
                        <Button 
                            variant="danger" 
                            className="w-full"
                            onClick={handleDeleteAccount}
                            disabled={!deletePassword && !user?.google_id}
                        >
                            I understand, delete my account
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
