
const EVENTO = {
  entrarSala: 'entrar-sala',
  criarSala: 'criar-sala',
  bemVindo: 'bem-vindo',
  naoAutorizado: 'não-autorizado',
  adicionarEvento: 'adicionar-evento',
  removerEvento: 'remover-evento',
  removerSala: 'remover-sala',
  listarSalas: 'listar-salas',
  ping: 'ping',
  pong: 'pong'
}

const reservedEvents = [
  EVENTO.entrarSala, 
  EVENTO.criarSala, 
  EVENTO.bemVindo, 
  EVENTO.naoAutorizado,
  EVENTO.adicionarEvento,
  EVENTO.removerEvento,
  EVENTO.removerSala,
  EVENTO.listarSalas
];

// Verifica se o evento é padrão do socket.io
const isDefaultEvent = (event) => {
  const defaultEvents = reservedEvents.concat(['connect', 'connect_error', 'disconnect', 'disconnecting', 'newListener', 'removeListener']);
  return defaultEvents.includes(event);
};

function criarSala(socket, rooms, { nome, token, eventos }) {
  console.log(`Cliente ${socket.id} está tentando criar a sala ${nome}`);

    // Verifica se a sala já existe
    if (rooms[nome]) {
      console.log(`Sala ${nome} já existe`);
      socket.emit(EVENTO.criarSala, {
        sucesso: false,
        mensagem: `A sala ${nome} já existe.`,
        eventos: [],
      });
    } else if (eventos.some(isDefaultEvent)) {
      // Verifica se a lista de eventos contém eventos padrão do Socket.IO
      console.log(`Tentativa de registrar eventos padrão do servidor na sala ${nome}`);
      socket.emit(EVENTO.criarSala, {
        sucesso: false,
        mensagem: `Não é permitido registrar eventos padrão do servidor.`,
        eventos: [],
      });
    } else {
      // Cria a sala com os eventos permitidos
      rooms[nome] = { nome, token, eventos };
      console.log(`Sala ${nome} criada com sucesso com eventos: ${eventos}`);

      // Remove o cliente de todas as salas que ele está atualmente
      const currentRooms = Object.keys(socket.rooms).filter(r => r !== socket.id);
      currentRooms.forEach(room => {
        socket.leave(room);
        console.log(`Cliente ${socket.id} saiu da sala ${room}`);
      });

      // Adiciona o cliente à nova sala
      socket.join(nome);
      console.log(`Cliente ${socket.id} entrou na sala ${nome}`);

      // Envia uma resposta ao cliente informando que a sala foi criada com sucesso
      socket.emit(EVENTO.criarSala, {
        sucesso: true,
        mensagem: `Sala ${nome} criada com sucesso.`,
        eventos,
      });
    }
} 

function entrarSala(socket, rooms, { sala, token }) {
  console.log(`Cliente ${socket.id} está tentando entrar na sala ${sala}`);

  //console.log(rooms[sala], sala, token, rooms)
  // Verifica se a sala existe
  if (rooms[sala]) {

    // Verifica se o token está correto
    if (rooms[sala].token === token) {
      // Remove o cliente de todas as salas que ele está atualmente
      const currentRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      currentRooms.forEach(room => {
        socket.leave(room);
        console.log(`Cliente ${socket.id} saiu da sala ${room.nome}`);
      });

      // Adiciona o cliente à nova sala
      socket.join(sala);
      console.log(`Cliente ${socket.id} entrou na sala ${sala}`);

      // Envia uma resposta ao cliente informando que ele entrou na sala com sucesso
      socket.emit(EVENTO.entrarSala, {
        sucesso: true,
        mensagem: `Entrou na sala ${sala} com sucesso.`,
        eventos: rooms[sala].eventos,
      });
    } else {
      // Token incorreto
      console.log(`Token incorreta para a sala ${sala}`);
      socket.emit(EVENTO.entrarSala, {
        sucesso: false,
        mensagem: `Token incorreta para a sala ${sala}.`,
        eventos: [],
      });
    }
    
  } else {
    // Informa ao cliente que a sala não existe
    console.log(`Sala ${sala} não existe`);
    socket.emit(EVENTO.entrarSala, {
      sucesso: false,
      mensagem: `A sala ${sala} não existe.`,
      eventos: [],
    });
  }
}

function listarSalas(socket, rooms, io){
  const salaList = [];
    for (const sala in rooms) {
      const numClientes = io.sockets.adapter.rooms.get(sala)?.size || 0;
      salaList.push({ nome: sala, clientes: numClientes });
    }
    socket.emit(EVENTO.listarSalas, {
      sucesso: true,
      salas: salaList,
    });
}

function removerSala(socket, rooms, { nome, token }){
  if (rooms[nome]) {
    if (rooms[nome].token === token) {
      delete rooms[nome];
      socket.emit(EVENTO.removerSala, {
        sucesso: true,
        mensagem: `Sala ${nome} removida com sucesso.`,
      });
    } else {
      socket.emit(EVENTO.removerSala, {
        sucesso: false,
        mensagem: `Token incorreto para remover a sala ${nome}.`,
      });
    }
  } else {
    socket.emit(EVENTO.removerSala, {
      sucesso: false,
      mensagem: `Sala ${nome} não existe.`,
    });
  }
}

function adicionarEvento(socket, rooms, { sala, evento, token }){
  if (rooms[sala]) {
    if (rooms[sala].token === token) {
      if (!rooms[sala].eventos.includes(evento) && !isDefaultEvent(evento)) {
        rooms[sala].eventos.push(evento);
        socket.emit(EVENTO.adicionarEvento, {
          sucesso: true,
          mensagem: `Evento ${evento} adicionado à sala ${sala}.`,
          eventos: rooms[sala].eventos,
        });
      } else {
        socket.emit(EVENTO.adicionarEvento, {
          sucesso: false,
          mensagem: `Evento ${evento} já existe ou não é permitido.`,
        });
      }
    } else {
      socket.emit(EVENTO.adicionarEvento, {
        sucesso: false,
        mensagem: `Token incorreto para adicionar evento na sala ${sala}.`,
      });
    }
  } else {
    socket.emit(EVENTO.adicionarEvento, {
      sucesso: false,
      mensagem: `Sala ${sala} não existe.`,
    });
  }
}

function removerEvento(socket, rooms, { sala, evento, token }){
  if (rooms[sala]) {
    if (rooms[sala].token === token) {
      const eventIndex = rooms[sala].eventos.indexOf(evento);
      if (eventIndex > -1) {
        rooms[sala].eventos.splice(eventIndex, 1);
        socket.emit(EVENTO.removerEvento, {
          sucesso: true,
          mensagem: `Evento ${evento} removido da sala ${sala}.`,
          eventos: rooms[sala].eventos,
        });
      } else {
        socket.emit(EVENTO.removerEvento, {
          sucesso: false,
          mensagem: `Evento ${evento} não encontrado na sala ${sala}.`,
        });
      }
    } else {
      socket.emit(EVENTO.removerEvento, {
        sucesso: false,
        mensagem: `Token incorreto para remover evento da sala ${sala}.`,
      });
    }
  } else {
    socket.emit(EVENTO.removerEvento, {
      sucesso: false,
      mensagem: `Sala ${sala} não existe.`,
    });
  }
}


module.exports = {
  entrarSala,
  criarSala,
  listarSalas,
  adicionarEvento,
  removerEvento,
  removerSala,
  EVENTO,
  reservedEvents
}