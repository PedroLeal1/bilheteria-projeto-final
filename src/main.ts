import { Evento } from "./dominio.ts";
import { criarBilheteria } from "./bilheteria.ts";
import { criarPagamentoFalso } from "./pagamento.ts";
import { criarServidor } from "./servidor.ts";

const eventos = [
  new Evento(1, "Festival de Música", 100, 100),
  new Evento(2, "Show de Rock", 120, 80),
  new Evento(3, "Festival de Cinema", 60, 50),
];

const pagar = criarPagamentoFalso({
  latenciaMs: 80,
  taxaDeFalha: 0.1,
});

const bilheteria = criarBilheteria({
  eventos,
  pagar,
  limitePagamentoMs: 500,
});

criarServidor(bilheteria).listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
