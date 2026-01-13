import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Home, Users, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'wouter';

interface SearchResult {
    id: number;
    type: 'lead' | 'deal' | 'buyer';
    title: string;
    subtitle: string;
}

const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [, setLocation] = useLocation();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await axios.get(`/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        
        switch (result.type) {
            case 'lead':
                setLocation(`/leads?highlight=${result.id}`);
                break;
            case 'deal':
                setLocation(`/deals?highlight=${result.id}`);
                break;
            case 'buyer':
                setLocation(`/buyers?highlight=${result.id}`);
                break;
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'lead': return <User size={16} className="text-blue-400" />;
            case 'deal': return <Home size={16} className="text-teal-400" />;
            case 'buyer': return <Users size={16} className="text-purple-400" />;
            default: return null;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'lead': return 'Lead';
            case 'deal': return 'Deal';
            case 'buyer': return 'Buyer';
            default: return '';
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search leads, deals, or buyers..."
                    className="w-full bg-slate-800 border-none rounded-lg py-2 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/50"
                />
                {query && (
                    <button 
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && (query || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400">
                            <Loader2 size={20} className="animate-spin mx-auto" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                        {getIcon(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate">{result.title}</div>
                                        <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                                    </div>
                                    <span className={`text-[10px] font-medium uppercase px-2 py-1 rounded ${
                                        result.type === 'lead' ? 'bg-blue-500/20 text-blue-400' :
                                        result.type === 'deal' ? 'bg-teal-500/20 text-teal-400' :
                                        'bg-purple-500/20 text-purple-400'
                                    }`}>
                                        {getTypeLabel(result.type)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            No results found for "{query}"
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
