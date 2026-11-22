import type { EventoInfo } from "./tipos.ts";

export abstract class ErroDeNegocio extends Error {
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = new.target.name;
    this.status = status;
  }
}

export class DadosInvalidosErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 400);
  }
}

export class NaoEncontradoErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 404);
  }
}

export class PoltronaOcupadaErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 409);
  }
}

export class PagamentoErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 502);
  }
}

export class Evento {
  #poltronasVendidas: number[] = [];

  constructor(
    public readonly id: number,
    public readonly nome: string,
    public readonly preco: number,
    public readonly capacidade: number,
  ) {}

  get disponivel(): number {
    return this.capacidade - this.#poltronasVendidas.length;
  }

  reservar(poltronas: readonly number[]): void {
    if (poltronas.length === 0) {
      throw new DadosInvalidosErro("lista de poltronas vazia");
    }

    const temPoltronaInvalida = poltronas.some(
      (poltrona) => poltrona < 1 || poltrona > this.capacidade,
    );

    if (temPoltronaInvalida) {
      throw new DadosInvalidosErro("poltrona inválida");
    }

    const temRepetida = new Set(poltronas).size !== poltronas.length;

    if (temRepetida) {
      throw new DadosInvalidosErro("poltrona repetida");
    }

    const temOcupada = poltronas.some((poltrona) =>
      this.#poltronasVendidas.includes(poltrona),
    );

    if (temOcupada) {
      throw new PoltronaOcupadaErro("poltrona já vendida");
    }

    this.#poltronasVendidas = [...this.#poltronasVendidas, ...poltronas];
  }

  liberar(poltronas: readonly number[]): void {
    const temNaoVendida = poltronas.some(
      (poltrona) => !this.#poltronasVendidas.includes(poltrona),
    );

    if (temNaoVendida) {
      throw new DadosInvalidosErro("poltrona não estava vendida");
    }

    this.#poltronasVendidas = this.#poltronasVendidas.filter(
      (poltrona) => !poltronas.includes(poltrona),
    );
  }

  info(): EventoInfo {
    return {
      id: this.id,
      nome: this.nome,
      preco: this.preco,
      capacidade: this.capacidade,
      disponivel: this.disponivel,
    };
  }
}
