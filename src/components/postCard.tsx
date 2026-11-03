import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Share, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ChatCircleIcon, DotsThreeIcon, HeartIcon, PencilSimpleIcon, ShareNetworkIcon, TrashIcon, UserIcon } from "phosphor-react-native";
import { alternarCurtidaPost, editarPost, excluirPost as excluirPostApi } from "../services/postService";
import { feedbackAcao } from "../services/feedbackTatil";
import MusicCard from "./musicCard";
import EstrelaNota from "./EstrelaNota";
import { ItemMenuAcao, MenuAcoes } from "./MenuAcoes";

interface PostCardProps {
    postId?: number;
    name?: string | null;
    username?: string | null;
    foto?: string | null;
    time: string;
    content?: string | null;
    nota?: number;
    editado?: boolean;
    musicId: number;
    musicTitle: string;
    artist?: string | null;
    artistId?: number;
    musicCover?: string | null;
    duracaoSegundos?: number;
    likes?: number;
    comments?: number;
    avaliacoes?: number;
    curtidoPorMim?: boolean;
    ehMeuPost?: boolean;
    onUnlike?: () => void;
    onExcluir?: () => void;
    modoNotificacao?: boolean;
}

export default function PostCard(props: PostCardProps) {
    const {
        postId, name, username, foto, time, content, nota = 0, editado = false,
        musicId, musicTitle, artist, artistId, musicCover, duracaoSegundos,
        likes = 0, comments = 0, avaliacoes, curtidoPorMim = false, ehMeuPost = false,
        onUnlike, onExcluir, modoNotificacao = false,
    } = props;
    const router = useRouter();
    const [curtido, setCurtido] = useState(curtidoPorMim);
    const [quantidadeCurtidas, setQuantidadeCurtidas] = useState(likes);
    const [curtindo, setCurtindo] = useState(false);
    const [oculto, setOculto] = useState(false);
    const [opcoesAbertas, setOpcoesAbertas] = useState(false);
    const [editando, setEditando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [textoAtual, setTextoAtual] = useState(content ?? "");
    const [notaAtual, setNotaAtual] = useState(nota);
    const [textoEditado, setTextoEditado] = useState(content ?? "");
    const [notaEditada, setNotaEditada] = useState(nota);
    const [postFoiEditado, setPostFoiEditado] = useState(editado);

    useEffect(() => { setCurtido(curtidoPorMim); }, [curtidoPorMim]);
    useEffect(() => { setQuantidadeCurtidas(likes); }, [likes]);
    useEffect(() => { setPostFoiEditado(editado); }, [editado]);

    function abrirPerfil() {
        if (username) router.push(`/u/${encodeURIComponent(username)}` as never);
    }

    function abrirPost() {
        if (postId != null) router.push(`/post/${postId}` as never);
    }

    async function alternarCurtida() {
        if (postId == null || curtindo) return;
        const estadoAnterior = curtido;
        const quantidadeAnterior = quantidadeCurtidas;
        feedbackAcao();
        setCurtido(!estadoAnterior);
        setQuantidadeCurtidas(Math.max(0, quantidadeAnterior + (estadoAnterior ? -1 : 1)));
        setCurtindo(true);
        try {
            await alternarCurtidaPost(postId, estadoAnterior);
            if (estadoAnterior) onUnlike?.();
        } catch (error) {
            setCurtido(estadoAnterior); setQuantidadeCurtidas(quantidadeAnterior);
            Alert.alert("Não foi possível atualizar a curtida", error instanceof Error ? error.message : "Tente novamente.");
        } finally { setCurtindo(false); }
    }

    async function salvarEdicao() {
        if (postId == null || excluindo) return;
        const texto = textoEditado.trim();
        if (texto.length > 500) return Alert.alert("Texto muito longo", "A publicação pode ter no máximo 500 caracteres.");
        if (notaEditada < 1 || notaEditada > 5) return Alert.alert("Nota inválida", "Escolha uma nota entre 1 e 5.");
        setExcluindo(true);
        try {
            await editarPost(postId, { texto: texto || null, nota: notaEditada });
            setPostFoiEditado(true);
            setTextoAtual(texto); setNotaAtual(notaEditada); setEditando(false);
        } catch (error) {
            Alert.alert("Não foi possível editar a publicação", error instanceof Error ? error.message : "Tente novamente.");
        } finally { setExcluindo(false); }
    }

    function confirmarExclusao() {
        Alert.alert("Excluir publicação?", "Essa ação não poderá ser desfeita.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir", style: "destructive", onPress: () => { void excluirPost(); } },
        ]);
    }

    async function excluirPost() {
        if (postId == null || excluindo) return;
        setExcluindo(true);
        try {
            await excluirPostApi(postId);
            setOculto(true);
            setOpcoesAbertas(false);
            onExcluir?.();
        } catch (error) {
            Alert.alert("Não foi possível excluir a publicação", error instanceof Error ? error.message : "Tente novamente.");
        } finally { setExcluindo(false); }
    }

    async function compartilhar() {
        try { feedbackAcao(); await Share.share({ message: `${name ?? "Alguém"} avaliou “${musicTitle}” no Maré${postId ? `: /post/${postId}` : ""}` }); }
        catch (error) { console.error("Erro ao compartilhar publicação:", error); }
    }

    function dataRelativa(data: string) {
        const diferenca = Math.max(0, Date.now() - new Date(data).getTime());
        const minutos = Math.floor(diferenca / 60000);
        if (!Number.isFinite(minutos)) return "";
        if (minutos < 1) return "agora";
        if (minutos < 60) return `há ${minutos} min`;
        const horas = Math.floor(minutos / 60);
        if (horas < 24) return `há ${horas} h`;
        const dias = Math.floor(horas / 24);
        if (dias < 7) return `há ${dias} dia${dias === 1 ? "" : "s"}`;
        return new Date(data).toLocaleDateString("pt-BR");
    }

    if (oculto) return null;

    return <View className="mx-4 my-2 rounded-xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-4">
        <View className="flex-row items-start">
            <Pressable onPress={abrirPerfil} disabled={!username} className="shrink-0">
                {foto ? <Image source={{ uri: foto }} className="w-11 h-11 rounded-full border border-[#C5D3E1] dark:border-[#354052]" /> : <View className="w-11 h-11 rounded-full bg-[#F4F7FA] dark:bg-[#171E2B] items-center justify-center"><UserIcon size={22} color="#9AA6BA" /></View>}
            </Pressable>
            <View className="flex-1 ml-3 pt-0.5">
                <Pressable onPress={abrirPerfil} disabled={!username}>
                    <Text className="text-[#142338] dark:text-white text-sm font-semibold" numberOfLines={1}>{name || "Usuário"}</Text>
                    {!!username && <Text className="text-[#52677F] dark:text-[#718096] text-xs mt-0.5">@{username}</Text>}
                </Pressable>
                <Pressable onPress={abrirPost} disabled={postId == null} className="self-start">
                    <Text className="text-[#687386] text-[11px] mt-1">{dataRelativa(time)}{postFoiEditado ? " · editado" : ""}</Text>
                </Pressable>
            </View>
            {!modoNotificacao && <Pressable onPress={() => setOpcoesAbertas(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Opções da publicação" className="h-9 w-9 items-center justify-center rounded-full border border-[#D5E0EC] bg-[#F4F7FA] dark:border-[#293143] dark:bg-[#171E2B]"><DotsThreeIcon size={22} color="#8793A7" weight="bold" /></Pressable>}
        </View>

        {editando ? <View className="mt-4 rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-[#EAF1F8] dark:bg-[#0C121D] p-3">
            <Text className="text-[#142338] dark:text-white text-sm mb-2">Texto da publicação</Text>
            <TextInput className="min-h-[90px] text-[#142338] dark:text-white text-sm border border-[#D5E0EC] dark:border-[#252D3C] rounded-lg p-3" value={textoEditado} onChangeText={setTextoEditado} multiline textAlignVertical="top" maxLength={500} placeholder="Escreva sobre a música..." placeholderTextColor="#718096" />
            <Text className="text-[#142338] dark:text-white text-sm mt-4 mb-2">Sua nota: {notaEditada.toFixed(1)}</Text>
            <View className="flex-row items-center">{[1, 2, 3, 4, 5].map((estrela) => <EstrelaNota key={estrela} estrela={estrela} nota={notaEditada} tamanho={26} aoSelecionar={setNotaEditada} />)}</View>
            <View className="flex-row justify-end mt-4"><Pressable onPress={() => setEditando(false)} className="px-3 py-2 mr-2"><Text className="text-[#52677F] dark:text-[#9AA6BA]">Cancelar</Text></Pressable><Pressable onPress={() => void salvarEdicao()} disabled={excluindo} className="px-4 py-2 rounded-lg bg-[#58AAF0]"><Text className="text-[#142338] dark:text-white">{excluindo ? "Salvando..." : "Salvar alterações"}</Text></Pressable></View>
        </View> : <>
            {notaAtual > 0 && <Pressable onPress={abrirPost} disabled={postId == null} className="flex-row items-center mt-4">{[1, 2, 3, 4, 5].map((estrela) => <EstrelaNota key={estrela} estrela={estrela} nota={notaAtual} tamanho={17} />)}<Text className="text-[#405570] dark:text-[#D0D0D5] text-xs ml-2">{notaAtual.toFixed(1).replace(".", ",")}</Text><Text className="text-[#52677F] dark:text-[#718096] text-xs ml-2">avaliação do usuário</Text></Pressable>}
            {!!textoAtual && <Pressable onPress={abrirPost} disabled={postId == null} className="mt-3"><Text className="text-[#405570] dark:text-[#D0D0D5] text-sm leading-6">{textoAtual}</Text></Pressable>}
            <View className="mt-4"><MusicCard id={musicId} tipo="post" titulo={musicTitle} artista={artist ?? "Artista desconhecido"} artistaId={artistId} capa={musicCover} nota={notaAtual} avaliacoes={avaliacoes} duracaoSegundos={duracaoSegundos} /></View>
        </>}

        {!modoNotificacao && !editando && <View className="flex-row items-center mt-3 pt-3 border-t border-[#D5E0EC] dark:border-[#252D3C]">
            <Pressable onPress={() => void alternarCurtida()} disabled={curtindo || postId == null} hitSlop={8} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.9 : 1 }] })} className="flex-row items-center mr-7"><HeartIcon size={19} color={curtido ? "#EC4899" : "#D0D0D5"} weight={curtido ? "fill" : "regular"} /><Text className={`${curtido ? "text-pink-400" : "text-[#405570] dark:text-[#D0D0D5]"} text-xs ml-1.5`}>{quantidadeCurtidas}</Text></Pressable>
            <Pressable onPress={abrirPost} disabled={postId == null} className="flex-row items-center"><ChatCircleIcon size={19} color="#D0D0D5" /><Text className="text-[#405570] dark:text-[#D0D0D5] text-xs ml-1.5">{comments}</Text></Pressable>
        </View>}

        <MenuAcoes aberto={opcoesAbertas} titulo="Opções da publicação" aoFechar={() => setOpcoesAbertas(false)}>
            {ehMeuPost ? <>
                <ItemMenuAcao
                    titulo="Editar publicação"
                    descricao="Alterar o texto ou a nota"
                    icone={<PencilSimpleIcon size={19} color="#58AAF0" />}
                    aoPressionar={() => { setTextoEditado(textoAtual); setNotaEditada(notaAtual); setEditando(true); setOpcoesAbertas(false); }}
                />
                <ItemMenuAcao
                    titulo="Excluir publicação"
                    descricao="Remover esta avaliação do seu perfil"
                    icone={<TrashIcon size={19} color="#E2717C" />}
                    destrutivo
                    aoPressionar={() => { setOpcoesAbertas(false); confirmarExclusao(); }}
                />
            </> : null}
            <ItemMenuAcao
                titulo="Compartilhar publicação"
                icone={<ShareNetworkIcon size={19} color="#58AAF0" />}
                aoPressionar={() => { setOpcoesAbertas(false); void compartilhar(); }}
            />
        </MenuAcoes>
    </View>;
}
