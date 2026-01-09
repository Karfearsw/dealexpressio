import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Upload, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
}

const ImportExport: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [importFormat, setImportFormat] = useState<'csv' | 'excel'>('csv');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
        setFile(selectedFile);
        setError(null);
        setImportResult(null);
      } else {
        setError('Please upload a CSV or Excel file');
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const fileData = e.target?.result;
        
        const response = await fetch('/api/import-export/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: fileData,
            format: importFormat,
            userId: user?.id,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setImportResult(result);
          setFile(null);
          // Reset file input
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        } else {
          setError(result.error || 'Failed to import data');
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
      };

      if (importFormat === 'csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError('An error occurred during import');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/import-export/export?format=${exportFormat}&userId=${user?.id}`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_export_${Date.now()}.${exportFormat === 'csv' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to export data');
      }
    } catch (err) {
      setError('An error occurred during export');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Import Leads</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={importFormat === 'csv'}
                  onChange={(e) => setImportFormat(e.target.value as 'csv')}
                  className="mr-2"
                />
                CSV
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={importFormat === 'excel'}
                  onChange={(e) => setImportFormat(e.target.value as 'excel')}
                  className="mr-2"
                />
                Excel
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import Leads
              </>
            )}
          </button>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">Import Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Successfully imported {importResult.imported} leads.
                  {importResult.failed > 0 && (
                    <span className="block mt-1">
                      {importResult.failed} records failed validation.
                    </span>
                  )}
                </p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-green-800">
                      View Errors ({importResult.errors.length})
                    </summary>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {importResult.errors.map((err, idx) => (
                        <div key={idx} className="text-xs bg-white p-2 rounded border border-green-200">
                          <p className="font-medium">Row {err.row}:</p>
                          <ul className="list-disc list-inside mt-1 text-red-600">
                            {err.errors.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Export Leads</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  className="mr-2"
                />
                CSV
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value as 'excel')}
                  className="mr-2"
                />
                Excel (.xlsx)
              </label>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export All Leads
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Import Guidelines</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Required fields: address, city, state, zip_code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Phone numbers must be in international format (E.164)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Email addresses must be valid format</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Numeric fields: bedrooms, bathrooms, square_feet, year_built, prices</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Invalid records will be skipped with error details provided</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImportExport;
