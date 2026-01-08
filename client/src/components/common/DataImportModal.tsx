import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface DataImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    endpoint: string;
    onSuccess: () => void;
    title: string;
    templateFields: string[];
}

const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose, endpoint, onSuccess, title, templateFields }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setUploading(true);
        setError(null);

        // Client-side validation using PapaParse
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const headers = results.meta.fields || [];
                const missingFields = templateFields.filter(field => !headers.includes(field));

                if (missingFields.length > 0) {
                    setError(`Missing required columns: ${missingFields.join(', ')}`);
                    setUploading(false);
                    return;
                }

                // If validation passes, upload to server
                const formData = new FormData();
                formData.append('file', file);

                try {
                    await axios.post(endpoint, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    onSuccess();
                    onClose();
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Failed to upload file.');
                } finally {
                    setUploading(false);
                }
            },
            error: (err) => {
                setError(`Failed to parse CSV: ${err.message}`);
                setUploading(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-100">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-teal-500/50 transition-colors">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            <Upload className="h-10 w-10 text-slate-500 mb-4" />
                            <span className="text-slate-300 font-medium mb-1">
                                {file ? file.name : 'Click to upload CSV'}
                            </span>
                            <span className="text-slate-500 text-sm">
                                Required columns: {templateFields.join(', ')}
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Import Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataImportModal;
