// Progress timeline page for measurements and progress photo sessions.
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import { useProgressPageData } from '../hooks/useProgressPageData';
import { MOTION } from '../lib/motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MeasurementAccordion from '../components/progress/MeasurementAccordion';
import UploadSessionHeader from '../components/progress/UploadSessionHeader';
import ProgressSessionCard from '../components/progress/ProgressSessionCard';

export default function ProgressPage() {
    const { 
        measurements, 
        isLoading, 
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
    } = useProgressPageData();

    if (isLoading) {
        // Block page body until measurements/photos timeline data is ready.
return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
                <LoadingSpinner size="lg" message="Loading your progress..." />
            </div>
        );
    }

return (
        <div className="p-5 md:p-8 max-w-5xl mx-auto pb-32">
            <motion.div {...MOTION.pageEnter} className="space-y-10 md:space-y-12 mt-6">
                {/* Page header */}
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-app shadow-neu flex items-center justify-center text-orange hidden md:flex shrink-0">
                            <ImageIcon size={20}/>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-text-primary tracking-tight">Progress Timeline</h1>
                            <p className="text-xs md:text-sm text-text-secondary mt-0.5">Track your body stats and photos</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full uppercase tracking-widest text-[10px] font-black">
                        Manage
                    </Button>
                </div>

                {/* Measurement editor section */}
                <MeasurementAccordion 
                    isOpen={isMeasurementsOpen} 
                    onToggle={() => setIsMeasurementsOpen(!isMeasurementsOpen)} 
                    measurementForm={measurementForm} 
                    setMeasurementForm={setMeasurementForm} 
                    onSave={handleSaveMeasurements} 
                    isSaving={isAddingMeasurement || isUpdatingMeasurement}
                />

                {/* Upload controls + grouped timeline sessions */}
                <div className="space-y-4 md:space-y-6">
                    <UploadSessionHeader 
                        selectedPose={selectedUploadPose} 
                        setSelectedPose={setSelectedUploadPose} 
                        onUploadClick={() => fileInputRef.current?.click()} 
                        isUploading={isUploadingPhoto} 
                        fileInputRef={fileInputRef} 
                        onFileChange={handleFileChange}
                    />

                     {sortedDates.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-6 md:p-12 text-center min-h-[200px]">
                            <ImageIcon size={32} className="text-text-muted/50 mb-3"/>
                            <h3 className="text-base font-bold text-text-primary">No photos yet</h3>
                            <p className="text-xs text-text-secondary mt-1 max-w-sm">
                                Visual progress is highly motivating.
                            </p>
                        </Card>
                    ) : (
                        // Each date key renders one grouped progress session card.
                        <div className="space-y-10 md:space-y-12">
                            <AnimatePresence>
                                {sortedDates.map((date) => {
                                    const session = sessionsByDate[date];
                                    // Resolves matching measurement by explicit id or same date fallback.
                                    const measurement = (measurements || []).find((m) => m.id === session.measurement_id || m.date === date);
return (
                                        <ProgressSessionCard 
                                            key={date} 
                                            date={date} 
                                            session={session} 
                                            measurement={measurement} 
                                            onDeletePhoto={handleDeletePhoto}
                                        />
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    );
}

