import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { ChevronDown, X, Save, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EdicaoTarefaModal = ({ isOpen, onClose, tarefa, colunas, tipos, plataformas, formatos, onUpdate }) => {
    
    const [formData, setFormData] = useState(tarefa || {}); 
    
    const isCreating = formData.id === 'novo' || !formData.id; 
    
    useEffect(() => {
        if (tarefa) {
            const dataFormatada = tarefa.data_agendamento ? tarefa.data_agendamento.split('T')[0] : '';
            
            setFormData({
                ...tarefa,
                data_agendamento: dataFormatada,
            });
        }
    }, [tarefa]);
    
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAcaoSalvar = async (e) => {
        e.preventDefault();

        const dataParaSalvar = {
            titulo_tarefa: formData.titulo_tarefa,
            descricao: formData.descricao,
            status_id: formData.status_id,
            tipo_id: formData.tipo_id,
            plataforma_id: formData.plataforma_id,
            formato_id: formData.formato_id,
            data_agendamento: formData.data_agendamento || null,
        };

        let result;
        
        if (isCreating) {
            result = await supabase
                .from('tarefas')
                .insert({ 
                    ...dataParaSalvar, 
                    criador_id: formData.criador_id,
                });
        } else {
            result = await supabase
                .from('tarefas')
                .update(dataParaSalvar)
                .eq('id', formData.id);
        }

        if (result.error) {
            console.error('Erro ao salvar/atualizar tarefa:', result.error.message);
        } else {
            onUpdate(); 
            onClose(); 
        }
    };

    const handleAcaoDeletar = async () => {
        if (!formData.id) return;

        const result = await supabase
            .from('tarefas')
            .delete()
            .eq('id', formData.id);

        if (result.error) {
            console.error("Erro ao excluir tarefa:", result.error.message);
        } else {
            onUpdate();
            onClose();
        }
    };
    
    if (!isOpen || !formData.status_id) return null; 

    const formatosFiltrados = formatos.filter(f => f.plataforma_id === formData.plataforma_id);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200"
                    >
                        
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                            {isCreating ? 'Criar Nova Tarefa' : 'Editar Tarefa'}
                            <span className="block text-gray-500 text-sm font-normal">
                                {isCreating ? 'Insira os dados iniciais' : tarefa.titulo_tarefa}
                            </span>
                        </h2>

                        <form onSubmit={handleAcaoSalvar} className="space-y-5">
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <select
                                        name="status_id" value={formData.status_id || ''} onChange={handleInputChange}
                                        className="appearance-none w-full bg-indigo-50 text-indigo-700 px-3 py-2 pr-8 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                        disabled={isCreating}
                                    >
                                        <option value="">Status</option>
                                        {colunas.map((col) => (<option key={col.id} value={col.id}>{col.nome}</option>))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>

                                <div className="relative">
                                    <select
                                        name="tipo_id" value={formData.tipo_id || ''} onChange={handleInputChange} required
                                        className="appearance-none w-full bg-gray-50 text-gray-700 px-3 py-2 pr-8 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Tipo</option>
                                        {tipos.map((tipo) => (<option key={tipo.id} value={tipo.id}>{tipo.nome}</option>))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>

                                <div className="relative">
                                    <select
                                        name="plataforma_id" value={formData.plataforma_id || ''} onChange={handleInputChange} required
                                        className="appearance-none w-full bg-gray-50 text-gray-700 px-3 py-2 pr-8 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Plataforma</option>
                                        {plataformas.map((plat) => (<option key={plat.id} value={plat.id}>{plat.nome}</option>))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>

                                <div className="relative">
                                    <select
                                        name="formato_id" value={formData.formato_id || ''} onChange={handleInputChange}
                                        disabled={!formData.plataforma_id}
                                        className="appearance-none w-full bg-gray-50 text-gray-700 px-3 py-2 pr-8 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                                    >
                                        <option value="">Formato</option>
                                        {formatosFiltrados.map((formato) => (<option key={formato.id} value={formato.id}>{formato.nome}</option>))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>

                                <input
                                    type="date" name="data_agendamento" value={formData.data_agendamento || ''}
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Título</label>
                                <input
                                    type="text" name="titulo_tarefa" value={formData.titulo_tarefa || ''} onChange={handleInputChange} required
                                    className="w-full border-b border-gray-300 focus:border-indigo-500 focus:outline-none pb-2 text-base font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Descrição</label>
                                <textarea
                                    name="descricao" value={formData.descricao || ''} onChange={handleInputChange} rows="4"
                                    className="w-full border-b border-gray-300 focus:border-indigo-500 focus:outline-none pb-2 text-base resize-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                                {!isCreating && (
                                <button
                                    type="button"
                                    onClick={handleAcaoDeletar}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                                >
                                    Excluir
                                </button>
                                 )}
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${isCreating ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {isCreating ? (
                                        <><Plus className="w-4 h-4 mr-1 inline" /> Criar Tarefa</>
                                    ) : (
                                        <><Save className="w-4 h-4 mr-1 inline" /> Salvar Edição</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EdicaoTarefaModal;