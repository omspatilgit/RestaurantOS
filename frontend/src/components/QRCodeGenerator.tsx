import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import QRCode from 'qrcode';

export default function QRCodeGenerator() {
  const [expanded, setExpanded] = useState(false);
  const [totalTables, setTotalTables] = useState(12);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const downloadQR = async (tableNum: number) => {
    try {
      const url = `${baseUrl}/portal?table=${tableNum}`;
      const dataURL = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
      
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 300, 320);
        ctx.drawImage(img, 0, 0, 300, 300);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`RestaurantOS — Table ${tableNum}`, 150, 305);
        
        const finalDataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `RestaurantOS_Table_${tableNum}_QR.png`;
        link.href = finalDataURL;
        link.click();
      };
      img.src = dataURL;
    } catch (err) {
      console.error('Error generating QR:', err);
    }
  };

  const downloadAll = () => {
    for (let i = 1; i <= totalTables; i++) {
      setTimeout(() => downloadQR(i), i * 300);
    }
  };

  return (
    <Card variant="glass" padding="md">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-surface-100">QR Code Generator</h3>
            <p className="text-[10px] text-surface-500">Generate for {totalTables} tables</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-3"
        >
          {/* Table count */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-surface-400">Tables:</label>
            <input
              type="number"
              min={1}
              max={50}
              value={totalTables}
              onChange={e => setTotalTables(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-16 px-2 py-1 rounded-lg bg-surface-800 border border-surface-700 text-sm text-surface-200 focus:outline-none focus:border-brand-500"
            />
            <Button size="sm" variant="outline" onClick={downloadAll} icon={<Download className="w-3 h-3" />}>
              Download All
            </Button>
          </div>

          {/* QR previews grid */}
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto scrollbar-hide">
            {Array.from({ length: totalTables }, (_, i) => i + 1).map(num => (
              <QRPreview key={num} tableNum={num} baseUrl={baseUrl} onDownload={() => downloadQR(num)} />
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

function QRPreview({ tableNum, baseUrl, onDownload }: { tableNum: number; baseUrl: string; onDownload: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let mounted = true;
    const url = `${baseUrl}/portal?table=${tableNum}`;
    
    QRCode.toDataURL(url, { width: 120, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(dataURL => {
        if (!mounted) return;
        const img = new Image();
        img.onload = () => {
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx && canvasRef.current) {
            canvasRef.current.width = 120;
            canvasRef.current.height = 140; // Extra space for text
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 120, 140);
            ctx.drawImage(img, 0, 0, 120, 120);
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`RestaurantOS — Table ${tableNum}`, 60, 132);
          }
        };
        img.src = dataURL;
      })
      .catch(console.error);
      
    return () => { mounted = false; };
  }, [tableNum, baseUrl]);

  return (
    <button
      onClick={onDownload}
      className="flex flex-col items-center p-2 rounded-xl bg-surface-800/50 border border-surface-700/30 hover:border-brand-500/30 transition-colors cursor-pointer group"
      title={`Download QR for Table ${tableNum}`}
    >
      <canvas ref={canvasRef} className="w-14 h-[65px] rounded-lg bg-white" />
      <span className="text-[10px] font-bold text-surface-400 mt-2 group-hover:text-brand-400 transition-colors">
        Table {tableNum}
      </span>
    </button>
  );
}
