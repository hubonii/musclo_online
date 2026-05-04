// Profile page: user summary, achievements, and shared routine cards.
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Trophy as TrophyIcon, Share2, Dumbbell, CalendarDays, TrendingUp, Settings as SettingsIcon, Lock as LockIcon, Camera, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useProfile, useAchievements, useSharedWorkouts } from '../hooks/useProfile';
import { MOTION } from '../lib/motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LevelBadge from '../components/profile/LevelBadge';
import AchievementBadge from '../components/profile/AchievementBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
// ChangePasswordModal removed - now integrated in settings
import { useState, useRef } from 'react';
import { useToast } from '../components/ui/Toast';
import { useThemeStore } from '../stores/useThemeStore';

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const authUser = useAuthStore(s => s.user);
    const logout = useAuthStore(s => s.logout);
    const { toast } = useToast();
    const { theme, toggleTheme } = useThemeStore();

    // `me` maps to current user profile when route param is missing.
    const resolvedUserId = id || 'me';

    // Hook set loads profile body, achievements, and routine cards for target user.
    const { data: profile, isLoading: isLoadingProfile } = useProfile(resolvedUserId);
    const { data: achievements = [], isLoading: isLoadingAchievements } = useAchievements(resolvedUserId);
    const { data: routines = [], isLoading: isLoadingRoutines } = useSharedWorkouts(resolvedUserId);

    // Controls owner-only actions such as navigating to editable settings.
    const isOwnProfile = !id || (authUser?.id && parseInt(id, 10) === authUser.id);


    if (isLoadingProfile) {
        // Initial profile query loading state.
        return (
            <div className="min-h-screen bg-app flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" message="Preparing your profile..." />
            </div>
        );
    }

    if (!profile) {
        // API returned empty target profile.
        return <div className="text-center p-12 text-text-muted">Profile not found.</div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <motion.div {...MOTION.pageEnter} className="space-y-6 md:space-y-8">

                {/* Mobile Quick Actions (Theme & Logout) */}
                {isOwnProfile && (
                    <div className="flex justify-end gap-2 md:hidden">
                        <button
                            onClick={toggleTheme}
                            className="p-3 bg-surface shadow-neu rounded-2xl text-text-secondary active:scale-95 transition-transform"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={logout}
                            className="p-3 bg-surface shadow-neu rounded-2xl text-danger/80 active:scale-95 transition-transform"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
                {/* Hero card with avatar, bio, level, and profile actions. */}
                <Card className="flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald/20 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <Avatar
                            name={profile.name}
                            src={profile.avatar_url}
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-neu border-4 border-white"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10 w-full">
                        <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight break-words">{profile.name}</h1>
                        <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto md:mx-0 break-words line-clamp-4">{profile.bio || 'This lifter prefers to let their weights do the talking.'}</p>

                        <div className="mt-4 flex justify-center md:justify-start">
                            <LevelBadge level={profile.level?.number || 1} title={profile.level?.title || 'Beginner'} progress={profile.level?.progress || 0} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10 w-full md:w-auto">
                        {isOwnProfile && (
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <Button variant="secondary" className="w-full flex items-center gap-2" onClick={() => navigate('/settings')}>
                                    <SettingsIcon size={16} /> Account Settings
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* High-level stats strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <Card className="flex flex-col items-center justify-center text-center p-6 md:p-8">
                        <Dumbbell className="text-tertiary mb-2 md:mb-3 opacity-80" size={24} />
                        <h3 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter mb-1 truncate w-full">
                            {profile.stats?.total_workouts || 0}
                        </h3>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary">Total Workouts</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center text-center p-6 md:p-8">
                        <TrendingUp className="text-emerald mb-2 md:mb-3 opacity-80" size={24} />
                        <h3 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter mb-1 truncate w-full">
                            {((profile.stats?.total_volume || 0) / 1000).toFixed(1)} <span className="text-xl md:text-2xl text-text-muted">t</span>
                        </h3>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary">Lifetime Volume</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center text-center p-6 md:p-8">
                        <CalendarDays className="text-tertiary mb-2 md:mb-3 opacity-80" size={24} />
                        <h3 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter mb-1 truncate w-full">
                            {profile.stats?.current_streak || 0} <span className="text-xl md:text-2xl text-text-muted">🔥</span>
                        </h3>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-secondary">Current Streak</p>
                    </Card>
                </div>

                {/* Achievement gallery */}
                <Card>
                    <div className="flex items-center gap-3 border-b border-divider/10 pb-4 mb-6">
                        <TrophyIcon className="text-orange" size={22} />
                        <h2 className="font-black text-text-primary text-xl uppercase tracking-tighter">Achievements</h2>
                    </div>
                    {isLoadingAchievements ? (
                        <div className="h-32 flex flex-col items-center justify-center">
                            <LoadingSpinner size="md" message="Loading achievements..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3 md:gap-4 w-full max-w-full overflow-hidden">
                            {(achievements || []).map((ach) => (
                                <AchievementBadge key={ach.id} {...ach} />
                            ))}
                            {(achievements || []).length === 0 && (
                                <p className="col-span-full text-center text-[10px] font-black uppercase text-text-muted py-8 tracking-widest opacity-50">No achievements yet</p>
                            )}
                        </div>
                    )}
                </Card>

                {/* Public routines section (if any) */}
                <Card>
                    <div className="flex items-center justify-between border-b border-divider/10 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <Share2 className="text-orange" size={22} />
                            <h2 className="font-black text-text-primary text-xl uppercase tracking-tighter">Shared Routines</h2>
                        </div>
                    </div>
                    {isLoadingRoutines ? (
                        <div className="h-32 flex flex-col items-center justify-center">
                            <LoadingSpinner size="md" message="Loading routines..." />
                        </div>
                    ) : (routines || []).length === 0 ? (
                        <div className="text-center py-12 text-text-muted border-2 border-dashed border-divider/10 rounded-3xl opacity-50">
                            <Dumbbell size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No shared routines found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4 w-full max-w-full">
                            {(routines || []).map((routine) => (
                                <div key={routine.id} className="w-full px-1 py-1 min-w-0">
                                    <div className="bg-app shadow-neu rounded-3xl p-6 border border-divider/10 flex flex-col h-full hover:shadow-neu-orange/5 transition-all overflow-hidden">
                                        <h3 className="font-black text-text-primary mb-2 line-clamp-1 uppercase tracking-tight break-words">{routine.name}</h3>
                                        <p className="text-[11px] text-text-secondary mb-4 flex-1 line-clamp-2 font-medium break-words">
                                            {routine.notes || 'No notes provided.'}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[9px] font-black bg-orange/10 px-2 py-1 rounded-md text-orange uppercase tracking-widest">
                                                {routine.exercises_count} Exercises
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

            </motion.div>

            {/* ChangePasswordModal removed - now integrated in settings */}
        </div>
    );
}

