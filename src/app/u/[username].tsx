import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShareNetworkIcon, UserIcon } from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Navbar from "../../components/navbar";
import Topbar from "../../components/topbar";
import PostCard from "../../components/postCard";
import ComentarioPerfilCard from "../../components/ComentarioPerfilCard";
import {
    alternarSeguirUsuario,
    buscarComentariosPublicos,
    buscarMeuPerfil,
    buscarPerfilPublico,
    type ComentarioPerfil,
    type PerfilPublico as PerfilPublicoDados,
} from "../../services/usuarioService";

type AbaPerfilPublico = "avaliacoes" | "comentarios";

export default function PerfilPublico() {
    const { username } = useLocalSearchParams<{ username: string }>();
    const roteador = useRouter();
    const [perfil, setPerfil] = useState<PerfilPublicoDados | null>(null);
    const [comentarios, setComentarios] = useState<ComentarioPerfil[]>([]);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [abaAtiva, setAbaAtiva] = useState<AbaPerfilPublico>("avaliacoes");
    const [seguindo, setSeguindo] = useState(false);
    const [salvandoSeguir, setSalvandoSeguir] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarPerfil() {
            try {
                const [dadosPerfil, meuPerfil] = await Promise.all([
                    buscarPerfilPublico(username),
                    buscarMeuPerfil().catch(() => null),
                ]);
                const comentariosPerfil = await buscarComentariosPublicos(dadosPerfil.id);

                if (!ativo) return;
                setPerfil(dadosPerfil);
                setComentarios(comentariosPerfil);
                setMeuId(meuPerfil?.id ?? null);
                setSeguindo(dadosPerfil.seguindoPorMim);
            } catch (erroCarregamento) {
                if (ativo) {
                    setErro(
                        erroCarregamento instanceof Error
                            ? erroCarregamento.message
                            : "Não foi possível carregar este perfil.",
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarPerfil();
        return () => { ativo = false; };
    }, [username]);

    async function alternarSeguir() {
        if (!perfil || salvandoSeguir) return;
        const seguindoAntes = seguindo;
        setSeguindo(!seguindoAntes);
        setSalvandoSeguir(true);
        setPerfil((atual) => atual ? {
            ...atual,
            _count: {
                ...atual._count,
                seguidores: Math.max(0, atual._count.seguidores + (seguindoAntes ? -1 : 1)),
            },
        } : atual);

        try {
            await alternarSeguirUsuario(perfil.id, seguindoAntes);
        } catch (erroSeguir) {
            setSeguindo(seguindoAntes);
            setPerfil((atual) => atual ? {
                ...atual,
                _count: {
                    ...atual._count,
                    seguidores: Math.max(0, atual._count.seguidores + (seguindoAntes ? 1 : -1)),
                },
            } : atual);
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar o seguimento",
                text2: erroSeguir instanceof Error ? erroSeguir.message : "Tente novamente.",
            });
        } finally {
            setSalvandoSeguir(false);
        }
    }

    async function compartilharPerfil() {
        if (!perfil) return;
        try {
            await Share.share({ message: `Confira o perfil de @${perfil.username} no Maré.` });
        } catch (erroCompartilhamento) {
            console.error("Erro ao compartilhar perfil:", erroCompartilhamento);
        }
    }

    function abrirListaRelacoes(tipo: "seguidores" | "seguindo") {
        if (!perfil) return;
        roteador.push({ pathname: "/relacoes/[id]", params: { id: String(perfil.id), tipo } } as never);
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar tipo="voltar" />

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#5EA7ED" />
                </View>
            ) : !perfil ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-red-400 text-sm text-center">{erro || "Perfil não encontrado."}</Text>
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="relative">
                        {perfil.capa ? (
                            <Image source={{ uri: perfil.capa }} className="h-[150px] w-full" resizeMode="cover" />
                        ) : (
                            <View className="h-[150px] bg-[#1C314B]" />
                        )}
                        <View className="absolute left-5 top-[95px] w-[88px] h-[88px] rounded-full overflow-hidden bg-[#505A70] border-2 border-[#080A10] items-center justify-center">
                            {perfil.foto ? <Image source={{ uri: perfil.foto }} className="w-full h-full" /> : <UserIcon size={42} color="#AAB4C5" />}
                        </View>
                    </View>

                    <View className="px-5 mt-3">
                        <View className="flex-row justify-end items-center">
                            <Pressable onPress={() => void compartilharPerfil()} accessibilityLabel="Compartilhar perfil" className="p-2 mr-2">
                                <ShareNetworkIcon size={20} color="#FFFFFF" />
                            </Pressable>
                            {meuId !== perfil.id ? (
                                <Pressable
                                    onPress={() => void alternarSeguir()}
                                    disabled={salvandoSeguir}
                                    className={`px-4 py-2 rounded-lg ${seguindo ? "border border-[#354052] bg-[#111420]" : "bg-[#58AAF0]"}`}
                                >
                                    <Text className="text-white text-xs font-semibold">
                                        {salvandoSeguir ? "Aguarde..." : seguindo ? "Seguindo" : "Seguir"}
                                    </Text>
                                </Pressable>
                            ) : null}
                        </View>

                        <Text className="text-white text-xl font-semibold">{perfil.nome}</Text>
                        <Text className="text-[#697386] text-sm">@{perfil.username}</Text>
                        {perfil.bio ? <Text className="text-[#C4CCDA] text-sm mt-2 leading-5">{perfil.bio}</Text> : null}

                        <View className="flex-row flex-wrap mt-5">
                            <Pressable onPress={() => abrirListaRelacoes("seguidores")} className="mr-6">
                                <Text className="text-white text-sm font-semibold">{perfil._count.seguidores}</Text>
                                <Text className="text-[#697386] text-xs mt-1">Seguidores</Text>
                            </Pressable>
                            <Pressable onPress={() => abrirListaRelacoes("seguindo")} className="mr-6">
                                <Text className="text-white text-sm font-semibold">{perfil._count.seguindo}</Text>
                                <Text className="text-[#697386] text-xs mt-1">Seguindo</Text>
                            </Pressable>
                            <View>
                                <Text className="text-white text-sm font-semibold">{perfil._count.posts}</Text>
                                <Text className="text-[#697386] text-xs mt-1">Avaliações</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row mt-8 border-b border-[#202633]">
                        {(["avaliacoes", "comentarios"] as const).map((aba) => (
                            <Pressable key={aba} onPress={() => setAbaAtiva(aba)} className="flex-1 items-center">
                                <Text className={`${abaAtiva === aba ? "text-white" : "text-[#697386]"} text-xs pb-3`}>
                                    {aba === "avaliacoes" ? "Avaliações" : "Comentários"}
                                </Text>
                                {abaAtiva === aba ? <View className="h-[2px] w-4/5 bg-[#58AAF0]" /> : null}
                            </Pressable>
                        ))}
                    </View>

                    {abaAtiva === "avaliacoes" ? (
                        perfil.posts.length ? perfil.posts.map((post) => post.musica ? (
                            <PostCard
                                key={post.id}
                                postId={post.id}
                                name={perfil.nome}
                                username={perfil.username}
                                foto={perfil.foto}
                                time={post.dataCriacao}
                                content={post.texto}
                                nota={post.nota}
                                editado={post.editado}
                                musicId={post.musica.id}
                                musicTitle={post.musica.titulo}
                                artist={post.musica.artista?.nome}
                                artistId={post.musica.artista?.id}
                                musicCover={post.musica.capa}
                                duracaoSegundos={post.musica.duracaoSegundos}
                                likes={post._count?.curtidas}
                                comments={post._count?.comentarios}
                                curtidoPorMim={post.curtidoPorMim}
                                ehMeuPost={meuId === perfil.id}
                            />
                        ) : null) : (
                            <Text className="text-[#718096] text-sm text-center py-8">Nenhuma avaliação publicada.</Text>
                        )
                    ) : comentarios.length ? comentarios.map((comentario) => (
                        <ComentarioPerfilCard
                            key={comentario.id}
                            comentario={comentario}
                            usuarioLogadoId={meuId}
                        />
                    )) : (
                        <Text className="text-[#718096] text-sm text-center py-8">Nenhum comentário publicado.</Text>
                    )}
                </ScrollView>
            )}

            <Navbar />
        </SafeAreaView>
    );
}
