// SelectMeteroidForm.tsx - Formulario interactivo para configurar parámetros del meteorito
// Se sincroniza en tiempo real con PersonalizablePlanet a través del MeteroidContext

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'  // Validador para React Hook Form
import { useForm } from 'react-hook-form'  // Manejo de formularios
import { router } from '@inertiajs/react'  // Para hacer peticiones a Laravel
import { meteroidSchema } from '../../lib/meteroidSchema'
import type { MeteroidFormData } from '../../lib/meteroidSchema'
import { useMeteroidContext } from '../context/MeteroidContext'  // Contexto global
import { GraduationCap } from 'lucide-react'  // Ícono educativo

import { Button } from "../components/ui/button"  // Componente de botón
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./form"  // Componentes de formulario de shadcn/ui
import { Input } from "./input"  // Campo de entrada
import { toast } from 'sonner'  // Sistema de notificaciones
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"  // Componente de tooltip

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"  // Componente selector desplegable
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

/**
 * Esquema de validación con Zod
 * Define las reglas y tipos para cada campo del formulario
 */
// using shared meteroidSchema and MeteroidFormData from src/lib/meteroidSchema

/**
 * Props del componente FormMeteroid
 */
interface FormMeteroidProps {
    onActivateSimulation?: () => void  // Función para activar la simulación
}

/**
 * Componente principal del formulario de meteorito
 * 
 * Funcionalidades:
 * - Campos para configurar propiedades del meteorito
 * - Validación en tiempo real con Zod
 * - Sincronización automática con el planeta 3D
 * - Botones para guardar y usar modelos NASA
 */
const FormMeteroid: React.FC<FormMeteroidProps> = ({ onActivateSimulation }) => {
    // Obtener estado y función de actualización del contexto
    const { updateMeteroidData } = useMeteroidContext()

    // Configuración del formulario con React Hook Form
    const form = useForm<MeteroidFormData>({
        resolver: zodResolver(meteroidSchema),  // Usar validación Zod
        defaultValues: {
            velocity: undefined,          // Sin valor inicial
            angle: undefined,            // Sin valor inicial
            material: undefined,         // Sin valor inicial
            radiusMeteroid: undefined,   // Sin valor inicial
            namemeteroid: undefined       // Sin valor inicial
        }
    })

    /**
     * Efecto para sincronización en tiempo real con el planeta 3D
     * 
     * Usa form.watch() para escuchar cambios en cualquier campo del formulario
     * Cuando un campo cambia, actualiza inmediatamente el contexto global
     * Esto hace que el planeta 3D se actualice instantáneamente
     */
    useEffect(() => {
        // Suscribirse a cambios en el formulario
        const subscription = form.watch((value) => {
            const updates: any = {}

            // Solo actualizar campos que tienen valores definidos
            if (value.radiusMeteroid !== undefined) updates.radiusMeteroid = value.radiusMeteroid
            if (value.velocity !== undefined) updates.velocity = value.velocity
            if (value.angle !== undefined) updates.angle = value.angle
            if (value.material !== undefined) updates.material = value.material

            // Si hay actualizaciones, enviarlas al contexto
            if (Object.keys(updates).length > 0) {
                updateMeteroidData(updates)
            }
        })

        // Limpiar suscripción cuando el componente se desmonte
        return () => subscription.unsubscribe()
    }, [form.watch, updateMeteroidData])

    /**
     * Manejador para el botón "Use real models of NASA"
     * Para ir a la pagina de Simulation 
     */

    const onSubmitNasaModels = () => {
        onActivateSimulation?.()
        toast.success("Going to use real NASA models!")
    }

    /**
     * Manejador para el botón "Save"
     * Envía los datos del meteorito a Laravel usando Inertia
     * 
     * @param {MeteroidFormData} data - Datos validados del formulario
     */
    const onSubmitSave = async (data: MeteroidFormData) => {
        try {
            console.log("🚀 Enviando datos del meteorito a Laravel:", data)

            // Enviar datos a Laravel usando Inertia
            router.post('/meteorites/store', data, {
                onSuccess: (page) => {
                    console.log("✅ Datos guardados exitosamente en Laravel")

                    // Mostrar toast de éxito
                    toast.success(`Meteorite "${data.namemeteroid}" saved successfully!`)

                    // Opcional: guardar también en localStorage
                    localStorage.setItem('meteroidData', JSON.stringify(data))
                },
                onError: (errors) => {
                    console.error("❌ Error al guardar en Laravel:", errors)
                    toast.error("Error saving Meteorite data")
                },
                onFinish: () => {
                    console.log("🔄 Petición completada")
                }
            })

        } catch (error) {
            console.error("❌ Error inesperado:", error)
            toast.error("Unexpected error: " + (error as Error).message)
        }
    }

    return (
        <TooltipProvider>
            <div className="w-full h-full overflow-y-auto p-4 space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitSave)} className="space-y-4">
                        
                        {/* Card Principal - Nombre */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Meteorite Simulator</CardTitle>
                                <CardDescription>
                                    Enjoy the power of Meteorite Simulator.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="namemeteroid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormLabel>Name of the Meteorite</FormLabel>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <GraduationCap className="h-4 w-4 text-blue-600 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">Give your Meteorite a unique name to identify it. This helps you track and manage multiple Meteorite simulations.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter Meteorite name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the name of the Meteorite
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Cards en Grid Responsive */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Card de Características */}
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">Características</CardTitle>
                                    <CardDescription>
                                        Define el tamaño y composición
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="radiusMeteroid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <FormLabel>Radio (m)</FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <GraduationCap className="h-4 w-4 text-blue-600 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">The radius determines the size of your Meteorite. Larger Meteorites (100+ meters) cause more significant impacts.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="1000"
                                                        {...field}
                                                        onChange={e => {
                                                            const value = e.target.value.replace(/[^0-9.]/g, '')
                                                            field.onChange(value ? parseFloat(value) : undefined)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="material"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <FormLabel>Material</FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <GraduationCap className="h-4 w-4 text-blue-600 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">Material composition affects impact energy. Iron is denser, rock may fragment.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select material" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="rock">Rock</SelectItem>
                                                            <SelectItem value="iron">Iron</SelectItem>
                                                            <SelectItem value="nickel">Nickel</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Card de Trayectoria */}
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">Trayectoria</CardTitle>
                                    <CardDescription>
                                        Define velocidad y ángulo de entrada
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="velocity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <FormLabel>Velocidad (m/s)</FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <GraduationCap className="h-4 w-4 text-blue-600 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">Meteorites enter at 11-72 km/s (11,000-72,000 m/s). Higher velocities create more intense impacts.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="1000"
                                                        {...field}
                                                        onChange={e => {
                                                            const value = e.target.value.replace(/[^0-9.]/g, '')
                                                            field.onChange(value ? parseFloat(value) : undefined)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="angle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <FormLabel>Ángulo (grados)</FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <GraduationCap className="h-4 w-4 text-blue-600 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">90° is vertical impact (most destructive), shallow angles (15-30°) travel farther through atmosphere.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="45"
                                                        {...field}
                                                        onChange={e => {
                                                            const value = e.target.value.replace(/[^0-9.]/g, '')
                                                            field.onChange(value ? parseFloat(value) : undefined)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-3 justify-end">
                            <Button type="submit" variant="default" className="text-black border-black hover:bg-blue-800 hover:text-white">
                                Save
                            </Button>
                            <Button type="button" variant="default" className="text-black border-black hover:bg-blue-800 hover:text-white" onClick={onSubmitNasaModels}>
                                Go to simulation
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </TooltipProvider>
    )
}

export default FormMeteroid

