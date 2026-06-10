# 🔩 Bolt Client Manager – Desafio Técnico

Aplicação fullstack de gerenciamento de clientes, construída com **Spring Boot 3** (backend) e **Angular 17 + Angular Material** (frontend).

---

## 🏗️ Arquitetura

```
bolt-challenge/
├── backend/            # Spring Boot – API REST
│   ├── src/main/java/com/bolt/clientmanager/
│   │   ├── controller/      # ClienteController (CRUD)
│   │   ├── service/         # ClienteService, ViaCepService
│   │   ├── repository/      # ClienteRepository, UnidadeConsumidoraRepository
│   │   ├── model/           # Cliente, UnidadeConsumidora, Endereco (JPA)
│   │   ├── dto/             # ViaCepResponseDto
│   │   ├── event/           # ClienteAnaliseMgEvent, ClienteAnaliseMgListener
│   │   └── exception/       # BusinessException, GlobalExceptionHandler
│   └── src/main/resources/
│       ├── application.properties         # Porta 8082, perfil padrão H2
│       ├── application-h2.properties      # Config H2 em memória
│       └── application-postgres.properties # Config PostgreSQL (para migração)
├── frontend/           # Angular 17 + Angular Material
│   └── src/app/
│       ├── components/
│       │   ├── cliente-list/   # Tabela de listagem (últimos 20 / todos)
│       │   └── cliente-form/   # Modal de cadastro/edição com FormArray
│       ├── services/            # ClienteService (API REST + ViaCEP)
│       └── models/              # Interfaces TypeScript
├── tools/              # JDK 17 e Maven 3.9.6 locais (não versionados)
└── sonar-project.properties  # Configuração SonarQube global
```

---

## 🚀 Como executar

### Pré-requisitos
- JDK 17+
- Maven 3.9+
- Node.js 18+ / npm
- Google Chrome (para testes Angular)

### Backend

```bash
cd backend

# Usando as ferramentas locais do projeto
JAVA_HOME=../tools/jdk17 ../tools/maven/bin/mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

A API ficará disponível em: **http://localhost:8082**  
Console H2: **http://localhost:8082/h2-console** (JDBC URL: `jdbc:h2:mem:clientedb`)

#### Para usar PostgreSQL (futuramente)
```bash
JAVA_HOME=../tools/jdk17 ../tools/maven/bin/mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```
Configure as variáveis de ambiente: `DB_URL`, `DB_USER`, `DB_PASSWORD`.

### Frontend

```bash
cd frontend
npm install
npm run start
```

Acesse: **http://localhost:4200**

---

## 🧪 Testes

### Backend (JUnit 5 + Mockito)
```bash
cd backend
JAVA_HOME=../tools/jdk17 ../tools/maven/bin/mvn test
# Resultado: Tests run: 6, Failures: 0, Errors: 0
```

### Frontend (Karma + Jasmine)
```bash
cd frontend
npx ng test --watch=false --browsers=ChromeHeadless
# Resultado: TOTAL: 20 SUCCESS
```

---

## 📋 Funcionalidades

### Backend – API REST (`/api/clientes`)

| Método | Endpoint           | Descrição                         |
|--------|--------------------|-----------------------------------|
| GET    | `/api/clientes`    | Lista clientes (param `?recentes=true` para últimos 20) |
| GET    | `/api/clientes/{id}` | Busca cliente por ID            |
| POST   | `/api/clientes`    | Cadastra novo cliente             |
| PUT    | `/api/clientes/{id}` | Atualiza cliente existente      |
| DELETE | `/api/clientes/{id}` | Soft delete (inativação lógica) |

### Regras de Negócio
- ✅ **Documento único**: CPF ou CNPJ não pode ser duplicado
- ✅ **Soft delete**: o campo `ativo` é setado para `false`, o registro permanece no banco
- ✅ **Integração ViaCEP**: o CEP é consultado automaticamente para preencher logradouro, bairro, cidade e UF
- ✅ **Validação regional**: estados **SP, RS e PR** são rejeitados para unidades consumidoras
- ✅ **Evento MG**: ao cadastrar um cliente com unidade consumidora em MG, um `ApplicationEvent` é publicado e logado

### Frontend – Angular Material
- 📋 Listagem tabular com toggle "Últimos 20 / Todos"
- ➕ Modal de cadastro/edição com `FormArray` dinâmico para unidades consumidoras
- 🔍 Consulta automática de CEP com preenchimento do endereço (via ViaCEP)
- ⚠️ Validação em tempo real de regiões não atendidas
- 🗑️ Soft delete com confirmação visual
- 🍞 Feedback com MatSnackBar (sucesso/erro/aviso)
- 🎨 Design premium com gradientes, animações e tipografia Outfit/Inter

---

## 📊 SonarQube

```bash
# A partir da raiz do projeto
cd backend
JAVA_HOME=../tools/jdk17 ../tools/maven/bin/mvn sonar:sonar \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=seu_token
```

---

## 🗄️ Modelo de Dados

```
Cliente (clientes)
├── id (PK)
├── nome
├── documento (unique, apenas dígitos)
├── cep / logradouro / bairro / localidade / uf / numero / complemento  (enderecoCliente - Embedded)
├── ativo (boolean, soft delete)
├── createdAt
└── updatedAt

UnidadeConsumidora (unidades_consumidoras)
├── id (PK)
├── nome
├── numeroInstalacao
├── cep / logradouro / bairro / localidade / uf / numero / complemento  (endereco - Embedded)
└── cliente_id (FK → clientes)
```

---

## 🔧 Tecnologias Utilizadas

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Backend    | Java 17, Spring Boot 3, Spring Data JPA |
| Banco      | H2 (dev) / PostgreSQL (prod-ready)     |
| REST       | Spring Web, Bean Validation             |
| Frontend   | Angular 17, Angular Material, RxJS      |
| Máscaras   | ngx-mask                               |
| Testes BE  | JUnit 5, Mockito, Spring Boot Test      |
| Testes FE  | Karma, Jasmine                          |
| Qualidade  | SonarQube (Sonar Maven Plugin)          |
| Build      | Maven 3.9, npm / Angular CLI            |
