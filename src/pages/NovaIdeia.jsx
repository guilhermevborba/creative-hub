import React, { useEffect, useState } from "react";
import { supabase } from '../utils/supabase'; 
import PageHeader from '../components/PageHeader';
import AISidebar from '../components/AISidebar';
import { ChevronDown, Plus } from 'lucide-react';

const ID_DO_CRIADOR_TESTE = "122077aa-3391-4d86-bc78-db181208a41e";
const STATUS_IDEIAS_ID_REAL = "dabb1134-01e7-42d4-9543-d39d55df47f2"; 

function NovaIdeia() { 
    const [tipos, setTipos] = useState([]);
    const [plataformas, setPlataformas] = useState([]);
    const [novaTarefaForm, setNovaTarefaForm] = useState({
        titulo_tarefa: '',
        descricao: '',
        tipo_id: '',
        plataforma_id: '',
        data_agendamento: '',
    });

    useEffect(() => {
        async function fetchData() {
            const { data: tiposData } = await supabase.from('tipos_conteudo').select('id, nome');
            if (tiposData) setTipos(tiposData);

            const { data: plataformasData } = await supabase.from('plataformas').select('id, nome');
            if (plataformasData) setPlataformas(plataformasData);
        }
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovaTarefaForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAdicionarTarefa = async (e) => {
        e.preventDefault();
        if (novaTarefaForm.titulo_tarefa.trim() === '') return;

        const objetoInsercao = {
            ...novaTarefaForm,
            criador_id: ID_DO_CRIADOR_TESTE,
            status_id: STATUS_IDEIAS_ID_REAL,
            nome_teste: 'Valor Testado com Sucesso',
            data_agendamento: novaTarefaForm.data_agendamento || null,
        };

        const { error } = await supabase
            .from('tarefas')
            .insert([objetoInsercao]);

        if (error) {
            console.error('Erro ao inserir tarefa:', error.message);
        } else {
            setNovaTarefaForm({
                titulo_tarefa: '', descricao: '', tipo_id: '', plataforma_id: '', data_agendamento: '',
            });
        }
    }

    const FormularioCriacao = ({ novaTarefaForm, handleInputChange, handleAdicionarTarefa, tipos, plataformas }) => (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <form onSubmit={handleAdicionarTarefa} className="space-y-4">
                <div className="flex items-center space-x-4">
                    
                    <div className="relative inline-block">
                        <select 
                            name="tipo_id" value={novaTarefaForm.tipo_id} onChange={handleInputChange} required
                            className="appearance-none block w-full bg-gray-100 border border-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Tipo de Conteúdo</option>
                            {tipos.map(tipo => (<option key={tipo.id} value={tipo.id}>{tipo.nome}</option>))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                    
                    <div className="relative inline-block">
                        <select 
                            name="plataforma_id" value={novaTarefaForm.plataforma_id} onChange={handleInputChange} required
                            className="appearance-none block w-full bg-gray-100 border border-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Plataforma</option> 
                            {plataformas.map(plat => (<option key={plat.id} value={plat.id}>{plat.nome}</option>))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>

                    <label className="text-sm font-medium text-gray-700">Título:</label>
                    <input
                        type="text" name="titulo_tarefa" value={novaTarefaForm.titulo_tarefa} onChange={handleInputChange} required
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <label className="block text-sm font-medium text-gray-700 mt-4">Descreva sua ideia:</label>
                <textarea
                    name="descricao" value={novaTarefaForm.descricao} onChange={handleInputChange} rows="4"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
                
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition duration-150">
                        Excluir
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150">
                        Salvar Ideia
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <>
            <PageHeader 
                title="Ideias" 
                actionButton={
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 transition duration-150">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Ideia
                    </button>
                }
            />

            <AIAssistantSidebar />

            <div className="pt-20 pr-80 pb-10"> 
                
                <div className="space-y-6">
                    <FormularioCriacao 
                        novaTarefaForm={novaTarefaForm}
                        handleInputChange={handleInputChange}
                        handleAdicionarTarefa={handleAdicionarTarefa}
                        tipos={tipos}
                        plataformas={plataformas}
                    />
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <p className="text-gray-500">Aqui será a visualização das ideias já cadastradas.</p>
                    </div>

                </div>

            </div>
        </>
    );
}

export default NovaIdeia;