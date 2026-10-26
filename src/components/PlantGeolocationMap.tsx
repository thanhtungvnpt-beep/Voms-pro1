import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Globe, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, ShieldCheck, 
  AlertCircle, Factory, Navigation, Radio, Activity, Cpu, Layers,
  ChevronRight, ExternalLink, Zap
} from 'lucide-react';
import { WORLD_GEO_JSON, SATELLITE_GEO_PLANTS, LOGISTICS_HUBS, PlantGeoLocation } from '../data/worldGeoData';
import { soundManager } from '../utils/audio';

interface PlantGeolocationMapProps {
  onSelectPlant?: (plantId: string) => void;
  onOpenPlantModal?: (plantId: string) => void;
  className?: string;
}

export const PlantGeolocationMap: React.FC<PlantGeolocationMapProps> = ({
  onSelectPlant,
  onOpenPlantModal,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Component state
  const [selectedPlant, setSelectedPlant] = useState<PlantGeoLocation | null>(SATELLITE_GEO_PLANTS[6]); // Default to DAAL (Critical)
  const [filterStatus, setFilterStatus] = useState<'all' | 'optimal' | 'warning' | 'critical'>('all');
  const [viewPreset, setViewPreset] = useState<'world' | 'vietnam' | 'korea'>('vietnam');
  const [showLogisticsRoutes, setShowLogisticsRoutes] = useState<boolean>(true);
  const [hoveredPlant, setHoveredPlant] = useState<PlantGeoLocation | null>(null);

  // Zoom reference to programmatically trigger zoom in/out
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  // Filtered plant list
  const displayedPlants = useMemo(() => {
    if (filterStatus === 'all') return SATELLITE_GEO_PLANTS;
    return SATELLITE_GEO_PLANTS.filter(p => p.status === filterStatus);
  }, [filterStatus]);

  // Counts
  const counts = useMemo(() => ({
    total: SATELLITE_GEO_PLANTS.length,
    optimal: SATELLITE_GEO_PLANTS.filter(p => p.status === 'optimal').length,
    warning: SATELLITE_GEO_PLANTS.filter(p => p.status === 'warning').length,
    critical: SATELLITE_GEO_PLANTS.filter(p => p.status === 'critical').length,
  }), []);

  // Initialize and Render D3 Map
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 520;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Clear previous contents
    svg.selectAll('*').remove();

    // Defs for gradients and glow filters
    const defs = svg.append('defs');

    // Glow filter for radar and optimal nodes
    const glowFilter = defs.append('filter')
      .attr('id', 'glow-optimal')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const mergeOptimal = glowFilter.append('feMerge');
    mergeOptimal.append('feMergeNode').attr('in', 'coloredBlur');
    mergeOptimal.append('feMergeNode').attr('in', 'SourceGraphic');

    // Glow filter for critical nodes
    const critGlow = defs.append('filter')
      .attr('id', 'glow-critical')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    critGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const mergeCrit = critGlow.append('feMerge');
    mergeCrit.append('feMergeNode').attr('in', 'coloredBlur');
    mergeCrit.append('feMergeNode').attr('in', 'SourceGraphic');

    // Grid pattern for tactical cybernetic background
    const pattern = defs.append('pattern')
      .attr('id', 'cyber-grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.4);

    // Root background rect
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#050b14');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#cyber-grid)');

    // Main map container group for zoom & pan
    const g = svg.append('g').attr('class', 'map-stage');
    gRef.current = g;

    // Geo Projection setup: Focused around East/Southeast Asia (center ~ 115°E, 23°N)
    const projection = d3.geoMercator()
      .center([115, 23])
      .scale(width * 1.6)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Graticule (lat/long lines)
    const graticule = d3.geoGraticule().step([10, 10]);
    g.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.7)
      .attr('stroke-dasharray', '2,4')
      .attr('stroke-opacity', 0.6);

    // Render Landmass Features
    const landGroup = g.append('g').attr('class', 'landmasses');
    landGroup.selectAll('path.land')
      .data(WORLD_GEO_JSON.features)
      .enter()
      .append('path')
      .attr('class', 'land')
      .attr('d', pathGenerator as any)
      .attr('fill', (d: any) => {
        if (d.properties.region === 'VIETNAM') return '#0f233a';
        if (d.properties.region === 'KOREA') return '#112942';
        return '#0b1626';
      })
      .attr('stroke', (d: any) => {
        if (d.properties.region === 'VIETNAM' || d.properties.region === 'KOREA') return '#0284c7';
        return '#1e3a5f';
      })
      .attr('stroke-width', (d: any) => {
        if (d.properties.region === 'VIETNAM' || d.properties.region === 'KOREA') return 1.2;
        return 0.8;
      })
      .attr('stroke-opacity', 0.8);

    // Render Shipping / Supply Chain Logistics Corridors
    if (showLogisticsRoutes) {
      const routesGroup = g.append('g').attr('class', 'logistics-routes');

      // Supply routes: Plant DAAL & KHV to Busan & Hai Phong
      const routes = [
        { from: [108.202, 16.054], to: [129.075, 35.179], name: 'DAD-PUS Corridor' }, // DAAL to Busan
        { from: [106.076, 21.186], to: [129.075, 35.179], name: 'KHV-PUS Trunk' },    // KHV to Busan
        { from: [106.688, 20.844], to: [128.344, 36.119], name: 'HPH-Gumi Direct' },   // Hai Phong to Gumi
        { from: [106.076, 21.186], to: [108.202, 16.054], name: 'North-Central Transit' } // KHV to DAAL
      ];

      routes.forEach(route => {
        const p1 = projection(route.from as [number, number]);
        const p2 = projection(route.to as [number, number]);
        if (!p1 || !p2) return;

        // Curved great circle representation
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;

        routesGroup.append('path')
          .attr('d', `M${p1[0]},${p1[1]}A${dr},${dr} 0 0,1 ${p2[0]},${p2[1]}`)
          .attr('fill', 'none')
          .attr('stroke', '#06b6d4')
          .attr('stroke-width', 1.2)
          .attr('stroke-dasharray', '4,4')
          .attr('stroke-opacity', 0.45);
      });

      // Logistics Hub Markers
      const hubGroup = g.append('g').attr('class', 'logistics-hubs');
      LOGISTICS_HUBS.forEach(hub => {
        const pos = projection(hub.coordinates);
        if (!pos) return;

        hubGroup.append('rect')
          .attr('x', pos[0] - 3)
          .attr('y', pos[1] - 3)
          .attr('width', 6)
          .attr('height', 6)
          .attr('fill', '#38bdf8')
          .attr('transform', `rotate(45 ${pos[0]} ${pos[1]})`)
          .attr('opacity', 0.7);

        hubGroup.append('text')
          .attr('x', pos[0] + 7)
          .attr('y', pos[1] + 3)
          .attr('fill', '#94a3b8')
          .attr('font-size', '8px')
          .attr('font-family', 'monospace')
          .text(hub.code);
      });
    }

    // Render Plant Markers Layer
    const plantGroup = g.append('g').attr('class', 'plant-nodes');

    displayedPlants.forEach(plant => {
      const pos = projection(plant.coordinates);
      if (!pos) return;

      const nodeG = plantGroup.append('g')
        .attr('class', `plant-node plant-${plant.id}`)
        .attr('transform', `translate(${pos[0]}, ${pos[1]})`)
        .style('cursor', 'pointer');

      // Status Colors
      const isCrit = plant.status === 'critical';
      const isWarn = plant.status === 'warning';
      const mainColor = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
      const filterId = isCrit ? 'url(#glow-critical)' : 'url(#glow-optimal)';

      // Outer Pulsing Radar Ring
      const radar = nodeG.append('circle')
        .attr('r', isCrit ? 18 : isWarn ? 14 : 10)
        .attr('fill', mainColor)
        .attr('fill-opacity', isCrit ? 0.25 : 0.15)
        .attr('stroke', mainColor)
        .attr('stroke-width', isCrit ? 1.5 : 1)
        .attr('stroke-dasharray', isCrit ? '2,2' : 'none');

      // Animated pulse for critical/warning
      if (isCrit || isWarn) {
        radar.append('animate')
          .attr('attributeName', 'r')
          .attr('values', `${isCrit ? 10 : 8};${isCrit ? 26 : 18};${isCrit ? 10 : 8}`)
          .attr('dur', isCrit ? '1.8s' : '2.6s')
          .attr('repeatCount', 'indefinite');
        radar.append('animate')
          .attr('attributeName', 'fill-opacity')
          .attr('values', '0.35;0.05;0.35')
          .attr('dur', isCrit ? '1.8s' : '2.6s')
          .attr('repeatCount', 'indefinite');
      }

      // Mid Circle Base
      nodeG.append('circle')
        .attr('r', 8)
        .attr('fill', '#070f1e')
        .attr('stroke', mainColor)
        .attr('stroke-width', 2)
        .attr('filter', filterId);

      // Core Solid Center
      nodeG.append('circle')
        .attr('r', 3.5)
        .attr('fill', mainColor);

      // Plant Code Label Badge
      const isSelected = selectedPlant?.id === plant.id;
      const labelG = nodeG.append('g')
        .attr('transform', `translate(12, ${isCrit ? -4 : 0})`);

      // Label background box
      labelG.append('rect')
        .attr('x', -2)
        .attr('y', -9)
        .attr('width', plant.id.length * 6.5 + 16)
        .attr('height', 16)
        .attr('rx', 3)
        .attr('fill', isSelected ? '#1e293b' : '#091120')
        .attr('stroke', isSelected ? '#38bdf8' : mainColor)
        .attr('stroke-width', isSelected ? 1.5 : 0.8)
        .attr('opacity', 0.95);

      // Status indicator pip inside badge
      labelG.append('circle')
        .attr('cx', 4)
        .attr('cy', -1)
        .attr('r', 2.5)
        .attr('fill', mainColor);

      // Label text
      labelG.append('text')
        .attr('x', 10)
        .attr('y', 2)
        .attr('fill', isSelected ? '#ffffff' : '#cbd5e1')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'monospace')
        .text(plant.id);

      // Interactive Events
      nodeG.on('mouseenter', () => {
        setHoveredPlant(plant);
      });

      nodeG.on('mouseleave', () => {
        setHoveredPlant(null);
      });

      nodeG.on('click', (event) => {
        event.stopPropagation();
        soundManager.playClick();
        setSelectedPlant(plant);
        if (onSelectPlant) onSelectPlant(plant.id);
      });
    });

    // Zoom and Pan Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 12])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Apply preset zoom transform based on current viewPreset
    applyPresetView(viewPreset, width, height, projection, zoom, svg);

  }, [displayedPlants, showLogisticsRoutes, viewPreset]);

  // View Preset Handler
  const applyPresetView = (
    preset: 'world' | 'vietnam' | 'korea',
    width: number,
    height: number,
    projection: d3.GeoProjection,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) => {
    let targetCenter: [number, number] = [107.5, 20.0];
    let targetScale = 1.0;

    if (preset === 'world') {
      targetCenter = [115, 24];
      targetScale = 0.9;
    } else if (preset === 'vietnam') {
      targetCenter = [106.8, 19.8];
      targetScale = 2.4;
    } else if (preset === 'korea') {
      targetCenter = [128.3, 36.1];
      targetScale = 3.6;
    }

    const targetPos = projection(targetCenter);
    if (!targetPos) return;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(targetScale)
      .translate(-targetPos[0], -targetPos[1]);

    svg.transition().duration(600).call(zoom.transform, transform);
  };

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    soundManager.playClick();
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.35);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    soundManager.playClick();
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.74);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    soundManager.playClick();
    setViewPreset('vietnam');
  };

  return (
    <div className={`relative flex flex-col bg-[#070e1b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl ${className}`}>
      {/* Top Header & Tactical Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 gap-3 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center">
            <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                BẢN ĐỒ ĐỊA LÝ VỆ TINH 7 NHÀ MÁY (D3.JS GEOLOCATION)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                LIVE D3 PROJECTION
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Giám sát tọa độ địa không gian thực tế tại Việt Nam & Hàn Quốc, hải trình xuất cảng và luồng logistics.
            </p>
          </div>
        </div>

        {/* View Presets & Quick Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Quick Counters */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-[10px] font-mono">
            <button
              onClick={() => { soundManager.playClick(); setFilterStatus('all'); }}
              className={`px-2 py-1 rounded transition ${filterStatus === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Tất cả ({counts.total})
            </button>
            <button
              onClick={() => { soundManager.playClick(); setFilterStatus('optimal'); }}
              className={`px-2 py-1 rounded flex items-center space-x-1 transition ${filterStatus === 'optimal' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30' : 'text-emerald-400 hover:text-emerald-300'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Tối ưu ({counts.optimal})</span>
            </button>
            <button
              onClick={() => { soundManager.playClick(); setFilterStatus('warning'); }}
              className={`px-2 py-1 rounded flex items-center space-x-1 transition ${filterStatus === 'warning' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/30' : 'text-amber-400 hover:text-amber-300'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Cảnh báo ({counts.warning})</span>
            </button>
            <button
              onClick={() => { soundManager.playClick(); setFilterStatus('critical'); }}
              className={`px-2 py-1 rounded flex items-center space-x-1 transition ${filterStatus === 'critical' ? 'bg-red-950 text-red-300 font-bold border border-red-500/30' : 'text-red-400 hover:text-red-300'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>Nguy cấp ({counts.critical})</span>
            </button>
          </div>

          {/* Region Presets */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-[10px] font-mono">
            <button
              onClick={() => { soundManager.playClick(); setViewPreset('vietnam'); }}
              className={`px-2.5 py-1 rounded transition ${viewPreset === 'vietnam' ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/30' : 'text-slate-400'}`}
            >
              Cụm Việt Nam
            </button>
            <button
              onClick={() => { soundManager.playClick(); setViewPreset('korea'); }}
              className={`px-2.5 py-1 rounded transition ${viewPreset === 'korea' ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/30' : 'text-slate-400'}`}
            >
              HQ Hàn Quốc
            </button>
            <button
              onClick={() => { soundManager.playClick(); setViewPreset('world'); }}
              className={`px-2.5 py-1 rounded transition ${viewPreset === 'world' ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/30' : 'text-slate-400'}`}
            >
              Toàn cầu
            </button>
          </div>

          {/* Logistics Route Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowLogisticsRoutes(prev => !prev);
            }}
            className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 font-mono transition ${
              showLogisticsRoutes 
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Bật/Tắt Luồng Tuyến Logistics"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div ref={containerRef} className="relative w-full h-[460px] min-h-[420px] bg-[#050b14] overflow-hidden select-none">
        <svg ref={svgRef} className="w-full h-full block" />

        {/* Map On-Screen Controls */}
        <div className="absolute top-4 left-4 flex flex-col space-y-1.5 z-20">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center transition shadow-lg"
            title="Thu phóng gần"
          >
            <ZoomIn className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center transition shadow-lg"
            title="Thu phóng xa"
          >
            <ZoomOut className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center transition shadow-lg"
            title="Đặt lại khung nhìn"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tactical Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 space-y-1.5 z-20 shadow-xl max-w-xs">
          <div className="font-bold text-white text-[11px] pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>CHÚ THÍCH TRẠNG THÁI</span>
            <span className="text-[9px] text-cyan-400">7 SATELLITE NODES</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>Optimal (Tối ưu): OEE ≥ 85%, Không nghẽn</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span>Warning (Cảnh báo): Rung máy, Thiếu thợ</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
            <span>Critical (Nguy cấp): Đứt phôi A980 (DAAL)</span>
          </div>
          <div className="pt-1 border-t border-slate-800 text-[9px] text-slate-500 flex items-center justify-between">
            <span>Hải trình xuất khẩu: Xanh ngọc đứt nét</span>
            <span>Kéo/Lăn để Zoom</span>
          </div>
        </div>

        {/* Hover Plant Tooltip */}
        {hoveredPlant && (
          <div className="absolute top-4 right-4 pointer-events-none bg-slate-900/95 border border-cyan-500/50 rounded-xl p-3 shadow-2xl z-30 font-mono text-xs w-64 backdrop-blur-md animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Factory className="w-3.5 h-3.5 text-cyan-400" />
                <span>{hoveredPlant.name}</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                hoveredPlant.status === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                hoveredPlant.status === 'warning' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {hoveredPlant.status.toUpperCase()}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Vị trí:</span>
                <span className="text-slate-200">{hoveredPlant.region}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>OEE / Tiến độ:</span>
                <span className="text-cyan-400 font-bold">{hoveredPlant.oee}% ({Math.round((hoveredPlant.actual/hoveredPlant.target)*100)}%)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Độ trễ truyền dẫn:</span>
                <span className="text-emerald-400">{hoveredPlant.latencyMs}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Plant Telemetry & Diagnostic Footer Card */}
      {selectedPlant && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Plant Identification & Status */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedPlant.status === 'critical' ? 'bg-red-500 animate-ping' :
                  selectedPlant.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <span>{selectedPlant.code} — {selectedPlant.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({selectedPlant.region}, {selectedPlant.country})</span>
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                  selectedPlant.status === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                  selectedPlant.status === 'warning' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {selectedPlant.statusText}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {selectedPlant.specialty} • Quản lý: <span className="text-slate-200">{selectedPlant.manager}</span> • Quy mô: <span className="text-slate-200">{selectedPlant.lines} chuyền sản xuất</span>
              </p>
              {selectedPlant.bottleneck && (
                <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded mt-1 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Điểm nghẽn cục bộ: {selectedPlant.bottleneck}</span>
                </div>
              )}
            </div>

            {/* Metrics Triad & Action Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Sản lượng / Mục tiêu</div>
                <div className="text-xs font-bold text-white">
                  {selectedPlant.actual.toLocaleString()} / {selectedPlant.target.toLocaleString()}
                  <span className="text-cyan-400 ml-1">({Math.round((selectedPlant.actual / selectedPlant.target) * 100)}%)</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Chỉ số OEE</div>
                <div className={`text-xs font-bold ${
                  selectedPlant.oee >= 85 ? 'text-emerald-400' : selectedPlant.oee >= 70 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {selectedPlant.oee}%
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Tỷ lệ Lỗi (Defect)</div>
                <div className="text-xs font-bold text-slate-300">
                  {selectedPlant.activeDefectRate}%
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (onOpenPlantModal) onOpenPlantModal(selectedPlant.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center space-x-1.5 transition active:scale-95"
              >
                <span>Hồ Sơ Nhà Máy</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {selectedPlant.status !== 'optimal' && (
                <button
                  onClick={() => {
                    soundManager.playSuccess();
                    // trigger quick dispatch or AI action
                    if (onSelectPlant) onSelectPlant(selectedPlant.id);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center space-x-1.5 transition shadow-lg shadow-cyan-600/20 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Xử Lý Cảnh Báo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
