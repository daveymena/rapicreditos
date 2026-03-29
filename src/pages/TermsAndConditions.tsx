import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        <span className="font-bold">Krédit Pro</span>
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold">Términos y Condiciones de Uso</h1>
                    <p className="text-muted-foreground mt-2">Vigente desde: 25 de enero, 2026</p>
                </div>

                <Card className="shadow-xl">
                    <CardContent className="p-8">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="prose prose-slate max-w-none space-y-6 text-foreground/80">
                                <section>
                                    <h2 className="text-xl font-bold text-foreground">1. Aceptación de los Términos</h2>
                                    <p>
                                        Al utilizar Krédit Pro, aceptas quedar vinculado por estos términos. Si no estás de acuerdo, por favor no utilices la plataforma.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">2. Uso de la Plataforma</h2>
                                    <p>
                                        Krédit Pro es una herramienta de <strong>gestión</strong>. No somos una entidad financiera, no prestamos dinero directamente ni somos responsables de los acuerdos entre prestamistas y clientes.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">3. Responsabilidad del Prestamista</h2>
                                    <p>
                                        El prestamista es el único responsable de:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Garantizar que sus tasas de interés cumplan con la legislación local (evitar la usura).</li>
                                        <li>La veracidad de la información de sus clientes.</li>
                                        <li>El cumplimiento de las leyes de protección de datos personales.</li>
                                        <li>El uso ético de las funciones de automatización de WhatsApp e IA.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">4. Pagos y Suscripciones</h2>
                                    <p>
                                        El acceso a funciones avanzadas (Plan Pro) requiere una suscripción mensual. Krédit se reserva el derecho de modificar tarifas previo aviso. No se realizan reembolsos parciales por meses ya utilizados.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">5. Limitación de Responsabilidad</h2>
                                    <p>
                                        Krédit Pro no se hace responsable por pérdidas financieras, impagos de clientes, fallos técnicos ajenos (como caídas de WhatsApp o Supabase) o cualquier daño indirecto derivado del uso de la app.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">6. Prohibiciones</h2>
                                    <p>
                                        Está terminantemente prohibido usar la plataforma para actividades ilegales, lavado de activos o acoso sistemático a deudores mediante las herramientas de mensajería.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-foreground">7. Ley Aplicable</h2>
                                    <p>
                                        Estos términos se rigen por las leyes de la República de Colombia / Legislación Internacional de Comercio Electrónico.
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

export default TermsAndConditions;
