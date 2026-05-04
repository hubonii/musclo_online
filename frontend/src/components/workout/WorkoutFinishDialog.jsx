// Confirmation dialog shown before saving/finishing a workout.
import ConfirmDialog from '../ui/ConfirmDialog';
export default function WorkoutFinishDialog({ open, onOpenChange, completedSetsCount, onConfirm }) {
    // Injects `completedSetsCount` into confirmation dialog description text.
return (<ConfirmDialog open={open} onOpenChange={onOpenChange} title="Finish Workout" description={`You have completed ${completedSetsCount} sets. Ready to save?`} confirmLabel="Finish" variant="primary" onConfirm={onConfirm}/>);
}


