import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChatCircleIcon, ShareNetworkIcon, UserIcon } from "phosphor-react-native";
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
import { iniciarConversa as abrirConversaPrivada } from "../../services/mensagemPrivadaService";
import { buscarPlaylistsPublicas, type Playlist } from "../../services/playlistService";

type AbaPerfilPublico = "avaliacoes" | "comentarios";

export default function PerfilPublico() {
    const { username } = useLocalSearchParams<{ username: string }>();
    const roteador = useRouter();
    const [perfil, setPerfil] = useState<PerfilPublicoDados | null>(null);
    const [comentarios, setComentarios] = useState<ComentarioPerfil[]>([]);
    const [playlistsPublicas, setPlaylistsPublicas] = useState<Playlist[]>([]);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [abaAtiva, setAbaAtiva] = useState<AbaPerfilPublico>("avaliacoes");
    const [seguindo, setSeguindo] = useState(false);
    const [salvandoSeguir, setSalvandoSeguir] = useState(false);
    const [abrindoConversa, setAbrindoConversa] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarPerfil() {
            try {
                const [dadosPerfil, meuPerfil, playlists] = await Promise.all([
                    buscarPerfilPublico(username),
                    buscarMeuPerfil().catch(() => null),
                    buscarPlaylistsPublicas(username),
                ]);
                const comentariosPerfil = await buscarComentariosPublicos(dadosPerfil.id);

                if (!ativo) return;
                setPerfil(dadosPerfil);
                setComentarios(comentariosPerfil);
                setPlaylistsPublicas(playlists);
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

    async function iniciarConversa() {
        if (!perfil || abrindoConversa || meuId === perfil.id) return;
        setAbrindoConversa(true);
        try {
            const conversa = await abrirConversaPrivada(perfil.id);
            roteador.push({
                pathname: "/mensagens/[id]",
                params: {
                    id: String(conversa.id),
                    nome: perfil.nome,
                    username: perfil.username,
                    foto: perfil.foto ?? "",
                },
            } as never);
        } catch (erroConversa) {
            Toast.show({
                type: "error",
                text1: "Não foi possível abrir a conversa",
                text2: erroConversa instanceof Error ? erroConversa.message : "Tente novamente.",
            });
        } finally {
            setAbrindoConversa(false);
        }
    }

    function abrirListaRelacoes(tipo: "seguidores" | "seguindo") {
        if (!perfil) return;
        roteador.push({ pathname: "/relacoes/[id]", params: { id: String(perfil.id), tipo } } as never);
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
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
                                <View className="flex-row items-center">
                                    <Pressable
                                        onPress={() => void iniciarConversa()}
                                        disabled={abrindoConversa || !seguindo || !perfil.segueDeVolta}
                                        accessibilityRole="button"
                                        accessibilityLabel="Enviar mensagem privada"
                                        accessibilityHint={seguindo && perfil.segueDeVolta ? "Abre uma conversa privada." : "Vocês precisam seguir um ao outro para conversar."}
                                        className={`mr-2 flex-row items-center rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] px-3 py-2 ${seguindo && perfil.segueDeVolta ? "" : "opacity-50"}`}
                                    >
                                        <ChatCircleIcon size={16} color="#D0D8E4" />
                                        <Text className="ml-1.5 text-xs font-semibold text-[#142338] dark:text-white">{abrindoConversa ? "Abrindo..." : seguindo && perfil.segueDeVolta ? "Mensagem" : "Sigam-se"}</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => void alternarSeguir()}
                                        disabled={salvandoSeguir}
                                        className={`px-4 py-2 rounded-lg ${seguindo ? "border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420]" : "bg-[#58AAF0]"}`}
                                    >
                                        <Text className="text-[#142338] dark:text-white text-xs font-semibold">
                                            {salvandoSeguir ? "Aguarde..." : seguindo ? "Seguindo" : "Seguir"}
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : null}
                        </View>

                        <Text className="text-[#142338] dark:text-white text-xl font-semibold">{perfil.nome}</Text>
                        <Text className="text-[#52677F] dark:text-[#697386] text-sm">@{perfil.username}</Text>
                        {perfil.bio ? <Text className="text-[#C4CCDA] text-sm mt-2 leading-5">{perfil.bio}</Text> : null}

                        <View className="flex-row flex-wrap mt-5">
                            <Pressable onPress={() => abrirListaRelacoes("seguidores")} className="mr-6">
                                <Text className="text-[#142338] dark:text-white text-sm font-semibold">{perfil._count.seguidores}</Text>
                                <Text className="text-[#52677F] dark:text-[#697386] text-xs mt-1">Seguidores</Text>
                            </Pressable>
                            <Pressable onPress={() => abrirListaRelacoes("seguindo")} className="mr-6">
                                <Text className="text-[#142338] dark:text-white text-sm font-semibold">{perfil._count.seguindo}</Text>
                                <Text className="text-[#52677F] dark:text-[#697386] text-xs mt-1">Seguindo</Text>
                            </Pressable>
                            <View>
                                <Text className="text-[#142338] dark:text-white text-sm font-semibold">{perfil._count.posts}</Text>
                                <Text className="text-[#52677F] dark:text-[#697386] text-xs mt-1">Avaliações</Text>
                            </View>
                        </View>
                    </View>

                    {playlistsPublicas.length > 0 ? (
                        <View className="mt-6">
                            <Text className="px-5 pb-3 font-serif text-lg text-[#142338] dark:text-white">Playlists públicas</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                                {playlistsPublicas.map((playlist) => (
                                    <View key={playlist.id} className="mr-3 w-64 rounded-2xl border border-[#29435F] bg-[#101A29] p-4">
                                        <Text className="text-base font-semibold text-white" numberOfLines={1}>{playlist.nome}</Text>
                                        {playlist.descricao ? <Text className="mt-1 text-xs text-[#D2DFEC]" numberOfLines={2}>{playlist.descricao}</Text> : null}
                                        <Text className="mt-2 text-[11px] text-[#A9D8FF]">{playlist.musicas.length} músicas</Text>
                                        {playlist.musicas.slice(0, 3).map(({ musica }) => <Text key={musica.id} className="mt-2 text-xs text-[#F3F7FC]" numberOfLines={1}>♪ {musica.titulo} · {musica.artista.nome}</Text>)}
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    ) : null}

                    <View className="flex-row mt-8 border-b border-[#D5E0EC] dark:border-[#202633]">
                        {(["avaliacoes", "comentarios"] as const).map((aba) => (
                            <Pressable key={aba} onPress={() => setAbaAtiva(aba)} className="flex-1 items-center">
                                <Text className={`${abaAtiva === aba ? "text-[#142338] dark:text-white" : "text-[#52677F] dark:text-[#697386]"} text-xs pb-3`}>
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
                            <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">Nenhuma avaliação publicada.</Text>
                        )
                    ) : comentarios.length ? comentarios.map((comentario) => (
                        <ComentarioPerfilCard
                            key={comentario.id}
                            comentario={comentario}
                            usuarioLogadoId={meuId}
                        />
                    )) : (
                        <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">Nenhum comentário publicado.</Text>
                    )}
                </ScrollView>
            )}

            <Navbar />
        </SafeAreaView>
    );
}
