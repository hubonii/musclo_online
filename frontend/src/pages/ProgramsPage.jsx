// Programs list page with create and delete program flows.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Folder } from 'lucide-react';
import { usePrograms, useCreateProgram, useDeleteProgram } from '../hooks/usePrograms';
import { MOTION } from '../lib/motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import ProgramCard from '../components/programs/ProgramCard';
import Textarea from '../components/ui/Textarea';

export default function ProgramsPage() {
    const navigate = useNavigate();
    const { data: programs, isLoading } = usePrograms();
    const createProgram = useCreateProgram();
    const deleteProgram = useDeleteProgram();

const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [newProgramName, setNewProgramName] = useState('');
const [newProgramDesc, setNewProgramDesc] = useState('');
const [deleteModalProgram, setDeleteModalProgram] = useState(null);

    const handleCreateProgram = (e) => {
        e.preventDefault();
        if (!newProgramName.trim()) return;

        // Submits create mutation then resets modal/form state on success.
        createProgram.mutate({
            name: newProgramName.trim(),
            description: newProgramDesc.trim()
        }, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setNewProgramName('');
                setNewProgramDesc('');
            },
        });
    };

    const handleDeleteProgram = () => {
        if (!deleteModalProgram) return;
        // Deletes selected program id from confirmation dialog state.
        deleteProgram.mutate(deleteModalProgram.id, {
            onSuccess: () => setDeleteModalProgram(null),
        });
    };

return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto pb-24">
            <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text-primary">Programs</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Organize your workouts into training phases.</p>
                </div>
                <Button variant="primary" className="shrink-0 shadow-neu-sm" onClick={() => setIsCreateModalOpen(true)} isLoading={createProgram.isPending}>
                    <Plus size={20} className="mr-2"/>
                    New Program
                </Button>
            </motion.div>

            {isLoading ? (
                <LoadingSpinner size="lg" message="Loading programs..." className="min-h-[400px] py-20" />
            ) : !programs || programs.length === 0 ? (
                <EmptyState 
                    icon={<Folder size={48}/>} 
                    title="No Programs yet" 
                    description="Create your first training program (e.g., 'Summer Cut' or 'Hypertrophy Block') to group your workouts." 
                    action={
                        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                            Create Program
                        </Button>
                    }
                />
            ) : (
                // Cards are rendered from queried programs array after loading completes.
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" variants={MOTION.staggerContainer} initial="initial" animate="animate">
                    {programs.map((program) => (
                        <ProgramCard 
                            key={program.id} 
                            program={program} 
                            onClick={() => navigate(`/programs/${program.id}`)} 
                            onDelete={setDeleteModalProgram}
                        />
                    ))}
                </motion.div>
            )}

            {/* Create program modal */}
            <Modal open={isCreateModalOpen} onOpenChange={(open) => { if (!open) setIsCreateModalOpen(false); }} title="Create New Program">
                <form onSubmit={handleCreateProgram} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Program Name</label>
                        <Input placeholder="e.g., Summer Cut 2026" value={newProgramName} onChange={(e) => setNewProgramName(e.target.value)} className="w-full" autoFocus/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Description (Optional)</label>
                        <Textarea placeholder="What's the main goal of this program?" value={newProgramDesc} onChange={(e) => setNewProgramDesc(e.target.value)} className="h-24"/>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" isLoading={createProgram.isPending} disabled={!newProgramName.trim()}>
                            Save Program
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirmation modal */}
            <ConfirmDialog 
                open={!!deleteModalProgram} 
                onOpenChange={(open) => { if (!open) setDeleteModalProgram(null); }} 
                onConfirm={handleDeleteProgram} 
                title="Delete Program?" 
                description={`Are you sure you want to delete "${deleteModalProgram?.name}"? Its workouts will be untouched and simply become unassigned. This action cannot be undone.`} 
                confirmLabel="Delete Program" 
                variant="danger" 
                isLoading={deleteProgram.isPending}
            />
        </div>
    );
}


