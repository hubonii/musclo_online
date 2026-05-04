// Dashboard preview strip for recent progress photos and metrics.
import { Image as ImageIcon } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressSessionCard from '../progress/ProgressSessionCard';
import { groupPhotosByDate } from '../../lib/utils';
export default function ProgressGallery({ progressPhotos, measurements, onManage }) {
    // Normalize raw photos into date-based sessions used by the timeline UI.
    const { sessionsByDate, sortedDates } = groupPhotosByDate(progressPhotos);
return (<div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                    <ImageIcon size={22} className="text-orange"/>
                    Progress Timeline
                </h3>
                <Button variant="outline" size="sm" onClick={onManage} className="text-[10px] px-3 h-8 rounded-xl font-black uppercase tracking-widest shadow-neu-sm border-orange/10 hover:text-orange">
                    MANAGE
                </Button>
            </div>

            {sortedDates.length === 0 ? (<Card className="flex flex-col items-center justify-center p-12 text-center bg-neu shadow-neu-inset">
                    <ImageIcon size={40} className="text-text-muted/20 mb-4"/>
                    <p className="text-[11px] font-black uppercase text-text-muted tracking-[0.2em]">No progress photos yet</p>
                    <Button variant="primary" size="sm" className="mt-8 font-black uppercase tracking-widest shadow-neu-orange/20" onClick={onManage}>Upload Photo</Button>
                </Card>) : (<div className="space-y-10">
                    {/* Dashboard shows only a preview; full history remains in Progress page. */}
                    {sortedDates.slice(0, 3).map((date) => {
                const session = sessionsByDate[date];
                // Measurement lookup order: `measurement_id` relation, then same-date relation.
                const measurement = measurements.find(m => m.id === session.measurement_id || m.date === date);
return (<ProgressSessionCard key={date} date={date} session={session} measurement={measurement} onSessionClick={onManage} allowDelete={false} showOtherPhotos={false} compact/>);
            })}

                    {sortedDates.length > 3 && (<div className="text-center pt-2">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={onManage}>
                                View All {sortedDates.length} Logs
                            </Button>
                        </div>)}
                </div>)}
        </div>);
}

