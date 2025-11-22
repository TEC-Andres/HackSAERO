// SimulationPage.tsx - Página principal del simulador de meteoritos
// Combina el formulario de configuración con la visualización 3D en tiempo real

import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'  // Contenedor 3D de React Three Fiber
import { Suspense } from 'react'  // Componente para carga diferida
import PersonalizablePlanet from '../../../assets/Planets/personalizableplanet'  // Planeta 3D
import FormMeteroid from '../../components/selectmeteroidform'  // Formulario de configuración
import MapPage from './map.page'
import FormTesting from '@/components/formtesting'
import { MeteroidProvider, useMeteroidContext } from '../../context/MeteroidContext'  // Proveedor del contexto
import { Toaster } from '@/components/sonner'  // Sistema de notificaciones toast
import FloatingChat from '../../components/FloatingChat'  // Chat flotante de NASAbot
import ChatToggleButton from '../../components/ChatToggleButton'  // Botón para abrir/cerrar chat
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

/**
 * Componente wrapper que obtiene datos del contexto y los pasa al Canvas
 * Esto es necesario porque el Canvas de React Three Fiber crea su propio contexto
 */
const PlanetCanvasWrapper = () => {
    const { meteroidData } = useMeteroidContext()

    return (
        <Canvas>
            <Suspense fallback={null}>
                <PersonalizablePlanet meteroidData={meteroidData} />
            </Suspense>
        </Canvas>
    )
}

/**
 * Componente interno que tiene acceso al contexto para limpiar estados
 */
const SimulationPageContent = () => {
    // Estado para controlar qué sección mostrar
    const [activeSection, setActiveSection] = useState<'simulation' | 'analysis'>('simulation')
    
    // Estado para controlar el chat flotante
    const [isChatOpen, setIsChatOpen] = useState(false)
    
    // Acceso al contexto para limpiar estados
    const { setIsSimulating, setCraterRadius } = useMeteroidContext()

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
    }

    // Limpiar estados de simulación cuando se cambia de pestaña
    useEffect(() => {
        if (activeSection === 'simulation') {
            // Cuando volvemos a la pestaña de simulación, limpiar estados
            setIsSimulating(false)
            setCraterRadius(null)
        }
    }, [activeSection, setIsSimulating, setCraterRadius])

    return (
        <Suspense fallback={null}>
            {/* Botones de alternancia */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                gap: '10px'
            }}>
                <button
                    onClick={() => setActiveSection('simulation')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeSection === 'simulation' ? '#007cba' : '#f0f0f0',
                        color: activeSection === 'simulation' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeSection === 'simulation' ? 'bold' : 'normal',
                        fontSize: '14px'
                    }}
                >
                    Create your own Meteorite
                </button>
                <button
                    onClick={() => setActiveSection('analysis')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeSection === 'analysis' ? '#007cba' : '#f0f0f0',
                        color: activeSection === 'analysis' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeSection === 'analysis' ? 'bold' : 'normal',
                        fontSize: '14px'
                    }}
                >
                    Simulation
                </button>
            </div>

            {/* Sección de Simulación 3D */}
            {activeSection === 'simulation' && (
                <ResizablePanelGroup
                    direction="horizontal"
                    style={{
                        width: '100vw',
                        height: '100vh',
                        background: 'black',
                    }}
                >
                    {/* Panel izquierdo - Formulario */}
                    <ResizablePanel defaultSize={40} minSize={0} maxSize={100}>
                        <div style={{
                            height: '100%',
                            padding: '20px',
                            boxSizing: 'border-box',
                            backgroundColor: 'black',
                            color: 'black',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <FormMeteroid onActivateSimulation={() => setActiveSection('analysis')} />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Panel derecho - Visualización 3D */}
                    <ResizablePanel defaultSize={70}>
                        <div style={{
                            height: '100%',
                            width: '100%'
                        }}>
                            <PlanetCanvasWrapper />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}

            {/* Sección de Análisis con Mapa */}
            {activeSection === 'analysis' && (
                <ResizablePanelGroup
                    direction="horizontal"
                    style={{
                        width: '100vw',
                        height: '100vh',
                        background: 'black',
                    }}
                >
                    {/* Panel izquierdo - Formulario */}
                    <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                        <div style={{
                            height: '100%',
                            padding: '20px',
                            boxSizing: 'border-box',
                            backgroundColor: 'black',
                            color: 'white',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                        }}>
                            <FormTesting />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Panel derecho - Mapa */}
                    <ResizablePanel defaultSize={70}>
                        <div style={{
                            height: '100%',
                            width: '100%'
                        }}>
                            <MapPage />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
            
            {/* Chat flotante de NASAbot */}
            <FloatingChat isOpen={isChatOpen} onToggle={toggleChat} />
            
            {/* Botón para abrir/cerrar el chat */}
            <ChatToggleButton isOpen={isChatOpen} onClick={toggleChat} />
            
            <Toaster />
        </Suspense>
    )
}

/**
 * Componente principal que envuelve todo con el Provider
 */
const SimulationPage = () => {
    return (
        <MeteroidProvider>
            <SimulationPageContent />
        </MeteroidProvider>
    )
}

export default SimulationPage

