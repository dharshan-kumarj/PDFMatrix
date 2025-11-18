import React from 'react';

export type PdfQualityLevel = 'high' | 'medium' | 'low' | 'custom';

export interface PdfQualitySettings {
  level: PdfQualityLevel;
  imageQuality: number; // 0.1 to 1.0 for JPEG quality
  imageMaxDimension: number; // Max width/height in pixels (0 = no limit)
  useObjectStreams: boolean; // PDF compression
}

export const DEFAULT_QUALITY_PRESETS: Record<PdfQualityLevel, Omit<PdfQualitySettings, 'level'>> = {
  high: {
    imageQuality: 0.95,
    imageMaxDimension: 0, // No limit
    useObjectStreams: true,
  },
  medium: {
    imageQuality: 0.85,
    imageMaxDimension: 2048,
    useObjectStreams: true,
  },
  low: {
    imageQuality: 0.7,
    imageMaxDimension: 1536,
    useObjectStreams: true,
  },
  custom: {
    imageQuality: 0.85,
    imageMaxDimension: 2048,
    useObjectStreams: true,
  },
};

interface PdfQualitySelectorProps {
  qualitySettings: PdfQualitySettings;
  onChange: (settings: PdfQualitySettings) => void;
  showCustomControls?: boolean;
  className?: string;
}

const PdfQualitySelector: React.FC<PdfQualitySelectorProps> = (props) => {
  const {
    qualitySettings,
    onChange,
    showCustomControls = false,
    className = '',
  } = props;
  const handleQualityLevelChange = (level: PdfQualityLevel) => {
    const preset = DEFAULT_QUALITY_PRESETS[level];
    onChange({
      level,
      ...preset,
    });
  };

  const handleCustomSettingChange = (
    field: keyof Omit<PdfQualitySettings, 'level'>,
    value: number | boolean
  ) => {
    onChange({
      ...qualitySettings,
      level: 'custom',
      [field]: value,
    });
  };

  const getQualityInfo = (level: PdfQualityLevel): { title: string; description: string; fileSize: string; icon: string } => {
    switch (level) {
      case 'high':
        return {
          icon: '🔥',
          title: 'High Quality',
          description: 'Best quality, original resolution',
          fileSize: 'Largest file size',
        };
      case 'medium':
        return {
          icon: '⚖️',
          title: 'Balanced',
          description: 'Good quality with compression',
          fileSize: '~50% smaller',
        };
      case 'low':
        return {
          icon: '⚡',
          title: 'Small Size',
          description: 'Optimized for quick sharing',
          fileSize: '~70% smaller',
        };
      case 'custom':
        return {
          icon: '⚙️',
          title: 'Custom',
          description: 'Fine-tune settings yourself',
          fileSize: 'Varies',
        };
      default:
        return {
          icon: '⚖️',
          title: 'Balanced',
          description: 'Good quality with compression',
          fileSize: '~50% smaller',
        };
    }
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800/50 to-black/50 rounded-xl p-6 border border-green-500/30 ${className}`}>
      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
        <span>📊</span> Output Quality
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {(['high', 'medium', 'low', 'custom'] as PdfQualityLevel[]).map((level) => {
          const info = getQualityInfo(level);
          return (
            <button
              key={level}
              onClick={() => handleQualityLevelChange(level)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                qualitySettings.level === level
                  ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                  : 'border-green-500/20 hover:border-green-500/40 bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{info.icon}</span>
                <span className="font-semibold text-white text-sm">{info.title}</span>
              </div>
              <div className="text-xs text-gray-300 mb-1">{info.description}</div>
              <div className="text-xs text-gray-400">{info.fileSize}</div>
            </button>
          );
        })}
      </div>

      {/* Custom Settings */}
      {(showCustomControls || qualitySettings.level === 'custom') && (
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-green-500/20 space-y-4">
          <h4 className="text-sm font-semibold text-green-400 mb-3">Advanced Settings</h4>

          {/* Image Quality */}
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Image Quality: {Math.round(qualitySettings.imageQuality * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={qualitySettings.imageQuality}
              onChange={(e) => handleCustomSettingChange('imageQuality', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Smaller files</span>
              <span>Better quality</span>
            </div>
          </div>

          {/* Max Image Dimension */}
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Max Image Size: {qualitySettings.imageMaxDimension === 0 ? 'Original' : `${qualitySettings.imageMaxDimension}px`}
            </label>
            <input
              type="range"
              min="0"
              max="4096"
              step="256"
              value={qualitySettings.imageMaxDimension}
              onChange={(e) => handleCustomSettingChange('imageMaxDimension', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Unlimited</span>
              <span>2048px</span>
              <span>4096px</span>
            </div>
          </div>

          {/* PDF Compression */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="useObjectStreams"
              checked={qualitySettings.useObjectStreams}
              onChange={(e) => handleCustomSettingChange('useObjectStreams', e.target.checked)}
              className="w-5 h-5 accent-green-500 cursor-pointer"
            />
            <label htmlFor="useObjectStreams" className="text-sm text-gray-300 cursor-pointer">
              Use PDF compression (object streams) - Recommended for smaller file size
            </label>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
        <p className="text-xs text-gray-300">
          <strong className="text-green-400">💡 Tip:</strong> Use <strong className="text-white">"Balanced"</strong> for most use cases. 
          It provides excellent quality while significantly reducing file size.
        </p>
      </div>
    </div>
  );
};

export default PdfQualitySelector;
