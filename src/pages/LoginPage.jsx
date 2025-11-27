import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase"; 
import { Loader2 } from "lucide-react"; 

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password: senha,
            });

            if (error) {
                throw error;
            }
            
            navigate('/', { replace: true }); 

        } catch (error) {
            console.error("Erro ao fazer login:", error.message);
            setErro("Credenciais inválidas. Por favor, verifique seu email e senha.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleResetPassword = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagemSucesso("");
    
    if (!email) {
        setErro("Por favor, insira seu email para redefinir a senha.");
        return;
    }

    setLoading(true);
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });

        if (error) throw error;
        
        setMensagemSucesso("Link de recuperação enviado para seu email!");
    } catch (error) {
        setErro("Erro ao enviar link. Verifique o email digitado.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md p-10 bg-white shadow-2xl border-2 border-indigo-100 rounded-3xl space-y-8">
                
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        CreativeHub
                    </h1>
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">
                        Acesse o Admin do CreativeHub
                    </h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-base font-medium text-gray-800 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label 
                            htmlFor="password" 
                            className="block text-base font-medium text-gray-800 mb-1"
                        >
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200"
                        />
                    </div>

                    <div className="flex justify-end text-sm">
                        <button 
                            type="button" 
                            onClick={handleResetPassword}
                            className="text-indigo-600 font-medium hover:text-indigo-500 hover:underline transition-colors"
                        >
                            Esqueceu sua senha?
                        </button>
                    </div>

                    {erro && (
                        <p className="text-sm text-red-700 text-center bg-red-100 p-3 rounded-xl border border-red-300">
                            {erro}
                        </p>
                    )}
                    {mensagemSucesso && (
                         <p className="text-sm text-green-700 text-center bg-green-100 p-3 rounded-xl border border-green-300">
                            {mensagemSucesso}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5 mr-3" />
                            ) : null}
                            {loading ? "Aguarde..." : "Entrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;