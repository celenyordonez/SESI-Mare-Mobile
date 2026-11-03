import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { UserIcon } from "phosphor-react-native";

import Navbar from "../../components/navbar";
import Topbar from "../../components/topbar";
import { buscarSeguidores, buscarListaSeguindo, type RelacaoUsuario } from "../../services/usuarioService";

type TipoRelacao = "seguidores" | "seguindo";

export default function ListaRelacoes() {
    const { id: idParametro, tipo } = useLocalSearchParams<{ id: string; tipo?: TipoRelacao }>();
    const roteador = useRouter();
    const usuarioId = Number(idParametro);
    const tipoLista: TipoRelacao = tipo === "seguindo" ? "seguindo" : "seguidores";
    const [relacoes, setRelacoes] = useState<RelacaoUsuario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarLista() {
            if (!Number.isInteger(usuarioId) || usuarioId < 1) {
                setErro("Não foi possível encontrar esta lista.");
                setCarregando(false);
                return;
            }

            try {
                const dados = tipoLista === "seguidores"
                    ? await buscarSeguidores(usuarioId)
                    : await buscarListaSeguindo(usuarioId);
                if (ativo) setRelacoes(dados);
            } catch (erroBusca) {
                if (ativo) {
                    setErro(erroBusca instanceof Error ? erroBusca.message : "Não foi possível carregar a lista.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarLista();
        return () => { ativo = false; };
    }, [usuarioId, tipoLista]);

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" />
            <View className="px-5 pb-4">
                <Text className="text-[#142338] dark:text-white text-xl font-serif">
                    {tipoLista === "seguidores" ? "Seguidores" : "Seguindo"}
                </Text>
                <Text className="text-[#52677F] dark:text-[#718096] text-sm mt-1">
                    {relacoes.length} {tipoLista === "seguidores" ? "pessoas seguem este perfil" : "perfis seguidos"}
                </Text>
            </View>

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#58AAF0" />
                </View>
            ) : erro ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-red-400 text-sm text-center">{erro}</Text>
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {relacoes.length === 0 ? (
                        <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-10">
                            {tipoLista === "seguidores" ? "Ainda não há seguidores." : "Este perfil ainda não segue ninguém."}
                        </Text>
                    ) : relacoes.map((relacao, indice) => {
                        const usuario = tipoLista === "seguidores" ? relacao.seguidor : relacao.seguido;
                        if (!usuario) return null;

                        return (
                            <Pressable
                                key={usuario.id ?? indice}
                                onPress={() => usuario.username && roteador.push(`/u/${encodeURIComponent(usuario.username)}` as never)}
                                className="flex-row items-center px-5 py-3 border-b border-[#D5E0EC] dark:border-[#202633]"
                            >
                                {usuario.foto ? (
                                    <Image source={{ uri: usuario.foto }} className="w-12 h-12 rounded-full border border-[#C5D3E1] dark:border-[#354052]" />
                                ) : (
                                    <View className="w-12 h-12 rounded-full bg-[#F4F7FA] dark:bg-[#171E2B] items-center justify-center">
                                        <UserIcon size={23} color="#9AA6BA" />
                                    </View>
                                )}
                                <View className="ml-3">
                                    <Text className="text-[#142338] dark:text-white text-sm font-semibold">{usuario.nome ?? "Usuário"}</Text>
                                    {usuario.username ? <Text className="text-[#52677F] dark:text-[#718096] text-xs mt-1">@{usuario.username}</Text> : null}
                                </View>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}
            <Navbar />
        </SafeAreaView>
    );
}
