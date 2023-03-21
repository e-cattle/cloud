## Sobre
Imagem contendo a API [Cloud](https://github.com/e-cattle/cloud) da plataforma [e-Cattle](https://github.com/e-cattle/).

## Executando
É necessário informar as variáveis de ambiente para a aplicação funcionar corretamente:
- **NODE_ENV**: Especifica se o ambiente é *development*, *production* ou *test*;
- **NODE_PORT**: Porta que o Node do *container guest* será exposta no *host*;
- **MONGO_PORT**: Porta que o MongoDB do *container guest* será exposta no *host*;
- **JWT_SECRET**: Token utilizado pelo JWT no *payload*;
- **SMTP_HOST**: Nome do serviço de e-mail dentro da *stack*;
- **SMTP_PORT**: Porta do serviço de e-mail dentro da *stack*;
- **SMTP_SECURE**: Indica se o serviço SMTP utilizará SSL;
- **SMTP_FROM**: Texto padrão do campo Assunto do e-mail;
- **DOCKER_EMAIL**: Porta que o SMTP vai rodar no *host*;
