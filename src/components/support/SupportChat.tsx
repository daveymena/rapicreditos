import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SYSTEM_PROMPT } from "@/lib/appKnowledge";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const QUICK_QUESTIONS = [
    "¿Cómo creo un préstamo?",
    "¿Cómo registro un pago?",
    "¿Cómo conecto WhatsApp?",
    "¿Cómo genero un paz y salvo?",
];

const OLLAMA_URL = "https://api.moonshot.ai/v1/chat/completions";
const MOONSHOT_KEY = "sk-ovVGRAygorXYanWNjj0WfEDZ14RsupSQsyZkO8ciJdaFiveD";
const MOONSHOT_MODEL = "moonshot-v1-8k";

const SupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            text: "¡Hola! Soy **KréditBot** 🤖, tu guía en Krédit.\n\n¿En qué te puedo ayudar hoy? Puedes preguntarme sobre préstamos, clientes, pagos, WhatsApp o cualquier función de la plataforma.",
            sender: "bot",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (!isOpen && messages.length > 1) {
            setUnread(prev => prev + 1);
        }
    }, [messages]);

    const handleOpen = () => {
        setIsOpen(true);
        setUnread(0);
        setIsMinimized(false);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: "user",
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Llama al proxy del backend que conecta con Ollama local (kimi-k2.5:cloud)
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemPrompt: SYSTEM_PROMPT,
                    messages: [{ role: "user", content: text.trim() }],
                }),
                signal: AbortSignal.timeout(45000),
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json();
            const reply = data.content?.trim() || "No pude procesar tu pregunta. Intenta de nuevo.";

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: reply,
                sender: "bot",
                timestamp: new Date(),
            }]);
        } catch {
            // Fallback con respuestas locales
            const fallback = getLocalFallback(text);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: fallback,
                sender: "bot",
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const getLocalFallback = (q: string): string => {
        const t = q.toLowerCase();
        if (t.includes("préstamo") || t.includes("prestamo") || t.includes("crear"))
            return "Para crear un préstamo: **Menú → Préstamos → + Nuevo Préstamo**. Selecciona el cliente, ingresa el monto, tasa, cuotas y frecuencia. El sistema calcula todo automáticamente.";
        if (t.includes("pago") || t.includes("abono") || t.includes("cuota"))
            return "Para registrar un pago: entra al **detalle del préstamo** → botón **'Registrar Abono'**. También puedes pagar cuotas específicas desde la tabla de amortización.";
        if (t.includes("whatsapp") || t.includes("qr"))
            return "Para conectar WhatsApp: **Menú → WhatsApp → Generar QR**. Luego abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular dispositivo → escanea el QR.";
        if (t.includes("paz") || t.includes("salvo") || t.includes("certificado"))
            return "El **Paz y Salvo** aparece cuando el préstamo llega a saldo $0 (estado 'Completado'). Entra al detalle del préstamo y verás el botón 'Generar Paz y Salvo'.";
        if (t.includes("cliente"))
            return "Para crear un cliente: **Menú → Clientes → + Nuevo Cliente**. Completa nombre, documento y teléfono (obligatorio). También puedes importar clientes masivamente con un archivo CSV.";
        if (t.includes("contraseña") || t.includes("clave") || t.includes("acceso"))
            return "Para recuperar tu contraseña: en la pantalla de login → **'Olvidé mi contraseña'** → ingresa tu correo → recibirás un link para crear una nueva contraseña.";
        return "Entiendo tu consulta. Para una respuesta más detallada, el servidor de IA está ocupado en este momento. Intenta de nuevo en unos segundos o visita el **Centro de Ayuda** en el menú lateral.";
    };

    // Renderizar markdown básico
    const renderText = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <>
            {/* Botón flotante */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleOpen}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
                    >
                        <MessageCircle className="w-6 h-6" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Ventana de chat */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed bottom-6 right-6 z-50 w-[360px] md:w-[400px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ height: isMinimized ? "64px" : "540px" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-sm">KréditBot</span>
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[11px] opacity-80">Asistente activo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost" size="icon"
                                    className="text-white hover:bg-white/20 w-8 h-8"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
                                </Button>
                                <Button
                                    variant="ghost" size="icon"
                                    className="text-white hover:bg-white/20 w-8 h-8"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Mensajes */}
                                <ScrollArea className="flex-1 px-4 py-3 bg-muted/20">
                                    <div className="space-y-3">
                                        {messages.map((msg) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                                {msg.sender === "bot" && (
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                                        <Bot className="w-3.5 h-3.5 text-primary" />
                                                    </div>
                                                )}
                                                <div
                                                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                        msg.sender === "user"
                                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                                            : "bg-card border border-border shadow-sm rounded-bl-sm"
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
                                                />
                                            </motion.div>
                                        ))}

                                        {/* Typing indicator */}
                                        {isTyping && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex justify-start items-end gap-2"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Bot className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                                                    <div className="flex gap-1 items-center">
                                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={bottomRef} />
                                    </div>
                                </ScrollArea>

                                {/* Preguntas rápidas */}
                                {messages.length <= 1 && (
                                    <div className="px-4 py-2 border-t border-border bg-background/50">
                                        <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Preguntas frecuentes</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {QUICK_QUESTIONS.map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => sendMessage(q)}
                                                    className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input */}
                                <div className="p-3 bg-background border-t border-border flex-shrink-0">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Escribe tu pregunta..."
                                            className="flex-1 text-sm h-9"
                                            disabled={isTyping}
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="h-9 w-9 flex-shrink-0"
                                            disabled={!input.trim() || isTyping}
                                        >
                                            {isTyping
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Send className="w-4 h-4" />
                                            }
                                        </Button>
                                    </form>
                                    <p className="text-[10px] text-center text-muted-foreground mt-1.5">
                                        KréditBot · Asistente inteligente
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportChat;
