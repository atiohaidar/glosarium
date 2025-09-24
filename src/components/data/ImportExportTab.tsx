import React, { useRef } from 'react';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '../ui/icons';

interface ImportExportTabProps {
  onExportData: () => string;
  onImportData: (jsonString: string) => boolean;
  onResetToDefault: () => void;
}

export const ImportExportTab: React.FC<ImportExportTabProps> = ({
  onExportData,
  onImportData,
  onResetToDefault
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = onExportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glosarium-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content && onImportData(content)) {
          alert('Data berhasil diimpor!');
        } else {
          alert('Gagal mengimpor data. Pastikan format JSON valid.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Data
          </h3>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            Unduh semua data glosarium dalam format JSON
          </p>
          <button
            onClick={handleExport}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export JSON
          </button>
        </div>

        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <ArrowUpTrayIcon className="w-5 h-5" />
            Import Data
          </h3>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            Unggah file JSON untuk mengganti semua data
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import JSON
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--border-primary)] pt-4">
        <h3 className="text-white font-semibold mb-3">Pengaturan Data</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              const confirmExport = window.confirm('Apakah Anda ingin export data sebelum reset ke default?');
              if (confirmExport) {
                handleExport();
              }
              if (window.confirm('Reset ke data default? Data local akan hilang.')) {
                onResetToDefault();
              }
            }}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg"
          >
            Reset ke Default
          </button>
        </div>
      </div>
    </div>
  );
};