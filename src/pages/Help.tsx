import { motion } from "framer-motion";
import {
    Book,
    FileText,
    CreditCard,
    DollarSign,
    Users,
    Settings,
    HelpCircle,
    MessageCircle,
    Download,
    Upload,
    FileSpreadsheet,
    Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Help = () => {
    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-5xl mx-auto pb-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">
                            Centro de Ayuda Krédit
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-2">
                            Todo lo que necesitas saber para gestionar tus préstamos como un experto.
                        </p>
                    </motion.div>
                </div>

                <div className="hidden">
                    {/* Background Music Loop for Tutorial */}
                    <audio 
                        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                        id="tutorial-music" 
                        loop
                    />
                </div>

                <Tabs defaultValue="tutorial" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50 rounded-xl">
                        <TabsTrigger value="tutorial" className="data-[state=active]:bg-background py-3 font-bold text-primary">
                            <Sparkles className="w-4 h-4 mr-2" /> Tutorial Video
                        </TabsTrigger>
                        <TabsTrigger value="getting-started" className="data-[state=active]:bg-background py-3">
                            <Book className="w-4 h-4 mr-2" /> Inicio
                        </TabsTrigger>
                        <TabsTrigger value="clients" className="data-[state=active]:bg-background py-3">
                            <Users className="w-4 h-4 mr-2" /> Clientes
                        </TabsTrigger>
                        <TabsTrigger value="loans" className="data-[state=active]:bg-background py-3">
                            <DollarSign className="w-4 h-4 mr-2" /> Préstamos
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="data-[state=active]:bg-background py-3">
                            <CreditCard className="w-4 h-4 mr-2" /> Pagos
                        </TabsTrigger>
                        <TabsTrigger value="faq" className="data-[state=active]:bg-background py-3">
                            <HelpCircle className="w-4 h-4 mr-2" /> FAQ
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-8 space-y-6">
                        {/* Video Tutorial Hub */}
                        <TabsContent value="tutorial">
                            <Card className="overflow-hidden border-primary/20 shadow-xl shadow-primary/5">
                                <CardHeader className="bg-primary/5 border-b border-primary/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl">Aprende a usar Krédit Pro</CardTitle>
                                            <CardDescription>Guía completa paso a paso para optimizar tu negocio</CardDescription>
                                        </div>
                                        <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold animate-pulse">
                                            NUEVO CONTENIDO
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="grid lg:grid-cols-5 gap-0">
                                        {/* Video Player Area */}
                                        <div className="lg:col-span-3 bg-black aspect-video flex items-center justify-center relative overflow-hidden">
                                            <img 
                                                src="/assets/tutorial.webp" 
                                                className="w-full h-full object-contain" 
                                                alt="Tutorial Video Recording"
                                                onError={(e) => {
                                                    // Fallback if video hasn't been copied to public assets yet
                                                    e.currentTarget.src = "https://placehold.co/1280x720/000/fff?text=Cargando+Video+Tutorial...";
                                                }}
                                            />
                                            
                                            {/* Music Toggle */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="absolute bottom-4 right-4 bg-black/50 text-white border-white/20 hover:bg-black/70"
                                                onClick={() => {
                                                    const audio = document.getElementById('tutorial-music') as HTMLAudioElement;
                                                    if (audio.paused) audio.play();
                                                    else audio.pause();
                                                }}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-2" /> 
                                                Activar Música/Video
                                            </Button>

                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <div className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                    REC
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Script / Narration Area - THE VOICE FOR CLIENTS */}
                                        <div className="lg:col-span-2 p-6 bg-card overflow-y-auto max-h-[500px] border-l border-border">
                                            <h4 className="font-bold flex items-center gap-2 mb-4 text-primary">
                                                <Sparkles className="w-4 h-4" /> Guion de la Guía
                                            </h4>
                                            <div className="space-y-6 text-sm">
                                                <div className="relative pl-6 border-l-2 border-primary/30">
                                                    <span className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">1</span>
                                                    <p className="font-semibold text-foreground">Introducción al Éxito (0:00 - 0:30)</p>
                                                    <p className="text-muted-foreground italic">"Bienvenido a la nueva era de tu negocio. Krédit Pro no es solo un software; es tu socio estratégico. Olvida el papel y los errores manuales..."</p>
                                                </div>
                                                <div className="relative pl-6 border-l-2 border-muted">
                                                    <span className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">2</span>
                                                    <p className="font-semibold text-foreground">Tu Cartera de Clientes (0:30 - 1:10)</p>
                                                    <p className="text-muted-foreground italic">"Organiza tu activo más valioso. Importa tus contactos masivamente y ten toda su historia de pagos a un solo clic de distancia."</p>
                                                </div>
                                                <div className="relative pl-6 border-l-2 border-muted">
                                                    <span className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">3</span>
                                                    <p className="font-semibold text-foreground">Préstamos en Segundos (1:10 - 2:00)</p>
                                                    <p className="text-muted-foreground italic">"Crea créditos con cálculos exactos. Deja que el sistema genere las tablas de amortización mientras tú te enfocas en crecer."</p>
                                                </div>
                                                <div className="relative pl-6 border-l-2 border-muted">
                                                    <span className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">4</span>
                                                    <p className="font-semibold text-foreground">Cobros con IA (2:00 - Fin)</p>
                                                    <p className="text-muted-foreground italic">"Activa WhatsApp y deja que la IA cobre por ti. Notificaciones automáticas que mejoran tu flujo de caja sin esfuerzo."</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Getting Started */}
                        <TabsContent value="getting-started">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Primeros Pasos con Krédit</CardTitle>
                                    <CardDescription>Configura tu cuenta y comienza a prestar en minutos.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                            <h3 className="font-semibold flex items-center mb-2">
                                                <Settings className="w-4 h-4 mr-2 text-primary" />
                                                Configura tu Perfil
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Ve a "Mi Perfil" para actualizar tus datos de contacto y logo. Esta información aparecerá en los recibos y el Paz y Salvo.
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                            <h3 className="font-semibold flex items-center mb-2">
                                                <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
                                                Conecta WhatsApp
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Vincula tu WhatsApp para enviar recordatorios automáticos de cobro a tus clientes.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Clients */}
                        <TabsContent value="clients">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gestión de Clientes</CardTitle>
                                    <CardDescription>Aprende a registrar e importar tus clientes de forma masiva.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex-1 space-y-4">
                                                <h3 className="text-lg font-semibold">Importación Masiva</h3>
                                                <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                                    <li>Ve a la sección <strong>Clientes</strong>.</li>
                                                    <li>Haz clic en el botón <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs border"><FileSpreadsheet className="w-3 h-3 mr-1" /> Plantilla</span> para descargar el formato Excel/CSV.</li>
                                                    <li>Lleva la plantilla con los datos de tus clientes. <strong>No cambies los encabezados</strong>.</li>
                                                    <li>Guarda el archivo y haz clic en <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs border"><Upload className="w-3 h-3 mr-1" /> Importar</span>.</li>
                                                </ol>
                                            </div>
                                            <div className="flex-1 p-4 bg-muted/30 rounded-lg">
                                                <h4 className="font-medium mb-2 flex items-center">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Estructura de la Plantilla
                                                </h4>
                                                <code className="text-xs block bg-background p-3 rounded border">
                                                    Nombre_Completo;Documento;Telefono;Email;Ciudad;Estado<br />
                                                    Juan Perez;12345678;3001234567;juan@mail.com;Bogota;active
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Loans */}
                        <TabsContent value="loans">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Creación y Edición de Préstamos</CardTitle>
                                    <CardDescription>Domina el cálculo de intereses y cronogramas.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>¿Cómo crear un nuevo préstamo?</AccordionTrigger>
                                            <AccordionContent>
                                                Ve a <strong>Nuevo Préstamo</strong>, selecciona un cliente existente y completa los datos financieros. El sistema calculará automáticamente las cuotas y fechas.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2">
                                            <AccordionTrigger>Tipos de Interés: Simple vs Compuesto</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="list-disc pl-5 space-y-2">
                                                    <li><strong>Simple:</strong> El interés se calcula solo sobre el capital inicial. (Común en préstamos personales).</li>
                                                    <li><strong>Compuesto:</strong> El interés se calcula sobre el capital + intereses acumulados. (Más rentable a largo plazo).</li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>¿Puedo editar un préstamo ya creado?</AccordionTrigger>
                                            <AccordionContent>
                                                ¡Sí! Entra al detalle del préstamo y haz clic en el botón <strong>"Ajustar Plan"</strong>. Podrás modificar la tasa, plazo o montos. Ten cuidado si ya hay pagos registrados.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Payments */}
                        <TabsContent value="payments">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registro de Pagos</CardTitle>
                                    <CardDescription>Mantén tus cuentas claras y genera recibos.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Registrar un Abono</h3>
                                            <p className="text-muted-foreground text-sm">
                                                En el detalle del préstamo, verás la tabla de amortización. Haz clic en el botón <strong>"Pagar"</strong> al lado de la cuota correspondiente.
                                            </p>
                                            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-100">
                                                ✅ El sistema marcará la cuota como pagada y actualizará el saldo pendiente automáticamente.
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Paz y Salvo</h3>
                                            <p className="text-muted-foreground text-sm">
                                                Cuando el saldo pendiente llegue a $0, aparecerá el botón <strong>"Descargar Paz y Salvo"</strong>. Este documento oficial certifica que la deuda ha sido cancelada totalmente.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* FAQ */}
                        <TabsContent value="faq">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preguntas Frecuentes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="faq-1">
                                            <AccordionTrigger>¿Cómo recupero mi contraseña?</AccordionTrigger>
                                            <AccordionContent>
                                                En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Te enviaremos un enlace a tu correo para restablecerla.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="faq-2">
                                            <AccordionTrigger>¿Los datos están seguros?</AccordionTrigger>
                                            <AccordionContent>
                                                Sí, utilizamos encriptación de nivel bancario y bases de datos seguras en la nube. Solo tú tienes acceso a la información de tus clientes.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="faq-3">
                                            <AccordionTrigger>¿Puedo exportar mis datos?</AccordionTrigger>
                                            <AccordionContent>
                                                Absolutamente. En la sección de Clientes y Préstamos encontrarás botones para exportar toda tu información a formato Excel/CSV.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default Help;
