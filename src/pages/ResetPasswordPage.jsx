import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setErro("");
        setSucesso("");

        if (!senha || !confirmarSenha) {
            setErro("Preencha os dois campos de senha.");
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: senha,
            });

            if (error) throw error;

            setSucesso("Senha alterada com sucesso! Faça login novamente.");

            setTimeout(() => navigate("/login"), 1800);

        } catch (err) {
            console.error(err);
            setErro("Erro ao redefinir senha. O link pode ter expirado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-center">Redefinir Senha</h2>

                <form className="space-y-5" onSubmit={handleReset}>
                    <div>
                        <label className="font-medium">Nova Senha</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border rounded-xl mt-1"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="font-medium">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border rounded-xl mt-1"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                        />
                    </div>

                    {erro && <p className="text-red-600 bg-red-100 p-3 rounded-xl">{erro}</p>}
                    {sucesso && <p className="text-green-600 bg-green-100 p-3 rounded-xl">{sucesso}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl flex justify-center items-center"
                    >
                        {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                        {loading ? "Salvando..." : "Redefinir Senha"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
