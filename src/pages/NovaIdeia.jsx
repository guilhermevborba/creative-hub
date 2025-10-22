import React, { useEffect, useState, useCallback, memo } from "react";
import { supabase } from '../utils/supabase'; 
import PageHeader from '../components/PageHeader';
import { ChevronDown, Plus } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function NovaIdeia() { 
    const [searchParams] = useSearchParams();
    const statusIdUrl = searchParams.get('status_id');
    const navigate = useNavigate();

    const [tipos, setTipos] = useState([]);
    const [plataformas, setPlataformas] = useState([]);
    const [formatos, setFormatos] = useState([]);
    const [regrasTipos, setRegrasTipos] = useState([]);
    const [statusIdeiasId, setStatusIdeiasId] = useState(null);

    const [novaTarefaForm, setNovaTarefaForm] = useState({
        titulo_tarefa: '',
        descricao: '',
        tipo_id: '',
        plataforma_id: '',
        formato_id: '',
        data_agendamento: '',
        status_id: null,
    });

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            const { data: colunas } = await supabase
                .from('colunas_kanban')
                .select('id, nome, criador_id')
                .eq('criador_id', userId);

            const colunaIdeias = colunas?.find(
                (c) => c.nome?.toUpperCase() === "IDEIAS"
            );
            if (colunaIdeias) setStatusIdeiasId(colunaIdeias.id);

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

    const getSecureUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    };

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

        const userId = await getSecureUserId();
        if (!userId) {
            alert("Erro: Faça login novamente para criar tarefas.");
            return;
        }

        const statusFinal = statusIdUrl || statusIdeiasId;
        if (!statusFinal) {
            alert("Erro: coluna 'IDEIAS' não encontrada. Atualize a página e tente novamente.");
            return;
        }

        const cleanedForm = {
            plataforma_id: novaTarefaForm.plataforma_id || null,
            tipo_id: novaTarefaForm.tipo_id || null,
            formato_id: novaTarefaForm.formato_id || null,
            data_agendamento: novaTarefaForm.data_agendamento || null,
            titulo_tarefa: novaTarefaForm.titulo_tarefa,
            descricao: novaTarefaForm.descricao,
            criador_id: userId,
            status_id: statusFinal,
            arquivado: false, 
        };

        const { error } = await supabase.from('tarefas').insert([cleanedForm]);

        if (!error) {
            navigate('/kanban'); 
        } else {
            console.error("Erro ao inserir:", error.message);
        }
    }, [novaTarefaForm, statusIdUrl, statusIdeiasId, navigate]);

    const mockTitulo = "Escreva aqui o título da sua Ideia";
    const mockDescricao = "Escreva aqui a descrição.";

    const handleNewIdeaClick = () => {
        setNovaTarefaForm(prev => ({
            titulo_tarefa: '', descricao: '', tipo_id: '', plataforma_id: '', formato_id: '', data_agendamento: '',
            status_id: statusIdeiasId || statusIdUrl
        }));
    };

    return (
        <>
            <PageHeader 
                title="Ideias" 
            />

            <div className="mt-20 pb-10 px-8 max-w-4xl mx-auto"> 
                <div className="space-y-6">
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

const IdeaCard = ({ currentIdea, onFormChange, onSave, tipos, plataformas, formatos, regrasTipos, mockTitulo, mockDescricao }) => {
    const tiposPermitidosIds = regrasTipos
        .filter(regra => regra.plataforma_id === currentIdea.plataforma_id)
        .map(regra => regra.tipo_id);
    
    const tiposFiltrados = tipos.filter(tipo => tiposPermitidosIds.includes(tipo.id));
    const formatosFiltrados = formatos.filter(f => f.plataforma_id === currentIdea.plataforma_id);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <form onSubmit={onSave} className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    
                    <SelectInput 
                        name="plataforma_id" 
                        value={currentIdea.plataforma_id} 
                        options={plataformas} 
                        placeholder="Plataforma"
                        onChange={onFormChange} 
                        required
                    />

                    <SelectInput 
                        name="tipo_id" 
                        value={currentIdea.tipo_id} 
                        options={tiposFiltrados} 
                        placeholder="Tipo de Conteúdo"
                        onChange={onFormChange} 
                        required
                        disabled={!currentIdea.plataforma_id}
                    />
                    
                    <SelectInput 
                        name="formato_id" 
                        value={currentIdea.formato_id} 
                        options={formatosFiltrados} 
                        placeholder="Formato"
                        onChange={onFormChange}
                        disabled={!currentIdea.plataforma_id}
                    />
                    
                    <input
                        type="date" 
                        name="data_agendamento" 
                        value={currentIdea.data_agendamento || ''}
                        onChange={onFormChange} 
                        className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-400 transition duration-150"
                    />

                </div>

                <div className="space-y-1">
                    <label className="block text-gray-700 font-medium text-lg">Título: </label>
                    <input
                        type="text" 
                        name="titulo_tarefa" 
                        value={currentIdea.titulo_tarefa || ''} 
                        placeholder={mockTitulo} 
                        onChange={onFormChange} 
                        className="w-full border-b border-gray-300 focus:border-indigo-500 focus:outline-none pt-1 pb-2 text-xl font-semibold placeholder-gray-400 transition duration-150"
                        required
                    />
                </div>

                <div className="space-y-1 mt-4">
                    <label className="block text-gray-700 font-medium">Descreva sua ideia:</label>
                    <textarea
                        name="descricao" 
                        value={currentIdea.descricao || ''} 
                        placeholder={mockDescricao} 
                        onChange={onFormChange} 
                        rows="3" 
                        className="w-full border-b border-gray-300 focus:border-indigo-500 focus:outline-none pt-1 pb-2 text-base resize-none placeholder-gray-400 transition duration-150"
                    ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                    <button type="button" className="px-5 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition duration-150 shadow-sm">
                        Excluir
                    </button>
                    <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 shadow-md">
                        Salvar ideia
                    </button>
                </div>
            </form>
        </div>
    );
};

const MemoizedIdeaCard = memo(IdeaCard);
