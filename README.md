# Bilheteria concorrente

**Vídeo de apresentação:** https://www.youtube.com/watch?v=-cGNuoCmxOo

Projeto final de Paradigmas de Linguagens de Programação. Enunciado completo no Blackboard.

Os arquivos de `src/` que vocês escrevem já existem, vazios; o `tipos.ts` e o `servidor.ts` vêm prontos. O que vai em cada um está no passo indicado do enunciado:

| Arquivo                                    | Passo do enunciado                      |
| :----------------------------------------- | :-------------------------------------- |
| `src/tipos.ts` (pronto)                    | 1: os tipos                             |
| `src/regras.ts`                            | 2: meia-entrada                         |
| `src/preco.ts`                             | 3: preço (funcional)                    |
| `src/dominio.ts`                           | 4: evento e erros (orientado a objetos) |
| `src/bilheteria.ts`                        | 5: a venda, onde a concorrência aparece |
| `src/servidor.ts` (pronto) e `src/main.ts` | 6: ligar o servidor                     |

Não alterem `src/pagamento.ts`, `src/servidor.ts`, `src/bench.ts` nem `testes/`: a correção usa os originais.

Para começar, sigam o `GUIA.md`. Depois dele, os comandos são:

```bash
npm install
npm test          # correção automática: mostra os pontos
npm start         # serviço em http://localhost:3000
npm run bench     # com o serviço no ar: 200 pedidos simultâneos no evento 1, dois por poltrona
```

Exemplo de pedido:

```bash
curl -X POST localhost:3000/reservas -H 'Content-Type: application/json' \
  -d '{"eventoId":1,"ingressos":[{"nome":"Ana","idade":20,"estudante":true,"pcd":false,"poltrona":7}]}'
```

---

## Preencham (avaliado no vídeo)

**Link do vídeo:** https://www.youtube.com/watch?v=-cGNuoCmxOo

### Integrantes

| Nome completo              | RGM      | Usuário do GitHub | Parte principal                   |
| :------------------------- | :------- | :---------------- | :-------------------------------- |
| Pedro Henrique Leal Vieira | 43620779 | PedroLeal1        | Implementação completa do projeto |

### Decisões

1. **Concorrência.** Como vocês garantem que duas pessoas não ficam com a mesma poltrona? Onde estava o `await` perigoso?

A poltrona é reservada antes de esperar o pagamento. Assim, quando outro pedido chega para a mesma poltrona, ela já está marcada como ocupada e o segundo pedido é recusado. O `await` perigoso seria o do pagamento caso a reserva da poltrona acontecesse somente depois dele, porque dois pedidos poderiam iniciar o pagamento antes de a poltrona ser marcada.

2. **OO.** O que o `Evento` esconde e por quê? Por que o `reservar` é tudo ou nada? Por que os erros são uma hierarquia de classes?

A classe `Evento` esconde a lista de poltronas vendidas para que ela não possa ser alterada diretamente de fora da classe. O método `reservar` valida todas as poltronas antes de alterar o estado, evitando que apenas uma parte de um pedido seja reservada. Os erros formam uma hierarquia porque todos representam erros de negócio, mas cada tipo pode ter seu próprio status HTTP, como 400, 404, 409 e 502.

3. **Funcional.** O que ganhamos com `preco.ts` puro? Como vocês testariam ele sem subir o servidor?

Como as funções de preço não dependem do servidor nem alteram dados externos, elas são mais simples de testar e têm resultados previsíveis para as mesmas entradas. É possível testar diretamente funções como `valorDoIngresso`, `montarIngressos` e `calcularTotal`, passando os dados necessários e comparando o resultado esperado, sem iniciar o servidor.

4. **Se fosse em outro paradigma.** Escolham uma das partes e expliquem como ficaria em outro paradigma, e se ficaria melhor ou pior.

A parte do `Evento`, que foi feita com orientação a objetos, poderia ser feita de forma procedural, usando um objeto simples para guardar os dados e funções separadas para reservar e liberar poltronas. Funcionaria, mas nesse caso considero pior porque seria mais fácil alterar o estado das poltronas de forma indevida. A classe ajuda a manter os dados e as regras de alteração juntos.

5. **Concorrente × paralelo.** O Node roda o JavaScript numa linha só: os pedidos de vocês são concorrentes, não paralelos. O que mudaria se a venda rodasse em vários núcleos ao mesmo tempo?

No projeto atual, vários pedidos podem ficar aguardando operações assíncronas ao mesmo tempo, mas o código JavaScript não executa essas alterações simultaneamente em vários núcleos. Se a venda rodasse realmente em paralelo em vários núcleos ou processos, seria necessário algum mecanismo de sincronização para proteger a reserva das poltronas, porque dois processos poderiam tentar alterar o mesmo estado exatamente ao mesmo tempo.

### Resultados do bench

| Cenário            | Pedidos | Tempo (ms) | Vendidos | Poltrona ocupada | Falha de pagamento |
| :----------------- | ------: | ---------: | -------: | ---------------: | -----------------: |
| Padrão (`main.ts`) |     200 |        255 |       91 |              100 |                  9 |

O bench ocupa as poltronas do evento 1: para rodar de novo, parem o `npm start` (`Ctrl+C`) e subam outra vez.

O que os números mostram:

Os 200 pedidos foram processados em 255 ms (784 pedidos/s). Como foram enviados dois pedidos para cada uma das 100 poltronas, 100 pedidos receberam erro de poltrona ocupada. Dos outros 100 que conseguiram reservar uma poltrona, 91 tiveram o pagamento aprovado e 9 tiveram falha de pagamento. Nessas 9 falhas, as poltronas foram liberadas novamente, por isso o evento terminou com 9 lugares disponíveis.
