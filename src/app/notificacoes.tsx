import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AtIcon, BellIcon, ChatCircleIcon, CheckIcon, HeartIcon, MusicNoteIcon, TrashIcon, UserIcon } from "phosphor-react-native";
import Topbar from "../components/topbar";
import Navbar from "../components/navbar";
import PostCard from "../components/postCard";
import { buscarNotificacoes, limparNotificacoes, marcarNotificacaoLida, marcarTodasNotificacoesLidas } from "../services/notificacaoService";
import { alternarSeguirUsuario, buscarMeuPerfil, buscarSeguindo } from "../services/usuarioService";
import type { Notificacao } from "../services/notificacaoService";
import { useContadoresNavegacao } from "../components/ContadoresNavegacao";

function tempo(data: string) {
    const ms = Date.now() - new Date(data).getTime();
    if (!Number.isFinite(ms) || ms < 0) return "Agora";
    const min = Math.floor(ms / 60000);
    if (min < 1) return "Agora";
    if (min < 60) return `Há ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Há ${h} h`;
    const d = Math.floor(h / 24);
    return d < 7 ? `Há ${d} dia${d === 1 ? "" : "s"}` : new Date(data).toLocaleDateString("pt-BR");
}

export default function Notificacoes() {
    const router = useRouter();
    const { atualizarContadores } = useContadoresNavegacao();
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [seguindoIds, setSeguindoIds] = useState<Set<number>>(new Set());
    const [filtro, setFiltro] = useState<"todas" | "naoLidas">("todas");
    const [carregando, setCarregando] = useState(true);
    const [marcandoTodas, setMarcandoTodas] = useState(false);
    const [limpando, setLimpando] = useState(false);
    const [atualizandoId, setAtualizandoId] = useState<number | null>(null);
    const [seguindoId, setSeguindoId] = useState<number | null>(null);
    const [erro, setErro] = useState("");
    const [atualizando, setAtualizando] = useState(false);

    const carregar = useCallback(async () => {
        setErro("");
        try {
            const dados = await buscarNotificacoes();
            setNotificacoes(Array.isArray(dados) ? dados : []);
            void atualizarContadores();
            try {
                const me = await buscarMeuPerfil();
                const relacoes = await buscarSeguindo(me.id);
                setSeguindoIds(new Set(relacoes.map((relacao) => relacao.seguido.id)));
            } catch (error) { console.error("Erro ao carregar quem sigo:", error); }
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível carregar as notificações.");
        } finally { setCarregando(false); }
    }, [atualizarContadores]);

    useEffect(() => { void carregar(); }, [carregar]);
    const naoLidas = useMemo(() => notificacoes.reduce((n, item) => n + Number(!item.lida), 0), [notificacoes]);
    const filtradas = useMemo(() => notificacoes.filter((n) => filtro === "todas" || !n.lida), [notificacoes, filtro]);

    async function marcarLida(id: number) {
        if (atualizandoId !== null) return false;
        setAtualizandoId(id);
        try {
            await marcarNotificacaoLida(id);
            setNotificacoes((lista) => lista.map((n) => n.id === id ? { ...n, lida: true } : n));
            void atualizarContadores();
            return true;
        } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível atualizar a notificação."); return false; }
        finally { setAtualizandoId(null); }
    }

    async function marcarTodas() {
        if (naoLidas === 0 || marcandoTodas) return;
        setMarcandoTodas(true);
        try {
            await marcarTodasNotificacoesLidas();
            setNotificacoes((lista) => lista.map((n) => ({ ...n, lida: true })));
            void atualizarContadores();
        } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível atualizar as notificações."); }
        finally { setMarcandoTodas(false); }
    }

    function confirmarLimpeza() {
        if (notificacoes.length === 0 || limpando) return;
        Alert.alert("Limpar notificações?", "O histórico será removido da sua conta.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Limpar",
                style: "destructive",
                onPress: () => {
                    setLimpando(true);
                    void limparNotificacoes()
                        .then(() => {
                            setNotificacoes([]);
                            setErro("");
                            void atualizarContadores();
                        })
                        .catch((error) => setErro(error instanceof Error ? error.message : "Não foi possível limpar as notificações."))
                        .finally(() => setLimpando(false));
                },
            },
        ]);
    }

    function icone(tipo: string) {
        if (tipo === "curtida") return <HeartIcon size={19} color="#58AAF0" />;
        if (tipo === "comentario") return <ChatCircleIcon size={19} color="#58AAF0" />;
        if (tipo === "mencao") return <AtIcon size={19} color="#58AAF0" />;
        if (tipo === "seguir" || tipo === "seguidor") return <UserIcon size={19} color="#58AAF0" />;
        if (tipo === "musica") return <MusicNoteIcon size={19} color="#58AAF0" />;
        return <BellIcon size={19} color="#58AAF0" />;
    }

    async function abrir(n: Notificacao) {
        if (!n.lida && !(await marcarLida(n.id))) return;
        if (n.postId != null) router.push(`/post/${n.postId}` as never);
        else if (n.musicaId != null) router.push(`/musica/${n.musicaId}` as never);
        else if (n.usuario?.username) router.push(`/u/${encodeURIComponent(n.usuario.username)}` as never);
    }

    async function seguirDeVolta(usuarioId: number) {
        if (seguindoId !== null || seguindoIds.has(usuarioId)) return;
        setSeguindoId(usuarioId);
        try {
            await alternarSeguirUsuario(usuarioId, false);
            setSeguindoIds((atual) => new Set(atual).add(usuarioId));
        } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível seguir essa pessoa."); }
        finally { setSeguindoId(null); }
    }

    function formatarPost(n: Notificacao) {
        const musica = n.post?.musica;
        if (!n.post || !musica) return null;
        return <PostCard postId={n.post.id} name={n.post.usuario?.nome ?? "Usuário"} username={n.post.usuario?.username} foto={n.post.usuario?.foto} time={n.criadaEm} content={n.post.texto} nota={n.post.nota} editado={n.post.editado} musicId={musica.id} musicTitle={musica.titulo} artist={musica.artista?.nome} musicCover={musica.capa} modoNotificacao />;
    }

    return <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
        <Topbar titulo="Notificações" subtitulo="Acompanhe as interações no seu perfil" />
        <View className="px-5 pb-3 border-b border-[#D5E0EC] dark:border-[#202633]">
            <View className="flex-row flex-wrap items-center justify-between gap-y-2"><Text className="text-[#52677F] dark:text-[#718096] text-xs">{naoLidas} não lida{naoLidas === 1 ? "" : "s"}</Text><View className="flex-row items-center">{naoLidas > 0 && <Pressable disabled={marcandoTodas || limpando} onPress={() => void marcarTodas()} className="mr-4 flex-row items-center"><CheckIcon size={16} color="#58AAF0" /><Text className="text-[#155B91] dark:text-[#58AAF0] text-xs ml-1">{marcandoTodas ? "Atualizando..." : "Marcar todas como lidas"}</Text></Pressable>}{notificacoes.length > 0 && <Pressable disabled={limpando || marcandoTodas} onPress={confirmarLimpeza} accessibilityRole="button" accessibilityLabel="Limpar notificações" className="flex-row items-center"><TrashIcon size={15} color="#F87171" /><Text className="ml-1 text-xs text-red-400">{limpando ? "Limpando..." : "Limpar"}</Text></Pressable>}</View></View>
            <View className="flex-row mt-3">{(["todas", "naoLidas"] as const).map((item) => <Pressable key={item} onPress={() => setFiltro(item)} className={`mr-2 px-4 py-2 rounded-lg ${filtro === item ? "bg-[#F4F7FA] dark:bg-[#171E2B]" : ""}`}><Text className={filtro === item ? "text-[#155B91] dark:text-[#58AAF0] text-xs" : "text-[#52677F] dark:text-[#718096] text-xs"}>{item === "todas" ? "Todas" : "Não lidas"}</Text></Pressable>)}</View>
        </View>
        {carregando ? <View className="flex-1 items-center justify-center"><ActivityIndicator color="#5EA7ED" /></View> : erro && notificacoes.length === 0 ? <View className="flex-1 items-center justify-center px-8"><Text className="text-red-400 text-sm text-center">{erro}</Text><Pressable onPress={() => { setCarregando(true); void carregar(); }} className="mt-4 px-4 py-2"><Text className="text-[#155B91] dark:text-[#58AAF0]">Tentar novamente</Text></Pressable></View> : <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); void carregar().finally(() => setAtualizando(false)); }} tintColor="#58AAF0" colors={["#58AAF0"]} />}>
            {erro ? <Text className="text-red-400 text-xs px-5 py-2">{erro}</Text> : null}
            {filtradas.length === 0 ? <View className="items-center px-8 py-14"><View className="w-16 h-16 rounded-full border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] items-center justify-center mb-4"><BellIcon size={27} color="#718096" /></View><Text className="text-[#142338] dark:text-white text-base font-semibold">{filtro === "naoLidas" ? "Tudo em dia" : "Nenhuma notificação por enquanto"}</Text><Text className="text-[#52677F] dark:text-[#718096] text-sm text-center mt-2">{filtro === "naoLidas" ? "Você já conferiu todas as suas notificações." : "Curtidas, comentários, menções e novos seguidores aparecerão aqui."}</Text></View> : filtradas.map((n) => <View key={n.id} className={`px-4 py-4 border-b border-[#D5E0EC] dark:border-[#252D3C] ${n.lida ? "bg-white dark:bg-[#111420]" : "bg-[#131B29]"}`}>
                <Pressable onPress={() => void abrir(n)} className="flex-row items-start">
                    {n.usuario?.foto ? <Image source={{ uri: n.usuario.foto }} className="w-11 h-11 rounded-full border border-[#C5D3E1] dark:border-[#354052]" /> : <View className="w-11 h-11 rounded-full border border-[#C5D3E1] dark:border-[#354052] bg-[#F4F7FA] dark:bg-[#171E2B] items-center justify-center">{icone(n.tipo)}</View>}
                    <View className="flex-1 ml-3"><Text className="text-[#D1D5DB] text-sm leading-5"><Text className="text-[#142338] dark:text-white font-semibold">{n.usuario?.nome ?? "Alguém"}</Text>{" "}{n.mensagem}</Text>{n.usuario?.username ? <Text className="text-[#52677F] dark:text-[#718096] text-xs mt-1">@{n.usuario.username}</Text> : null}{n.tipo === "comentario" && n.textoComentario ? <Text className="text-[#9CA8BA] text-sm leading-5 mt-2">“{n.textoComentario}”</Text> : null}<Text className="text-[#52677F] dark:text-[#718096] text-[11px] mt-2">{tempo(n.criadaEm)}</Text></View>
                    {!n.lida && <View className="w-2 h-2 rounded-full bg-[#58AAF0] mt-2 ml-2" />}
                </Pressable>
                {(n.tipo === "seguir" || n.tipo === "seguidor") && n.usuario?.id ? <Pressable onPress={() => void seguirDeVolta(n.usuario!.id)} disabled={seguindoIds.has(n.usuario.id) || seguindoId === n.usuario.id} className="self-start ml-14 mt-3 px-3 py-2 rounded-full bg-[#58AAF0] disabled:opacity-60"><Text className="text-[#142338] dark:text-white text-xs font-semibold">{seguindoIds.has(n.usuario.id) ? "Seguindo" : seguindoId === n.usuario.id ? "Seguindo..." : "Seguir de volta"}</Text></Pressable> : null}
                {formatarPost(n) ? <View className="mt-3">{formatarPost(n)}</View> : null}
                {!n.lida && <Pressable onPress={() => void marcarLida(n.id)} disabled={atualizandoId !== null} accessibilityRole="button" accessibilityLabel="Marcar notificação como lida" className="self-end mt-3 min-h-10 flex-row items-center px-3 py-2 rounded-full border border-[#C5D3E1] dark:border-[#354052] bg-[#EAF1F8] dark:bg-[#0D1520]"><CheckIcon size={17} color="#58AAF0" /><Text className="text-[#155B91] dark:text-[#58AAF0] text-xs font-medium ml-2">Marcar como lida</Text></Pressable>}
            </View>)}
        </ScrollView>}
        <Navbar />
    </SafeAreaView>;
}
