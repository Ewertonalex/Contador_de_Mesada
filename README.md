# 🪙 Contador de Mesada - Enzo & Matteo

Um sistema interativo e intuitivo para gerenciar a mesada dos seus filhos, permitindo acompanhar o comportamento diário e calcular descontos baseados em atividades não realizadas.

## ✨ Funcionalidades

### 🎯 Sistema de Mesada
- **Enzo (11 anos)**: Mesada inicial de R$ 30,00
- **Matteo (6 anos)**: Mesada inicial de R$ 10,00
- Saldo atualizado em tempo real
- Controle mensal independente

### 📋 Atividades Monitoradas

#### Enzo
- Não arrumou cama (-R$ 0,50)
- Não fez tarefas na hora certa (-R$ 0,75)
- Não fez tarefas (-R$ 1,00)
- Não jogou o lixo (-R$ 0,50)
- Não escovou dentes (-R$ 0,75)
- Bagunçou na hora de dormir (-R$ 0,50)
- Tirou nota baixa (-R$ 1,50)
- Não estudou para prova (-R$ 1,00)
- Não obedeceu ordens dos pais (-R$ 1,25)
- Bateu no irmão (-R$ 2,00)
- Bagunçou o quarto e não arrumou (-R$ 0,75)

#### Matteo
- Não escovou dentes (-R$ 0,50)
- Não fez tarefas (-R$ 0,75)
- Desobedeceu os pais (-R$ 1,00)
- Ficou bravo com os pais (-R$ 0,75)
- Bateu no irmão (-R$ 1,50)
- Não se comportou na escola (-R$ 1,25)
- Deixou brinquedos espalhados (-R$ 0,50)
- Não quis comer (-R$ 0,75)

## 🚀 Como Usar

### 1. **Iniciar o Sistema**
- Abra o arquivo `index.html` em qualquer navegador moderno
- O sistema carregará automaticamente com o mês atual

### 2. **Selecionar o Mês**
- Use o seletor de mês para navegar entre diferentes meses
- Cada mês mantém dados independentes

### 3. **Marcar Atividades Diárias**
- Clique nas atividades que não foram realizadas
- Cada clique marca/desmarca a atividade
- O resumo do dia é atualizado automaticamente
- **Importante**: Uma atividade pode ser marcada múltiplas vezes no mesmo dia

### 4. **Salvar Atividades (Individual)**
- Cada criança tem seu próprio botão "Salvar Atividades"
- O sistema acumula as atividades (não substitui as anteriores)
- Você pode salvar várias vezes no mesmo dia
- Todas as atividades são contabilizadas no relatório mensal

### 5. **Acompanhar o Progresso (Individual)**
- Os saldos são atualizados em tempo real
- Use "Resetar Seleções" para limpar as novas seleções da criança específica
- Use "Limpar Dia" para remover todas as atividades do dia da criança específica
- Visualize o resumo diário com histórico completo
- Atividades já salvas aparecem com ✓, novas com ✏️

### 6. **Relatórios Individuais**
- Cada criança tem seu próprio botão "Relatório"
- Mostra estatísticas específicas da criança selecionada
- Inclui total de atividades, valores descontados e médias
- Detalhamento de cada tipo de atividade por frequência

### 7. **Editar Mesadas**
- Clique no botão de editar (✏️) ao lado do valor da mesada
- Digite o novo valor no campo que aparece
- Clique no botão de salvar (✓) para confirmar ou cancelar (✗) para desistir
- Use Enter para salvar ou Escape para cancelar
- O saldo é recalculado automaticamente baseado na nova mesada

### 8. **Resetar Mês Individual**
- Cada filho tem seu próprio botão "Resetar Mês"
- Limpa apenas as atividades do filho selecionado
- Mantém os valores de mesada configurados
- Confirmação é solicitada antes de resetar
- O saldo retorna ao valor inicial da mesada



## 💾 Armazenamento

- Todos os dados são salvos automaticamente no navegador (localStorage)
- Não é necessário instalar ou configurar banco de dados
- Os dados persistem entre sessões do navegador

## 🎨 Interface

- Design responsivo e moderno
- Cores diferenciadas para cada filho (Enzo: vermelho/laranja, Matteo: azul/verde)
- Animações suaves e feedback visual
- Compatível com dispositivos móveis e desktop

## 🔧 Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo com gradientes e animações
- **JavaScript ES6+**: Lógica de negócio e interatividade
- **Font Awesome**: Ícones intuitivos
- **Google Fonts**: Tipografia moderna (Nunito)

## 📱 Responsividade

- Layout adaptável para diferentes tamanhos de tela
- Grid responsivo para atividades
- Botões e controles otimizados para mobile
- Modal responsivo para relatórios

## 🎯 Dicas de Uso

1. **Consistência**: Marque as atividades todos os dias para manter o controle
2. **Múltiplas Ocorrências**: Uma criança pode fazer a mesma coisa errada várias vezes no dia
3. **Salvamento**: Sempre salve o dia antes de fechar o navegador
4. **Relatórios**: Use os relatórios mensais para acompanhar o progresso
5. **Novo Mês**: Inicie um novo mês quando necessário para resetar os saldos

## 🚀 Executando o Projeto

1. Baixe todos os arquivos para uma pasta
2. Abra o arquivo `index.html` em um navegador
3. Não é necessário servidor web - funciona localmente

## 📊 Exemplo de Uso

**Cenário**: Enzo não arrumou a cama e não fez as tarefas na hora certa
1. Clique em "Não arrumou cama" (-R$ 0,50)
2. Clique em "Não fez tarefas na hora" (-R$ 0,75)
3. Verifique o resumo do dia: Total -R$ 1,25
4. Clique em "Salvar Atividades"
5. Saldo do Enzo será atualizado de R$ 30,00 para R$ 28,75

**Cenário**: Aumentar a mesada do Matteo
1. Clique no botão de editar (✏️) ao lado da mesada do Matteo
2. Digite o valor 15 no campo que aparece
3. Clique no botão de salvar (✓) ou pressione Enter
4. O sistema recalcula automaticamente o saldo
5. Confirmação é exibida na tela

---

**Desenvolvido com ❤️ para Enzo e Matteo**
*Sistema de contador de mesada interativo e educativo*
