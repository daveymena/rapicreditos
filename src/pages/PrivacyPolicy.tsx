import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">Política de Privacidad</h1>
                    <p className="text-muted-foreground mt-2">Última actualización: 25 de enero, 2026</p>
                </div>

                <Card className="shadow-xl">
                    <CardContent className="p-8">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="prose prose-slate max-w-none space-y-6 text-foreground/80">
                                <section>
                                    <h2 className="text-xl font-bold text-foreground">1. Introducción</h2>
                                    <p>
                                        En Krédit Pro, valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos la información de prestamistas y clientes.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">2. Información que recopilamos</h2>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Datos de Registro:</strong> Nombre, correo electrónico, teléfono y dirección del prestamista.</li>
                                        <li><strong>Datos de Clientes:</strong> Información proporcionada por el prestamista o el cliente mediante el link de registro (nombres, documentos de identidad, teléfonos, ubicación).</li>
                                        <li><strong>Datos Financieros:</strong> Montos de préstamos, tasas de interés, historiales de pago y recordatorios generados.</li>
                                        <li><strong>Datos de WhatsApp:</strong> Información técnica necesaria para la sincronización de mensajes (no almacenamos el contenido de tus chats privados personales).</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">3. Uso de la Inteligencia Artificial</h2>
                                    <p>
                                        Utilizamos modelos de IA (Ollama) para generar mensajes de cobro y analizar riesgos. Tus datos son procesados de forma segura y no se utilizan para entrenar modelos externos públicos.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">4. Protección de Datos</h2>
                                    <p>
                                        Implementamos medidas de seguridad nivel bancario, encriptación SSL y bases de datos seguras en la nube (Google Cloud / Supabase) para evitar el acceso no autorizado.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">5. Derechos del Usuario (Habeas Data)</h2>
                                    <p>
                                        Tienes derecho a conocer, actualizar y rectificar tus datos o los de tus clientes en cualquier momento a través de la plataforma o contactando a nuestro soporte.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">6. Cambios en la Política</h2>
                                    <p>
                                        Nos reservamos el derecho de actualizar esta política. Los cambios se notificarán a través de la aplicación.
                                    </p>
                                </section>

                                <section className="bg-primary/5 p-4 rounded-lg border border-primary/20 mt-8">
                                    <p className="text-sm font-medium text-primary">
                                        Si tienes dudas sobre el manejo de tus datos, contáctanos en soporte@rapicredi-sas.com
                                    </p>
                                </section>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
