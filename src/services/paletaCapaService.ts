import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image as ImagemExpo } from "expo-image";
import { Platform } from "react-native";
import { thumbHashToRGBA } from "thumbhash";

export type PaletaCapa = {
    dominante: string;
    acento: string;
};

type PaletaSalva = PaletaCapa & { uri: string; data: number };
type CachePaletas = Record<string, PaletaSalva>;

const CHAVE_CACHE = "mare:paletas-capas:v1";
const LIMITE_CACHE = 60;
const memoria = new Map<string, PaletaCapa>();
const emAndamento = new Map<string, Promise<PaletaCapa | null>>();
let cachePersistente: CachePaletas | null = null;
let filaExtracao = Promise.resolve();

function salvarEmMemoria(uri: string, paleta: PaletaCapa) {
    memoria.delete(uri);
    memoria.set(uri, paleta);
    while (memoria.size > LIMITE_CACHE) {
        const uriMaisAntiga = memoria.keys().next().value;
        if (!uriMaisAntiga) break;
        memoria.delete(uriMaisAntiga);
    }
}

function hashTexto(texto: string) {
    let hash = 2166136261;
    for (let indice = 0; indice < texto.length; indice += 1) {
        hash = Math.imul(hash ^ texto.charCodeAt(indice), 16777619);
    }
    return (hash >>> 0).toString(36);
}

function decodificarBase64(texto: string) {
    const limpo = texto.replace(/[^A-Za-z0-9+/]/g, "");
    const indiceBase64 = new Int16Array(128).fill(-1);
    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (let indice = 0; indice < alfabeto.length; indice += 1) {
        indiceBase64[alfabeto.charCodeAt(indice)] = indice;
    }

    const bytes = new Uint8Array(Math.floor((limpo.length * 3) / 4));
    let buffer = 0;
    let bits = 0;
    let posicao = 0;

    for (let indice = 0; indice < limpo.length; indice += 1) {
        const valor = indiceBase64[limpo.charCodeAt(indice)];
        if (valor < 0) continue;
        buffer = (buffer << 6) | valor;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            bytes[posicao] = (buffer >> bits) & 0xff;
            posicao += 1;
        }
    }

    return bytes.subarray(0, posicao);
}

function paraHexadecimal(valor: number) {
    return Math.max(0, Math.min(255, Math.round(valor))).toString(16).padStart(2, "0");
}

function extrairCores(rgba: Uint8Array): PaletaCapa | null {
    const grupos = new Map<string, { r: number; g: number; b: number; quantidade: number; saturacao: number }>();
    for (let indice = 0; indice < rgba.length; indice += 4) {
        const alpha = rgba[indice + 3];
        if (alpha < 180) continue;

        const r = rgba[indice];
        const g = rgba[indice + 1];
        const b = rgba[indice + 2];
        const brilho = (r * 0.299) + (g * 0.587) + (b * 0.114);
        if (brilho < 18 || brilho > 246) continue;

        const maximo = Math.max(r, g, b);
        const minimo = Math.min(r, g, b);
        const saturacao = maximo === 0 ? 0 : (maximo - minimo) / maximo;
        const chave = `${r >> 4}-${g >> 4}-${b >> 4}`;
        const grupo = grupos.get(chave) ?? { r: 0, g: 0, b: 0, quantidade: 0, saturacao: 0 };
        grupo.r += r;
        grupo.g += g;
        grupo.b += b;
        grupo.quantidade += 1;
        grupo.saturacao += saturacao;
        grupos.set(chave, grupo);
    }

    if (grupos.size === 0) return null;

    const cores = [...grupos.values()]
        .map((grupo) => {
            const r = grupo.r / grupo.quantidade;
            const g = grupo.g / grupo.quantidade;
            const b = grupo.b / grupo.quantidade;
            const saturacao = grupo.saturacao / grupo.quantidade;
            return { r, g, b, pontuacao: grupo.quantidade * (1 + saturacao * 0.5) };
        })
        .sort((a, b) => b.pontuacao - a.pontuacao);

    const dominante = cores[0];
    const acento = cores.find((cor) => {
        const diferenca = Math.sqrt(
            (cor.r - dominante.r) ** 2 +
            (cor.g - dominante.g) ** 2 +
            (cor.b - dominante.b) ** 2,
        );
        return diferenca > 72;
    }) ?? dominante;

    const hexadecimal = ({ r, g, b }: { r: number; g: number; b: number }) =>
        `#${paraHexadecimal(r)}${paraHexadecimal(g)}${paraHexadecimal(b)}`;

    return { dominante: hexadecimal(dominante), acento: hexadecimal(acento) };
}

