import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import PageHeader from "../components/PageHeader";
import EdicaoTarefaModal from "../components/EdicaoTarefaModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

let currentUserId = null; 
const FALLBACK_ID = "122077aa-3391-4d86-bc78-db181208a41e"; 

const insertDefaultKanbanColumns = async (userId) => {
    const statusData = [
        { nome: 'IDEIAS', ordem: 1, tipo_final: false },
        { nome: 'ESCREVENDO', ordem: 2, tipo_final: false },
        { nome: 'GRAVANDO', ordem: 3, tipo_final: false },
        { nome: 'EDITANDO', ordem: 4, tipo_final: false },
        { nome: 'PARA APROVAÇÃO', ordem: 5, tipo_final: false },
        { nome: 'PRONTO', ordem: 6, tipo_final: true },
    ];
    
    const insertPromises = statusData.map(status => 
        supabase.from('colunas_kanban').insert({ 
            ...status, 
            criador_id: userId 
        }).select().maybeSingle()
    );
    await Promise.all(insertPromises);
};


function KanbanPage() {
    const [colunas, setColunas] = useState([]);
    const [tarefas, setTarefas] = useState([]);
    const [plataformas, setPlataformas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [formatos, setFormatos] = useState([]);
    const [filtroAtivo, setFiltroAtivo] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const getSecureUserId = async () => {
        if (currentUserId) return currentUserId;
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id || FALLBACK_ID;
        return currentUserId;
    };

    const fetchKanbanData = useCallback(async () => {
        const userId = await getSecureUserId();
        
        if (!userId) {
            setColunas([]);
            setTarefas([]);
            setPlataformas([]);
            return;
        }

        const [colunasRes, plataformasRes, tiposRes, formatosRes] =
            await Promise.all([
                supabase
                    .from("colunas_kanban").select("*").eq("criador_id", userId).order("ordem", { ascending: true }),
                
                supabase.from("plataformas").select("id, nome"), 
                supabase.from("tipos_conteudo").select("id, nome"),
                supabase.from("formatos").select("*"),
            ]);

        let finalColunas = colunasRes.data || [];
        
        if (finalColunas.length === 0) {
            console.log("Novo usuário: Inserindo colunas padrão...");
            await insertDefaultKanbanColumns(userId);
            
            const { data: newColunas } = await supabase
                .from("colunas_kanban").select("*").eq("criador_id", userId).order("ordem", { ascending: true });
            finalColunas = newColunas || [];
        }

        const tarefasRes = await supabase
            .from("tarefas")
            .select("*, plataforma:plataforma_id(nome)")
            .eq("criador_id", userId) 
            .eq("arquivado", false);

            setColunas(finalColunas);
        setPlataformas(plataformasRes.data || []); 
        if (tiposRes.data) setTipos(tiposRes.data);
        if (formatosRes.data) setFormatos(formatosRes.data);
        if (tarefasRes.data) setTarefas(tarefasRes.data);
        
    }, []);

    useEffect(() => {
        fetchKanbanData();
    }, [fetchKanbanData, refreshKey]);

    const handleOpenModal = async (tarefa = null, status_id_coluna) => { 
        const userId = await getSecureUserId();
        if (!userId) return;

        const tarefaParaModal = tarefa 
            ? tarefa 
            : {
                id: 'novo',
                titulo_tarefa: '',
                descricao: '',
                status_id: status_id_coluna,
                plataforma_id: '',
                tipo_id: '',
                formato_id: '',
                data_agendamento: '',
                criador_id: userId,
            };

        setTarefaSelecionada(tarefaParaModal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTarefaSelecionada(null);
        setRefreshKey((prev) => prev + 1);
    };

    const onDragEnd = async (result) => {
        const { destination, draggableId } = result;
        if (!destination) return;

        const destinationId = destination.droppableId;
        
        const tarefaMovida = tarefas.find(t => t.id === draggableId);
        if (!tarefaMovida) return;
        
        const novasTarefas = tarefas.filter(t => t.id !== draggableId);
        const tarefaAtualizadaOtimista = {
            ...tarefaMovida,
            status_id: destinationId,
        };
        
        setTarefas([...novasTarefas, tarefaAtualizadaOtimista]);
        
        const { error } = await supabase
            .from("tarefas")
            .update({ status_id: destinationId })
            .eq("id", draggableId);
            
        if (error) {
            console.error("Erro ao salvar mudança de status no DB:", error.message);
            setRefreshKey((prev) => prev + 1); 
        }
    };

    const tarefasAgrupadas = colunas.map((coluna) => {
        const itensDaColuna = tarefas.filter((tarefa) => {
            const filtroPlataforma = filtroAtivo
                ? tarefa.plataforma_id === filtroAtivo
                : true;
            const filtroColuna = tarefa.status_id === coluna.id;
            return filtroPlataforma && filtroColuna;
        });
        return { ...coluna, items: itensDaColuna };
    });

    return (
        <>
            <PageHeader title="Planejamento de conteúdos" />
            <div className="mt-20 pb-10 px-8 w-full overflow-x-hidden bg-gray-50">

    
                
                {plataformas.length > 0 && (
                    <div className="flex items-center space-x-3 mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-gray-200">
                        <button
                            onClick={() => setFiltroAtivo(null)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                filtroAtivo === null
                                    ? "bg-indigo-600 text-white shadow"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                        >
                            Planejamento
                        </button>
                        {plataformas.map((plat) => (
                            <button
                                key={plat.id}
                                onClick={() => setFiltroAtivo(plat.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    filtroAtivo === plat.id
                                        ? "bg-indigo-600 text-white shadow"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                }`}
                            >
                                {plat.nome}
                            </button>
                        ))}
                    </div>
                )}
                
                {colunas.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-2xl">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex overflow-x-auto pt-4 pb-4 space-x-6 h-[calc(100vh-250px)] bg-gray-50 rounded-xl">  
                                {tarefasAgrupadas.map((coluna) => (
                                    <KanbanColuna
                                        key={coluna.id}
                                        coluna={coluna}
                                        handleOpenModal={handleOpenModal}
                                    />
                                ))}
                                
                            </div>
                        </DragDropContext>
                    </div>    
                ) : (
                    <div className="text-center p-10 bg-white rounded-lg shadow-md border border-gray-200">
                        <p className="text-lg text-gray-500">Sua estrutura de Kanban está sendo inicializada. Por favor, aguarde.</p>
                    </div>
                )}
            </div>

            <EdicaoTarefaModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                tarefa={tarefaSelecionada}
                colunas={colunas}
                tipos={tipos}
                plataformas={plataformas}
                formatos={formatos}
                onUpdate={handleCloseModal}
            />
        </>
    );
}

export default KanbanPage;


const KanbanColuna = ({ coluna, handleOpenModal }) => {
    return (
        <Droppable droppableId={coluna.id}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-shrink-0 w-72 bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl shadow-inner p-4 border border-gray-200 flex flex-col h-full"
                >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            {coluna.nome}{" "}
                            <span className="text-xs text-gray-500">
                                ({coluna.items.length})
                            </span>
                        </h3>
                    </div>

                    <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                        {coluna.items.map((tarefa, index) => (
                            <Draggable key={tarefa.id} draggableId={tarefa.id} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => handleOpenModal(tarefa)}
                                    >
                                        <KanbanCard tarefa={tarefa} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        <button 
                            onClick={() => handleOpenModal(null, coluna.id)}
                            className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition duration-150 mt-3 flex-shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Criar
                        </button>
                    </div>
                </div>
            )}
        </Droppable>
    );
};

const KanbanCard = ({ tarefa }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                {tarefa.titulo_tarefa}
            </p>
            {tarefa.plataforma && (
                <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                    {tarefa.plataforma.nome}
                </span>
            )}
        </div>
    );
};
