# Ho'oponopono - Jornada de Cura e Transformação 🙏

Uma aplicação web moderna para praticar a antiga técnica havaiana de Ho'oponopono, focada em limpeza, perdão e transformação pessoal.

## 🌺 Sobre o Ho'oponopono

Ho'oponopono é uma prática espiritual havaiana que utiliza quatro frases sagradas para promover cura, perdão e limpeza energética:

- **Sinto muito**
- **Me perdoe** 
- **Te amo**
- **Sou grato**

## ✨ Funcionalidades

### Para Usuários
- 📚 **Módulos de Aprendizado**: Conteúdo estruturado sobre Ho'oponopono
- 📖 **Diário Pessoal**: Registre suas práticas e reflexões
- 🎵 **Biblioteca de Áudios**: Meditações guiadas e mantras
- 👥 **Comunidade**: Compartilhe experiências com outros praticantes
- 📱 **Progressive Web App (PWA)**: Funciona offline e pode ser instalado

### Para Administradores
- 📝 **Editor de Módulos**: Crie e edite conteúdo dos módulos
- 📄 **Editor de Páginas**: Sistema visual para criar páginas
- 🎵 **Upload de Áudios**: Adicione meditações e mantras
- 📊 **Estatísticas**: Acompanhe o crescimento do conteúdo

## 🚀 Como Subir no GitHub e Vercel

### 1. Preparar os Arquivos

Crie uma pasta para o projeto e adicione os seguintes arquivos:

```
hooponopono-app/
├── index.html
├── styles.css
├── script.js
├── manifest.json
└── README.md
```

### 2. Subir no GitHub

```bash
# 1. Inicializar repositório Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit inicial
git commit -m "🌺 Primeira versão do app Ho'oponopono"

# 4. Conectar ao repositório GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/hooponopono-app.git

# 5. Enviar para o GitHub
git branch -M main
git push -u origin main
```

### 3. Deploy na Vercel

#### Opção A: Via GitHub (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `hooponopono-app`
5. Clique em "Deploy"

#### Opção B: Via CLI da Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Seguir as instruções do terminal
```

### 4. Configurações da Vercel

No painel da Vercel, configure:

- **Project Name**: `hooponopono-app`
- **Framework**: `Other`
- **Root Directory**: `./`
- **Build Command**: (deixe vazio)
- **Output Directory**: `./`

## 🔐 Acesso Administrativo

Para acessar o painel admin:

1. Na tela inicial, clique 5 vezes rapidamente no logo 🙏
2. Aparecerá o botão de "Acesso Admin"
3. Use as credenciais:
   - **Usuário**: Rita Mattos
   - **Senha**: 31536000

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo com gradientes e animações
- **JavaScript**: Funcionalidades interativas e Web Audio API
- **LocalStorage**: Persistência de dados local
- **PWA**: Aplicação web progressiva
- **Web Audio API**: Reprodução de áudios

## 📱 Recursos PWA

- ✅ Instalável no dispositivo
- ✅ Funciona offline (cache dos recursos estáticos)
- ✅ Ícones adaptativos
- ✅ Splash screen personalizada
- ✅ Atalhos rápidos

## 🎨 Design

- **Tema**: Galáxico com cores roxas e verdes
- **Responsivo**: Otimizado para mobile e desktop
- **Animações**: Transições suaves e efeitos visuais
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 📦 Estrutura do Projeto

```
├── index.html          # Página principal
├── styles.css          # Estilos e animações
├── script.js           # Lógica da aplicação
├── manifest.json       # Configuração PWA
└── README.md          # Documentação
```

## 🚀 Funcionalidades Técnicas

### Sistema de Módulos
- Editor visual WYSIWYG
- Suporte a texto, imagens e formatação
- Persistência automática

### Sistema de Áudios
- Upload de MP3, WAV, OGG, M4A
- Player customizado com controles
- Armazenamento em Base64

### Sistema de Persistência
- LocalStorage para dados do usuário
- Fallback para memória se localStorage indisponível
- Sincronização automática

## 🔒 Segurança

- Console logs desabilitados em produção
- Prevenção de F12 e ferramentas de desenvolvedor
- Validação de inputs
- Sanitização de conteúdo

## 📈 SEO e Performance

- Meta tags otimizadas
- Open Graph para compartilhamento
- Código minificado e otimizado
- Carregamento progressivo

## 🌟 Próximas Funcionalidades

- [ ] Sincronização em nuvem
- [ ] Notificações push para lembretes
- [ ] Modo escuro
- [ ] Integração com redes sociais
- [ ] Sistema de conquistas
- [ ] Relatórios de progresso
- [ ] Backup automático

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👩‍💻 Desenvolvido por

**Rita Mattos**
- Especialista em Ho'oponopono
- Desenvolvedora Full Stack

## 🙏 Agradecimentos

- Comunidade havaiana pela preservação da tradição Ho'oponopono
- Dr. Ihaleakala Hew Len pelos ensinamentos
- Todos os praticantes que contribuem para a evolução espiritual

---

**"A paz começa comigo" 🌺**

Para mais informações sobre Ho'oponopono, visite o app e comece sua jornada de transformação hoje mesmo!