async function carregarCache() {
    if (cachePersistente) return cachePersistente;
    try {
        const salvo = await AsyncStorage.getItem(CHAVE_CACHE);
        cachePersistente = salvo ? JSON.parse(salvo) as CachePaletas : {};
    } catch {
        cachePersistente = {};
    }
    return cachePersistente;
}

async function salvarNoCache(chave: string, uri: string, paleta: PaletaCapa) {
    const cache = await carregarCache();
    cache[chave] = { ...paleta, uri, data: Date.now() };

    const itensRecentes = Object.entries(cache)
        .sort((a, b) => b[1].data - a[1].data)
        .slice(0, LIMITE_CACHE);
    cachePersistente = Object.fromEntries(itensRecentes);

    try {
        await AsyncStorage.setItem(CHAVE_CACHE, JSON.stringify(cachePersistente));
    } catch {
        // A extração continua funcionando mesmo se o armazenamento local estiver indisponível.
    }
}

async function processarCapa(uri: string, chave: string): Promise<PaletaCapa | null> {
    try {
        if (Platform.OS === "web") return null;

        // O Expo Image gera um hash compacto a partir da capa, sem trazer a imagem
        // completa para o JavaScript. A decodificação seguinte trabalha só com 32px.
        const hash = await ImagemExpo.generateThumbhashAsync(uri);
        if (!hash) return null;

        const miniatura = thumbHashToRGBA(decodificarBase64(hash));
        const paleta = extrairCores(miniatura.rgba);
        if (paleta) await salvarNoCache(chave, uri, paleta);
        return paleta;
    } catch {
        // Formatos ou URLs que não puderem ser lidos usam a cor padrão da Maré.
        return null;
    }
}

/** Extrai cores de uma miniatura e guarda até 60 resultados no dispositivo. */
export function buscarPaletaCapa(uri?: string | null): Promise<PaletaCapa | null> {
    if (!uri) return Promise.resolve(null);

    const chave = hashTexto(uri);
    const paletaEmMemoria = memoria.get(uri);
    if (paletaEmMemoria) return Promise.resolve(paletaEmMemoria);

    const pendente = emAndamento.get(uri);
    if (pendente) return pendente;

    const tarefa = filaExtracao.then(async () => {
        const cache = await carregarCache();
        const salva = cache[chave];
        if (salva?.uri === uri) {
            salvarEmMemoria(uri, salva);
            return salva;
        }

        const paleta = await processarCapa(uri, chave);
        if (paleta) salvarEmMemoria(uri, paleta);
        return paleta;
    });

    filaExtracao = tarefa.then(() => undefined, () => undefined);
    emAndamento.set(uri, tarefa);
    void tarefa.then(
        () => emAndamento.delete(uri),
        () => emAndamento.delete(uri),
    );
    return tarefa;
}

export function corComOpacidade(hex: string, opacidade: number) {
    const limpo = hex.replace("#", "");
    if (limpo.length !== 6) return `rgba(88,170,240,${opacidade})`;
    const r = Number.parseInt(limpo.slice(0, 2), 16);
    const g = Number.parseInt(limpo.slice(2, 4), 16);
    const b = Number.parseInt(limpo.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${opacidade})`;
}
