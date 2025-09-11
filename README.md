# 🚀 Projeto N8N via Docker

Este projeto permite rodar o [N8N](https://n8n.io/) localmente utilizando Docker, com persistência de dados, autenticação básica, integração com banco de dados Postgres, Redis para filas e o Ollama para IA generativa.

---

## 📦 Serviços inclusos

- **Postgres**: Banco de dados para persistência dos workflows e credenciais.
- **Redis**: Gerenciamento de filas para execução dos workflows.
- **Ollama**: API para rodar modelos de IA localmente.
- **N8N**: Plataforma de automação de workflows.
- **Qdrant**: Banco de dados vetorial para embeddings, busca semântica e RAG/memória.

---

## ⚙️ Como levantar o ambiente

1. **Clone o repositório e acesse a pasta:**

   ```sh
   git clone <url-do-repo>
   cd N8N
   ```

2. **Suba os containers:**
   ```sh
   docker compose up -d
   ```

---

## 🗄️ Persistência de dados

- Os dados do N8N (workflows e credenciais) ficam em `/home/node/.n8n` dentro do container.
- O volume `n8n_data` garante que os dados sejam persistidos mesmo após reiniciar os containers.
- Outros volumes:
  - `postgres_data`: dados do Postgres
  - `redis_data`: dados do Redis
  - `ollama_data`: modelos baixados do Ollama
  - `qdrant_data`: coleções/vetores armazenados pelo Qdrant

---

## 🧠 Qdrant: Banco Vetorial

### Por que adicionamos o Qdrant?

O Qdrant é um banco de dados vetorial utilizado para armazenar e buscar embeddings de alta dimensão. Ele permite implementar recursos como busca semântica, RAG (Retrieval-Augmented Generation), recomendação e memória de longo prazo em workflows do N8N. Com isso, é possível:

- Indexar documentos em vetores e recuperar conteúdos semelhantes por significado.
- Construir agentes com memória, histórico e contexto persistente.
- Aumentar respostas de IA com contexto relevante (RAG) e reduzir alucinações.

### Como acessar o Qdrant

- **API HTTP**: `http://localhost:6333`
- **gRPC**: `localhost:6334`
- **Volume de dados**: `qdrant_data` mapeado para `/qdrant/storage` (persistência local)

O serviço está definido no `docker-compose.yml` como `qdrant` e o N8N já possui a variável de ambiente `QDRANT_URL` apontando para `http://qdrant:6333` para uso dentro da rede Docker.

### Testes rápidos (cURL)

1. Verificar saúde do serviço:

```sh
curl http://localhost:6333/healthz
```

2. Criar uma coleção (ex.: `docs`, com vetores de dimensão 768 e métrica cosseno):

```sh
curl -X PUT "http://localhost:6333/collections/docs" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": { "size": 768, "distance": "Cosine" }
  }'
```

3. Inserir pontos (embeddings) na coleção:

```sh
curl -X PUT "http://localhost:6333/collections/docs/points?wait=true" \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {"id": 1, "vector": [0.01, 0.02, 0.03, /* ... 768 dims ... */ 0.04], "payload": {"title": "Doc A"}},
      {"id": 2, "vector": [0.02, 0.03, 0.01, /* ... 768 dims ... */ 0.05], "payload": {"title": "Doc B"}}
    ]
  }'
```

4. Fazer uma busca por similaridade:

```sh
curl -X POST "http://localhost:6333/collections/docs/points/search" \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.01, 0.02, 0.03, /* ... 768 dims ... */ 0.04],
    "limit": 5,
    "with_payload": true
  }'
```

Obs.: substitua os vetores de exemplo pelos embeddings reais gerados pelo seu modelo (por exemplo, via Ollama + uma etapa de embedding adequada).

### Integração com o N8N

- Dentro do container do N8N, o Qdrant está acessível via `QDRANT_URL=http://qdrant:6333`.
- Use o nó `HTTP Request` para chamar a API do Qdrant (criar coleções, upsert e busca).
- Se estiver utilizando nós/comunidade para vetores, aponte o endpoint para o `QDRANT_URL`.
- Fluxos típicos de RAG: `Texto/Arquivo → Embedding → Upsert no Qdrant → Consulta por vetor → Contexto → LLM`.

---

## 🔒 Autenticação

- O N8N está protegido por autenticação básica:
  - **Usuário:** `admin`
  - **Senha:** `senha-super-segura`
- O timezone está configurado para `America/Sao_Paulo`.

---

## 🌐 Acessando o N8N

Abra o navegador em:

👉 [http://localhost:5678](http://localhost:5678)

---

## 🤖 Testando o Ollama

### 1️⃣ Listar modelos disponíveis

Dentro do container Ollama, rode:

```sh
docker exec -it <nome_do_container_ollama> ollama list
```

### 2️⃣ Baixar o modelo desejado

Exemplo para baixar o modelo `llama3`:

```sh
docker exec -it <nome_do_container_ollama> ollama pull llama3
```

Você pode baixar outros modelos, como `mistral`, `codellama`, etc.

### 3️⃣ Testar o modelo

Após baixar, teste com o comando:

```sh
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3",
    "prompt": "Explique o que é n8n em 3 frases curtas."
  }'
```

Se tudo estiver certo, o modelo irá retornar uma resposta. ✅

---

## 📝 Observações

- O serviço N8N depende do Postgres, Redis e Ollama, garantindo que todos estejam prontos antes de iniciar.
- Os workflows podem ser salvos na pasta `./workflows` do projeto, que é montada no container.

---

## 📚 Referências

- [Documentação oficial do N8N](https://docs.n8n.io/)
- [Documentação do Ollama](https://ollama.com/)
- [Documentação do Qdrant](https://qdrant.tech/documentation/)
