-- Script de criação do esquema AtividadesBD
CREATE DATABASE "AtividadesBD";

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    id_lider INTEGER REFERENCES usuarios(id)
);

CREATE TABLE atividades (
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    id_projeto INTEGER REFERENCES projetos(id)
);

-- Dados iniciais
INSERT INTO usuarios (nome, email) VALUES ('José Inamar', 'inamarjr@gmail.com');
INSERT INTO projetos (nome, id_lider) VALUES ('Projeto Sentinel', 1);
