// Orchestrates progress page forms, uploads, and grouped timeline data.
import { useState, useRef } from 'react';
import { useMeasurements, useAddMeasurement, useUpdateMeasurement } from './useMeasurements';
import { useProgressPhotos, useUploadProgressPhoto, useDeleteProgressPhoto } from './useProgressPhotos';
import { useToast } from '../components/ui/Toast';
import { useMemoryStore } from '../stores/useMemoryStore';
import { groupPhotosByDate, getTodayString } from '../lib/utils';
export function useProgressPageData() {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const { data: measurements = [], isLoading: isLoadingMeasurements } = useMeasurements();
    const { mutateAsync: addMeasurement, isPending: isAddingMeasurement } = useAddMeasurement();
    const { mutateAsync: updateMeasurement, isPending: isUpdatingMeasurement } = useUpdateMeasurement();
    const { data: photos = [], isLoading: isLoadingPhotos } = useProgressPhotos();
    const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useUploadProgressPhoto();
    const { mutateAsync: deletePhoto } = useDeleteProgressPhoto();
    const {
        progressIsMeasurementsOpen: isMeasurementsOpen,
        setProgressIsMeasurementsOpen: setIsMeasurementsOpen,
        progressSelectedUploadPose: selectedUploadPose,
        setProgressSelectedUploadPose: setSelectedUploadPose
    } = useMemoryStore();
    const [measurementForm, setMeasurementForm] = useState({
        weight_kg: '', chest_cm: '', waist_cm: '', left_arm_cm: '', right_arm_cm: '',
        left_leg_cm: '', right_leg_cm: '', calves_cm: '', shoulders_cm: '',
        neck_cm: '', body_fat_percent: '', notes: ''
    });
    const handleSaveMeasurements = async (e) => {
        // Build payload from non-empty form fields only.
        e.preventDefault();
        const payload = { date: getTodayString() };
        let hasData = false;
        Object.entries(measurementForm).forEach(([key, val]) => {
            if (val.trim() !== '') {
                payload[key] = key === 'notes' ? val : Number(val);
                hasData = true;
            }
        });
        if (!hasData) {
            toast('error', 'Empty Form', 'Please enter at least one measurement.');
            return;
        }
        try {
            const todayMeasurement = measurements.find((m) => m.date === getTodayString());
            // Date-keyed upsert flow: updates existing daily record or creates a new row.
            if (todayMeasurement) {
                await updateMeasurement({
                    id: todayMeasurement.id,
                    date: getTodayString(),
                    ...payload
                });
            }
            else {
                await addMeasurement({
                    date: getTodayString(),
                    ...payload
                });
            }
            toast('success', 'Measurements Logged', 'Body measurements saved.');
            setMeasurementForm({
                weight_kg: '', chest_cm: '', waist_cm: '', left_arm_cm: '', right_arm_cm: '',
                left_leg_cm: '', right_leg_cm: '', calves_cm: '', shoulders_cm: '',
                neck_cm: '', body_fat_percent: '', notes: ''
            });
            setIsMeasurementsOpen(false);
        }
        catch (error) {
            toast('error', 'Error', 'Failed to save measurements.');
        }
    };
    const handleFileChange = async (e) => {
        // Upload one selected photo and attach today's measurement when available.
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            toast('error', 'File too large', 'Maximum photo size is 5MB.');
            return;
        }
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('pose', selectedUploadPose);
        formData.append('taken_at', getTodayString());
        const todayMeasurement = measurements.find(m => m.date === getTodayString());
        if (todayMeasurement) {
            // Attaches measurement foreign key when a same-day measurement exists.
            formData.append('measurement_id', todayMeasurement.id.toString());
        }
        try {
            await uploadPhoto(formData);
            toast('success', 'Photo Uploaded', 'Your progress photo was saved.');
        }
        catch (error) {
            toast('error', 'Upload Failed', 'Could not upload the photo.');
        }
        finally {
            if (fileInputRef.current) {
                // Resets input element state to allow re-selecting the same file name.
                fileInputRef.current.value = '';
            }
        }
    };
    const handleDeletePhoto = async (id) => {
        if (!confirm('Are you sure you want to delete this photo?'))
            return;
        try {
            await deletePhoto(id);
            toast('success', 'Photo Deleted', 'The photo has been removed.');
        }
        catch (error) {
            toast('error', 'Error', 'Could not delete the photo.');
        }
    };
    const { sessionsByDate, sortedDates } = groupPhotosByDate(photos);
    return {
        measurements,
        isLoading: isLoadingMeasurements || isLoadingPhotos,
        isMeasurementsOpen,
        setIsMeasurementsOpen,
        selectedUploadPose,
        setSelectedUploadPose,
        measurementForm,
        setMeasurementForm,
        fileInputRef,
        isAddingMeasurement,
        isUpdatingMeasurement,
        isUploadingPhoto,
        handleSaveMeasurements,
        handleFileChange,
        handleDeletePhoto,
        sessionsByDate,
        sortedDates
    };
}


