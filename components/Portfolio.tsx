
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowUpRight, Settings, Minus, Plus, X } from 'lucide-react';
import { WorkItem, Position, TileCoordinate } from '../types';

const Portfolio: React.FC = () => {
  // --- 1. Core State Management ---
  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  // Modal & Animation State
  const [selectedWork, setSelectedWork] = useState<{ 
      data: WorkItem; 
      initialStyles: { x: number; y: number; scale: number } 
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  
  // Configuration State
  const [config, setConfig] = useState({
    gap: 12,           // Tight gap
    baseScale: 0.45,   // Default size 45%
    viewportZoom: 1,   // Global zoom level
  });

  // Derived Constants
  const HOVER_MULTIPLIER = 1.4; // Hover is always 40% larger than base

  // Refs
  const dragDistance = useRef<number>(0);
  const lastInteraction = useRef(Date.now());
  const animationFrameRef = useRef<number>(0);

  // --- 2. Data ---
  const works: WorkItem[] = [
    { 
      id: 1, 
      color: "bg-stone-100", 
      title: "吊脚楼", 
      category: "建筑", 
      description: "土家族和苗族的传统干栏式建筑。多依河岸或陡坡而建，悬空的结构既防潮又防野兽，与山地地形和谐共生。",
      image: "https://i.postimg.cc/pdjrqjW1/diao-jiao-lou.png" 
    },
    { 
      id: 2, 
      color: "bg-red-100", 
      title: "虎头鞋", 
      category: "工艺", 
      description: "中国传统的童鞋。绣有精致夸张的老虎图案，被视为护身符，能驱邪避灾，保佑孩子健康强壮。",
      image: "https://i.postimg.cc/63N3SQqS/hu-tou-xie.png"
    },
    { 
      id: 3, 
      color: "bg-blue-100", 
      title: "蝴蝶妈妈", 
      category: "传说", 
      description: "在苗族神话中，蝴蝶妈妈是万物的始祖。她是苗族刺绣、银饰和剪纸中的核心纹样，象征着生命与繁衍。",
      image: "https://i.postimg.cc/gJPJ50jt/miao-zu-hu-die-ma-ma.png"
    },
    { 
      id: 4, 
      color: "bg-amber-100", 
      title: "苗族芦笙", 
      category: "音乐", 
      description: "苗族文化核心的竹制簧管乐器。芦笙常在求偶仪式、丰收庆典和舞蹈表演中吹奏，其多声部的旋律回荡在山谷之间。",
      image: "https://i.postimg.cc/hGmvpm4F/miao-zu-lu-sheng.png"
    },
    { 
      id: 5, 
      color: "bg-orange-100", 
      title: "泥哇呜", 
      category: "音乐", 
      description: "又称“泥哨”，是回族和苗族传统的陶土吹奏乐器。音色深沉古朴，常被塑造成动物或简单的几何形状。",
      image: "https://i.postimg.cc/sXRX82x0/miao-zu-ni-wa-wu.png"
    },
    { 
      id: 6, 
      color: "bg-rose-100", 
      title: "三炮台", 
      category: "饮食", 
      description: "回族的传统盖碗茶。用盖碗盛装，配料包括茶叶、冰糖、桂圆、红枣和枸杞，寓意健康长寿。",
      image: "https://i.postimg.cc/QtrtPMVr/san-pao-tai.png"
    },
    { 
      id: 7, 
      color: "bg-yellow-100", 
      title: "土家葱油饼", 
      category: "饮食", 
      description: "土家菜的招牌主食。这种煎饼通常包裹着肉末、韭菜和香葱，外皮酥脆，内馅鲜香软嫩。",
      image: "https://i.postimg.cc/26f6J53C/tu-jia-cong-you-bing.png"
    },
    { 
      id: 8, 
      color: "bg-emerald-100", 
      title: "咚咚喹", 
      category: "音乐", 
      description: "土家族的一种单簧气鸣乐器，传统上由竹子或芦苇制成。因其吹奏时发出“咚咚”的嗡嗡声而得名。",
      image: "https://i.postimg.cc/pTtT7dyM/tu-jia-zu-dong-dong-kui.png"
    },
    { 
      id: 9, 
      color: "bg-purple-100", 
      title: "五色糯米饭", 
      category: "节日", 
      description: "用天然植物提取液将糯米染成黑、红、黄、紫、白五种颜色。在姊妹饭节和清明节食用，象征五行和五谷丰登。",
      image: "https://i.postimg.cc/nztz5LMV/wu-se-nuo-mi.png"
    },
    { 
      id: 10, 
      color: "bg-red-200", 
      title: "西兰卡普", 
      category: "艺术", 
      description: "土家族的传统织锦，意为“有花的铺盖”。在木制织机上用棉、丝、毛交织而成，图案几何化，色彩艳丽，描绘生活场景和传说。",
      image: "https://i.postimg.cc/d1K1X0DD/xi-lan-ka-pu.png"
    },
    { 
      id: 11, 
      color: "bg-orange-200", 
      title: "油香", 
      category: "小吃", 
      description: "回族的传统油炸面食。金黄圆润，常在开斋节等宗教节日制作，分发给亲友邻里享用。",
      image: "https://i.postimg.cc/ZRhRgq0C/you-xiang.png"
    },
    { 
      id: 12, 
      color: "bg-stone-300", 
      title: "藏族男装", 
      category: "服饰", 
      description: "藏族男子通常身穿厚重的羊毛藏袍。为了适应高原气候调节体温，常将一只袖子脱下搭在肩上，展现出粗犷的适应力。",
      image: "https://i.postimg.cc/nzYzttQV/cang-zu-nan.png"
    },
    { 
      id: 13, 
      color: "bg-cyan-200", 
      title: "藏族女装", 
      category: "服饰", 
      description: "藏族妇女身穿长袖衬衫和围裹式长裙，常系着象征婚姻状况的彩色围裙（邦典），并佩戴绿松石、珊瑚和琥珀制成的首饰。",
      image: "https://i.postimg.cc/j5Q5rrJW/cang-zu-nu.png"
    },
    { 
      id: 14, 
      color: "bg-red-300", 
      title: "回族男装", 
      category: "服饰", 
      description: "回族男子传统上戴白色圆帽（号帽），白衬衫外罩简朴的马甲。这种装束体现了伊斯兰教谦逊、洁净和虔诚的价值观。",
      image: "https://i.postimg.cc/cHMHNN8w/hui-zu-nan.png"
    },
    { 
      id: 15, 
      color: "bg-green-200", 
      title: "回族女装", 
      category: "服饰", 
      description: "回族妇女通常佩戴盖头遮住头发和颈部，搭配传统长袍。绿色是她们文化中珍视的颜色，象征生命与自然。",
      image: "https://i.postimg.cc/QtktrrWc/hui-zu-nu.png"
    },
    { 
      id: 16, 
      color: "bg-blue-300", 
      title: "土家男装", 
      category: "服饰", 
      description: "土家男子身穿对襟或侧襟短袄，头上常缠包头帕。蓝色和黑色是主色调，源自传统的靛蓝染色工艺。",
      image: "https://i.postimg.cc/sxj2j0pb/tu-jia-zu-nan.png"
    },
    { 
      id: 17, 
      color: "bg-yellow-400", 
      title: "土家老者服饰", 
      category: "服饰", 
      description: "土家男性长者或在仪式中担任角色的人，会佩戴更复杂的头饰和绣有精美图案的长衫，象征其在社区中的地位和智慧。",
      image: "https://i.postimg.cc/gjz0zBv7/tu-jia-zu-nan2.png"
    },
    { 
      id: 18, 
      color: "bg-slate-300", 
      title: "土家女装", 
      category: "服饰", 
      description: "土家妇女身穿宽袖右衽短衣，衣边常装饰有刺绣花边（西兰卡普纹样）。节日期间佩戴银饰以驱邪祈福。",
      image: "https://i.postimg.cc/vTYmYSrF/tu-jia-zu-nu.png"
    },
    { 
      id: 19, 
      color: "bg-indigo-200", 
      title: "苗族女装", 
      category: "服饰", 
      description: "苗族妇女以其壮观的银头饰和繁复的刺绣闻名。银饰图案讲述着苗族的历史，包括他们的迁徙传说。",
      image: "https://i.postimg.cc/0jkNkHp0/miao-zu-nu1.png"
    },
    { 
      id: 20, 
      color: "bg-amber-300", 
      title: "苗族男装", 
      category: "服饰", 
      description: "苗族男子通常穿短上衣和宽裤，多染成靛蓝色。腰间系带，头缠包头帕，这种装束适合山地生活劳作。",
      image: "https://i.postimg.cc/Y9f9wwmn/miao-zu-nan.png"
    },
    { 
      id: 21, 
      color: "bg-sky-200", 
      title: "苗族盛装男饰", 
      category: "服饰", 
      description: "在芦笙节等节日期间，苗族男子身穿装饰华丽的上衣，有时佩戴银项圈。衣物上的图案常代表图腾动物或家族标志。",
      image: "https://i.postimg.cc/Ss7sppz1/miao-zu-nan2.png"
    },
    { 
      id: 22, 
      color: "bg-pink-300", 
      title: "苗族盛装女饰", 
      category: "服饰", 
      description: "这种苗族盛装女饰的特点是高耸的结构化头饰和大胆的几何刺绣。整套服饰是纺织艺术的杰作，往往耗时数月甚至数年完成。",
      image: "https://i.postimg.cc/NFs0sP17/miao-zu-nu2.png"
    },
    {
      id: 23,
      color: "bg-stone-100",
      title: "干栏建筑",
      category: "建筑",
      description: "一种为了适应南方潮湿气候而建的传统建筑形式，底层架空，楼上居住。既能防潮防洪，又能有效利用山地空间。",
      image: "https://i.postimg.cc/pdjrqjW1/diao-jiao-lou.png"
    },
    {
      id: 24,
      color: "bg-red-100",
      title: "民间布艺",
      category: "工艺",
      description: "中国民间传统手工技艺的代表，以布为原料，集剪纸、刺绣、制作工艺于一体。虎头鞋便是其中最具代表性的作品之一。",
      image: "https://i.postimg.cc/63N3SQqS/hu-tou-xie.png"
    }
  ];

  // --- 3. Grid Dimensions Calculation ---
  const COLS = 4;
  const CONTENT_WIDTH = 1200; 
  const ITEM_SIZE = (CONTENT_WIDTH - (COLS - 1) * config.gap) / COLS;
  const ROWS = Math.ceil(works.length / COLS);
  const CONTENT_HEIGHT = ROWS * ITEM_SIZE + (ROWS - 1) * config.gap;
  const UNIT_WIDTH = CONTENT_WIDTH + config.gap;
  const UNIT_HEIGHT = CONTENT_HEIGHT + config.gap;

  // --- 4. Interactions & Animation ---
  
  const resetInteraction = () => {
    lastInteraction.current = Date.now();
  };

  // Auto-roam animation (Breathing/Harmonic motion)
  useEffect(() => {
    const animate = () => {
      const timeSinceInteraction = (Date.now() - lastInteraction.current) / 1000;
      
      // Only roam if idle for 2s and not doing anything else
      if (timeSinceInteraction > 2 && !isDragging && !isModalOpen && !showSettings) {
         // Create a gentle, harmonic ease-in-ease-out wandering effect
         const t = Date.now() / 3000; // Time factor
         const speed = 0.8; // Max roam speed
         
         // Using Sin/Cos creates smooth acceleration and deceleration
         const dx = Math.sin(t) * speed;
         const dy = Math.cos(t * 0.7) * speed;

         setPosition(prev => ({
           x: prev.x + dx,
           y: prev.y + dy
         }));
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isDragging, isModalOpen, showSettings]);

  // Keyboard 's' for settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        setShowSettings(prev => !prev);
      }
      resetInteraction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth Scroll / Trackpad
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      resetInteraction();
      if (isModalOpen) return;

      setPosition(prev => ({
        x: prev.x + e.deltaX,
        y: prev.y + e.deltaY
      }));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isModalOpen]);


  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Buttons and modal blocking
    if (e.target instanceof Element && (e.target.closest('button') || e.target.closest('.no-drag'))) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    dragDistance.current = 0;
    resetInteraction();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    resetInteraction(); // Also reset on simple hover movement
    if (!isDragging) return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calculate distance to differentiate click vs drag
    const dx = e.clientX - (dragStart.x + position.x);
    const dy = e.clientY - (dragStart.y + position.y);
    dragDistance.current += Math.abs(dx) + Math.abs(dy);

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- 5. Tile Logic ---
  const tiles = useMemo(() => {
    const offsetX = position.x % UNIT_WIDTH;
    const offsetY = position.y % UNIT_HEIGHT;
    const range = [-1, 0, 1]; 
    
    const tileList: TileCoordinate[] = [];
    range.forEach(ix => {
      range.forEach(iy => {
        tileList.push({
          key: `${ix}-${iy}`,
          x: offsetX + (ix * UNIT_WIDTH),
          y: offsetY + (iy * UNIT_HEIGHT)
        });
      });
    });
    return tileList;
  }, [position, UNIT_WIDTH, UNIT_HEIGHT]);

  // --- 6. Item Click & Transition ---
  const handleTileClick = (e: React.MouseEvent, work: WorkItem) => {
    if (dragDistance.current > 5) return; // Ignore if it was a drag

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Calculate center deviation for animation trajectory
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const itemCenterX = rect.left + rect.width / 2;
    const itemCenterY = rect.top + rect.height / 2;

    setSelectedWork({
        data: work,
        initialStyles: {
            x: itemCenterX - centerX,
            y: itemCenterY - centerY,
            scale: 0.2 // Starting scale relative to final modal size
        }
    });
    
    // Small delay to let React render the modal at start position before animating
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedWork(null), 400); // Wait for transition
  };

  return (
    <div 
      className="fixed inset-0 bg-white cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header - Transparent & Minimal */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 pointer-events-none flex justify-end">
         {/* Settings Button */}
         <button 
            onClick={() => setShowSettings(!showSettings)}
            className="pointer-events-auto p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm"
         >
            <Settings className="w-5 h-5 text-gray-700" />
         </button>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-16 right-6 z-50 w-64 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 pointer-events-auto">
           <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
             <Settings className="w-4 h-4" /> 页面设置
           </h3>
           
           <div className="space-y-4">
              {/* Gap Control */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>间距 (Gap)</span>
                  <span>{config.gap}px</span>
                </div>
                <input 
                  type="range" min="0" max="50" value={config.gap}
                  onChange={(e) => setConfig({...config, gap: Number(e.target.value)})}
                  className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Scale Control */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>大小 (Scale)</span>
                  <span>{Math.round(config.baseScale * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="1" step="0.05" value={config.baseScale}
                  onChange={(e) => setConfig({...config, baseScale: Number(e.target.value)})}
                  className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Viewport Zoom */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>全局视角 (Zoom)</span>
                  <span>{config.viewportZoom}x</span>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => setConfig(c => ({...c, viewportZoom: Math.max(0.5, c.viewportZoom - 0.1)}))} className="p-1 hover:bg-gray-100 rounded"><Minus className="w-3 h-3"/></button>
                   <input 
                      type="range" min="0.5" max="2" step="0.1" value={config.viewportZoom}
                      onChange={(e) => setConfig({...config, viewportZoom: Number(e.target.value)})}
                      className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                   <button onClick={() => setConfig(c => ({...c, viewportZoom: Math.min(2, c.viewportZoom + 0.1)}))} className="p-1 hover:bg-gray-100 rounded"><Plus className="w-3 h-3"/></button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
        <div className="bg-black text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-sm font-medium pointer-events-auto cursor-pointer flex items-center gap-2">
           Contact <ArrowUpRight className="w-4 h-4"/>
        </div>
      </div>

      {/* Canvas Area with Viewport Zoom */}
      <div 
        className="absolute inset-0 will-change-transform origin-center transition-transform duration-300 ease-out"
        style={{ transform: `scale(${config.viewportZoom})` }}
      >
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="absolute will-change-transform"
            style={{
              width: CONTENT_WIDTH,
              height: CONTENT_HEIGHT,
              transform: `translate3d(${tile.x}px, ${tile.y}px, 0)`,
            }}
          >
            <div 
              className="grid grid-cols-4 w-full h-full"
              style={{ gap: config.gap }}
            >
              {works.map((work) => (
                <div 
                  key={work.id}
                  className="relative group flex items-center justify-center pointer-events-none" 
                  // pointer-events-none allows dragging on the whitespace
                >
                  {/* The interactive image object */}
                  <div 
                    className="cursor-pointer pointer-events-auto relative transition-transform duration-500 ease-out will-change-transform"
                    style={{
                        width: '100%',
                        height: '100%',
                        // CSS Variables for dynamic scaling
                        // @ts-ignore
                        '--base-scale': config.baseScale,
                        // Fix Bug 2: Hover scale is computed from base scale * Multiplier
                        // @ts-ignore
                        '--hover-scale': config.baseScale * HOVER_MULTIPLIER
                    }}
                    onClick={(e) => handleTileClick(e, work)}
                  >
                     <div 
                        className="w-full h-full bg-contain bg-center bg-no-repeat transform scale-[var(--base-scale)] group-hover:scale-[var(--hover-scale)] transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
                        style={{ backgroundImage: `url(${work.image})` }}
                     />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedWork && (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none`}
        >
          {/* Backdrop */}
          <div 
             className={`absolute inset-0 bg-white/90 backdrop-blur-xl transition-opacity duration-500 ease-in-out pointer-events-auto ${isModalOpen ? 'opacity-100' : 'opacity-0'}`}
             onClick={closeModal}
          />

          {/* Card Container with Coordinate Transition */}
          <div 
             className={`relative w-full max-w-4xl h-[80vh] flex shadow-2xl overflow-hidden rounded-3xl bg-white transition-all duration-700 pointer-events-auto no-drag`}
             style={{
                // Magic Movement: Start from the icon position, end at (0,0)
                // @ts-ignore
                '--start-x': `${selectedWork.initialStyles.x}px`,
                '--start-y': `${selectedWork.initialStyles.y}px`,
                // We use transform to animate smoothly
                transform: isModalOpen 
                    ? 'translate3d(0, 0, 0) scale(1)' 
                    : `translate3d(var(--start-x), var(--start-y), 0) scale(0.2)`,
                opacity: isModalOpen ? 1 : 0,
                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' 
             }}
          >
             <button 
                onClick={closeModal}
                className="absolute top-6 right-6 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
             >
                <X className="w-6 h-6 text-gray-700" />
             </button>

             <div className="grid md:grid-cols-2 w-full h-full">
               {/* Left: Image Hero */}
               <div className="relative h-full bg-white flex items-center justify-center p-12">
                  <img 
                    src={selectedWork.data.image} 
                    alt={selectedWork.data.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
               </div>

               {/* Right: Content */}
               <div className="p-12 flex flex-col justify-center bg-gray-50/50">
                  <div className="mb-8">
                    <span className="px-3 py-1 bg-black text-white text-xs font-bold tracking-widest rounded-full uppercase">
                      {selectedWork.data.category}
                    </span>
                  </div>
                  
                  <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                    {selectedWork.data.title}
                  </h2>
                  
                  <p className="text-lg text-gray-600 leading-relaxed font-light">
                    {selectedWork.data.description}
                  </p>

                  <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
                     <span className="text-xs font-mono text-gray-400">NO. {String(selectedWork.data.id).padStart(2, '0')}</span>
                     <button className="text-sm font-bold border-b-2 border-black pb-0.5 hover:text-gray-600 hover:border-gray-400 transition-colors">
                        了解更多
                     </button>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
