// Header controls for pose selection and photo upload trigger.
import React from 'react';
import { Camera, Plus } from 'lucide-react';
import Button from '../ui/Button';
// Combines pose selector and file-upload action controls.
export default function UploadSessionHeader({ selectedPose, setSelectedPose, onUploadClick, isUploading, fileInputRef, onFileChange }) {
    const poses = ['front', 'back', 'side'];
return (<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <h2 className="text-base md:text-2xl font-black text-text-primary flex items-center gap-2 tracking-tight">
                <Camera className="text-orange shrink-0" size={20}/>
                Progress Gallery
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-divider/10 px-2 py-1 rounded-md">View:</span>
                
                <div className="flex p-1 bg-app rounded-2xl shadow-neu-inset border border-orange/5">
                    {/* Pose tabs update the upload context used when saving the photo. */}
                    {poses.map(p => (<button key={p} onClick={() => setSelectedPose(p)} className={`px-4 py-2 text-[10px] font-black rounded-xl capitalize transition-all tracking-widest ${selectedPose === p ? 'bg-orange shadow-neu-orange text-white' : 'text-text-muted hover:text-orange'}`} type="button">
                            {p}
                        </button>))}
                </div>

                {/* File input stays hidden; upload button triggers click via ref from parent. */}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={onFileChange}/>

                <Button variant="primary" size="sm" icon={<Plus size={16} strokeWidth={3}/>} onClick={onUploadClick} isLoading={isUploading} className="h-10 md:h-12 px-6 font-black uppercase tracking-widest shadow-neu-orange/10">
                    Add Photo
                </Button>
            </div>
        </div>);
}

