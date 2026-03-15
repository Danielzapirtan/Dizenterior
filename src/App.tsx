import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Group, Text, Transformer } from 'react-konva';
import { Plus, Trash2, RotateCw, Move, Maximize2, Layers, Settings2, Download, Trash, Menu, X, ZoomIn, ZoomOut, Box, Layout, Sparkles } from 'lucide-react';
import { FURNITURE_LIBRARY, PIXELS_PER_CM } from './constants';
import { PlacedFurniture, RoomDimensions, FurnitureTemplate } from './types';
import { Room3D } from './components/Room3D';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FurnitureIcon = ({ type, color }: { type: FurnitureTemplate['type'], color: string }) => {
  switch (type) {
    case 'sofa':
      return <div className="w-8 h-4 rounded-sm border-2" style={{ borderColor: color, backgroundColor: `${color}22` }} />;
    case 'bed':
      return <div className="w-6 h-8 rounded-sm border-2" style={{ borderColor: color, backgroundColor: `${color}22` }} />;
    case 'circle':
      return <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: color, backgroundColor: `${color}22` }} />;
    default:
      return <div className="w-6 h-6 rounded-sm border-2" style={{ borderColor: color, backgroundColor: `${color}22` }} />;
  }
};

const FurnitureShape = ({ 
  item, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  item: PlacedFurniture; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (newAttrs: PlacedFurniture) => void;
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const template = FURNITURE_LIBRARY.find(t => t.id === item.templateId);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (!template) return null;

  const handleDragEnd = (e: any) => {
    onChange({
      ...item,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      ...item,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    });
  };

  return (
    <React.Fragment>
      <Group
        ref={shapeRef}
        x={item.x}
        y={item.y}
        rotation={item.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {template.type === 'circle' ? (
          <Circle
            radius={item.width / 2}
            fill={template.color + '44'}
            stroke={template.color}
            strokeWidth={2}
          />
        ) : (
          <Rect
            width={item.width}
            height={item.height}
            fill={template.color + '44'}
            stroke={template.color}
            strokeWidth={2}
            cornerRadius={template.type === 'sofa' ? 10 : 2}
          />
        )}
        <Text
          text={template.name}
          fontSize={10}
          fill="#333"
          width={item.width}
          align="center"
          y={item.height / 2 - 5}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function App() {
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([]);
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({ width: 500, height: 400 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [isGenerating, setIsGenerating] = useState(false);
  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null);
  const [showPanorama, setShowPanorama] = useState(false);

  const generateAIPanorama = async () => {
    try {
      setIsGenerating(true);
      const { GoogleGenAI } = await import("@google/genai");
      // Folosim cheia API gratuită din mediu
      const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });

      const furnitureDescription = placedFurniture.map(f => {
        const template = FURNITURE_LIBRARY.find(t => t.id === f.templateId);
        return `${template?.name} de culoare ${template?.color}`;
      }).join(", ");

      const prompt = `O imagine panoramică a unui interior de cameră modernă. 
      Dimensiuni: ${roomDimensions.width}x${roomDimensions.height} cm. 
      Mobilierul include: ${furnitureDescription}. 
      Stil: românesc anul 2025, temă crem deschis, iluminare fotorealistă, randare 8k, perspectivă largă.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          setPanoramaUrl(imageUrl);
          setShowPanorama(true);
          break;
        }
      }
    } catch (error) {
      console.error("Eroare la generarea imaginii AI:", error);
      alert("A apărut o eroare la generarea imaginii AI. Te rugăm să încerci din nou.");
      alert(error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddFurniture = (template: FurnitureTemplate) => {
    const newItem: PlacedFurniture = {
      id: Math.random().toString(36).substr(2, 9),
      templateId: template.id,
      x: 50,
      y: 50,
      rotation: 0,
      width: template.width * PIXELS_PER_CM,
      height: template.height * PIXELS_PER_CM,
    };
    setPlacedFurniture([...placedFurniture, newItem]);
    setSelectedId(newItem.id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      setPlacedFurniture(placedFurniture.filter(f => f.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleClearAll = () => {
    setPlacedFurniture([]);
    setSelectedId(null);
    setShowResetConfirm(false);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const checkDeselect = (e: any) => {
    // Konva event: check if clicked on stage (empty area)
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // DOM event: check if clicked directly on the background container
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'room-design.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAutoFit = () => {
    if (!containerRef.current) return;
    
    const padding = 80; // Spațiu de siguranță
    const containerW = containerRef.current.clientWidth - padding;
    const containerH = containerRef.current.clientHeight - padding;
    
    const roomW = roomDimensions.width * PIXELS_PER_CM;
    const roomH = roomDimensions.height * PIXELS_PER_CM;
    
    const zoomW = containerW / roomW;
    const zoomH = containerH / roomH;
    
    // Alegem zoom-ul cel mai mic pentru a încadra ambele dimensiuni
    const newZoom = Math.min(zoomW, zoomH, 2); // Nu depășim 200%
    setZoom(Math.max(0.1, Number(newZoom.toFixed(2))));
  };

  useEffect(() => {
    // Auto-fit la prima încărcare sau când se schimbă dimensiunile camerei
    handleAutoFit();
  }, [roomDimensions.width, roomDimensions.height]);

  return (
    <div className="flex h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Library */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white border-r border-[#141414] flex flex-col z-50 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-[#141414] flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif italic mb-1">Decorator de Cameră</h1>
            <p className="text-[11px] uppercase tracking-wider opacity-50">Studio Proiectare v1.0</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h2 className="text-[11px] uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
              <Layers size={12} /> Librărie Mobilier
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {FURNITURE_LIBRARY.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddFurniture(item)}
                  className="flex items-center gap-3 p-4 border border-[#14141411] hover:bg-[#141414] hover:text-white transition-all group text-left min-h-[56px]"
                >
                  <FurnitureIcon type={item.type} color={item.color} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-[10px] opacity-60 font-mono">
                      {item.width}x{item.height} cm
                    </div>
                  </div>
                  <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>

          <section className="pt-6 border-t border-[#14141411]">
            <h2 className="text-[11px] uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
              <Settings2 size={12} /> Setări Cameră
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase block mb-1">Lățime (cm)</label>
                <input 
                  type="number" 
                  value={roomDimensions.width}
                  onChange={(e) => setRoomDimensions({ ...roomDimensions, width: Number(e.target.value) })}
                  className="w-full bg-transparent border border-[#141414] p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#141414]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase block mb-1">Înălțime (cm)</label>
                <input 
                  type="number" 
                  value={roomDimensions.height}
                  onChange={(e) => setRoomDimensions({ ...roomDimensions, height: Number(e.target.value) })}
                  className="w-full bg-transparent border border-[#141414] p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#141414]"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-[#141414] bg-[#f8f8f8]">
          {showResetConfirm ? (
            <div className="space-y-2">
              <p className="text-[10px] text-center uppercase font-bold text-red-600">Ești sigur?</p>
              <div className="flex gap-2">
                <button 
                  onClick={handleClearAll}
                  className="flex-1 p-3 text-[10px] uppercase bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Da
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 p-3 text-[10px] uppercase bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Nu
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors border border-transparent hover:border-red-600 min-h-[48px]"
            >
              <Trash size={14} /> Resetează Camera
            </button>
          )}
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toolbar */}
        <header className="h-16 md:h-14 border-b border-[#141414] bg-white flex items-center justify-between px-4 md:px-6 z-10">
          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] uppercase opacity-50">Zoom</span>
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.05" 
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 accent-[#141414]"
              />
              <span className="text-[10px] font-mono w-10">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={handleAutoFit}
                className="p-1.5 hover:bg-gray-100 rounded-md border border-[#14141422] transition-colors"
                title="Încadrare Automată"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            <div className="md:hidden flex items-center gap-1">
              <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-2 hover:bg-gray-100 rounded-full">
                <ZoomOut size={18} />
              </button>
              <span className="text-[10px] font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-gray-100 rounded-full">
                <ZoomIn size={18} />
              </button>
              <button onClick={handleAutoFit} className="p-2 hover:bg-gray-100 rounded-full">
                <Maximize2 size={18} />
              </button>
            </div>

            <div className="h-6 w-[1px] bg-[#14141422] mx-2" />

            <div className="flex bg-[#14141411] p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('2D')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-md",
                  viewMode === '2D' ? "bg-white shadow-sm font-bold" : "opacity-50 hover:opacity-100"
                )}
              >
                <Layout size={14} /> 2D
              </button>
              <button 
                onClick={() => setViewMode('3D')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-md",
                  viewMode === '3D' ? "bg-white shadow-sm font-bold" : "opacity-50 hover:opacity-100"
                )}
              >
                <Box size={14} /> 3D
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedId && (
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 bg-red-50 text-red-600 border border-red-200 text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                title="Șterge Selecția"
              >
                <Trash2 size={16} />
                <span className="hidden md:inline ml-2">Șterge</span>
              </button>
            )}
            <button 
              onClick={generateAIPanorama}
              disabled={isGenerating || placedFurniture.length === 0}
              className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 bg-emerald-600 text-white text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generează Panoramă AI"
            >
              <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
              <span className="hidden md:inline ml-2">{isGenerating ? 'Generare...' : 'Panoramă AI'}</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 bg-[#141414] text-white text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"
              title="Exportă Planul"
            >
              <Download size={16} />
              <span className="hidden md:inline ml-2">Exportă</span>
            </button>
          </div>
        </header>

        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto bg-[#E4E3E0] p-4 md:p-12 flex items-center justify-center touch-none"
          onMouseDown={handleContainerClick}
        >
          {viewMode === '2D' ? (
            <div 
              className="bg-white shadow-2xl border border-[#141414] relative transition-all duration-200"
              style={{ 
                width: roomDimensions.width * PIXELS_PER_CM * zoom, 
                height: roomDimensions.height * PIXELS_PER_CM * zoom,
                backgroundImage: 'radial-gradient(#14141422 1px, transparent 0)',
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`
              }}
            >
              <Stage
                ref={stageRef}
                width={roomDimensions.width * PIXELS_PER_CM}
                height={roomDimensions.height * PIXELS_PER_CM}
                scaleX={zoom}
                scaleY={zoom}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
              >
                <Layer>
                  {placedFurniture.map((item) => (
                    <FurnitureShape
                      key={item.id}
                      item={item}
                      isSelected={item.id === selectedId}
                      onSelect={() => setSelectedId(item.id)}
                      onChange={(newAttrs) => {
                        const items = placedFurniture.slice();
                        const index = items.findIndex(f => f.id === item.id);
                        items[index] = newAttrs;
                        setPlacedFurniture(items);
                      }}
                    />
                  ))}
                </Layer>
              </Stage>

              {/* Scale Indicator */}
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white border border-[#141414] px-2 py-1 text-[8px] md:text-[9px] font-mono pointer-events-none">
                1m = {100 * PIXELS_PER_CM}px
              </div>
            </div>
          ) : (
            <div className="w-full h-full border border-[#141414] shadow-2xl overflow-hidden rounded-lg">
              <Room3D furniture={placedFurniture} roomDimensions={roomDimensions} />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <footer className="h-8 border-t border-[#141414] bg-white flex items-center justify-between px-4 md:px-6 text-[8px] md:text-[9px] uppercase tracking-widest opacity-50">
          <div>Obiecte: {placedFurniture.length}</div>
          <div className="flex gap-2 md:gap-4">
            <span className="hidden sm:inline">Cameră: {roomDimensions.width} x {roomDimensions.height} cm</span>
            <span>Suprafață: {(roomDimensions.width * roomDimensions.height / 10000).toFixed(2)} m²</span>
          </div>
        </footer>
      </main>
      {/* Panorama Modal */}
      {showPanorama && panoramaUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-12">
          <div className="absolute top-6 right-6 flex gap-4">
            <a 
              href={panoramaUrl} 
              download="panorama-ai.png"
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <Download className="w-6 h-6" />
            </a>
            <button 
              onClick={() => setShowPanorama(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="w-full max-w-7xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light text-white tracking-widest uppercase">Panoramă Realistă AI</h2>
              <p className="text-white/50 text-sm italic">Generat pe baza designului tău curent</p>
            </div>
            
            <div className="relative aspect-[4/1] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl group">
              <img 
                src={panoramaUrl} 
                alt="AI Generated Panorama" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <p className="text-white/80 text-sm">Aceasta este o interpretare artistică a camerei tale folosind inteligența artificială.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setShowPanorama(false)}
                className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-emerald-50 transition-colors"
              >
                Înapoi la Editor
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Panorama Modal */}
      {showPanorama && panoramaUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-12">
          <div className="absolute top-6 right-6 flex gap-4">
            <a 
              href={panoramaUrl} 
              download="panorama-ai.png"
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <Download size={24} />
            </a>
            <button 
              onClick={() => setShowPanorama(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="w-full max-w-7xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light text-white tracking-widest uppercase">Panoramă Realistă AI</h2>
              <p className="text-white/50 text-sm italic">Generat pe baza designului tău curent</p>
            </div>
            
            <div className="relative aspect-[4/1] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl group">
              <img 
                src={panoramaUrl} 
                alt="AI Generated Panorama" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <p className="text-white/80 text-sm">Aceasta este o interpretare artistică a camerei tale folosind inteligența artificială.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setShowPanorama(false)}
                className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-emerald-50 transition-colors"
              >
                Înapoi la Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
