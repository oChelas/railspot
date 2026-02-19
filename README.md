#  RailSpot

**RailSpot** é uma Aplicação Web Progressiva (PWA) desenvolvida para explorar o património ferroviário de Portugal. A aplicação permite aos utilizadores descobrir estações de comboio, ver horários, ler a história e navegar até ao destino em tempo real.

O projeto combina uma interface moderna com um backend robusto de dados geoespaciais.

## Funcionalidades Principais

* ** Mapa Interativo:** Visualização de todas as estações num mapa dinâmico (Leaflet).
* ** Navegação GPS em Tempo Real:** Sistema de rotas integrado (Pé e Carro) que segue a localização do utilizador e dá instruções passo-a-passo.
* ** Design Responsivo:** Interface adaptada para Desktop e Mobile (com modo de navegação estilo GPS).
* ** Comunidade:** Sistema de Autenticação (Login/Registo) que permite aos utilizadores deixar comentários e avaliações nas estações.
* ** Backoffice de Administrador:** Painel protegido para gestão e criação de novas estações no mapa.
* ** Informação em Tempo Real:** Visualização de horários e partidas.

## Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna de tecnologias:

### Frontend
* **React.js** (Vite)
* **Tailwind CSS** (Estilização e Responsividade)
* **React Leaflet & OSRM** (Mapas e Cálculo de Rotas)

### Backend
* **Node.js & Express** (API RESTful)
* **PostgreSQL** (Base de Dados Relacional)
* **PostGIS** (Extensão para processamento de dados geográficos e coordenadas)
* **JWT & Bcrypt** (Segurança e Autenticação)

---
*Desenvolvido por Pedro Nuno Nogueira Soares no âmbito da disciplina de Projeto I.*
