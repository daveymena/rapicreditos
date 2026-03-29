import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Bot, Save, Sparkles, Wand2, Stethoscope, Briefcase, ShoppingCart, Home, Code, GraduationCap, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const NICHES = [
    { id: 'sales', name: 'Ventas & E-commerce', icon: <ShoppingCart />, prompt: 'Eres un experto cerrador de ventas. Tu objetivo es convertir cada consulta en una compra.' },
    { id: 'medical', name: 'Servicios Médicos', icon: <Stethoscope />, prompt: 'Eres un asistente médico profesional. Ayudas a agendar citas y das información básica de salud sin recetar.' },
    { id: 'realestate', name: 'Inmobiliaria', icon: <Home />, prompt: 'Eres un asesor inmobiliario de lujo. Tu tono es sofisticado y conoces todas las propiedades.' },
    { id: 'legal', name: 'Legal & Abogados', icon: <Briefcase />, prompt: 'Eres un asistente legal diligente. Ayudas con consultas básicas y agendamiento de asesorías.' },
    { id: 'edu', name: 'Educación', icon: <GraduationCap />, prompt: 'Eres un tutor inteligente. Ayudas a los estudiantes a entender conceptos difíciles de forma simple.' },
    { id: 'dev', name: 'Soporte Técnico', icon: <Code />, prompt: 'Eres un ingeniero de soporte nivel 3. Solucionas problemas técnicos con paciencia y claridad.' },
];

export default function AgentsPage() {
    const { user } = useAuth();
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState<any>(null);

    useEffect(() => {
        if (user) fetchAgents();
    }, [user]);

    async function fetchAgents() {
        const { data, error } = await supabase
            .from('ai_agents')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (error) toast.error('Error al cargar agentes');
        else setAgents(data || []);
        setLoading(false);
    }

    async function createAgent() {
        if (!user) return;
        setSaving(true);

        const newAgent = {
            user_id: user.id,
            name: 'Nuevo Agente',
            system_prompt: 'Eres un asistente IA inteligente y servicial.',
            model_name: 'qwen2.5:3b',
            temperature: 0.7
        };

        const { data, error } = await supabase
            .from('ai_agents')
            .insert([newAgent])
            .select();

        if (error) toast.error('Error al crear agente');
        else {
            toast.success('Agente configurado');
            setAgents([data[0], ...agents]);
        }
        setSaving(false);
    }

    async function updateAgent(id: string, updates: any) {
        setSaving(true);
        const { error } = await supabase
            .from('ai_agents')
            .update(updates)
            .eq('id', id);

        if (error) toast.error('Error al guardar');
        else {
            toast.success('Agente actualizado correctamente');
            fetchAgents();
        }
        setSaving(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 pb-20"
        >
            <div className="glass p-12 rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">Mentes <span className="text-primary italic">Maestras</span></h1>
                        <p className="text-white/50 text-xl max-w-xl">Entrena a tu IA con inteligencia específica para dominar cualquier industria.</p>
                    </div>
                    <button
                        onClick={createAgent}
                        disabled={saving}
                        className="btn-premium flex items-center gap-3 scale-110 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                        Crear Agente
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
                    <Wand2 className="text-primary" /> Selector de Oficio <span className="text-white/20 text-sm font-normal">(Inteligencia Pre-configurada)</span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {NICHES.map((niche) => (
                        <motion.div
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={niche.id}
                            onClick={() => {
                                setSelectedNiche(niche);
                                toast.info(`Estrategia para ${niche.name} seleccionada`);
                            }}
                            className={`glass p-6 rounded-[2.5rem] text-center cursor-pointer transition-all border-white/5
                ${selectedNiche?.id === niche.id ? 'bg-primary/20 border-primary/50 shadow-2xl shadow-primary/20' : 'hover:bg-white/10'}
              `}
                        >
                            <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors
                ${selectedNiche?.id === niche.id ? 'bg-primary text-white' : 'bg-white/5 text-white/40'}
              `}>
                                {niche.icon}
                            </div>
                            <span className="font-bold text-sm tracking-tight leading-tight block">{niche.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10">
                {agents.map((agent) => (
                    <motion.div
                        layout
                        key={agent.id}
                        className="glass overflow-hidden rounded-[3rem] border-white/5 group h-fit"
                    >
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                                        <Bot size={32} />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            defaultValue={agent.name}
                                            onBlur={(e) => updateAgent(agent.id, { name: e.target.value })}
                                            className="bg-transparent border-none font-extrabold text-2xl tracking-tight focus:ring-0 w-full"
                                        />
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 py-1 px-3 rounded-full text-white/40">
                                                {agent.model_name.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30 block mb-3">ADN del Agente (System Prompt)</label>
                                    <textarea
                                        className="input-premium w-full h-40 resize-none text-sm leading-relaxed"
                                        defaultValue={agent.system_prompt}
                                        onChange={(e) => {
                                            // Solo actualizamos localmente para el botón Save
                                            agent.temp_prompt = e.target.value;
                                        }}
                                        placeholder="Describe la personalidad y tareas de tu agente..."
                                    />
                                    {selectedNiche && (
                                        <button
                                            onClick={() => updateAgent(agent.id, { system_prompt: selectedNiche.prompt })}
                                            className="mt-3 text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                        >
                                            <Sparkles size={12} /> Aplicar Prompt de {selectedNiche.name}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="glass bg-white/5 p-6 rounded-[2rem] border-white/5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-4">Creatividad IA</label>
                                        <input
                                            type="range"
                                            className="w-full accent-primary bg-white/10 rounded-full h-1.5"
                                            min="0" max="1" step="0.1"
                                            defaultValue={agent.temperature}
                                            onChange={(e) => updateAgent(agent.id, { temperature: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="glass bg-white/5 p-6 rounded-[2rem] border-white/5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Modelo</label>
                                        <select
                                            className="bg-transparent text-primary font-black text-sm outline-none w-full"
                                            defaultValue={agent.model_name}
                                            onChange={(e) => updateAgent(agent.id, { model_name: e.target.value })}
                                        >
                                            <option value="qwen2.5:3b">Qwen 2.5</option>
                                            <option value="llama3.2:1b">Llama 3.2</option>
                                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        const txt = (e.currentTarget.parentElement?.querySelector('textarea') as HTMLTextAreaElement).value;
                                        updateAgent(agent.id, { system_prompt: txt });
                                    }}
                                    disabled={saving}
                                    className="w-full btn-premium py-5 text-lg group disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {!loading && agents.length === 0 && (
                    <div className="col-span-full py-32 glass rounded-[3rem] border-white/5 border-dashed border-2 flex flex-col items-center justify-center text-center">
                        <Bot size={48} className="text-white/10 mb-6" />
                        <h3 className="text-2xl font-bold mb-2 text-white/40">Sin Agentes Digitales</h3>
                        <p className="text-white/20 max-w-sm mb-8">Haz clic en el botón superior para crear tu primer cerebro artificial.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
