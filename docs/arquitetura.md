# Arquitetura do Projeto - SmartManagementSystem (SMS)

Este documento descreve a arquitetura técnica e a stack de tecnologias utilizadas no desenvolvimento do SmartManagementSystem (SMS).

## Visão Geral

A solução foi construída utilizando uma arquitetura **full-stack moderna**, centrada no framework **Next.js**. A separação de responsabilidades é definida da seguinte forma:

- **Frontend:** Desenvolvido com **Next.js 15**, utilizando o **App Router** para roteamento eficiente e renderização híbrida (Server e Client Components). A interface é construída com **Tailwind CSS** e **Shadcn/UI**, garantindo um design responsivo e de alta performance.
- **Backend:** As lógicas de negócio e interações com serviços externos são disparadas via **Next.js Server Actions**, permitindo uma comunicação segura e direta entre o cliente e o servidor sem a necessidade de uma API REST tradicional separada.
- **Inteligência Artificial:** Integrada através do framework **Google Genkit**, que orquestra as chamadas aos modelos de linguagem (LLMs) como o **Gemini**, processando feedbacks motivacionais e geração de treinos de forma estruturada.
- **Banco de Dados:** Utiliza **PostgreSQL** como SGBD relacional, com o **Prisma ORM** atuando como a camada de mapeamento objeto-relacional, garantindo integridade de dados e facilidade em migrations.

## Tecnologias Utilizadas

| Tecnologia | Categoria | Descrição |
| --- | --- | --- |
| **Next.js 15** | Framework Full-Stack | Base da aplicação, App Router e Server Actions. |
| **Prisma** | ORM | Mapeamento Relacional e Gestão de Banco de Dados. |
| **Genkit** | Framework de IA | Orquestração de prompts e integração com Google Gemini. |
| **Supabase** | Infraestrutura Backend | Hospedagem do PostgreSQL e serviço de Autenticação. |

## Implantação

A estratégia de implantação foca em escalabilidade e facilidade de manutenção:

- **Frontend & Server Functions:** Hospedados na plataforma **Vercel**, aproveitando a integração nativa com o Next.js para builds rápidos e edge computing.
- **Banco de Dados & Auth:** Gerenciados pelo **Supabase**, que fornece a instância gerenciada do PostgreSQL e o provedor de autenticação seguro.
