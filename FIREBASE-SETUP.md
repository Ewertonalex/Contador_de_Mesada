# 🔥 Configuração do Firebase - MesadaKids

## Passo a Passo para Configurar Autenticação e Sincronização

### 1. Criar Projeto no Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Criar um projeto"**
3. Nome do projeto: `mesada-kids`
4. Desabilite Google Analytics (não é necessário)
5. Clique em **"Criar projeto"**

### 2. Configurar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**:
   - Ative **"Email/senha"**
   - Ative **"Google"** 
   - Em Google, configure:
     - Nome do projeto: `MesadaKids`
     - Email de suporte: seu-email@gmail.com

### 3. Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Começar no modo de teste"** (regras permissivas por 30 dias)
4. Escolha a localização: **"southamerica-east1 (São Paulo)"**

### 4. Criar Usuário Admin

1. Ainda no Authentication, vá para a aba **"Users"**
2. Clique em **"Adicionar usuário"**
3. Configure:
   - Email: `admin@mesadakids.com`
   - Senha: `admin123`
4. Clique em **"Adicionar usuário"**

### 5. Obter Configuração do Firebase

1. No menu lateral, clique no ⚙️ **"Configurações do projeto"**
2. Role para baixo até **"Seus apps"**
3. Clique no ícone **"</>"** (Web)
4. Nome do app: `MesadaKids`
5. **NÃO** marque "Configurar Firebase Hosting"
6. Clique em **"Registrar app"**
7. **COPIE** a configuração que aparece

### 6. Atualizar os Arquivos

#### Edite `firebase-config.js`:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAWxlKMbSjQo-6s7cAiUecPCsm6C89vmK4",
    authDomain: "mesadakids-534c2.firebaseapp.com",
    projectId: "mesadakids-534c2",
    storageBucket: "mesadakids-534c2.firebasestorage.app",
    messagingSenderId: "827704870033",
    appId: "1:827704870033:web:b0e453f6419a0018346b30",
    measurementId: "G-46SZ3EN88Q"
};
```

#### Edite `login.html` (mesma configuração):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAWxlKMbSjQo-6s7cAiUecPCsm6C89vmK4",
  authDomain: "mesadakids-534c2.firebaseapp.com",
  projectId: "mesadakids-534c2",
  storageBucket: "mesadakids-534c2.firebasestorage.app",
  messagingSenderId: "827704870033",
  appId: "1:827704870033:web:b0e453f6419a0018346b30",
  measurementId: "G-46SZ3EN88Q"
};
```

### 7. Configurar Regras de Segurança do Firestore

1. No Firestore Database, clique na aba **"Regras"**
2. Substitua as regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite acesso apenas a usuários autenticados aos seus próprios dados
    match /mesada-data/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clique em **"Publicar"**

### 8. Testar o Sistema

1. Abra `login.html` no navegador
2. Teste o login com:
   - **Usuário**: `admin`
   - **Senha**: `admin`
3. Ou teste com **"Entrar com Google"**
4. Após o login, deve redirecionar para `index.html`
5. Teste marcando atividades - devem sincronizar automaticamente!

### 9. Verificar Sincronização

1. Faça login em um dispositivo/navegador
2. Marque algumas atividades
3. Faça login em outro dispositivo com a mesma conta
4. Os dados devem aparecer automaticamente! 🎉

## 💰 Custos

- **TOTALMENTE GRATUITO** para o seu uso!
- Limites do plano gratuito:
  - 50.000 leituras/dia
  - 20.000 escritas/dia
  - 10.000 autenticações/mês

Para 2 usuários (você e sua esposa), isso é mais que suficiente! 

## 🔐 Segurança

- ✅ Dados criptografados em trânsito e repouso
- ✅ Autenticação Google OAuth2
- ✅ Regras de segurança impedem acesso não autorizado
- ✅ Cada usuário vê apenas seus próprios dados

## 🚀 Recursos Implementados

- ✅ Login com usuário/senha (admin/admin)
- ✅ Login com Google
- ✅ Sincronização em tempo real entre dispositivos
- ✅ Dados seguros na nuvem
- ✅ Logout funcional
- ✅ Interface responsiva

Agora vocês podem usar o MesadaKids em qualquer lugar! 📱💻
