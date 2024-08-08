
const reservedEvents = ['entrar-sala', 'criar-sala', 'bem-vindo', 'não-autorizado'];

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
      socket.emit('criar-sala', {
        sucesso: false,
        mensagem: `A sala ${nome} já existe.`,
        eventos: [],
      });
    } else if (eventos.some(isDefaultEvent)) {
      // Verifica se a lista de eventos contém eventos padrão do Socket.IO
      console.log(`Tentativa de registrar eventos padrão do servidor na sala ${nome}`);
      socket.emit('criar-sala', {
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
      socket.emit('criar-sala', {
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
      socket.emit('entrar-sala', {
        sucesso: true,
        mensagem: `Entrou na sala ${sala} com sucesso.`,
        eventos: rooms[sala].eventos,
      });
    } else {
      // Token incorreto
      console.log(`Token incorreta para a sala ${sala}`);
      socket.emit('entrar-sala', {
        sucesso: false,
        mensagem: `Token incorreta para a sala ${sala}.`,
        eventos: [],
      });
    }
    
  } else {
    // Informa ao cliente que a sala não existe
    console.log(`Sala ${sala} não existe`);
    socket.emit('entrar-sala', {
      sucesso: false,
      mensagem: `A sala ${sala} não existe.`,
      eventos: [],
    });
  }
}


module.exports = {
  entrarSala,
  criarSala,
  reservedEvents
}