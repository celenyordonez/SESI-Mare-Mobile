import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FileTextIcon, ShieldCheckIcon } from "phosphor-react-native";

import Navbar from "./navbar";
import Topbar from "./topbar";

type TipoDocumento = "termos" | "privacidade";

const documentos = {
    termos: {
        titulo: "Termos de Uso",
        resumo: "Regras básicas para usar a Maré e participar da comunidade.",
        Icone: ShieldCheckIcon,
        secoes: [
            ["1. Sobre a Maré", "A Maré é uma plataforma demonstrativa para descobrir músicas, publicar avaliações e conversar com outras pessoas sobre música."],
            ["2. Sua conta", "Mantenha seus dados de acesso em segurança e forneça informações corretas ao criar sua conta. Você é responsável pelas atividades realizadas nela."],
            ["3. Publicações e convivência", "Publique opiniões próprias e trate as outras pessoas com respeito. Não use a plataforma para publicar conteúdo ilegal, abusivo ou que viole direitos de terceiros."],
            ["4. Disponibilidade", "Recursos e conteúdos podem mudar enquanto a plataforma evolui. Podemos limitar ou remover conteúdo que descumpra estas regras."],
            ["5. Versão demonstrativa", "Este texto é fictício e serve apenas como conteúdo inicial de demonstração. Não constitui aconselhamento jurídico nem um documento legal final."],
        ],
    },
    privacidade: {
        titulo: "Política de Privacidade",
        resumo: "Um resumo demonstrativo sobre os dados usados para oferecer os recursos da Maré.",
        Icone: FileTextIcon,
        secoes: [
            ["1. Dados da conta", "A Maré pode usar informações de cadastro, como nome, nome de usuário e e-mail, para identificar sua conta e oferecer os recursos do serviço."],
            ["2. Atividade na plataforma", "Avaliações, publicações, comentários, curtidas e informações de perfil podem ser exibidos para outras pessoas conforme os recursos da plataforma."],
            ["3. Preferências", "Preferências de notificações e interesses musicais podem ser usadas para personalizar a experiência. As notificações podem ser controladas nas configurações da conta."],
            ["4. Controle e segurança", "Use as configurações para revisar suas informações e proteger seu acesso. A plataforma deve adotar medidas razoáveis para proteger os dados tratados."],
            ["5. Versão demonstrativa", "Este texto é fictício e serve apenas como conteúdo inicial de demonstração. Não descreve necessariamente todas as práticas técnicas nem substitui uma política revisada para publicação."],
        ],
    },
} as const;

export default function DocumentoLegal({ tipo }: { tipo: TipoDocumento }) {
    const documento = documentos[tipo];
    const Icone = documento.Icone;

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" />
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-5 mb-4">
                    <Icone size={26} color="#58AAF0" />
                    <Text className="text-[#155B91] dark:text-[#58AAF0] text-xs font-semibold uppercase tracking-widest mt-4">
                        Maré · Documento demonstrativo
                    </Text>
                    <Text className="text-[#142338] dark:text-white text-2xl font-serif mt-2">{documento.titulo}</Text>
                    <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm leading-6 mt-3">{documento.resumo}</Text>
                    <Text className="text-[#C4CCDA] text-xs leading-5 border border-[#C5D3E1] dark:border-[#354052] rounded-lg p-3 mt-4">
                        Este conteúdo é fictício e foi incluído como texto inicial para a interface. Ele precisa ser revisado antes de ser usado como documento oficial.
                    </Text>
                </View>

                {documento.secoes.map(([titulo, texto]) => (
                    <View key={titulo} className="rounded-xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-4 mb-3">
                        <Text className="text-[#142338] dark:text-white text-base font-semibold">{titulo}</Text>
                        <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm leading-6 mt-2">{texto}</Text>
                    </View>
                ))}
            </ScrollView>
            <Navbar />
        </SafeAreaView>
    );
}
