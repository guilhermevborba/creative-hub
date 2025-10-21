import React, { useEffect, useState, useCallback, memo } from "react";
import { supabase } from '../utils/supabase'; 
import PageHeader from '../components/PageHeader';
import { ChevronDown, Plus } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

const ID_DO_CRIADOR_TESTE = "122077aa-3391-4d86-bc78-db181208a41e";
const STATUS_IDEIAS_ID_REAL = "dabb1134-01e7-42d4-9543-d39d55df47f2"; 

function NovaIdeia() { 
    const [tipos, setTipos] = useState([]);
    const [plataformas, setPlataformas] = useState([]);
    const [formatos, setFormatos] = useState([]);
    const [regrasTipos, setRegrasTipos] = useState([]);
    const [novaTarefaForm, setNovaTarefaForm] = useState({
        titulo_tarefa: '',
        descricao: '',
        tipo_id: '',
        plataforma_id: '',
        formato_id: '',
        data_agendamento: '',
    });

    useEffect(() => {
        async function fetchData() {
            const [tiposRes, plataformasRes, formatosRes, regrasRes] = await Promise.all([
                supabase.from('tipos_conteudo').select('id, nome'),
                supabase.from('plataformas').select('id, nome'),
                supabase.from('formatos').select('*'),
                supabase.from('plataforma_tipo').select('plataforma_id, tipo_id, tipo:tipo_id(nome)'), 
            ]);

            if (tiposRes.data) setTipos(tiposRes.data);
            if (plataformasRes.data) setPlataformas(plataformasRes.data);
            if (formatosRes.data) setFormatos(formatosRes.data);
            if (regrasRes.data) setRegrasTipos(regrasRes.data);
        }
        fetchData();
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        
        let newState = { [name]: value };
        if (name === 'plataforma_id') {
            newState = { ...newState, tipo_id: '', formato_id: '' };
        } else if (name === 'tipo_id') {
            newState = { ...newState, formato_id: '' };
        }
        
        setNovaTarefaForm(prev => ({ ...prev, ...newState }));
    }, []);

    const handleAdicionarTarefa = useCallback(async (e) => {
        e.preventDefault();
        if (novaTarefaForm.titulo_tarefa.trim() === '') return;

        const objetoInsercao = {
            ...novaTarefaForm,
            criador_id: ID_DO_CRIADOR_TESTE,
            status_id: STATUS_IDEIAS_ID_REAL,
            data_agendamento: novaTarefaForm.data_agendamento || null,
        };

        const { error } = await supabase.from('tarefas').insert([objetoInsercao]);

        if (!error) {
             alert("💡 Ideia salva com sucesso!");
            setNovaTarefaForm({
                titulo_tarefa: '', descricao: '', tipo_id: '', plataforma_id: '', formato_id: '', data_agendamento: '',
            });
        }
    }, [novaTarefaForm]);

    const mockTitulo = "Escreva aqui o título da sua Ideia";
    const mockDescricao = "Escreva aqui a descrição.";

    return (
        <>
            <PageHeader 
                title="Nova Ideia" 
                subtitle="Crie e organize suas ideias de conteúdo antes de levá-las ao planejamento"
                actionButton={
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl shadow-md hover:bg-indigo-700 transition-all duration-200">
                        <Plus className="w-4 h-4" />
                        Nova Ideia
                    </button>
                }
            />

            <div className="mt-24 pb-10 px-10 w-full">
                <div className="max-w-4xl mx-auto space-y-8">
                    <MemoizedIdeaCard 
                        currentIdea={novaTarefaForm} 
                        onFormChange={handleInputChange} 
                        onSave={handleAdicionarTarefa} 
                        tipos={tipos}
                        plataformas={plataformas}
                        formatos={formatos}
                        regrasTipos={regrasTipos}
                        mockTitulo={mockTitulo}
                        mockDescricao={mockDescricao}
                    />
                    
                </div>
            </div>
        </>
    );
}

export default NovaIdeia;

const IdeaCard = ({ currentIdea, onFormChange, onSave, tipos, plataformas, formatos, regrasTipos, mockTitulo, mockDescricao }) => {
    const tiposPermitidosIds = regrasTipos
        .filter(regra => regra.plataforma_id === currentIdea.plataforma_id)
        .map(regra => regra.tipo_id);
    
    const tiposFiltrados = tipos.filter(tipo => tiposPermitidosIds.includes(tipo.id));
    const formatosFiltrados = formatos.filter(f => f.plataforma_id === currentIdea.plataforma_id);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <form onSubmit={onSave} className="space-y-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <SelectInput
                        name="plataforma_id"
                        value={currentIdea.plataforma_id}
                        onChange={onFormChange}
                        options={plataformas}
                        placeholder="Plataforma"
                        disabled={false}
                    />

                    <SelectInput
                        name="tipo_id"
                        value={currentIdea.tipo_id}
                        onChange={onFormChange}
                        options={tiposFiltrados}
                        placeholder="Tipo de Conteúdo"
                        disabled={!currentIdea.plataforma_id}
                    />

                    <SelectInput
                        name="formato_id"
                        value={currentIdea.formato_id}
                        onChange={onFormChange}
                        options={formatosFiltrados}
                        placeholder="Formato"
                        disabled={!currentIdea.plataforma_id}
                    />

                    <input
                        type="date" 
                        name="data_agendamento" 
                        value={currentIdea.data_agendamento || ''}
                        onChange={onFormChange} 
                        className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-150"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-gray-700 font-medium text-lg">Título</label>
                    <input
                        type="text" 
                        name="titulo_tarefa" 
                        value={currentIdea.titulo_tarefa || ''} 
                        placeholder={mockTitulo} 
                        onChange={onFormChange} 
                        className="w-full bg-white border-b border-gray-200 focus:border-indigo-500 focus:ring-0 focus:outline-none pt-1 pb-2 text-xl font-semibold placeholder-gray-400 transition-all duration-150"
                        required
                    />
                </div>

                <div className="space-y-1 mt-4">
                    <label className="block text-gray-700 font-medium">Descreva sua ideia</label>
                    <textarea
                        name="descricao" 
                        value={currentIdea.descricao || ''} 
                        placeholder={mockDescricao} 
                        onChange={onFormChange} 
                        rows="4" 
                        className="w-full bg-white border-b border-gray-200 focus:border-indigo-500 focus:ring-0 focus:outline-none pt-1 pb-2 text-base resize-none placeholder-gray-400 transition-all duration-150"
                    ></textarea>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6">
                    <button type="button" className="px-5 py-2 text-sm font-medium text-red-600 border border-red-500 rounded-xl hover:bg-red-50 transition-all duration-150 shadow-sm">
                        Excluir
                    </button>
                    <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-150 shadow-md">
                        Salvar Ideia
                    </button>
                </div>
            </form>
        </div>
    );
};

const SelectInput = ({ name, value, onChange, options, placeholder, disabled }) => (
    <div className="relative inline-block">
        <select 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            disabled={disabled}
            className={`appearance-none bg-gray-50 text-gray-700 px-4 py-2 pr-8 rounded-full text-sm font-medium border border-gray-200 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all duration-150 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            <option value="">{placeholder}</option> 
            {options.map(opt => (
                <option key={opt.id} value={opt.id} className="bg-white text-gray-900">
                    {opt.nome}
                </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
    </div>
);

const MemoizedIdeaCard = memo(IdeaCard);
