import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    DeviceEventEmitter,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator as EditorDeImagem, SaveFormat } from "expo-image-manipulator";
import Toast from "react-native-toast-message";
import {
    CameraIcon,
    ChatCircleIcon,
    DotsThreeIcon,
    MagnifyingGlassIcon,
    MusicNoteIcon,
    PlusIcon,
    PencilSimpleIcon,
    ShareNetworkIcon,
    TrashIcon,
    UserIcon,
    XIcon,
} from "phosphor-react-native";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import PostCard from "../components/postCard";
import MusicCard from "../components/musicCard";
import ComentarioPerfilCard from "../components/ComentarioPerfilCard";
import { ItemMenuAcao, MenuAcoes } from "../components/MenuAcoes";
import { invalidarCacheFotoPerfil } from "../services/perfilCache";
import { feedbackAcao } from "../services/feedbackTatil";
import { linkPerfil } from "../services/linksCompartilhamento";
import { alternarSalvamentoMusica } from "../services/salvamentoService";
import { alternarCurtidaPost } from "../services/postService";
import {
    atualizarMeuPerfil,
    buscarComentariosDoUsuario,
    buscarMeuPerfil,
    buscarMusicasSalvas,
    buscarPostsCurtidos,
    buscarPostsDoUsuario,
    enviarImagemDoPerfil,
    removerImagemDoPerfil,
    type ComentarioPerfil,
    type DadosEdicaoPerfil,
    type MeuPerfil,
} from "../services/usuarioService";
import { buscarMusicas, type Musica } from "../services/musicaService";
import type { Post } from "../services/postService";
import { adicionarMusicaPlaylist, atualizarPlaylist, buscarMinhasPlaylists, criarPlaylist, excluirPlaylist, type Playlist } from "../services/playlistService";

type AbaPerfil = "avaliacoes" | "comentarios" | "curtidos" | "salvos" | "playlists";
type TipoImagemPerfil = "foto" | "capa";

