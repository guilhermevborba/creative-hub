import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import PageHeader from "../components/PageHeader";
import moment from "moment";
import "moment/dist/locale/pt-br";
import {
    Clock,
    ClipboardList,
    CheckCircle2,
    Settings,
} from "lucide-react";
import ConfigurarMetaModal from "../components/ConfigurarMetaModal";
import EdicaoTarefaModal from "../components/EdicaoTarefaModal"; // Importado do Código 1/2

moment.locale("pt-br");

const StatCard = ({ count, label, icon: Icon, iconColor }) => (
    <div className="bg-white p-5 rounded-xl shadow flex-1 min-w-[200px]">
        <div className="flex justify-between items-center mb-2">
            <span className="text-4xl font-extrabold text-gray-800">{count}</span>
            {Icon && (
                <div className={`p-2 rounded-full ${iconColor} bg-opacity-10`} >
                    <Icon size={24} className={iconColor} />
                </div>
            )}
        </div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
);

const MetaDonutChart = ({ atual, meta }) => {
    if (meta === 0 || !meta) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-full">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">Meta Mensal de Conteúdo</h3>
                <p className="text-center text-gray-500">Meta Mensal não definida. Clique em <Settings size={14} className="inline-block" /> para configurar.</p>
            </div>
        );
    }

    const porcentagem = Math.round((atual / meta) * 100);
    const isExcedente = porcentagem >= 100;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((Math.min(porcentagem, 100) / 100) * circumference);

    return (
        <div className="flex flex-col items-center p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Meta Mensal de Conteúdo</h3>
            <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="-rotate-90">
                    <circle
                        cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
                        className="text-gray-100"
                    />
                    <circle
                        cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${isExcedente ? 'text-green-500' : 'text-indigo-500'}`}
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">
                        {porcentagem}%
                    </span>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                {atual} concluídos de {meta}
            </p>
            {isExcedente && (
                <p className="text-xs font-semibold text-green-500 mt-1">
                    🏆 +{porcentagem - 100}% Desempenho excedente!
                </p>
            )}
        </div>
    );
};

const ProgressListItem = ({ nome, atual, meta }) => {
    const progresso = meta > 0 ? Math.min(100, (atual / meta) * 100) : 0;

    if (meta === 0 && atual === 0) return null;

    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium w-24 truncate">{nome}</span>
            <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full">
                <div
                    className="h-2 bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                />
            </div>
            <span className="text-sm font-semibold text-indigo-600">
                {atual}/{meta}
            </span>
        </div>
    );
};

function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
    
    const [colunasList, setColunasList] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [plataformas, setPlataformas] = useState([]);
    const [formatos, setFormatos] = useState([]);

    const [kpiData, setKpiData] = useState({
        ideias: 0,
        emAndamento: 0,
        aprovacao: 0,
        finalizados: 0
    });

    const [progressoPorPlataforma, setProgressoPorPlataforma] = useState([]);
    const [metaGeral, setMetaGeral] = useState(0);
    const [proximasTarefas, setProximasTarefas] = useState([]);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const userId = user.id;
        const mesAtual = moment().startOf('month').format('YYYY-MM-DD');

        const [configRes] = await Promise.all([
            Promise.all([
                supabase.from("colunas_kanban").select('id, nome').eq("criador_id", userId),
                supabase.from("tipos_conteudo").select('id, nome'),
                supabase.from("plataformas").select('id, nome'),
                supabase.from("formatos").select('*'),
            ]),
        ]);

        const [colunasRes, tiposRes, plataformasRes, formatosRes] = configRes;
        const colunas = colunasRes.data || [];

        setColunasList(colunas);
        setTipos(tiposRes.data || []);
        setPlataformas(plataformasRes.data || []);
        setFormatos(formatosRes.data || []);

        if (colunas.length === 0) {
            setLoading(false);
            return;
        }

        const getIdByName = (name) => colunas.find(c => c.nome.toUpperCase() === name.toUpperCase())?.id;
        const idIdeias = getIdByName("IDEIAS");
        const idPronto = getIdByName("PRONTO");
        const idAprovacao = getIdByName("PARA APROVAÇÃO");
        const idsEmAndamento = colunas.filter(c => !["IDEIAS", "PRONTO", "PARA APROVAÇÃO"].includes(c.nome.toUpperCase())).map(c => c.id);

        const { data: tarefas } = await supabase
            .from("tarefas")
            .select("id, status_id, plataforma_id")
            .eq("criador_id", userId)
            .neq("arquivado", true);

        const { data: metasSalvas } = await supabase
            .from('metas_por_plataforma')
            .select('plataforma_id, meta, plataforma:plataforma_id(nome)')
            .eq('criador_id', userId)
            .eq('mes_referencia', mesAtual);

        let totalGeralMetas = 0;
        const progressoDetalhado = [];

        if (metasSalvas) {
            metasSalvas.forEach(metaItem => {
                totalGeralMetas += metaItem.meta;

                const realizado = tarefas?.filter(t =>
                    t.plataforma_id === metaItem.plataforma_id && t.status_id === idPronto
                ).length || 0;

                progressoDetalhado.push({
                    plataforma_id: metaItem.plataforma_id,
                    nome: metaItem.plataforma.nome,
                    meta: metaItem.meta,
                    realizado: realizado
                });
            });
        }
        setMetaGeral(totalGeralMetas);
        setProgressoPorPlataforma(progressoDetalhado);

        setKpiData({
            ideias: tarefas?.filter(t => t.status_id === idIdeias).length || 0,
            emAndamento: tarefas?.filter(t => idsEmAndamento.includes(t.status_id)).length || 0,
            aprovacao: tarefas?.filter(t => t.status_id === idAprovacao).length || 0,
            finalizados: tarefas?.filter(t => t.status_id === idPronto).length || 0,
        });

        const todayStr = moment().format("YYYY-MM-DD");
        const { data: listData } = await supabase
            .from("tarefas")
            .select("id, titulo_tarefa, data_agendamento, criador_id, status_id, plataforma_id, tipo_id, formato_id, descricao") // Select completo
            .eq("criador_id", userId)
            .neq("status_id", idPronto)
            .gte("data_agendamento", todayStr)
            .order("data_agendamento", { ascending: true })
            .limit(5);

        setProximasTarefas(listData || []);
        setLoading(false);

    }, [refreshKey]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const handleOpenTaskModal = (tarefa) => {
        setTarefaSelecionada(tarefa);
        setIsTaskModalOpen(true);
    };

    const handleCloseTaskModal = () => {
        setIsTaskModalOpen(false);
        setTarefaSelecionada(null);
        setRefreshKey((prev) => prev + 1); 
    };

    const renderTaskItem = (tarefa) => {
        const dataEntrega = moment(tarefa.data_agendamento);
        const hoje = moment().startOf('day');
        const diffDias = dataEntrega.diff(hoje, 'days');
        const isUrgent = diffDias >= 0 && diffDias <= 2;

        return (
            <button
                key={tarefa.id}
                onClick={() => handleOpenTaskModal(tarefa)}
                className="w-full flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 text-left hover:bg-gray-50 transition duration-150 rounded-lg px-2 -mx-2"
            >
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{tarefa.titulo_tarefa}</span>
                    {isUrgent && (
                        <span className="text-xs text-red-500 font-semibold mt-0.5">
                            Vence em {diffDias === 0 ? "hoje" : `${diffDias} dias`}
                        </span>
                    )}
                </div>
                <span className="text-sm font-semibold text-gray-500 flex-shrink-0">
                    {dataEntrega.format("DD/MMM")}
                </span>
            </button>
        );
    };

    const handleSaveSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <>
            <PageHeader title="Dashboard" />

            <div className="max-w-screen-xl mx-auto p-6">

                <div className="mt-20 flex flex-wrap gap-4 mb-8">
                    <StatCard count={kpiData.ideias} label="Ideias" />
                    <StatCard count={kpiData.emAndamento} label="Em Andamento" icon={Clock} iconColor="text-blue-500" />
                    <StatCard count={kpiData.aprovacao} label="Para Aprovação" icon={ClipboardList} iconColor="text-amber-500" />
                    <StatCard count={kpiData.finalizados} label="Finalizado" icon={CheckCircle2} iconColor="text-green-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-700 mb-4 pb-2">
                            Próximas Entregas ({proximasTarefas.length})
                        </h3>
                        <div className="space-y-2">
                            {loading ? (
                                <p className="text-center text-gray-500">Carregando...</p>
                            ) : proximasTarefas.length === 0 ? (
                                <p className="text-center text-gray-500">Sem entregas próximas.</p>
                            ) : (
                                proximasTarefas.map(renderTaskItem)
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-700">Progresso de Meta</h3>
                            <button
                                onClick={() => setIsMetaModalOpen(true)}
                                className="text-gray-400 hover:text-indigo-600 transition"
                                title="Configurar Metas"
                            >
                                <Settings size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <MetaDonutChart
                                atual={kpiData.finalizados}
                                meta={metaGeral}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Progresso por Plataforma</h4>
                            {loading ? (
                                <p className="text-xs text-gray-400">Carregando metas...</p>
                            ) : progressoPorPlataforma.length > 0 ? (
                                progressoPorPlataforma.map(item => (
                                    <ProgressListItem
                                        key={item.plataforma_id}
                                        nome={item.nome}
                                        atual={item.realizado}
                                        meta={item.meta}
                                    />
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">Nenhuma meta definida para este mês.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <ConfigurarMetaModal
                isOpen={isMetaModalOpen}
                onClose={() => setIsMetaModalOpen(false)}
                onSaveSuccess={handleSaveSuccess}
            />

            {isTaskModalOpen && (
                <EdicaoTarefaModal
                    isOpen={isTaskModalOpen}
                    onClose={handleCloseTaskModal}
                    tarefa={tarefaSelecionada}
                    colunas={colunasList}
                    tipos={tipos}
                    plataformas={plataformas}
                    formatos={formatos}
                    onUpdate={handleCloseTaskModal}
                />
            )}
        </>
    );
}

export default DashboardPage;