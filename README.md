# IO


## Bunker
É uma terceira aplĩcação usada com fonte de dados por esta aplicação

## Funcionamento

### App

Representa uma instância de app de controle remoto conectada

- Cada app terá seus clientes
- Cada app é caracterizado pelo token do respectivo usuário na aplicação bunker.
- Ao realizar a conexão, será verificado primeiro se o token associado já existe na aplicação bunker. Caso negativo, envia-se um evento chamado `iounauthorized`. Então a conexão é finalizada. Caso positivo, vincula-se todos os clientes que possuem o mesmo token. Dispara-se o evento interno `bindapp` aos clientes correspondentes contendo o app.


### Cliente

Representa uma instância do jogo conectada

- Cada cliente pertencerá a um conjunto de apps do mesmo usuário
- Cada cliente é caracterizado pelo header `Hardware` e `Authorization` que são, respectivamente o id do Hardware onde o cliente está rodando e a chave associada. Este par de headers são o identificador do cliente.
- Ao realizar a conexão, será verificado primeiro se o identificado do cliente já existe registrado no Bunker. Caso positivo, associa-se o cliente aos apps vinculados. Caso negativo, passar-se-á ao estágio de sincronização.
- A sincronização será o processo de enviar uma palavra secreta para o cliente no evento `iosecurityword`. Tal palavra secreta deverá ser enviada pelo usuário através do app através como um evento `iosecurityword`. Quando o app informar a palavra, dispara-se um evento chamado `appauthorized` para o cliente que estava em espera contendo o app que confirmou a palavra secreta. Então o cliente é associado aos apps vinculados que possuem o mesmo token do app que informou a palavra secreta. Depois da associação do cliente, emite-se um evento `ioconfirmed` contendo o nome do cliente que confirmou a palavra chave.
- Ao associar um cliente a um app, cria-se um registro na aplicação bunker.
- Ao dissociar um cliente, apaga-se o identificador deste cliente na aplicação bunker e atualiza-se as instâncias de app que possuem aquele cliente.
- Ao desconectar um cliente, simplesmente dispara-se um evento interno chamado `unbindclient` para as instâncias de app que possuem aquele cliente. Então eles deverão ser removidos da lista de binding daqueles clientes.
- Ao associar, dissociar ou desconectar clientes, dispara-se um evento aos respectivos apps chamado de `ioconnectedclients` contendo os novos clientes.

