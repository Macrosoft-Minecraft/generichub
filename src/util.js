const funcs = require('./funcs');

const TUTORIAL = {
    sucesso: true,
    mensagem: 'Bem vindo ao hub websocket da Macrosoft v1',
    eventos: funcs.reservedEvents,
    tutorial: {
      ping: {
        descricao: 'Envia um ping ao servidor e recebe um pong em resposta.',
        evento: 'ping',
        exemplo: {
          evento: 'ping'
        },
        resposta: {
          evento: 'pong',
          mensagem: 'Mensagem indicando que o servidor recebeu o ping e respondeu com um pong',
          salas: 'A lista de salas nas quais o cliente está. Apenas uma sala por vez!'
        }
      },
      criarSala: {
        descricao: 'Cria uma nova sala com eventos permitidos e uma senha.',
        evento: 'criar-sala',
        dados: {
          nome: 'Nome da sala (string)',
          senha: 'Senha da sala (string)',
          eventos: 'Array de strings com os nomes dos eventos permitidos'
        },
        exemplo: {
          evento: 'criar-sala',
          dados: {
            nome: 'salaExemplo',
            senha: 'minhaSenha123',
            eventos: ['eventoA', 'eventoB', 'eventoC']
          }
        }
      },
      entrarSala: {
        descricao: 'Entra em uma sala existente utilizando uma senha.',
        evento: 'entrar-sala',
        dados: {
          sala: 'Nome da sala (string)',
          senha: 'Senha da sala (string)'
        },
        exemplo: {
          evento: 'entrar-sala',
          dados: {
            sala: 'salaExemplo',
            senha: 'minhaSenha123'
          }
        }
      },
      enviarEvento: {
        descricao: 'Envia um evento permitido para todos os membros da sala, exceto para o remetente.',
        evento: 'nomeDoEventoPermitido',
        dados: {
          chave: 'Dados do evento (qualquer formato)'
        },
        exemplo: {
          evento: 'eventoA',
          dados: {
            chave: 'valor'
          }
        }
      },
      respostaEventos: {
        descricao: 'Descrição das respostas possíveis para os eventos.',
        eventos: {
          'entrar-sala': {
            sucesso: 'Booleano indicando se a entrada na sala foi bem-sucedida',
            mensagem: 'Mensagem de status',
            eventos: 'Array de strings com os nomes dos eventos permitidos na sala'
          },
          'criar-sala': {
            sucesso: 'Booleano indicando se a criação da sala foi bem-sucedida',
            mensagem: 'Mensagem de status',
            eventos: 'Array de strings com os nomes dos eventos permitidos na sala'
          },
          'não-autorizado': {
            mensagem: 'Mensagem de status explicando que o evento não é permitido'
          }
        }
      }
    }
  }

  module.exports = {
    TUTORIAL
  }