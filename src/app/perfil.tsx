import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    DeviceEventEmitter,
    Image,
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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import {
    CameraIcon,
    ChatCircleIcon,
    DotsThreeIcon,
    MusicNoteIcon,
    PencilSimpleIcon,
    ShareNetworkIcon,
    UserIcon,
    XIcon,
} from "phosphor-react-native";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import PostCard from "../components/postCard";
import MusicCard from "../components/musicCard";
import ComentarioPerfilCard from "../components/ComentarioPerfilCard";
import { invalidarCacheFotoPerfil } from "../services/perfilCache";
import { feedbackAcao } from "../services/feedbackTatil";
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
    type ComentarioPerfil,
    type DadosEdicaoPerfil,
    type MeuPerfil,
} from "../services/usuarioService";
import type { Musica } from "../services/musicaService";
import type { Post } from "../services/postService";

type AbaPerfil = "avaliacoes" | "comentarios" | "curtidos" | "salvos";
type TipoImagemPerfil = "foto" | "capa";

export default function Perfil() {
    const roteador = useRouter();
    const [perfil, setPerfil] = useState<MeuPerfil | null>(null);
    const [avaliacoes, setAvaliacoes] = useState<Post[]>([]);
    const [comentarios, setComentarios] = useState<ComentarioPerfil[]>([]);
    const [curtidos, setCurtidos] = useState<Post[]>([]);
    const [musicasSalvas, setMusicasSalvas] = useState<{ musica: Musica }[]>([]);
    const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>("avaliacoes");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [menuAberto, setMenuAberto] = useState(false);
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
    const [salvandoPerfil, setSalvandoPerfil] = useState(false);
    const [alterandoImagem, setAlterandoImagem] = useState(false);
    const [nomeEditado, setNomeEditado] = useState("");
    const [usuarioEditado, setUsuarioEditado] = useState("");
    const [bioEditada, setBioEditada] = useState("");
    const [revisao, setRevisao] = useState(0);

    useEffect(() => {
        let ativo = true;

        async function carregarPerfil() {
            try {
                const [dadosPerfil, publicacoes, comentariosPerfil, curtidasPerfil, salvas] =
                    await Promise.all([
                        buscarMeuPerfil(),
                        buscarPostsDoUsuario(),
                        buscarComentariosDoUsuario<ComentarioPerfil>(),
                        buscarPostsCurtidos(),
                        buscarMusicasSalvas(),
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

    async function compartilharPerfil() {
        if (!perfil) return;
        try {
            feedbackAcao();
            await Share.share({ message: `Confira o perfil de @${perfil.username} no Maré.` });
        } catch (erroCompartilhamento) {
            console.error("Erro ao compartilhar perfil:", erroCompartilhamento);
        }
    }

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

        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: tipo === "foto" ? [1, 1] : [16, 5],
                quality: 0.85,
            });
            if (resultado.canceled || !resultado.assets[0]) return;

            const imagem = resultado.assets[0];
            const formulario = new FormData();
            formulario.append("tipo", tipo);

            if (Platform.OS === "web" && imagem.file) {
                formulario.append("imagem", imagem.file);
            } else {
                formulario.append(
                    "imagem",
                    {
                        uri: imagem.uri,
                        name: imagem.fileName ?? `${tipo}.jpg`,
                        type: imagem.mimeType ?? "image/jpeg",
                    } as unknown as Blob,
                );
            }

            setAlterandoImagem(true);
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
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
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
                            onPress={() => void escolherImagem("capa")}
                            disabled={alterandoImagem}
                            className="absolute right-4 top-4 flex-row items-center rounded-lg border border-white/10 bg-[#080A10]/75 px-3 py-2"
                        >
                            <CameraIcon size={17} color="#FFFFFF" />
                            <Text className="text-white text-xs ml-2">{alterandoImagem ? "Enviando..." : "Alterar capa"}</Text>
                        </Pressable>
                        <View className="absolute left-5 top-[95px] w-[88px] h-[88px] z-10">
                            <Pressable
                                onPress={() => void escolherImagem("foto")}
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
                                onPress={() => void escolherImagem("foto")}
                                disabled={alterandoImagem}
                                accessibilityLabel="Trocar foto de perfil"
                                className="absolute -right-8 bottom-0 w-8 h-8 rounded-full bg-[#58AAF0] border-2 border-[#080A10] items-center justify-center"
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
                            <Pressable onPress={() => setMenuAberto((aberto) => !aberto)} accessibilityLabel="Mais opções do perfil" className="p-2">
                                <DotsThreeIcon size={23} color="#FFFFFF" weight="bold" />
                            </Pressable>
                        </View>
                        <Text className="text-white text-xl font-semibold">{perfil.nome}</Text>
                        <Text className="text-[#697386] text-sm">@{perfil.username}</Text>
                        {perfil.bio ? (
                            <Text className="text-[#C4CCDA] text-sm mt-2 leading-5">{perfil.bio}</Text>
                        ) : (
                            <Text className="text-[#718096] text-sm mt-2 italic">Adicione uma bio ao seu perfil.</Text>
                        )}

                        <View className="flex-row flex-wrap mt-5">
                            <Pressable onPress={() => abrirListaRelacoes("seguidores")} className="mr-6">
                                <Text className="text-white text-sm font-semibold">{perfil._count?.seguidores ?? 0}</Text>
                                <Text className="text-[#697386] text-xs mt-1">Seguidores</Text>
                            </Pressable>
                            <Pressable onPress={() => abrirListaRelacoes("seguindo")} className="mr-6">
                                <Text className="text-white text-sm font-semibold">{perfil._count?.seguindo ?? 0}</Text>
                                <Text className="text-[#697386] text-xs mt-1">Seguindo</Text>
                            </Pressable>
                            <View>
                                <Text className="text-white text-sm font-semibold">{perfil._count?.posts ?? avaliacoes.length}</Text>
                                <Text className="text-[#697386] text-xs mt-1">Avaliações</Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-8 border-b border-[#202633]">
                        {abas.map((item) => (
                            <Pressable key={item.id} onPress={() => setAbaAtiva(item.id)} className="items-center px-4">
                                <Text numberOfLines={1} className={`${abaAtiva === item.id ? "text-white" : "text-[#697386]"} text-xs pb-3`}>
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
                                <Text className="text-[#718096] text-sm text-center py-8">Nenhuma avaliação feita.</Text>
                            )
                        ) : null}

                        {abaAtiva === "comentarios" ? (
                            <>
                                <View className="flex-row items-center px-5 py-3">
                                    <ChatCircleIcon size={18} color="#58AAF0" />
                                    <Text className="text-white text-base font-serif ml-2">Comentários</Text>
                                </View>
                                {comentarios.length ? comentarios.map((comentario) => (
                                    <ComentarioPerfilCard
                                        key={comentario.id}
                                        comentario={comentario}
                                        usuarioLogadoId={perfil.id}
                                    />
                                )) : (
                                    <Text className="text-[#718096] text-sm text-center py-8">Nenhum comentário feito.</Text>
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
                                <Text className="text-[#718096] text-sm text-center py-8">Você ainda não curtiu nenhuma publicação.</Text>
                            )
                        ) : null}

                        {abaAtiva === "salvos" ? (
                            musicasSalvas.length ? musicasSalvas.map(({ musica }) => (
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
                                <Text className="text-[#718096] text-sm text-center py-8">Nenhuma música salva.</Text>
                            )
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
                    <View className="rounded-2xl border border-[#354052] bg-[#0D121C] p-5">
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className="text-white text-lg font-serif">Editar perfil</Text>
                            <Pressable onPress={() => setModalEdicaoAberto(false)} accessibilityLabel="Fechar edição">
                                <XIcon size={21} color="#9AA6BA" />
                            </Pressable>
                        </View>

                        <Text className="text-[#C4CCDA] text-xs mb-2">Nome</Text>
                        <TextInput
                            className="rounded-lg border border-[#354052] bg-[#080A10] px-3 py-3 text-white text-sm mb-4"
                            value={nomeEditado}
                            onChangeText={setNomeEditado}
                            maxLength={80}
                        />
                        <Text className="text-[#C4CCDA] text-xs mb-2">Usuário</Text>
                        <TextInput
                            className="rounded-lg border border-[#354052] bg-[#080A10] px-3 py-3 text-white text-sm mb-4"
                            value={usuarioEditado}
                            onChangeText={setUsuarioEditado}
                            autoCapitalize="none"
                            maxLength={30}
                        />
                        <Text className="text-[#C4CCDA] text-xs mb-2">Bio</Text>
                        <TextInput
                            className="min-h-[90px] rounded-lg border border-[#354052] bg-[#080A10] px-3 py-3 text-white text-sm"
                            value={bioEditada}
                            onChangeText={setBioEditada}
                            multiline
                            maxLength={240}
                        />
                        <View className="flex-row justify-end mt-5">
                            <Pressable onPress={() => setModalEdicaoAberto(false)} className="px-4 py-3 mr-2">
                                <Text className="text-[#9AA6BA] text-sm">Cancelar</Text>
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
                visible={menuAberto}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuAberto(false)}
            >
                <View className="flex-1 items-center justify-center bg-black/35 px-8">
                    <Pressable
                        className="absolute inset-0"
                        onPress={() => setMenuAberto(false)}
                        accessibilityLabel="Fechar menu do perfil"
                    />
                    <View className="w-full max-w-[300px] rounded-xl border border-[#354052] bg-[#111420] p-2 shadow-lg">
                        <Pressable
                            onPress={() => {
                                setMenuAberto(false);
                                setModalEdicaoAberto(true);
                            }}
                            className="flex-row items-center rounded-lg px-3 py-3"
                        >
                            <PencilSimpleIcon size={18} color="#58AAF0" />
                            <Text className="text-white text-sm ml-3">Editar perfil</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Navbar />
        </SafeAreaView>
    );
}
