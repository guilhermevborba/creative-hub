import React, { useEffect, useState } from "react";
import { X, Save, Settings } from "lucide-react";
import { supabase } from "../utils/supabase"; 
import moment from "moment";
import "moment/dist/locale/pt-br";

moment.locale("pt-br");

export default function ConfigurarMetaModal({ isOpen, onClose, onSaveSuccess }) {
    const [loading, setLoading] = useState(false);
    const [plataformas, setPlataformas] = useState([]);
    const [metas, setMetas] = useState({}); 

    const mesAtual = moment().startOf('month').format('YYYY-MM-DD');

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: plats } = await supabase
            .from('plataformas')
            .select('id, nome')
            .order('nome');

        if (plats) setPlataformas(plats);

        const { data: metasSalvas } = await supabase
            .from('metas_por_plataforma')
            .select('plataforma_id, meta')
            .eq('criador_id', user.id) // [4]
            .eq('mes_referencia', mesAtual); // [4]

        const mapaMetas = {};
        if (metasSalvas) {
            metasSalvas.forEach(m => {
                mapaMetas[m.plataforma_id] = m.meta;
            });
        }
        setMetas(mapaMetas);
        setLoading(false);
    };

    const handleChange = (id, valor) => {
        setMetas(prev => ({
            ...prev,
            [id]: parseInt(valor) || 0
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        const dadosParaSalvar = plataformas.map(p => ({
            criador_id: user.id,
            plataforma_id: p.id,
            mes_referencia: mesAtual,
            meta: metas[p.id] || 0
        }));

        const { error } = await supabase
            .from('metas_por_plataforma')
            .upsert(dadosParaSalvar, { onConflict: 'criador_id, plataforma_id, mes_referencia' });

        setLoading(false); [5]

        if (error) {
            console.error("Erro ao salvar metas:", error);
            alert("Não foi possível salvar as metas. Tente novamente.");
        } else {
            onSaveSuccess();
            onClose();
        }
    };

    const totalGeral = Object.values(metas).reduce((a, b) => a + b, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">

            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X size={20} />
                </button>

                <header className="mb-6 border-b pb-4">
                    <div className="flex items-center gap-3 text-indigo-600 mb-1">
                        <Settings size={24} />
                        <h2 className="text-xl font-bold">
                            Metas de {moment().format('MMMM')}
                        </h2>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Defina sua produção por plataforma.
                    </p>
                </header>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {loading && plataformas.length === 0 ? (
                        <p className="text-center text-gray-500">
                            Carregando canais...
                        </p>
                    ) : (
                        plataformas.map(plat => (
                            <div key={plat.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="font-semibold text-gray-700">{plat.nome}</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-20 text-center font-bold text-gray-900 bg-white border border-gray-200 rounded-lg py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={metas[plat.id] || ''}
                                        placeholder="0"
                                        onChange={(e) => handleChange(plat.id, e.target.value)}
                                    />
                                    <span className="text-gray-500 text-sm">tarefa(s)</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <footer className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-4 p-3 bg-indigo-50 rounded-lg">
                        <span className="font-semibold text-indigo-700">Meta Total Prevista</span>
                        <span className="font-extrabold text-xl text-indigo-800">{totalGeral}</span>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading} // [7]
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-70 active:scale-[0.98]" // [7]
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <Save size={20} /> Salvar Metas
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    );
}