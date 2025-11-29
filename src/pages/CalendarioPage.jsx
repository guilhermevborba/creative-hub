import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import PageHeader from "../components/PageHeader";
import EdicaoTarefaModal from "../components/EdicaoTarefaModal";
import { ArrowLeft, ArrowRight } from "lucide-react";
import moment from "moment";
import "moment/dist/locale/pt-br";
import { motion } from "framer-motion";

moment.locale("pt-br"); 

function CalendarioPage() {
    const [mesAtual, setMesAtual] = useState(moment());
    const [tarefasAgendadas, setTarefasAgendadas] = useState({});
    
    const [colunas, setColunas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [plataformas, setPlataformas] = useState([]);
    const [formatos, setFormatos] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 

    const fetchCalendarData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;
        
        if (!currentUserId) {
            setColunas([]);
            return;
        }
        
        const inicioDaBusca = mesAtual.clone().startOf("month").startOf("week").format("YYYY-MM-DD");
        const fimDaBusca = mesAtual.clone().endOf("month").endOf("week").format("YYYY-MM-DD");

        const [configRes, tarefasRes] = await Promise.all([
            Promise.all([
                supabase.from("colunas_kanban").select('id, nome').eq("criador_id", currentUserId), 
                supabase.from("tipos_conteudo").select('id, nome'),
                supabase.from("plataformas").select('id, nome'),
                supabase.from("formatos").select('*'),
            ]),
            supabase
                .from("tarefas")
                .select('*, plataforma:plataforma_id(nome)')
                .eq("criador_id", currentUserId) 
                .gte("data_agendamento", inicioDaBusca)
                .lte("data_agendamento", fimDaBusca),
        ]);

        const [colunasRes, tiposRes, plataformasRes, formatosRes] = configRes;
        
        if (colunasRes.data) setColunas(colunasRes.data);
        if (tiposRes.data) setTipos(tiposRes.data);
        if (plataformasRes.data) setPlataformas(plataformasRes.data);
        if (formatosRes.data) setFormatos(formatosRes.data);

        if (tarefasRes.data) {
            const grouped = tarefasRes.data.reduce((acc, tarefa) => {
                if (tarefa.data_agendamento) {
                    const dia = moment(tarefa.data_agendamento).format("YYYY-MM-DD");
                    if (!acc[dia]) acc[dia] = [];
                    acc[dia].push(tarefa);
                }
                return acc;
            }, {});
            setTarefasAgendadas(grouped);
        }
    }, [mesAtual, refreshKey]);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    const handleEventClick = (tarefa) => {
        setTarefaSelecionada(tarefa);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTarefaSelecionada(null);
        setRefreshKey((prev) => prev + 1);
    };

    const renderCalendario = () => {
        const inicioDaSemana = mesAtual.clone().startOf("month").startOf("week");

        const dias = [];
        
        const diasSemanaPT = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

        if (colunas.length === 0) {
            return (
                <div className="text-center p-10 bg-white rounded-lg shadow-md border border-gray-200">
                    <p className="text-lg text-gray-500">Seu calendário está sendo inicializado. Por favor, aguarde.</p>
                </div>
            );
        }

        for (let i = 0; i < 42; i++) {
            const dia = inicioDaSemana.clone().add(i, "days");
            const chaveDia = dia.format("YYYY-MM-DD");
            const isCurrentMonth = dia.month() === mesAtual.month();
            const isToday = dia.isSame(moment(), 'day');
            const tarefasDoDia = tarefasAgendadas[chaveDia] || [];

            dias.push(
                <motion.div
                    key={i}
                    className={`h-28 p-2 border border-gray-200 text-sm flex flex-col transition-all ${
                        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
                    } ${isToday ? 'bg-indigo-50 border-indigo-300' : ''}`}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className={`font-semibold mb-1 text-right text-sm ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>{dia.date()}</div>
                    <div className="space-y-1 overflow-y-auto max-h-20 custom-scrollbar">
                        {tarefasDoDia.map((tarefa, index) => (
                            <div 
                                key={index} 
                                onClick={() => handleEventClick(tarefa)}
                                className="px-1 py-0.5 bg-indigo-100 text-xs text-indigo-700 truncate rounded cursor-pointer hover:bg-indigo-200 shadow-sm transition"
                            >
                                {tarefa.titulo_tarefa} ({tarefa.plataforma.nome})
                            </div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => setMesAtual(mesAtual.clone().subtract(1, "month"))}
                        className="p-2 text-indigo-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {mesAtual.clone().locale('pt-br').format("MMMM [de] YYYY").toUpperCase()}
                    </h2>
                    <button
                        onClick={() => setMesAtual(mesAtual.clone().add(1, "month"))}
                        className="p-2 text-indigo-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-7 border-y border-gray-300 text-xs font-semibold text-center text-gray-600 uppercase">
                    {diasSemanaPT.map((dia) => (
                        <div key={dia} className="py-3">
                            {dia}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 border-b border-gray-300">
                    {dias}
                </div>
            </motion.div>
        );
    };

    return (
        <>
            <PageHeader
                title="Calendário"
            />
            <div className="mt-24 pb-10 px-8 w-full">{renderCalendario()}</div>


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

export default CalendarioPage;
