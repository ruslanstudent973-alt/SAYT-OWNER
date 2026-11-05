import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X } from 'lucide-react';

interface LogViewerProps {
  targetId: string;
  targetName: string;
  type: 'bot' | 'app';
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ targetId, targetName, type, onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/logs/${type}/${targetId}`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [targetId, type]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl h-[600px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Live Logs: {targetName} ({type})
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4"/></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 text-slate-300">
              <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={`font-bold ${log.level === 'ERROR' ? 'text-rose-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-cyan-400'}`}>
                {log.level}
              </span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
