import React from 'react';
import { PlantMetric } from '../types';
import { soundManager } from '../utils/audio';

interface PlantKpiBarProps {
  plants: PlantMetric[];
  selectedPlantId: string | null;
  onSelectPlant: (plant: PlantMetric) => void;
}

export const PlantKpiBar: React.FC<PlantKpiBarProps> = ({
  plants,
  selectedPlantId,
  onSelectPlant
}) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
      {plants.map((plant) => {
        const isSelected = selectedPlantId === plant.id;
        return (
          <div
            key={plant.id}
            onClick={() => {
              soundManager.playClick();
              onSelectPlant(plant);
            }}
            className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer group bg-[#0d1321]/80 hover:scale-[1.02] flex flex-col justify-between ${
              isSelected
                ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20'
                : plant.status === 'critical'
                ? 'border-red-500/80 shadow-lg shadow-red-500/15'
                : plant.status === 'warning'
                ? 'border-amber-500/60'
                : 'border-slate-800 hover:border-cyan-500/50'
            }`}
          >
            {/* Thumbnail Header */}
            <div className="h-16 w-full relative overflow-hidden bg-slate-900">
              <img
                src={plant.imgUrl}
                alt={plant.name}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1321] via-transparent to-transparent" />
              
              {/* Rate pill */}
              <span
                className={`absolute top-1.5 right-1.5 text-[10px] font-mono font-black px-1.5 py-0.5 rounded shadow ${
                  plant.status === 'critical'
                    ? 'bg-red-500 text-white animate-pulse'
                    : plant.status === 'warning'
                    ? 'bg-amber-500/90 text-slate-950'
                    : 'bg-emerald-500/90 text-slate-950'
                }`}
              >
                {plant.rate}%
              </span>

              {/* Plant Short Tag */}
              <span className="absolute bottom-1 left-2 text-[10px] font-mono font-bold text-slate-300 drop-shadow">
                {plant.id}
              </span>
            </div>

            {/* Plant Details */}
            <div className="p-2.5 space-y-1">
              <div className="font-bold text-xs text-white truncate" title={plant.name}>
                {plant.name}
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Sản lượng:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {(plant.actual / 1000).toFixed(1)}k{' '}
                  <span className="text-slate-500 font-normal">/ {(plant.target / 1000).toFixed(1)}k</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">OEE:</span>
                <span className={`font-mono font-bold ${
                  plant.oee < 70 ? 'text-red-400' : plant.oee < 85 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {plant.oee}%
                </span>
              </div>

              <div
                className={`text-[10px] truncate pt-0.5 font-medium ${
                  plant.status === 'critical'
                    ? 'text-red-400 font-bold'
                    : plant.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
                title={plant.statusText}
              >
                ● {plant.statusText}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};
