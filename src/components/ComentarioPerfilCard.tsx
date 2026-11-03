import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowUpRightIcon, ChatCircleIcon, UserIcon } from "phosphor-react-native";

import PostCard from "./postCard";
import type { ComentarioPerfil } from "../services/usuarioService";

function tempoRelativo(data: string) {
    const milissegundos = Date.now() - new Date(data).getTime();
    if (!Number.isFinite(milissegundos) || milissegundos < 0) return "agora";

    const minutos = Math.floor(milissegundos / 60_000);
    if (minutos < 1) return "agora";
    if (minutos < 60) return `há ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 7) return `há ${dias} dia${dias === 1 ? "" : "s"}`;
    return new Date(data).toLocaleDateString("pt-BR");
}

export default function ComentarioPerfilCard({
    comentario,
    usuarioLogadoId,
}: {
    comentario: ComentarioPerfil;
    usuarioLogadoId?: number | null;
}) {
    const roteador = useRouter();
    const publicacao = comentario.post;
    const musica = publicacao?.musica;

    return (
        <View className="pb-5">
            {publicacao && musica ? (
                <PostCard
                    postId={publicacao.id}
                    name={publicacao.usuario?.nome ?? "Usuário"}
                    username={publicacao.usuario?.username}
                    foto={publicacao.usuario?.foto}
                    time={publicacao.dataCriacao}
                    content={publicacao.texto}
                    nota={publicacao.nota}
                    editado={publicacao.editado}
                    musicId={musica.id}
                    musicTitle={musica.titulo}
                    artist={musica.artista?.nome}
                    artistId={musica.artista?.id}
                    musicCover={musica.capa}
                    duracaoSegundos={musica.duracaoSegundos}
                    likes={publicacao._count?.curtidas}
                    comments={publicacao._count?.comentarios}
                    avaliacoes={musica.avaliacoes}
                    curtidoPorMim={publicacao.curtidoPorMim}
                    ehMeuPost={publicacao.usuario?.id === usuarioLogadoId}
                />
            ) : (
                <View className="rounded-xl border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] p-4">
                    <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm">
                        A publicação original não está disponível.
                    </Text>
                    {publicacao?.id ? (
                        <Pressable
                            onPress={() => roteador.push(`/post/${publicacao.id}` as never)}
                            className="flex-row items-center mt-3"
                        >
                            <Text className="text-[#155B91] dark:text-[#58AAF0] text-xs mr-1">Ver publicação</Text>
                            <ArrowUpRightIcon size={15} color="#58AAF0" />
                        </Pressable>
                    ) : null}
                </View>
            )}

            <View className="flex-row items-center ml-8 py-3">
                <View className="w-px h-8 bg-[#354052] mr-4" />
                <View className="flex-row items-center rounded-full border border-[#293342] bg-[#EAF1F8] dark:bg-[#0D1520] px-3 py-2">
                    <ChatCircleIcon size={15} color="#58AAF0" />
                    <Text className="text-[#52677F] dark:text-[#9AA6BA] text-xs ml-2">Comentário</Text>
                </View>
            </View>

            <View className="flex-row items-start px-3">
                {comentario.usuario?.foto ? (
                    <Image
                        source={{ uri: comentario.usuario.foto }}
                        className="w-10 h-10 rounded-full border border-[#C5D3E1] dark:border-[#354052]"
                    />
                ) : (
                    <View className="w-10 h-10 rounded-full border border-[#C5D3E1] dark:border-[#354052] bg-[#F4F7FA] dark:bg-[#171E2B] items-center justify-center">
                        <UserIcon size={20} color="#9AA6BA" />
                    </View>
                )}

                <View className="flex-1 ml-3">
                    <View className="flex-row flex-wrap items-center">
                        <Text className="text-[#142338] dark:text-white text-sm font-semibold">
                            {comentario.usuario?.nome ?? "Usuário"}
                        </Text>
                        {comentario.usuario?.username ? (
                            <Text className="text-[#52677F] dark:text-[#718096] text-xs ml-2">
                                @{comentario.usuario.username}
                            </Text>
                        ) : null}
                        <Text className="text-[#52677F] dark:text-[#718096] text-xs ml-2">
                            · {tempoRelativo(comentario.dataCriacao)}
                        </Text>
                    </View>

                    <Text className="text-[#D1D5DB] text-sm leading-5 mt-2">
                        {comentario.texto}
                    </Text>

                    {publicacao?.id ? (
                        <Pressable
                            onPress={() => roteador.push(`/post/${publicacao.id}` as never)}
                            className="self-start flex-row items-center mt-3 px-3 py-2 rounded-full"
                        >
                            <ChatCircleIcon size={15} color="#9AA6BA" />
                            <Text className="text-[#52677F] dark:text-[#9AA6BA] text-xs ml-2">Ver conversa</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </View>
    );
}
