const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const funcs = require('./funcs');
const util = require('./util')

const app = express();

//const port = 4000;
const port = process.env.PORT ? process.env.PORT : 80;

const server = http.createServer(app);
const io = new Server(server);

const rooms = {};  // Armazena informações sobre salas e seus eventos permitidos

app.use(express.static('public'));

// Configuração do servidor Socket.IO
io.on('connection', (socket) => {
  console.log('Um cliente se conectou');

  socket.emit('bem-vindo', { 
    sucesso: true,
    mensagem: util.TUTORIAL,
    eventos: funcs.reservedEvents
  });

  // Tratamento para o evento "entrar-sala"
  socket.on(funcs.EVENTO.entrarSala, ({ sala, token }) => funcs.entrarSala(socket, rooms, { sala, token }));

  // Tratamento para o evento "criar-sala"
  socket.on(funcs.EVENTO.criarSala, ({ nome, token, eventos }) => funcs.criarSala(socket, rooms, { nome, token, eventos }));

  socket.on(funcs.EVENTO.adicionarEvento, ({ sala, evento, token }) => funcs.adicionarEvento(socket, rooms, { sala, evento, token }));
  socket.on(funcs.EVENTO.removerEvento, ({ sala, evento, token }) => funcs.removerEvento(socket, rooms, { sala, evento, token }));
  socket.on(funcs.EVENTO.removerSala, ({ nome, token }) => funcs.removerSala(socket, rooms, { nome, token }));
  socket.on(funcs.EVENTO.listarSalas, () => funcs.listarSalas(socket, rooms, io));

  // Tratamento para o evento "ping"
  socket.on(funcs.EVENTO.ping, () => {
    console.log(`Cliente ${socket.id} enviou um ping`);
    socket.emit(funcs.EVENTO.pong, {
      mensagem: 'pong',
      salas: Object.keys(socket.rooms).filter(r => r !== socket.id)
    });
  });

  // Repassar eventos apenas se forem permitidos
  socket.onAny((event, ...args) => {

    if(funcs.reservedEvents.includes(event)){
      console.log(`[Evento padrão recebido] --> ${event}`);
      return;
    }

    const currentRooms = Array.from(socket.rooms).filter(room => room !== socket.id);

    // Verifica se o cliente está em uma única sala
    if (currentRooms.length === 1) {
      const sala = currentRooms[0];

      // Verifica se o evento é permitido na sala
      if (rooms[sala] && rooms[sala].eventos.includes(event)) {
        //console.log(`Repassando evento ${event} para a sala ${sala}`);
        //io.to(sala).emit(event, ...args);
        socket.broadcast.to(sala).emit(event, ...args);
      } else {
        // Informa ao cliente que o evento não é permitido na sala
        console.log(`Evento ${event} não é permitido na sala ${sala}`);
        socket.emit(funcs.EVENTO.naoAutorizado, { mensagem: `O evento ${event} não é permitido na sala ${sala}.` });
      }
    } else {
      // Informa ao cliente que ele não está em nenhuma sala ou está em múltiplas salas
      console.log(`Cliente ${socket.id} não está em nenhuma sala ou está em múltiplas salas`);
      socket.emit(funcs.EVENTO.naoAutorizado, { mensagem: `Você não está em nenhuma sala ou está em múltiplas salas.` });
    }
  });

  // Tratamento para desconexão do cliente
  socket.on('disconnect', () => {
    console.log(`Cliente ${socket.id} se desconectou`);
  });
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});






