// Floating AI coach chat entry point and panel container.
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Dumbbell, Square, User as UserIcon, Trash2, ArrowUpCircle, Image as ImageIcon, History as HistoryIcon, Plus, BrainCircuit, Activity as ActivityIcon, ChevronDown as ChevronDownIcon, Cpu as CpuIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAIChatStore } from '../../stores/useAIChatStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useCreateProgramFromAI } from '../../hooks/usePrograms';
import { cn } from '../../lib/utils';
import { API_URL } from '../../api/axios';
import { useAuthStore } from '../../stores/useAuthStore';
import Textarea from '../ui/Textarea';

const WORKOUT_PLAN_TAG_REGEX = /<workout_plan_json>([\s\S]*?)<\/workout_plan_json>/;
const WORKOUT_PLAN_MD_REGEX = /```(?:json)?\s*(\{[\s\S]*?"routines":[\s\S]*?\})\s*```/;
const WORKOUT_PLAN_LOOSE_REGEX = /(\{[\s\S]*?"routines":[\s\S]*?\})/;
const STREAMING_WORKOUT_PLAN_REGEX = /(?:<workout_plan_json>|```(?:json)?\s*\{[\s\S]*?"routines"|\{[\s\S]*?"routines":)[\s\S]*/;

const SUGGESTED_PROMPTS = [
    "Analyze my current training volume",
    "How to optimize RPE for hypertrophy?",
    "Suggest a plateau breaker for Bench Press",
    "Review my muscle group balance"
];

// Curated models for different tasks.
const FREE_MODELS = [
    { id: 'openai/gpt-oss-120b:free', name: 'GPT OSS 120B', desc: 'Maximum Reasoning' },
];

const DEFAULT_MODEL_ID = FREE_MODELS[0].id;

export default function AIChatComponent() {
    const {
        isOpen, messages, isLoading, error, abortController, sessions,
        currentSessionId, closeChat, toggleChat,
        addUserMessage, addAssistantMessage, setStreaming,
        finalizeStreaming, setLoading, setError, setAbortController,
        fetchSessions, selectSession, createNewSession, deleteSession
    } = useAIChatStore();

    const isActive = useWorkoutStore(state => state.isActive);
    const exercises = useWorkoutStore(state => state.exercises);
    const routineName = useWorkoutStore(state => state.routineName);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    const { mutate: saveAIProgram, isLoading: isSavingProgram } = useCreateProgramFromAI();

    const [input, setInput] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const modelPickerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchSessions();
            const storedSessionId = localStorage.getItem('musclo-ai-session');
            if (storedSessionId && !currentSessionId) {
                selectSession(storedSessionId);
            }
        }
    }, [isOpen, isAuthenticated]);

    useEffect(() => {
        if (messagesEndRef.current)
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);





    const handleStop = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setLoading(false);
            const lastMsg = messages[messages.length - 1];
            if (lastMsg?.id) finalizeStreaming(lastMsg.id);
        }
    };



    const handleSend = async (msgOverride) => {
        const textToSend = msgOverride || input;
        if (!msgOverride) {
            setInput('');
        }

        if (!textToSend.trim() || isLoading) return;

        if (!isAuthenticated) {
            setError('Authentication required for Musclo AI access.');
            return;
        }setError(null);

        addUserMessage(textToSend);
        setLoading(true);
        setError(null);

        const workoutContext = isActive ? {
            is_active: true,
            routine_name: routineName,
            exercises: exercises.map(ex => ({
                id: ex.exerciseId,
                name: ex.exerciseName,
                sets_completed: ex.sets.filter(s => s.isCompleted).length,
                total_sets: ex.sets.length,
                current_weight: ex.sets[ex.sets.length - 1]?.weight_kg || 0
            }))
        } : null;

        const controller = new AbortController();
        setAbortController(controller);

        try {
            // Get CSRF from cookie safely
            let xsrfToken = '';
            try {
                const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
                if (match?.[1]) xsrfToken = decodeURIComponent(match[1]);
            } catch (e) {
                console.warn('[AIChat] Failed to parse XSRF token:', e);
            }

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'Authorization': `Bearer ${localStorage.getItem('musclo-token') || ''}`,
                    'X-XSRF-TOKEN': xsrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: textToSend,
                    session_id: currentSessionId,
                    workout_context: workoutContext
                })
            });

            if (!response.ok) throw new Error(response.status === 401 ? 'Session expired.' : 'Neural link failed.');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            const assistantMsgId = addAssistantMessage('');
            let fullContent = '';

            if (reader) {
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine.startsWith('data: ')) continue;
                        const data = trimmedLine.slice(6);
                        if (data === '[DONE]') {
                            finalizeStreaming(assistantMsgId);
                            break;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.content || '';
                            fullContent += content;
                            setStreaming(assistantMsgId, fullContent);
                        } catch (e) { }
                    }
                }
            }
            // Stream ended — finalize if not already done via [DONE] signal.
            finalizeStreaming(assistantMsgId);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message || 'Signal lost.');
            }
        } finally {
            // Always unlock input when everything is done.
            setLoading(false);
            setAbortController(null);
        }
    };

    return (
        <>
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={toggleChat} aria-label="Musclo AI" type="button"
                    className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-orange text-white rounded-[24px] shadow-neu-orange flex items-center justify-center z-50 transition-all border-4 border-white/10"
                >
                    <BrainCircuit size={28} />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] md:inset-auto md:bottom-8 md:right-8 flex flex-col pointer-events-none p-0 md:p-0">
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="bg-app border border-white/20 shadow-neu-lg md:rounded-[40px] w-full h-full md:w-[750px] md:h-[88vh] flex flex-col pointer-events-auto overflow-hidden relative"
                        >
                            <div className="p-5 flex flex-col gap-3 border-b border-divider bg-surface z-20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setShowHistory(!showHistory)} className="p-3 bg-app shadow-neu-sm rounded-2xl transition-all text-text-muted hover:text-orange active:shadow-neu-inset">
                                            <HistoryIcon size={20} />
                                        </button>
                                        <div>
                                            <h2 className="font-black text-text-primary text-sm tracking-tight uppercase">
                                                {currentSessionId ? sessions.find(s => s.id === currentSessionId)?.title : 'Bodybuilding AI'}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-orange shadow-[0_0_8px_rgba(234,88,12,0.6)] animate-pulse" />
                                                <span className="text-[10px] text-orange font-black uppercase tracking-widest">AI Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={createNewSession} title="New Chat" className="p-3 bg-app shadow-neu-sm text-text-muted hover:text-orange rounded-2xl transition-all active:shadow-neu-inset">
                                            <Plus size={20} />
                                        </button>
                                        <button onClick={closeChat} className="p-3 bg-app shadow-neu-sm text-text-muted hover:text-danger rounded-2xl active:shadow-neu-inset transition-all">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <div className="flex-1 relative flex overflow-hidden">
                                <AnimatePresence>
                                    {showHistory && (
                                        <motion.div initial={{ x: -350 }} animate={{ x: 0 }} exit={{ x: -350 }} className="absolute inset-y-0 left-0 w-72 bg-surface border-r border-divider z-30 shadow-neu-lg p-5 flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Session Logs</h3>
                                                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-divider/10 rounded-xl transition-all"><X size={16} /></button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                                                {sessions.map(s => (
                                                    <div key={s.id} className="group relative">
                                                        <button
                                                            onClick={() => { selectSession(s.id); setShowHistory(false); }}
                                                            className={cn("w-full text-left p-4 rounded-2xl text-[11px] font-bold transition-all truncate pr-10 shadow-neu-sm", currentSessionId === s.id ? "bg-orange text-white shadow-neu-orange" : "bg-app text-text-secondary hover:shadow-neu-inset")}
                                                        >
                                                            {s.title || 'Untitled Session'}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSession(s.id)}
                                                            className={cn("absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/20 transition-all", currentSessionId === s.id ? "text-white" : "text-text-muted hover:text-danger")}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-10 scrollbar-hide bg-app/30">
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8">
                                            <div className="w-24 h-24 rounded-[40px] bg-orange text-white flex items-center justify-center shadow-neu-orange border-4 border-white/10">
                                                <BrainCircuit size={48} />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-text-primary tracking-tighter uppercase">MUSCLO <span className="text-orange">AI</span></h3>
                                                <p className="text-sm text-text-secondary mt-3 leading-relaxed font-medium uppercase tracking-wide opacity-70">
                                                    Your personal bodybuilding assistant.
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                                                {SUGGESTED_PROMPTS.map(p => (
                                                    <button key={p} onClick={() => handleSend(p)} className="p-4 bg-surface shadow-neu-sm rounded-2xl text-[10px] font-black text-text-secondary hover:text-orange hover:shadow-neu-orange/20 transition-all text-left uppercase leading-tight tracking-wider">
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg) => (
                                        <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col gap-4 w-full", msg.role === 'user' ? "items-end" : "items-start")}>
                                            <div className={cn("flex gap-5 max-w-[88%] min-w-0", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                                <div className={cn("w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-neu-sm", msg.role === 'user' ? "bg-orange text-white shadow-neu-orange" : "bg-surface text-orange border border-divider/10")}>
                                                    {msg.role === 'user' ? <UserIcon size={24} /> : <BrainCircuit size={24} />}
                                                </div>
                                                <div className="flex flex-col gap-4 flex-1 min-w-0">
                                                    {msg.image_url && (
                                                        <div className="rounded-[24px] overflow-hidden shadow-neu-sm border-4 border-white/20 max-w-[280px]">
                                                            <img src={msg.image_url} alt="Reference" className="w-full h-auto object-cover" />
                                                        </div>
                                                    )}

                                                    <div className={cn("p-6 rounded-[32px] text-[15px] leading-[1.8] shadow-neu-sm overflow-hidden", msg.role === 'user' ? "bg-orange text-white" : "bg-surface text-text-primary font-medium border border-white/5")}>
                                                        {/* Thinking indicator */}
                                                        {msg.role === 'assistant' && msg.isStreaming && !msg.content && (
                                                            <div className="flex items-center gap-3 py-2 px-1">
                                                                <div className="relative flex items-center justify-center w-6 h-6">
                                                                    <span className="absolute w-6 h-6 rounded-full bg-orange/20" style={{ animation: 'thinkingPulse 2s ease-in-out infinite' }} />
                                                                    <BrainCircuit size={14} className="relative text-orange" style={{ animation: 'thinkingSpin 3s linear infinite' }} />
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-[13px] font-bold text-text-secondary" style={{ animation: 'thinkingFade 1.8s ease-in-out infinite' }}>Thinking</span>
                                                                    <span className="flex gap-[2px] mt-[2px]">
                                                                        <span className="w-[3px] h-[3px] rounded-full bg-orange/60" style={{ animation: 'thinkingDot 1.4s ease-in-out infinite', animationDelay: '0ms' }} />
                                                                        <span className="w-[3px] h-[3px] rounded-full bg-orange/60" style={{ animation: 'thinkingDot 1.4s ease-in-out infinite', animationDelay: '200ms' }} />
                                                                        <span className="w-[3px] h-[3px] rounded-full bg-orange/60" style={{ animation: 'thinkingDot 1.4s ease-in-out infinite', animationDelay: '400ms' }} />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Streaming text with blinking cursor */}
                                                        {msg.content && (
                                                            <div className="prose prose-sm dark:prose-invert max-w-none break-words space-y-4">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-4 rounded-2xl border border-divider"><table className="min-w-full divide-y divide-divider" {...props} /></div>,
                                                                        th: ({ node, ...props }) => <th className="px-4 py-3 bg-app text-left text-[11px] font-black uppercase tracking-wider text-text-muted" {...props} />,
                                                                        td: ({ node, ...props }) => <td className="px-4 py-3 text-[13px] border-t border-divider" {...props} />,
                                                                        h3: ({ node, ...props }) => <h3 className="text-orange font-black uppercase tracking-tight text-sm mt-6 mb-2" {...props} />,
                                                                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />
                                                                    }}
                                                                >
                                                                    {msg.content.replace(STREAMING_WORKOUT_PLAN_REGEX, '').trim()}
                                                                </ReactMarkdown>
                                                                
                                                                {/* Save Program Button if JSON block detected */}
                                                                {msg.role === 'assistant' && !msg.isStreaming && (msg.content.match(WORKOUT_PLAN_TAG_REGEX) || msg.content.match(WORKOUT_PLAN_MD_REGEX) || msg.content.match(WORKOUT_PLAN_LOOSE_REGEX)) && (
                                                                    <div className="mt-6 p-4 bg-app/50 rounded-3xl border border-white/5 shadow-neu-inset">
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
                                                                                    <Dumbbell size={18} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[11px] font-black uppercase tracking-widest text-text-primary">Workout Plan Detected</p>
                                                                                    <p className="text-[10px] text-text-muted uppercase font-bold">Save this plan to your library</p>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    try {
                                                                                        const tagMatch = msg.content.match(WORKOUT_PLAN_TAG_REGEX);
                                                                                        const mdMatch = msg.content.match(WORKOUT_PLAN_MD_REGEX);
                                                                                        const looseMatch = msg.content.match(WORKOUT_PLAN_LOOSE_REGEX);
                                                                                        const jsonStr = tagMatch ? tagMatch[1] : (mdMatch ? mdMatch[1] : (looseMatch ? looseMatch[1] : null));
                                                                                        if (jsonStr) {
                                                                                            const data = JSON.parse(jsonStr);
                                                                                            saveAIProgram(data);
                                                                                        }
                                                                                    } catch (e) {
                                                                                        console.error('Failed to parse AI program:', e);
                                                                                    }
                                                                                }}
                                                                                disabled={isSavingProgram}
                                                                                className="px-5 py-2.5 bg-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-neu-orange hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                                                                            >
                                                                                {isSavingProgram ? 'Saving...' : 'Save to Programs'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {msg.isStreaming && (
                                                                    <span className="inline-block w-[3px] h-[1.1em] bg-orange/80 ml-0.5 align-middle rounded-full" style={{ animation: 'cursorBlink 0.8s steps(1) infinite' }} />
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* Non-streaming, non-empty message (history) */}
                                                        {!msg.isStreaming && !msg.content && msg.role !== 'assistant' && (
                                                            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-6 bg-surface border-t border-divider relative z-20">
                                <div className={cn("flex items-end gap-3 bg-app p-3 rounded-[32px] shadow-neu-inset transition-all focus-within:ring-4 focus-within:ring-orange/10", isLoading && "opacity-60")}>
                                    <Textarea
                                        ref={textareaRef} value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (!isLoading) handleSend();
                                            }
                                        }}
                                        disabled={isLoading}
                                        placeholder={isLoading ? "Wait for response or stop..." : "Ask Musclo AI..."}
                                        className="flex-1 bg-transparent shadow-none focus:shadow-none focus:ring-0 max-h-[150px] scrollbar-hide py-3.5 px-2 text-[14px] font-bold text-text-primary placeholder:text-text-muted/50 disabled:cursor-not-allowed"
                                        rows={1}
                                    />

                                    {isLoading ? (
                                        <button onClick={handleStop} className="p-3.5 bg-danger/10 text-danger rounded-2xl flex items-center justify-center hover:bg-danger/20 transition-all shadow-sm"><Square size={20} fill="currentColor" /></button>
                                    ) : (
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={!input.trim()}
                                            className={cn("p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-neu-sm", input.trim() ? "bg-orange text-white shadow-neu-orange" : "bg-app text-text-muted opacity-40")}
                                        >
                                            <ArrowUpCircle size={24} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                {error && <p className="text-[10px] text-danger font-black uppercase mt-3 text-center tracking-[0.1em] animate-pulse">{error}</p>}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
