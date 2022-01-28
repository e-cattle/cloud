### Conteúdo
- [Sobre](#sobre)
- [Execução do projeto](#executando-o-projeto)

## Sobre
A aplicação cloud é uma <abbr title="Application Programming Interface"> API </abbr> responsável pelos *endpoints* consumidos por:

- **BigBoxx**: *Middleware* da propriedade que solicita e envia os dados armazenados nele para a nuvem mediante aprovação feita no "Portal Web";
- **Sistema de Gestão de Inquilinos**: Aplicação *web* em [NodeJS](https://nodejs.org/en/) que permite criar propriedades e gestores na nuvem.
 <br> Saiba mais no repositório do [Sistema de Gestão de Inquilinos](https://github.com/e-cattle/manager/);
- **Portal Web**: Aplicação *web* em [NodeJS](https://nodejs.org/en/) que permite a aprovação do envio dos dados do BigBoxx para a nuvem, além disso, apresenta as informações das propriedades já sincronizadas na nuvem.
 <br> Saiba mais no repositório [Portal Web](https://github.com/e-cattle/web/);
- **Scheduler Job**: Aplicação [NodeJS](https://nodejs.org/en/) de tarefas agendadas, reponsável por criar a *stack* de uma nova propriedade na nuvem. <br> Saiba mais no repositório [Scheduler Job](https://github.com/e-cattle/farm/).

## Executando o projeto


### Project setup
```
docker-compose up --build
```