function normalizarPesquisa(texto: string) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export default function Perfil() {
    const roteador = useRouter();
    const parametros = useLocalSearchParams<{ aba?: string }>();
    const [perfil, setPerfil] = useState<MeuPerfil | null>(null);
    const [avaliacoes, setAvaliacoes] = useState<Post[]>([]);
    const [comentarios, setComentarios] = useState<ComentarioPerfil[]>([]);
    const [curtidos, setCurtidos] = useState<Post[]>([]);
    const [musicasSalvas, setMusicasSalvas] = useState<{ musica: Musica }[]>([]);
    const [pesquisaSalvos, setPesquisaSalvos] = useState("");
    const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>("avaliacoes");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [menuAberto, setMenuAberto] = useState(false);
    const [tipoImagemMenu, setTipoImagemMenu] = useState<TipoImagemPerfil | null>(null);
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
    const [salvandoPerfil, setSalvandoPerfil] = useState(false);
    const [alterandoImagem, setAlterandoImagem] = useState(false);
    const [nomeEditado, setNomeEditado] = useState("");
    const [usuarioEditado, setUsuarioEditado] = useState("");
    const [bioEditada, setBioEditada] = useState("");
    const [revisao, setRevisao] = useState(0);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [nomePlaylist, setNomePlaylist] = useState("");
    const [criandoPlaylist, setCriandoPlaylist] = useState(false);
    const [playlistParaAdicionar, setPlaylistParaAdicionar] = useState<number | null>(null);
    const [buscaCatalogo, setBuscaCatalogo] = useState("");
    const [musicasCatalogo, setMusicasCatalogo] = useState<Musica[]>([]);
    const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);
    const [erroCatalogo, setErroCatalogo] = useState("");
    const [musicaAdicionandoId, setMusicaAdicionandoId] = useState<number | null>(null);

    async function compartilharPerfil() {
        if (!perfil) return;
        try {
            feedbackAcao();
            await Share.share({ message: `Confira o perfil de @${perfil.username} no Maré:\n${linkPerfil(perfil.username)}` });
        } catch (erroCompartilhamento) {
            console.error("Erro ao compartilhar perfil:", erroCompartilhamento);
        }
    }

    useEffect(() => {
        if (parametros.aba === "salvos") setAbaAtiva("salvos");
    }, [parametros.aba]);

    // Busca músicas do catálogo para adicionar à playlist; não usa a biblioteca salva.
    useEffect(() => {
        if (playlistParaAdicionar === null) return;
        let ativo = true;
        const temporizador = setTimeout(() => {
            setCarregandoCatalogo(true);
            setErroCatalogo("");
            void buscarMusicas(buscaCatalogo.trim() || undefined)
                .then((resultado) => { if (ativo) setMusicasCatalogo(resultado); })
                .catch((erroBusca) => {
                    if (!ativo) return;
                    setMusicasCatalogo([]);
                    setErroCatalogo(erroBusca instanceof Error ? erroBusca.message : "Não foi possível buscar no catálogo.");
                })
                .finally(() => { if (ativo) setCarregandoCatalogo(false); });
        }, buscaCatalogo.trim() ? 250 : 0);
        return () => { ativo = false; clearTimeout(temporizador); };
    }, [playlistParaAdicionar, buscaCatalogo]);

    useEffect(() => {
        let ativo = true;

        async function carregarPerfil() {
            try {
                const [dadosPerfil, publicacoes, comentariosPerfil, curtidasPerfil, salvas, minhasPlaylists] =
                    await Promise.all([
                        buscarMeuPerfil(),
                        buscarPostsDoUsuario(),
                        buscarComentariosDoUsuario<ComentarioPerfil>(),
                        buscarPostsCurtidos(),
                        buscarMusicasSalvas(),
                        buscarMinhasPlaylists(),
                    ]);

                if (!ativo) return;
                setPerfil(dadosPerfil);
                setNomeEditado(dadosPerfil.nome ?? "");
                setUsuarioEditado(dadosPerfil.username ?? "");
                setBioEditada(dadosPerfil.bio ?? "");
                setAvaliacoes(publicacoes);
                setComentarios(comentariosPerfil);
                setCurtidos(curtidasPerfil);
                setMusicasSalvas(salvas);
                setPlaylists(minhasPlaylists);
            } catch (erroCarregamento) {
                console.error("Erro ao carregar perfil:", erroCarregamento);
                if (ativo) setErro("Não foi possível carregar seu perfil.");
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarPerfil();
        return () => {
            ativo = false;
        };
    }, [revisao]);

    const musicasSalvasFiltradas = useMemo(() => {
        const consulta = normalizarPesquisa(pesquisaSalvos.trim());
        if (!consulta) return musicasSalvas;
        return musicasSalvas.filter(({ musica }) =>
            [musica.titulo, musica.artista?.nome, musica.genero].some((campo) =>
                normalizarPesquisa(campo ?? "").includes(consulta),
            ),
        );
    }, [musicasSalvas, pesquisaSalvos]);

    async function salvarEdicaoPerfil() {
        if (!perfil || salvandoPerfil) return;

        const dados: DadosEdicaoPerfil = {
            nome: nomeEditado.trim(),
            username: usuarioEditado.trim(),
            bio: bioEditada.trim(),
        };

        if (!dados.nome || !dados.username) {
            Toast.show({ type: "error", text1: "Preencha o nome e o usuário." });
            return;
        }
        if (dados.nome.length > 50) {
            Toast.show({ type: "error", text1: "Nome muito longo", text2: "O nome pode ter no máximo 50 caracteres." });
            return;
        }
        if (!/^[a-z0-9_]{3,15}$/.test(dados.username) && dados.username !== perfil.username) {
            Toast.show({ type: "error", text1: "Usuário inválido", text2: "Use de 3 a 15 letras, números ou _, sem espaços." });
            return;
        }

        try {
            setSalvandoPerfil(true);
            const atualizado = await atualizarMeuPerfil(dados);
            setPerfil((atual) => atual ? { ...atual, ...atualizado, bio: dados.bio } : atual);
            DeviceEventEmitter.emit("usuarioAtualizado");
            setModalEdicaoAberto(false);
            Toast.show({ type: "success", text1: "Perfil atualizado." });
        } catch (erroEdicao) {
            Toast.show({
                type: "error",
                text1: "Não foi possível editar o perfil",
                text2: erroEdicao instanceof Error ? erroEdicao.message : "Tente novamente.",
            });
        } finally {
            setSalvandoPerfil(false);
        }
    }

    async function escolherImagem(tipo: TipoImagemPerfil) {
        if (!perfil || alterandoImagem) return;

        setAlterandoImagem(true);
        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                // O formato da capa segue o corte 3:1 usado no web.
                aspect: tipo === "foto" ? [1, 1] : [3, 1],
                quality: 0.75,
            });
            if (resultado.canceled || !resultado.assets[0]) return;

            const imagem = resultado.assets[0];
            const tamanhoMaximo = 5 * 1024 * 1024;
            const tamanhoImagem = imagem.fileSize ?? imagem.file?.size ?? 0;

            // Redimensiona apenas fotos que ultrapassariam o limite da API.
            // A proporção é mantida e o resultado é convertido para JPEG.
            const imagemParaEnviar = !tamanhoImagem || tamanhoImagem > tamanhoMaximo
                ? await EditorDeImagem.manipulate(imagem.uri, {
                      maxWidth: 1600,
                      maxHeight: 1600,
                  })
                      .renderAsync()
                      .then((resultadoImagem) =>
                          resultadoImagem.saveAsync({
                              format: SaveFormat.JPEG,
                              compress: 0.68,
                          }),
                      )
                : null;

            const formulario = new FormData();
            formulario.append("tipo", tipo);

            if (Platform.OS === "web") {
                const arquivo = imagemParaEnviar
                    ? await fetch(imagemParaEnviar.uri).then((resposta) => resposta.blob())
                    : imagem.file;

                if (!arquivo) {
                    throw new Error("Não foi possível preparar a imagem para envio.");
                }

                formulario.append(
                    "imagem",
                    arquivo,
                    imagemParaEnviar ? `${tipo}.jpg` : imagem.fileName ?? `${tipo}.jpg`,
                );
            } else {
                formulario.append(
                    "imagem",
                    {
                        uri: imagemParaEnviar?.uri ?? imagem.uri,
                        name: imagemParaEnviar ? `${tipo}.jpg` : imagem.fileName ?? `${tipo}.jpg`,
                        type: imagemParaEnviar ? "image/jpeg" : imagem.mimeType ?? "image/jpeg",
                    } as unknown as Blob,
                );
            }

            const dadosAtualizados = await enviarImagemDoPerfil(formulario);
            setPerfil((atual) =>
                atual
                    ? {
                          ...atual,
                          foto: dadosAtualizados.foto ?? atual.foto,
                          capa: dadosAtualizados.capa ?? atual.capa,
                      }
                    : atual,
            );
            invalidarCacheFotoPerfil();
            DeviceEventEmitter.emit("usuarioAtualizado");
            Toast.show({ type: "success", text1: tipo === "foto" ? "Foto atualizada." : "Capa atualizada." });
        } catch (erroImagem) {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar a imagem",
                text2: erroImagem instanceof Error ? erroImagem.message : "Tente novamente.",
            });
        } finally {
            setAlterandoImagem(false);
        }
    }

    async function removerImagem(tipo: TipoImagemPerfil) {
        if (!perfil || alterandoImagem) return;
        setTipoImagemMenu(null);
        setAlterandoImagem(true);
        try {
            const atualizado = await removerImagemDoPerfil(tipo);
            setPerfil((atual) => atual ? { ...atual, foto: atualizado.foto, capa: atualizado.capa } : atual);
            invalidarCacheFotoPerfil();
            DeviceEventEmitter.emit("usuarioAtualizado");
            Toast.show({ type: "success", text1: tipo === "foto" ? "Foto de perfil removida." : "Capa removida." });
        } catch (erroRemocao) {
            Toast.show({ type: "error", text1: "Não foi possível remover a imagem", text2: erroRemocao instanceof Error ? erroRemocao.message : "Tente novamente." });
        } finally {
            setAlterandoImagem(false);
        }
    }

    async function removerCurtida(postId: number) {
        try {
            await alternarCurtidaPost(postId, true);
            setCurtidos((atuais) => atuais.filter((post) => post.id !== postId));
        } catch (erroCurtida) {
            Toast.show({ type: "error", text1: "Não foi possível remover a curtida." });
            console.error(erroCurtida);
        }
    }

    async function removerMusicaSalva(musicaId: number) {
        try {
            await alternarSalvamentoMusica(musicaId, true);
            setMusicasSalvas((atuais) => atuais.filter((item) => item.musica.id !== musicaId));
        } catch (erroRemocao) {
            Toast.show({
                type: "error",
                text1: "Não foi possível remover a música",
                text2: erroRemocao instanceof Error ? erroRemocao.message : undefined,
            });
        }
    }

    function abrirListaRelacoes(tipo: "seguidores" | "seguindo") {
        if (!perfil) return;
        roteador.push({
            pathname: "/relacoes/[id]",
            params: { id: String(perfil.id), tipo },
        } as never);
    }

    const abas: { id: AbaPerfil; titulo: string }[] = [
        { id: "avaliacoes", titulo: "Avaliações" },
        { id: "comentarios", titulo: "Comentários" },
        { id: "curtidos", titulo: "Curtidos" },
        { id: "salvos", titulo: "Músicas salvas" },
        { id: "playlists", titulo: "Playlists" },
    ];

    async function criarNovaPlaylist() {
        if (!nomePlaylist.trim() || criandoPlaylist) return;
        setCriandoPlaylist(true);
        try {
            const criada = await criarPlaylist(nomePlaylist.trim());
            setPlaylists((lista) => [criada, ...lista]);
            setNomePlaylist("");
            Toast.show({ type: "success", text1: "Playlist criada." });
        } catch (erro) {
            Toast.show({ type: "error", text1: "Não foi possível criar a playlist", text2: erro instanceof Error ? erro.message : undefined });
        } finally { setCriandoPlaylist(false); }
    }

    async function alternarVisibilidadePlaylist(playlist: Playlist) {
        try {
            const atualizada = await atualizarPlaylist(playlist.id, { publica: !playlist.publica });
            setPlaylists((lista) => lista.map((item) => item.id === playlist.id ? atualizada : item));
        } catch (erro) {
            Toast.show({ type: "error", text1: "Não foi possível alterar a privacidade", text2: erro instanceof Error ? erro.message : undefined });
        }
    }

    async function adicionarMusicaDoCatalogo(musica: Musica) {
        if (playlistParaAdicionar === null || musicaAdicionandoId !== null) return;
        const playlistId = playlistParaAdicionar;
        const playlist = playlists.find((item) => item.id === playlistId);
        if (!playlist || playlist.musicas.length >= 15) return;
        setMusicaAdicionandoId(musica.id);
        try {
            const atualizada = await adicionarMusicaPlaylist(playlistId, musica.id);
            setPlaylists((lista) => lista.map((item) => item.id === playlistId ? atualizada : item));
            Toast.show({ type: "success", text1: "Música adicionada à playlist", text2: musica.titulo });
            if (atualizada.musicas.length >= 15) setPlaylistParaAdicionar(null);
        } catch (erro) {
            Toast.show({ type: "error", text1: "Não foi possível adicionar a música", text2: erro instanceof Error ? erro.message : undefined });
        } finally {
            setMusicaAdicionandoId(null);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" />

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#5EA7ED" />
                </View>
            ) : erro ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-red-400 text-sm text-center">{erro}</Text>
                </View>
            ) : perfil ? (
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => { setErro(""); setCarregando(true); setRevisao((valor) => valor + 1); }} tintColor="#58AAF0" colors={["#58AAF0"]} />}>
                    <View className="relative">
                        {perfil.capa ? (
                            <Image source={{ uri: perfil.capa }} className="h-[150px] w-full" resizeMode="cover" />
                        ) : (
                            <View className="h-[150px] bg-[#1C314B]" />
                        )}
                        <Pressable
                            onPress={() => setTipoImagemMenu("capa")}
                            disabled={alterandoImagem}
                            className="absolute right-4 top-4 flex-row items-center rounded-lg border border-white/10 bg-[#E8EEF5] dark:bg-[#080A10]/75 px-3 py-2"
                        >
                            <CameraIcon size={17} color="#FFFFFF" />
                            <Text className="text-[#142338] dark:text-white text-xs ml-2">{alterandoImagem ? "Atualizando..." : "Editar capa"}</Text>
                        </Pressable>
                        <View className="absolute left-5 top-[95px] w-[88px] h-[88px] z-10">
                            <Pressable
                                onPress={() => setTipoImagemMenu("foto")}
                                disabled={alterandoImagem}
                                accessibilityLabel="Alterar foto de perfil"
                                className="w-full h-full rounded-full bg-[#505A70] items-center justify-center overflow-hidden border-2 border-[#080A10]"
                            >
                                {perfil.foto ? (
                                    <Image source={{ uri: perfil.foto }} className="w-full h-full" />
                                ) : (
                                    <UserIcon size={42} color="#AAB4C5" />
                                )}
                            </Pressable>
                            <Pressable
                                onPress={() => setTipoImagemMenu("foto")}
                                disabled={alterandoImagem}
                                accessibilityLabel="Trocar foto de perfil"
                                className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-8 h-8 rounded-full bg-[#58AAF0] border-2 border-[#080A10] items-center justify-center"
                            >
                                <CameraIcon size={15} color="#FFFFFF" />
                            </Pressable>
                        </View>
                    </View>

                    <View className="px-5 mt-3">
                        <View className="flex-row justify-end items-center">
                            <Pressable onPress={() => void compartilharPerfil()} accessibilityLabel="Compartilhar perfil" className="p-2 mr-1">
                                <ShareNetworkIcon size={20} color="#FFFFFF" />
                            </Pressable>
                            <Pressable onPress={() => setMenuAberto(true)} accessibilityRole="button" accessibilityLabel="Mais opções do perfil" className="h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35">
                                <DotsThreeIcon size={22} color="#FFFFFF" weight="bold" />
                            </Pressable>
                        </View>
                        <Text className="text-[#142338] dark:text-white text-xl font-semibold">{perfil.nome}</Text>
                        <Text className="text-[#52677F] dark:text-[#697386] text-sm">@{perfil.username}</Text>
                        {perfil.bio ? (
                            <Text className="text-[#C4CCDA] text-sm mt-2 leading-5">{perfil.bio}</Text>
                        ) : (
                            <Text className="text-[#52677F] dark:text-[#718096] text-sm mt-2 italic">Adicione uma bio ao seu perfil.</Text>
                        )}

                        <View className="flex-row flex-wrap mt-5">
                            <Pressable onPress={() => abrirListaRelacoes("seguidores")} className="mr-6">
                                <Text className="text-[#142338] dark:text-white text-sm font-semibold">{perfil._count?.seguidores ?? 0}</Text>
                                <Text className="text-[#52677F] dark:text-[#697386] text-xs mt-1">Seguidores</Text>
                            </Pressable>
                            <Pressable onPress={() => abrirListaRelacoes("seguindo")} className="mr-6">
                                <Text className="text-[#142338] dark:text-white text-sm font-semibold">{perfil._count?.seguindo ?? 0}</Text>
                                <Text className="text-[#52677F] dark:text-[#697386] text-xs mt-1">Seguindo</Text>
                            </Pressable>
                            <View>
                                <Text className="text-[#142338] dark:text-white text-sm font-semibold">{perfil._count?.posts ?? avaliacoes.length}</Text>
                                <Text className="text-[#52677F] dark:text-[#697386] text-xs mt-1">Avaliações</Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-8 border-b border-[#D5E0EC] dark:border-[#202633]">
                        {abas.map((item) => (
                            <Pressable key={item.id} onPress={() => setAbaAtiva(item.id)} className="items-center px-4">
                                <Text numberOfLines={1} className={`${abaAtiva === item.id ? "text-[#142338] dark:text-white" : "text-[#52677F] dark:text-[#697386]"} text-xs pb-3`}>
                                    {item.titulo}
                                </Text>
                                {abaAtiva === item.id ? <View className="h-[2px] w-full bg-[#58AAF0]" /> : null}
                            </Pressable>
                        ))}
                    </ScrollView>

                    <View className="mt-2">
                        {abaAtiva === "avaliacoes" ? (
                            avaliacoes.length ? avaliacoes.map((post) => post.musica ? (
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
                                    ehMeuPost
                                    onExcluir={() => setAvaliacoes((atuais) => atuais.filter((item) => item.id !== post.id))}
                                />
                            ) : null) : (
                                <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">Nenhuma avaliação feita.</Text>
                            )
                        ) : null}

                        {abaAtiva === "comentarios" ? (
                            <>
                                <View className="flex-row items-center px-5 py-3">
                                    <ChatCircleIcon size={18} color="#58AAF0" />
                                    <Text className="text-[#142338] dark:text-white text-base font-serif ml-2">Comentários</Text>
                                </View>
                                {comentarios.length ? comentarios.map((comentario) => (
                                    <ComentarioPerfilCard
                                        key={comentario.id}
                                        comentario={comentario}
                                        usuarioLogadoId={perfil.id}
                                    />
                                )) : (
                                    <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">Nenhum comentário feito.</Text>
                                )}
                            </>
                        ) : null}

                        {abaAtiva === "curtidos" ? (
                            curtidos.length ? curtidos.map((post) => post.musica ? (
                                <PostCard
                                    key={post.id}
                                    postId={post.id}
                                    name={post.usuario?.nome}
                                    username={post.usuario?.username}
                                    foto={post.usuario?.foto}
                                    time={post.dataCriacao}
                                    content={post.texto}
                                    nota={post.nota}
                                    editado={post.editado}
                                    musicId={post.musica.id}
                                    musicTitle={post.musica.titulo}
                                    artist={post.musica.artista?.nome}
                                    musicCover={post.musica.capa}
                                    likes={post._count?.curtidas}
                                    comments={post._count?.comentarios}
                                    curtidoPorMim
                                    ehMeuPost={post.usuario?.id === perfil.id}
                                    onUnlike={() => void removerCurtida(post.id)}
                                />
                            ) : null) : (
                                <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">Você ainda não curtiu nenhuma publicação.</Text>
                            )
                        ) : null}

                        {abaAtiva === "salvos" ? (
                            musicasSalvas.length ? (
                                <>
                                    <View className="mx-4 mb-2 flex-row items-center rounded-xl border border-[#29384B] bg-[#EAF1F8] dark:bg-[#0D1520] px-3">
                                        <MagnifyingGlassIcon size={19} color="#8495A9" />
                                        <TextInput
                                            className="flex-1 px-3 py-3 text-sm text-[#142338] dark:text-white"
                                            value={pesquisaSalvos}
                                            onChangeText={setPesquisaSalvos}
                                            placeholder="Buscar nas músicas salvas..."
                                            placeholderTextColor="#738196"
                                            autoCapitalize="none"
                                            accessibilityLabel="Buscar nas músicas salvas"
                                        />
                                        {pesquisaSalvos ? (
                                            <Pressable onPress={() => setPesquisaSalvos("")} accessibilityLabel="Limpar busca nas músicas salvas">
                                                <XIcon size={18} color="#8495A9" />
                                            </Pressable>
                                        ) : null}
                                    </View>
                                    {musicasSalvasFiltradas.length ? musicasSalvasFiltradas.map(({ musica }) => (
                                        <View key={musica.id} className="mx-4 my-2">
                                            <MusicCard
                                                id={musica.id}
                                                tipo="post"
                                                titulo={musica.titulo}
                                                artista={musica.artista?.nome}
                                                artistaId={musica.artista?.id}
                                                capa={musica.capa}
                                                nota={musica.nota}
                                                avaliacoes={musica.avaliacoes ?? musica._count?.posts}
                                                duracaoSegundos={musica.duracaoSegundos}
                                                salva
                                                onAlternarSalvamento={() => void removerMusicaSalva(musica.id)}
                                            />
                                        </View>
                                    )) : (
                                        <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">Nenhuma música salva corresponde à sua busca.</Text>
                                    )}
                                </>
                            ) : (
                                <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">Nenhuma música salva.</Text>
                            )
                        ) : null}

                        {abaAtiva === "playlists" ? (
                            <View className="px-4 py-4">
                                <View className="mb-4 flex-row gap-2">
                                    <TextInput value={nomePlaylist} onChangeText={setNomePlaylist} maxLength={80} placeholder="Nome da playlist" placeholderTextColor="#8793A7" className="h-11 flex-1 rounded-xl border border-[#354052] bg-[#111420] px-3 text-sm text-white" />
                                    <Pressable onPress={() => void criarNovaPlaylist()} disabled={!nomePlaylist.trim() || criandoPlaylist} className="items-center justify-center rounded-xl bg-[#58AAF0] px-4"><Text className="font-semibold text-[#081321]">Criar</Text></Pressable>
                                </View>
                                {!playlists.length ? <Text className="py-6 text-center text-sm text-[#8793A7]">Crie sua primeira playlist e escolha músicas do catálogo.</Text> : playlists.map((playlist) => (
                                    <View key={playlist.id} className="mb-4 overflow-hidden rounded-2xl border border-[#2A3C52] bg-[#101A29] p-4">
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1"><Text className="text-base font-semibold text-white">{playlist.nome}</Text><Text className="mt-1 text-xs text-[#C3D0DE]">{playlist.musicas.length}/15 músicas · {playlist.publica ? "Pública no perfil" : "Privada"}</Text></View>
                                            <Pressable onPress={() => void alternarVisibilidadePlaylist(playlist)} className="rounded-full border border-[#53718F] px-3 py-2"><Text className="text-xs font-medium text-[#A9D8FF]">{playlist.publica ? "Tornar privada" : "Tornar pública"}</Text></Pressable>
                                        </View>
                                        {playlist.musicas.length ? (
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                className="mt-4"
                                                contentContainerStyle={{ paddingRight: 4 }}
                                            >
                                                {playlist.musicas.slice(0, 15).map(({ musica }) => (
                                                    <MusicCard
                                                        key={musica.id}
                                                        id={musica.id}
                                                        tipo="quadrado"
                                                        larguraFixa
                                                        titulo={musica.titulo}
                                                        artista={musica.artista.nome}
                                                        artistaId={musica.artista.id}
                                                        capa={musica.capa}
                                                    />
                                                ))}
                                            </ScrollView>
                                        ) : (
                                            <Text className="mt-4 text-xs text-[#8793A7]">Escolha músicas do catálogo para montar esta playlist.</Text>
                                        )}
                                        <Pressable
                                            onPress={() => { setBuscaCatalogo(""); setPlaylistParaAdicionar(playlist.id); }}
                                            disabled={playlist.musicas.length >= 15}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Adicionar música à playlist ${playlist.nome}`}
                                            className="mt-4 h-10 flex-row items-center justify-center gap-2 rounded-xl border border-[#53718F] bg-[#20364F] px-4 disabled:opacity-50"
                                        >
                                            <PlusIcon size={18} color="#A9D8FF" weight="bold" />
                                            <Text className="text-xs font-semibold text-white">{playlist.musicas.length >= 15 ? "Limite de 15 músicas" : "Adicionar música"}</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            ) : null}

            <Modal
                visible={modalEdicaoAberto}
                transparent
                animationType="fade"
                onRequestClose={() => setModalEdicaoAberto(false)}
            >
                <View className="flex-1 justify-center bg-black/70 px-5">
                    <View className="rounded-2xl border border-[#C5D3E1] dark:border-[#354052] bg-[#0D121C] p-5">
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className="text-[#142338] dark:text-white text-lg font-serif">Editar perfil</Text>
                            <Pressable onPress={() => setModalEdicaoAberto(false)} accessibilityLabel="Fechar edição">
                                <XIcon size={21} color="#9AA6BA" />
                            </Pressable>
                        </View>

                        <Text className="text-[#C4CCDA] text-xs mb-2">Nome</Text>
                        <TextInput
                            className="rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-[#E8EEF5] dark:bg-[#080A10] px-3 py-3 text-[#142338] dark:text-white text-sm mb-4"
                            value={nomeEditado}
                            onChangeText={setNomeEditado}
                            maxLength={50}
                        />
                        <Text className="text-[#C4CCDA] text-xs mb-2">Usuário</Text>
                        <TextInput
                            className="rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-[#E8EEF5] dark:bg-[#080A10] px-3 py-3 text-[#142338] dark:text-white text-sm mb-4"
                            value={usuarioEditado}
                            onChangeText={(valor) => setUsuarioEditado(valor.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15))}
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={15}
                        />
                        <Text className="-mt-2 mb-4 text-[11px] leading-4 text-[#52677F] dark:text-[#8793A7]">3 a 15 caracteres: letras, números e _; sem espaços.</Text>
                        <Text className="text-[#C4CCDA] text-xs mb-2">Bio</Text>
                        <TextInput
                            className="min-h-[90px] rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-[#E8EEF5] dark:bg-[#080A10] px-3 py-3 text-[#142338] dark:text-white text-sm"
                            value={bioEditada}
                            onChangeText={setBioEditada}
                            multiline
                            maxLength={240}
                        />
                        <View className="flex-row justify-end mt-5">
                            <Pressable onPress={() => setModalEdicaoAberto(false)} className="px-4 py-3 mr-2">
                                <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm">Cancelar</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => void salvarEdicaoPerfil()}
                                disabled={salvandoPerfil}
                                className="px-4 py-3 rounded-lg bg-[#58AAF0]"
                            >
                                {salvandoPerfil ? <ActivityIndicator color="#080A10" /> : <Text className="text-[#07111E] text-sm font-semibold">Salvar</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={playlistParaAdicionar !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setPlaylistParaAdicionar(null)}
            >
                <View className="flex-1 justify-end bg-black/70">
                    <KeyboardAvoidingView className="flex-1 justify-end" behavior="padding">
                    <View className="h-[82%] rounded-t-3xl border border-[#263143] bg-[#0D121C] px-4 pb-5 pt-4">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-white">Adicionar músicas</Text>
                                <Text className="mt-1 text-xs text-[#9AA6BA]">Pesquise no catálogo da Maré · até 15 faixas</Text>
                            </View>
                            <Pressable onPress={() => setPlaylistParaAdicionar(null)} accessibilityLabel="Fechar catálogo" className="h-10 w-10 items-center justify-center rounded-full bg-[#171E2B]"><XIcon size={20} color="#AEB8C8" /></Pressable>
                        </View>
                        <TextInput
                            value={buscaCatalogo}
                            onChangeText={setBuscaCatalogo}
                            placeholder="Buscar música ou artista"
                            placeholderTextColor="#718096"
                            returnKeyType="search"
                            className="mb-3 h-11 rounded-xl border border-[#354052] bg-[#111A27] px-3 text-sm text-white"
                            accessibilityLabel="Buscar músicas no catálogo"
                        />
                        {carregandoCatalogo ? <ActivityIndicator className="py-5" color="#58AAF0" /> : null}
                        {erroCatalogo ? <Text className="py-4 text-center text-sm text-[#E8A0A7]">{erroCatalogo}</Text> : null}
                        {!carregandoCatalogo && !erroCatalogo && musicasCatalogo.length === 0 ? <Text className="py-6 text-center text-sm text-[#8793A7]">Nenhuma música encontrada no catálogo.</Text> : null}
                        <FlatList
                            data={musicasCatalogo.filter((musica) => !playlists.find((item) => item.id === playlistParaAdicionar)?.musicas.some(({ musica: faixa }) => faixa.id === musica.id))}
                            keyExtractor={(musica) => String(musica.id)}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingBottom: 16, gap: 8 }}
                            renderItem={({ item: musica }) => (
                                <View className="min-h-[66px] flex-row items-center rounded-xl border border-[#263143] bg-[#111A27] p-2">
                                    {musica.capa ? <Image source={{ uri: musica.capa }} className="h-12 w-12 rounded-lg bg-[#202A39]" /> : <View className="h-12 w-12 items-center justify-center rounded-lg bg-[#202A39]"><MusicNoteIcon size={21} color="#8793A7" /></View>}
                                    <View className="ml-3 flex-1">
                                        <Text numberOfLines={1} className="text-sm font-medium text-white">{musica.titulo}</Text>
                                        <Text numberOfLines={1} className="mt-1 text-xs text-[#9AA6BA]">{musica.artista?.nome ?? "Artista desconhecido"}</Text>
                                    </View>
                                    <Pressable
                                        onPress={() => void adicionarMusicaDoCatalogo(musica)}
                                        disabled={musicaAdicionandoId !== null}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Adicionar ${musica.titulo}`}
                                        className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-[#58AAF0] disabled:opacity-50"
                                    >{musicaAdicionandoId === musica.id ? <ActivityIndicator size="small" color="#081321" /> : <PlusIcon size={20} color="#081321" weight="bold" />}</Pressable>
                                </View>
                            )}
                        />
                    </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <MenuAcoes aberto={menuAberto} titulo="Opções do perfil" aoFechar={() => setMenuAberto(false)}>
                <ItemMenuAcao
                    titulo="Editar perfil"
                    descricao="Atualizar nome, bio e fotos"
                    icone={<PencilSimpleIcon size={19} color="#58AAF0" />}
                    aoPressionar={() => {
                        setMenuAberto(false);
                        setModalEdicaoAberto(true);
                    }}
                />
            </MenuAcoes>

            <MenuAcoes
                aberto={tipoImagemMenu !== null}
                titulo={tipoImagemMenu === "foto" ? "Foto de perfil" : "Foto de capa"}
                aoFechar={() => setTipoImagemMenu(null)}
            >
                {tipoImagemMenu ? (
                    <>
                        <ItemMenuAcao
                            titulo={tipoImagemMenu === "foto" ? "Escolher nova foto" : "Escolher nova capa"}
                            descricao="Abrir a galeria do celular"
                            icone={<CameraIcon size={19} color="#58AAF0" />}
                            desabilitado={alterandoImagem}
                            aoPressionar={() => {
                                const tipo = tipoImagemMenu;
                                setTipoImagemMenu(null);
                                void escolherImagem(tipo);
                            }}
                        />
                        {((tipoImagemMenu === "foto" && perfil?.foto) || (tipoImagemMenu === "capa" && perfil?.capa)) ? (
                            <ItemMenuAcao
                                titulo={tipoImagemMenu === "foto" ? "Remover foto de perfil" : "Remover foto de capa"}
                                descricao="Voltar para a imagem padrão"
                                icone={<TrashIcon size={19} color="#E2717C" />}
                                destrutivo
                                desabilitado={alterandoImagem}
                                aoPressionar={() => void removerImagem(tipoImagemMenu)}
                            />
                        ) : null}
                    </>
                ) : null}
            </MenuAcoes>

            <Navbar />
        </SafeAreaView>
    );
}
