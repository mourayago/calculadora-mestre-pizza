# Calculadora Especialista de Pizza

Aplicativo web responsivo para calcular massa de pizza por porcentagem do padeiro, consultar receitas-base do curso, molhos e coberturas/sabores.

## Rodar localmente

```bash
node src/server/index.js
```

Depois acesse:

```text
http://localhost:3000
```

## Publicar no GitHub Pages

Este projeto funciona como site estatico. Para publicar gratuitamente:

1. Suba o projeto para um repositorio no GitHub.
2. No GitHub, entre em `Settings`.
3. Va em `Pages`.
4. Em `Build and deployment`, selecione `Deploy from a branch`.
5. Em `Branch`, escolha a branch principal e a pasta `/root`.
6. Clique em `Save`.

O GitHub Pages vai usar o arquivo `index.html` da raiz do projeto.

## Validar antes de publicar

```bash
node --check src/frontend/App.js
node --check src/server/index.js
```
