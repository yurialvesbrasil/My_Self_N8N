# 🚀 Projeto N8N via Docker

Este projeto permite rodar o [N8N](https://n8n.io/) localmente utilizando Docker, com persistência de dados, autenticação básica, integração com banco de dados Postgres, Redis para filas e o Ollama para IA generativa.

---

## 📦 Serviços inclusos

- **Postgres**: Banco de dados para persistência dos workflows e credenciais.
- **Redis**: Gerenciamento de filas para execução dos workflows.
- **Ollama**: API para rodar modelos de IA localmente.
- **N8N**: Plataforma de automação de workflows.

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