
export type Usuario = {
    id: number;
    username: string;
    email: string;
    nome?: string | null;
    preferenciasConcluidas?: boolean;
};

export type LoginResponse = {
    message: string;
    token: string;
    usuario: Usuario;
};

export type CadastroResponse = {
    id: number;
    username: string;
    email: string;
};
