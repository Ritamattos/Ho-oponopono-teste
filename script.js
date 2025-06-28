// ===== HO'OPONOPONO APP - SCRIPT COMPLETO E FUNCIONAL =====

// Desabilitar console em produção
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log = console.warn = console.error = console.info = console.debug = () => {};
    document.body.setAttribute('data-production', 'true');
}

// Sistema de persistência usando localStorage com fallback para memória
const StorageManager = {
    KEYS: {
        MODULES: 'hooponopono_modules',
        AUDIOS: 'hooponopono_audios',
        DIARY: 'hooponopono_diary',
        USER: 'hooponopono_user'
    },

    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            if (typeof Storage !== "undefined") {
                localStorage.setItem(key, serialized);
            } else {
                this.memoryStorage = this.memoryStorage || {};
                this.memoryStorage[key] = data;
            }
            return true;
        } catch (error) {
            this.memoryStorage = this.memoryStorage || {};
            this.memoryStorage[key] = data;
            return false;
        }
    },

    load(key, defaultValue = null) {
        try {
            if (typeof Storage !== "undefined") {
                const item = localStorage.getItem(key);
                if (item) {
                    return JSON.parse(item);
                }
            }
            
            if (this.memoryStorage && this.memoryStorage[key]) {
                return this.memoryStorage[key];
            }
        } catch (error) {
            // Fallback silencioso
        }
        
        return defaultValue;
    },

    remove(key) {
        try {
            if (typeof Storage !== "undefined") {
                localStorage.removeItem(key);
            }
            if (this.memoryStorage) {
                delete this.memoryStorage[key];
            }
        } catch (error) {
            // Silencioso
        }
    }
};

// Sistema de notificações toast
const ToastManager = {
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    }
};

// ===== VARIÁVEIS GLOBAIS =====
let userName = '';
let currentPage = 1;
let totalPages = 1;
let diaryEntries = [];
let selectedImage = null;
let postId = 0;
let isAdmin = false;
let cliquesSecretos = 0;
let tempoUltimoClique = 0;

// Configuração do Admin
const ADMIN_PASSWORD = '31536000';
const ADMIN_USERNAME = 'Rita Mattos';

// Variáveis para o editor
let moduloAtualEditor = null;
let paginaAtualEditor = 0;
let elementosContador = 0;
let audiosPersonalizados = [];
let audioAtualTocando = null;

// Conteúdo dos módulos (agora persistente)
let modules = {};

// ===== FUNÇÃO PRINCIPAL CORRIGIDA =====
function entrarApp() {
    console.log('🚀 Função entrarApp chamada');
    
    try {
        const nomeInput = document.getElementById('name');
        const splash = document.getElementById('splash');
        const main = document.getElementById('main');
        const welcome = document.getElementById('welcome');
        
        // Verificar se os elementos existem
        if (!nomeInput || !splash || !main) {
            console.error('❌ Elementos não encontrados');
            alert('Erro: Elementos da página não encontrados!');
            return;
        }
        
        const nome = nomeInput.value.trim();
        if (!nome) {
            alert('Por favor, digite seu nome antes de continuar! 📝');
            nomeInput.focus();
            return;
        }
        
        console.log('✅ Nome válido, iniciando app...');
        
        // Definir userName
        userName = nome;
        
        // Salvar usuário
        StorageManager.save(StorageManager.KEYS.USER, { nome, lastLogin: new Date().toISOString() });
        
        // Atualizar welcome
        if (welcome) {
            welcome.textContent = `Bem-vindo, ${nome}`;
        }
        
        // Esconder splash e mostrar main
        splash.style.display = 'none';
        main.style.display = 'block';
        
        // Carregar dados na interface
        try {
            if (typeof carregarModulosNaInterface === 'function') {
                carregarModulosNaInterface();
            }
            if (typeof carregarAudiosNaInterface === 'function') {
                carregarAudiosNaInterface();
            }
            if (typeof atualizarDiario === 'function') {
                atualizarDiario();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
        
        console.log('✅ App iniciado com sucesso!');
        
        // Mostrar toast de sucesso
        if (typeof ToastManager !== 'undefined') {
            ToastManager.success(`Bem-vindo, ${nome}! 🌺`);
        }
        
    } catch (error) {
        console.error('❌ Erro na função entrarApp:', error);
        alert('Erro ao iniciar o app: ' + error.message);
    }
}

// TORNAR FUNÇÃO GLOBAL IMEDIATAMENTE
window.entrarApp = entrarApp;
// ===== INICIALIZAÇÃO =====
async function inicializarDadosPadrao() {
    const modulosPadrao = {
        1: {
            title: "Módulo 1: Descobrindo o Ho'oponopono",
            description: "Introdução à prática havaiana - 9 páginas",
            pages: [
                {
                    title: "🌺 Aloha! Bem-vindo",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">Você está prestes a descobrir uma antiga prática havaiana que tem o poder de transformar sua vida através do perdão, gratidão e amor.</p><div style="text-align: center; margin-top: 40px;"><p style="font-size: 1.3em; color: #10b981;">"A paz começa comigo"</p></div>`
                },
                {
                    title: "As 4 Frases Sagradas",
                    content: `<div style="background: rgba(139, 92, 246, 0.2); padding: 30px; border-radius: 15px; text-align: center;"><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sinto muito</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Me perdoe</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Te amo</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sou grato</p></div>`
                },
                {
                    title: "Como Praticar",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">Simplesmente repita as quatro frases sempre que surgir um problema, conflito ou memória dolorosa.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 20px;">Não precisa entender, apenas confie no processo.</p>`
                },
                {
                    title: "A Origem do Ho'oponopono",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">Uma Sabedoria Ancestral</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono é uma antiga prática havaiana de reconciliação e perdão que significa "corrigir" ou "tornar certo".</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta técnica sagrada foi usada por gerações para resolver conflitos familiares e comunitários, restaurando a harmonia através do amor incondicional.</p>`
                },
                {
                    title: "Dr. Ihaleakala Hew Len",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">O Mestre Moderno</h3><p style="line-height: 1.8; font-size: 1.1em;">O Dr. Hew Len tornou o Ho'oponopono conhecido mundialmente após curar um hospital psiquiátrico inteiro usando apenas esta técnica.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ele nunca viu os pacientes pessoalmente - apenas estudou seus prontuários e aplicou Ho'oponopono em si mesmo.</p><div style="text-align: center; margin-top: 30px; font-style: italic; color: #10b981;">"O problema não está neles, está em mim"</div>`
                },
                {
                    title: "100% de Responsabilidade",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">O Conceito Fundamental</h3><p style="line-height: 1.8; font-size: 1.1em;">No Ho'oponopono, você é 100% responsável por tudo que aparece em sua realidade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Isso não significa culpa, mas sim o poder de transformar qualquer situação através da limpeza interior.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;"><p style="font-size: 1.2em; color: #10b981;">"Se você quer mudar o mundo, comece por você mesmo"</p></div>`
                },
                {
                    title: "Memórias e Programas",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">Limpando o Subconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">Nossas memórias e programas subconscientes criam nossa realidade atual.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O Ho'oponopono limpa essas memórias, permitindo que a Inteligência Divina flua livremente através de nós.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando limpamos uma memória em nós, ela é automaticamente limpa em todos que compartilham essa mesma memória.</p>`
                },
                {
                    title: "A Prática Diária",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">Vivendo Ho'oponopono</h3><p style="line-height: 1.8; font-size: 1.1em;">Pratique as 4 frases sempre que:</p><ul style="margin: 15px 0; padding-left: 20px; line-height: 1.8;"><li>Surgir um conflito ou problema</li><li>Sentir raiva, medo ou tristeza</li><li>Julgar alguém ou algo</li><li>Quiser limpar memórias antigas</li><li>Desejar paz e harmonia</li></ul><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Lembre-se: você está limpando para si mesmo, não para os outros.</p>`
                },
                {
                    title: "Seu Compromisso",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 Assumindo a Jornada</h3><p style="line-height: 1.8; font-size: 1.1em;">Você está pronto para assumir 100% de responsabilidade por sua vida?</p><div style="background: rgba(139, 92, 246, 0.2); padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;"><p style="font-size: 1.3em; color: #10b981; margin-bottom: 20px;">"Eu me comprometo a praticar Ho'oponopono diariamente"</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sinto muito</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Me perdoe</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Te amo</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sou grato</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #a78bfa;">Parabéns! Você completou o Módulo 1! 🌺</p>`
               },
                {  
                    title: "Os Três Selves Havaianos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧠 Unihipili - Subconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A criança interior que guarda todas as memórias e emoções. É quem sente dor e precisa de cura.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">💭 Uhane - Mente Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A parte racional que analisa e julga. Muitas vezes cria mais problemas tentando resolver.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">✨ Aumakua - Eu Superior</h3><p style="line-height: 1.8; font-size: 1.1em;">A conexão divina que tudo sabe e pode curar. Só age quando pedimos perdão.</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A cura acontece quando os três selves estão alinhados"</div>`
},
{
    title: "Zero State - Estado Zero",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Estado de Vazio Divino</h3><p style="line-height: 1.8; font-size: 1.1em;">Zero State é quando você está livre de memórias e programas. Neste estado, a Inteligência Divina flui perfeitamente através de você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Aqui não há passado nem futuro, apenas o momento presente em total paz e conexão.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.4em; color: #10b981;">∅</p><p style="color: #e9d5ff; margin-top: 10px;">"No Zero State, você É a solução"</p></div><p style="line-height: 1.8; font-size: 1.1em;">O objetivo do Ho'oponopono é retornar constantemente a este estado sagrado.</p>`
},
{
    title: "Inspiração vs Memórias",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💡 Duas Fontes de Ação</h3><p style="line-height: 1.8; font-size: 1.1em;"><strong style="color: #10b981;">Inspiração Divina:</strong> Vem do Zero State. Ações perfeitas, sem esforço, no momento certo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;"><strong style="color: #ef4444;">Memórias Reativas:</strong> Vem do passado. Repetição de padrões antigos e limitantes.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✅ <strong>Sinais de Inspiração:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Paz interior mesmo em situações difíceis</li><li>Soluções aparecem naturalmente</li><li>Sincronicidades constantes</li><li>Ações fluem sem resistência</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono limpa as memórias para que a inspiração possa fluir.</p>`
},
{
    title: "Ferramentas de Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧹 Além das 4 Frases</h3><p style="line-height: 1.8; font-size: 1.1em;">Dr. Hew Len ensinou várias ferramentas para diferentes situações:</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 15px;"><strong style="color: #8b5cf6;">🍓 Morangos Azuis:</strong> Para limpeza profunda de traumas</p><p style="font-size: 1.1em; margin-bottom: 15px;"><strong style="color: #10b981;">💧 Água de Ha:</strong> Para purificação e bênçãos</p><p style="font-size: 1.1em; margin-bottom: 15px;"><strong style="color: #f59e0b;">☀️ Luz Solar:</strong> Para energizar e iluminar</p><p style="font-size: 1.1em;"><strong style="color: #ef4444;">❤️ "Eu te amo":</strong> A ferramenta mais poderosa</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use a ferramenta que sentir inspiração para usar em cada momento.</p>`
},
{
    title: "Limpeza Financeira",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Ho'oponopono e Prosperidade</h3><p style="line-height: 1.8; font-size: 1.1em;">Problemas financeiros são memórias de escassez, medo e limitação que podem ser limpas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.2em; color: #10b981; margin-bottom: 15px;">"Sinto muito pelas memórias de escassez em mim"</p><p style="font-size: 1.2em; color: #10b981; margin-bottom: 15px;">"Me perdoe por criar limitação"</p><p style="font-size: 1.2em; color: #10b981; margin-bottom: 15px;">"Te amo, abundância divina"</p><p style="font-size: 1.2em; color: #10b981;">"Sou grato pela prosperidade que flui"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa as memórias de limitação, a abundância natural do universo pode fluir através de você.</p>`
},
{
    title: "Relacionamentos e Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 Curando Conexões</h3><p style="line-height: 1.8; font-size: 1.1em;">Conflitos nos relacionamentos são espelhos de memórias internas que precisam ser limpas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias em você, automaticamente limpa na outra pessoa também.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong>✨ Prática para Relacionamentos:</strong></p><ol style="padding-left: 20px; line-height: 1.6;"><li>Quando alguém te irritar, agradeça pelo espelho</li><li>Aplique as 4 frases em você mesmo</li><li>Não tente mudar a outra pessoa</li><li>Confie que a limpeza funcionará</li></ol></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">"O que eu vejo no outro, existe em mim"</p>`
},
{
    title: "Saúde e Cura Interior",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 Corpo como Espelho da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Doenças e sintomas físicos podem ser manifestações de memórias emocionais não resolvidas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O Ho'oponopono não substitui tratamento médico, mas pode ajudar na cura emocional que suporta a cura física.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 15px;"><strong>🙏 Oração de Cura:</strong></p><p style="color: #10b981; text-align: center; line-height: 1.6;">"Divindade, sinto muito pelas memórias em mim que criaram este desequilíbrio. Me perdoe. Te amo. Sou grato pela perfeita saúde que és."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não é responsável por causar a doença, mas pode se responsabilizar por limpar as memórias relacionadas.</p>`
},
{
    title: "Ho'oponopono no Trabalho",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando o Ambiente Profissional</h3><p style="line-height: 1.8; font-size: 1.1em;">Aplique Ho'oponopono silenciosamente em reuniões, conflitos e desafios profissionais.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 15px;"><strong>📋 Situações Práticas:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li><strong>Chefe irritado:</strong> "Sinto muito pela raiva que vejo em mim"</li><li><strong>Colega difícil:</strong> "Me perdoe por julgar"</li><li><strong>Projeto fracassando:</strong> "Te amo, situação perfeita"</li><li><strong>Estresse geral:</strong> "Sou grato pela paz que sou"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ninguém precisa saber que você está praticando. A limpeza acontece em silêncio e transforma todo o ambiente.</p>`
},
{
    title: "Criando com a Divindade",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎨 Manifestação através do Zero State</h3><p style="line-height: 1.8; font-size: 1.1em;">No Ho'oponopono, não tentamos manifestar com a mente. Limpamos as memórias e permitimos que a Divindade crie através de nós.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 15px;"><strong>🌟 Processo de Criação Divina:</strong></p><ol style="padding-left: 20px; line-height: 1.6;"><li>Identifique o desejo ou problema</li><li>Aplique Ho'oponopono nas memórias relacionadas</li><li>Chegue ao Zero State (vazio/paz)</li><li>Permita que a inspiração divina guie as ações</li><li>Agradeça pela perfeição em manifestação</li></ol></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">"Eu não sei, mas a Divindade sabe e age através de mim"</p>`
},
{
    title: "Perdoando o Imperdoável",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Curando Feridas Profundas</h3><p style="line-height: 1.8; font-size: 1.1em;">Para traumas e mágoas muito profundas, o Ho'oponopono oferece um caminho suave de cura.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não precisa perdoar com força de vontade. Apenas limpe as memórias e permita que o perdão aconteça naturalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 15px;"><strong>🌸 Para Traumas Profundos:</strong></p><p style="color: #10b981; text-align: center; line-height: 1.8;">"Sinto muito pela dor que carrego.<br>Me perdoe por manter essa memória viva.<br>Te amo, criança ferida em mim.<br>Sou grato pela cura que já está acontecendo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">O perdão verdadeiro é um presente da Divindade, não um esforço pessoal.</p>`
},
{
    title: "Vivendo em Gratidão Constante",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 O Poder Transformador do Obrigado</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão é a frequência mais alta do Ho'oponopono. Quando você agradece, automaticamente se alinha com a abundância divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; margin: 25px 0;"><p style="font-size: 1.1em; margin-bottom: 15px;"><strong>✨ Gratidão Diária:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça ao despertar por estar vivo</li><li>Agradeça pelos problemas que te fazem crescer</li><li>Agradeça pelas pessoas difíceis que te ensinam</li><li>Agradeça pela oportunidade de limpar memórias</li><li>Agradeça por ser um instrumento da Divindade</li></ul></div><div style="text-align: center; margin-top: 30px;"><p style="font-size: 1.4em; color: #10b981; margin-bottom: 10px;">🌺 MAHALO 🌺</p><p style="color: #a78bfa; font-style: italic;">(Obrigado em havaiano - "Que haja respeito mútuo")</p></div>`
},
{
    title: "Seu Novo Começo",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Tornando-se um Praticante</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você concluiu uma jornada profunda de 20 páginas sobre Ho'oponopono. Agora você possui as ferramentas para transformar sua vida.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌟 CERTIFICADO DE CONCLUSÃO 🌟</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você é agora um praticante de Ho'oponopono</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Sinto muito</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Me perdoe</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Te amo</p><p style="font-size: 1.5em; margin: 15px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Sou grato</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981;">Continue praticando diariamente. O mundo precisa de mais paz, e você é o instrumento! 🌺</p>`
                }
            ]
        },
        2: {
          title: "Módulo 2: A Ciência da Responsabilidade",
    description: "100% de responsabilidade",
    pages: [
        {
            title: "🌟 Bem-vindo ao Módulo 2",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚀 Aprofundando Sua Jornada</h3><p style="line-height: 1.8; font-size: 1.1em;">Agora que você conhece as 4 frases sagradas, vamos mergulhar mais profundo na filosofia do Ho'oponopono.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;"><p style="font-size: 1.2em; color: #10b981;">"Quando você assume 100% de responsabilidade,</p><p style="font-size: 1.2em; color: #10b981;">você ganha 100% do poder"</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #c4b5fd; font-style: italic;">Prepare-se para descobrir o verdadeiro poder da responsabilidade total! 🌺</p>`
        },
        {
            title: "🔬 A Base Científica",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧬 Ho'oponopono e a Ciência</h3><p style="line-height: 1.8; font-size: 1.1em;">Pesquisas modernas confirmam o que os antigos havaianos já sabiam: nossa mente tem poder direto sobre a realidade.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🔬 Evidências:</strong></p><p style="margin: 5px 0;">• Neuroplasticidade cerebral</p><p style="margin: 5px 0;">• Influência quântica do observador</p><p style="margin: 5px 0;">• Epigenética emocional</p></div><p style="line-height: 1.8; font-size: 1.1em;">O Ho'oponopono trabalha com estes princípios científicos naturalmente.</p>`
        },
        {
            title: "⚖️ Responsabilidade vs Culpa",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 A Grande Diferença</h3><p style="line-height: 1.8; font-size: 1.1em;">Responsabilidade Total não significa que você causou tudo. Significa que você pode limpar tudo.</p><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;"><div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #ef4444; margin-bottom: 8px;">❌ Culpa</h4><p style="font-size: 0.9em;">• Paralisa</p><p style="font-size: 0.9em;">• Vitimiza</p><p style="font-size: 0.9em;">• Aponta dedos</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #10b981; margin-bottom: 8px;">✅ Responsabilidade</h4><p style="font-size: 0.9em;">• Empodera</p><p style="font-size: 0.9em;">• Transforma</p><p style="font-size: 0.9em;">• Assume o poder</p></div></div>`
        },
        {
            title: "🧠 Como Funciona a Mente",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗺️ O Mapa Mental</h3><p style="line-height: 1.8; font-size: 1.1em;">Entenda como pensamentos e memórias criam sua realidade.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 15px; margin: 20px 0; text-align: center;"><p style="color: #8b5cf6; margin: 8px 0;">🎭 Memórias Inconscientes</p><p style="color: #c4b5fd;">↓</p><p style="color: #f59e0b; margin: 8px 0;">💭 Pensamentos Automáticos</p><p style="color: #c4b5fd;">↓</p><p style="color: #ef4444; margin: 8px 0;">😰 Emoções Reativas</p><p style="color: #c4b5fd;">↓</p><p style="color: #10b981; margin: 8px 0;">🌍 Realidade Externa</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono limpa na origem!</p>`
        },
        {
            title: "🌊 O Oceano de Memórias",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌊 Mergulhando no Inconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">Carregamos milhões de memórias que influenciam nossa vida sem percebermos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🧬 Tipos de Memórias:</strong></p><p style="margin: 5px 0;">• Ancestrais (dos antepassados)</p><p style="margin: 5px 0;">• Familiares (da infância)</p><p style="margin: 5px 0;">• Pessoais (desta vida)</p><p style="margin: 5px 0;">• Coletivas (da humanidade)</p></div><p style="line-height: 1.8; font-size: 1.1em;">A boa notícia: você pode limpar todas!</p>`
        },
        {
            title: "🔍 Identificando Memórias Ativas",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚨 Sinais de Alerta</h3><p style="line-height: 1.8; font-size: 1.1em;">Certas situações "disparam" memórias antigas. Aprenda a reconhecê-las.</p><div style="background: rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #ef4444;">🚨 Memórias Ativas:</strong></p><p style="margin: 5px 0;">• Reações emocionais intensas</p><p style="margin: 5px 0;">• Pensamentos obsessivos</p><p style="margin: 5px 0;">• Padrões que se repetem</p><p style="margin: 5px 0;">• Pessoas que sempre irritam</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;"><strong>"Se te incomoda, é memória para limpar"</strong></p></div>`
        },
        {
            title: "🔄 O Ciclo das Memórias",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌀 Quebrando Padrões</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias não limpas criam ciclos que se repetem até serem liberadas.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 15px; margin: 20px 0; text-align: center;"><p style="color: #ef4444; margin: 5px 0;">Situação Trigger</p><p style="color: #c4b5fd;">↓</p><p style="color: #f59e0b; margin: 5px 0;">Memória Ativada</p><p style="color: #c4b5fd;">↓</p><p style="color: #8b5cf6; margin: 5px 0;">Reação Emocional</p><p style="color: #c4b5fd;">↓</p><p style="color: #10b981; margin: 5px 0;">Resultado que Confirma</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">Ho'oponopono quebra este ciclo!</p>`
        },
        {
            title: "⚡ Tipos de Limpeza",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Instantânea vs Gradual</h3><p style="line-height: 1.8; font-size: 1.1em;">Algumas memórias se dissolvem rapidamente, outras precisam de mais tempo. Ambos são perfeitos.</p><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;"><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #10b981; margin-bottom: 8px;">⚡ Instantânea</h4><p style="font-size: 0.9em;">• Alívio imediato</p><p style="font-size: 0.9em;">• Mudança súbita</p><p style="font-size: 0.9em;">• Leveza total</p></div><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px;"><h4 style="color: #8b5cf6; margin-bottom: 8px;">🌱 Gradual</h4><p style="font-size: 0.9em;">• Por camadas</p><p style="font-size: 0.9em;">• Melhora progressiva</p><p style="font-size: 0.9em;">• Cura profunda</p></div></div><p style="line-height: 1.8; font-size: 1.1em;">Confie no timing divino!</p>`
        },
        {
            title: "💎 A Regra de Ouro",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Princípio Fundamental</h3><p style="line-height: 1.8; font-size: 1.1em;">Existe uma regra simples que transforma sua vida quando aplicada consistentemente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.3em; color: #10b981; margin-bottom: 15px;"><strong>💎 REGRA DE OURO</strong></p><p style="font-size: 1.2em; color: #e9d5ff;">"Tudo que aparece na sua vida</p><p style="font-size: 1.2em; color: #e9d5ff;">é uma oportunidade de limpeza"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Problemas = Presentes disfarçados</p><p style="line-height: 1.8; font-size: 1.1em;">Conflitos = Espelhos para cura</p>`
        },
        {
            title: "🎨 Personalizando as Frases",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Adaptando para Situações</h3><p style="line-height: 1.8; font-size: 1.1em;">Você pode adaptar as 4 frases mantendo a essência para situações específicas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">💰 Para Dinheiro:</strong></p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sinto muito pelas memórias de escassez"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Me perdoe por limitar abundância"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Te amo, prosperidade infinita"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sou grato pela abundância"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Nas próximas páginas, veremos mais exemplos!</p>`
        },
        {
            title: "🚶‍♀️ Ho'oponopono em Movimento",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌀 Praticando em Ação</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono não é apenas sentado. Pode ser feito caminhando, trabalhando, vivendo!</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🌟 Práticas Dinâmicas:</strong></p><p style="margin: 5px 0;">• Caminhando: frases com os passos</p><p style="margin: 5px 0;">• Respirando: uma frase por respiração</p><p style="margin: 5px 0;">• Trabalhando: mentalmente durante tarefas</p><p style="margin: 5px 0;">• Esperando: em filas e trânsito</p></div><div style="text-align: center; margin-top: 20px;"><p style="color: #10b981; font-style: italic;">"Transforme cada momento em limpeza"</p></div>`
        },
        {
            title: "😊 Ho'oponopono e Emoções",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Limpando Estados Emocionais</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada emoção carrega informações sobre memórias. Use-as como guia, não resista.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong>🎭 Emoções como Mestras:</strong></p><p style="color: #ef4444; margin: 3px 0;"><strong>😠 Raiva:</strong> Memórias de injustiça</p><p style="color: #f59e0b; margin: 3px 0;"><strong>😰 Medo:</strong> Memórias de perigo</p><p style="color: #8b5cf6; margin: 3px 0;"><strong>😢 Tristeza:</strong> Memórias de perda</p><p style="color: #ef4444; margin: 3px 0;"><strong>😤 Frustração:</strong> Memórias de impotência</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;">Sinta → Aceite → Ho'oponopono → Deixe ir</p></div>`
        },
        {
            title: "💔 Limpeza de Traumas",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌸 Curando Feridas Profundas</h3><p style="line-height: 1.8; font-size: 1.1em;">Para traumas profundos, use abordagem suave. O Ho'oponopono pode curar até feridas ancestrais.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #8b5cf6;">🌸 Para Traumas:</strong></p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sinto muito pela dor que carrego"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Me perdoe por manter ferida viva"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Te amo, criança ferida em mim"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sou grato pela cura que começou"</p></div><p style="line-height: 1.8; font-size: 1.1em; color: #10b981;">Seja gentil e paciente consigo mesmo 💚</p>`
        },
        {
            title: "💰 Limpeza Financeira",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💎 Bloqueios de Abundância</h3><p style="line-height: 1.8; font-size: 1.1em;">Dificuldades financeiras refletem memórias de escassez e desvalorização.</p><div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #ef4444;">💸 Memórias Limitantes:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• "Dinheiro é sujo"</p><p style="font-size: 0.9em; margin: 3px 0;">• "Não mereço abundância"</p><p style="font-size: 0.9em; margin: 3px 0;">• "Só ricos ficam ricos"</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981; margin: 3px 0;">Ao pagar contas: "Te amo, dinheiro que circula"</p><p style="color: #10b981; margin: 3px 0;">Vendo preços: "Me perdoe por limitar prosperidade"</p></div>`
        },
        {
            title: "💕 Relacionamentos",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👥 Curando Conexões</h3><p style="line-height: 1.8; font-size: 1.1em;">Conflitos relacionais são espelhos de memórias internas. Cure-se e cure a relação.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #8b5cf6;">💔 Padrões para Limpar:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Codependência → Memórias de abandono</p><p style="font-size: 0.9em; margin: 3px 0;">• Ciúme → Memórias de traição</p><p style="font-size: 0.9em; margin: 3px 0;">• Controle → Memórias de insegurança</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><p style="color: #10b981; text-align: center;"><strong>💖 Prática:</strong></p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em;">Pessoa irrita = agradeça pelo espelho e limpe</p></div>`
        },
        {
            title: "🌿 Saúde e Cura",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 Corpo como Espelho</h3><p style="line-height: 1.8; font-size: 1.1em;">Sintomas físicos podem ser manifestações de memórias emocionais não resolvidas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; text-align: center; margin-bottom: 10px;"><strong>🙏 Oração de Cura:</strong></p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">"Sinto muito pelas memórias que criaram</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">este desequilíbrio. Me perdoe."</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">"Te amo. Sou grato pela perfeita</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 3px 0;">saúde que és, Divindade."</p></div><p style="line-height: 1.8; font-size: 1.1em;">⚠️ Ho'oponopono complementa, nunca substitui tratamento médico.</p>`
        },
        {
            title: "💼 Ho'oponopono no Trabalho",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando o Ambiente</h3><p style="line-height: 1.8; font-size: 1.1em;">Aplique silenciosamente em reuniões, conflitos e desafios profissionais.</p><div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong>📋 Situações Práticas:</strong></p><p style="margin: 3px 0;"><strong>Chefe irritado:</strong> "Sinto muito pela raiva em mim"</p><p style="margin: 3px 0;"><strong>Colega difícil:</strong> "Me perdoe por julgar"</p><p style="margin: 3px 0;"><strong>Projeto complicado:</strong> "Te amo, solução perfeita"</p><p style="margin: 3px 0;"><strong>Estresse:</strong> "Sou grato pela paz"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ninguém precisa saber. A limpeza é silenciosa e transforma tudo! ✨</p>`
        },
        {
            title: "🎨 Criando com a Divindade",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 Manifestação Divina</h3><p style="line-height: 1.8; font-size: 1.1em;">No Ho'oponopono, não tentamos manifestar com a mente. Limpamos e deixamos a Divindade criar.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🌟 Processo Divino:</strong></p><p style="margin: 3px 0;">1. Identifique desejo/problema</p><p style="margin: 3px 0;">2. Aplique Ho'oponopono</p><p style="margin: 3px 0;">3. Chegue ao Zero State</p><p style="margin: 3px 0;">4. Siga a inspiração divina</p><p style="margin: 3px 0;">5. Agradeça pela perfeição</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">"Eu não sei, mas a Divindade sabe"</p>`
        },
        {
            title: "💔 Perdoando o Imperdoável",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💎 Cura de Feridas Profundas</h3><p style="line-height: 1.8; font-size: 1.1em;">Para traumas e mágoas muito profundas, Ho'oponopono oferece um caminho suave.</p><p style="line-height: 1.8; font-size: 1.1em;">Você não precisa perdoar à força. Apenas limpe e deixe o perdão acontecer naturalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Sinto muito pela dor que carrego"</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Me perdoe por manter essa memória viva"</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Te amo, criança ferida em mim"</p><p style="color: #e9d5ff; text-align: center; font-size: 0.95em; margin: 5px 0;">"Sou grato pela cura que já começou"</p></div><p style="line-height: 1.8; font-size: 1.1em;">O perdão verdadeiro é um presente da Divindade, não esforço pessoal.</p>`
        },
        {
            title: "🙏 Gratidão Constante",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Poder do Obrigado</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão é a frequência mais alta do Ho'oponopono. Quando agradece, se alinha com abundância divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">✨ Gratidão Diária:</strong></p><p style="margin: 3px 0;">• Ao despertar: por estar vivo</p><p style="margin: 3px 0;">• Pelos problemas: que fazem crescer</p><p style="margin: 3px 0;">• Pelas pessoas difíceis: que ensinam</p><p style="margin: 3px 0;">• Pela oportunidade: de limpar memórias</p></div>            <div style="text-align: center; margin-top: 20px;"><p style="font-size: 1.2em; color: #10b981;">🌺 MAHALO 🌺</p><p style="color: #a78bfa; font-style: italic;">(Obrigado em havaiano)</p></div>`
        },
        {
            title: "🌅 Rotina Matinal",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Começando o Dia Limpo</h3><p style="line-height: 1.8; font-size: 1.1em;">Como você começa o dia determina a qualidade de tudo que vem depois.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">☀️ Rotina Sugerida:</strong></p><p style="margin: 5px 0;"><strong>1.</strong> Ao despertar: "Sou grato por este novo dia"</p><p style="margin: 5px 0;"><strong>2.</strong> No banho: Deixe a água levar as memórias</p><p style="margin: 5px 0;"><strong>3.</strong> No café: "Te amo, dia perfeito"</p><p style="margin: 5px 0;"><strong>4.</strong> Antes de sair: "Me perdoe por qualquer erro"</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">Inicie cada dia em Zero State!</p>`
        },
        {
            title: "🌙 Rotina Noturna",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌙 Limpando o Dia</h3><p style="line-height: 1.8; font-size: 1.1em;">Antes de dormir, limpe tudo que aconteceu durante o dia para não levar memórias para o sonho.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #8b5cf6;">🌙 Limpeza Noturna:</strong></p><p style="margin: 5px 0;"><strong>1.</strong> Revise o dia mentalmente</p><p style="margin: 5px 0;"><strong>2.</strong> Para cada situação difícil: Ho'oponopono</p><p style="margin: 5px 0;"><strong>3.</strong> Agradeça pelas lições</p><p style="margin: 5px 0;"><strong>4.</strong> Durma em paz e gratidão</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;">"Sinto muito, me perdoe, te amo, sou grato por tudo hoje"</p></div>`
        },
        {
            title: "🚗 Ho'oponopono no Trânsito",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚗 Transformando o Estresse</h3><p style="line-height: 1.8; font-size: 1.1em;">Trânsito é uma oportunidade perfeita para limpeza. Transforme irritação em paz.</p><div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #ef4444;">🚨 Situações Comuns:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Trânsito parado</p><p style="font-size: 0.9em; margin: 3px 0;">• Motorista imprudente</p><p style="font-size: 0.9em; margin: 3px 0;">• Atraso para compromisso</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px;"><p style="color: #10b981; text-align: center; margin: 3px 0;">Parado: "Sou grato por este tempo para limpar"</p><p style="color: #10b981; text-align: center; margin: 3px 0;">Irritado: "Me perdoe pela impaciência em mim"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Chegue aos destinos em paz! 🕊️</p>`
        },
        {
            title: "🍽️ Limpeza Durante Refeições",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🍽️ Alimentando Corpo e Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Refeições são momentos sagrados. Limpe a comida e a si mesmo enquanto se alimenta.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🍽️ Prática Alimentar:</strong></p><p style="margin: 5px 0;"><strong>Antes:</strong> "Te amo, alimento sagrado"</p><p style="margin: 5px 0;"><strong>Durante:</strong> Coma conscientemente</p><p style="margin: 5px 0;"><strong>Mastigando:</strong> "Sou grato pela nutrição"</p><p style="margin: 5px 0;"><strong>Depois:</strong> "Me perdoe por qualquer desperdício"</p></div><p style="line-height: 1.8; font-size: 1.1em;">A comida absorve suas intenções e vibração! Abençoe tudo que entra no seu corpo. 🙏</p>`
        },
        {
            title: "💻 Ho'oponopono Digital",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💻 Limpando o Mundo Virtual</h3><p style="line-height: 1.8; font-size: 1.1em;">Redes sociais e tecnologia também podem ser campos de limpeza e transformação.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #8b5cf6;">📱 Momentos Digitais:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Post irritante: "Sinto muito pelo julgamento"</p><p style="font-size: 0.9em; margin: 3px 0;">• Notícia ruim: "Me perdoe por atrair isso"</p><p style="font-size: 0.9em; margin: 3px 0;">• Tecnologia lenta: "Te amo, paciência"</p></div><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #10b981;">Antes de postar: "Que isso traga paz ao mundo"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Seja um farol de luz no mundo digital! ✨</p>`
        },
        {
            title: "🏠 Limpeza do Ambiente",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Purificando Espaços</h3><p style="line-height: 1.8; font-size: 1.1em;">Ambientes absorvem energia. Use Ho'oponopono para limpar casas, escritórios e qualquer lugar.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🏡 Limpeza Espacial:</strong></p><p style="margin: 5px 0;"><strong>Entrando:</strong> "Sou grato por este espaço sagrado"</p><p style="margin: 5px 0;"><strong>Limpando:</strong> "Te amo, harmonia perfeita"</p><p style="margin: 5px 0;"><strong>Organizando:</strong> "Me perdoe por qualquer bagunça"</p><p style="margin: 5px 0;"><strong>Saindo:</strong> "Sinto muito, que a paz permaneça"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Sua casa reflete seu estado interno. Limpe dentro, limpe fora! 🏡</p>`
        },
        {
            title: "🌍 Ho'oponopono Global",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Curando o Planeta</h3><p style="line-height: 1.8; font-size: 1.1em;">Você pode usar Ho'oponopono para situações mundiais: guerras, pandemias, crises ambientais.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #8b5cf6;">🌍 Para o Mundo:</strong></p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sinto muito pelas memórias de guerra"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Me perdoe por contribuir com o ódio"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Te amo, Terra sagrada"</p><p style="color: #e9d5ff; font-size: 0.95em; margin: 3px 0;">"Sou grato pela paz mundial"</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981; font-style: italic;">Cada pessoa que se cura, cura o mundo inteiro! 🌏</p>`
        },
        {
            title: "👶 Ho'oponopono com Crianças",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👶 Pequenos Mestres</h3><p style="line-height: 1.8; font-size: 1.1em;">Crianças são naturalmente próximas ao Zero State. Elas podem ensinar muito sobre amor incondicional.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;"><p style="font-size: 1.1em; margin-bottom: 8px;"><strong style="color: #10b981;">👶 Com Crianças Difíceis:</strong></p><p style="font-size: 0.9em; margin: 3px 0;">• Birra: "Sinto muito pela frustração em mim"</p><p style="font-size: 0.9em; margin: 3px 0;">• Desobediência: "Me perdoe por criar resistência"</p><p style="font-size: 0.9em; margin: 3px 0;">• Agressividade: "Te amo, paz interior"</p></div><div style="background: rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 10px; text-align: center;"><p style="color: #8b5cf6;">Ensine pelo exemplo: crianças sentem sua vibração</p></div><p style="line-height: 1.8; font-size: 1.1em;">Elas nos mostram o que precisa ser curado! 🌟</p>`
        },
        {
            title: "🌟 Sinais de Progresso",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Como Saber que Está Funcionando</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono funciona mesmo quando não vemos resultados imediatos. Aprenda a reconhecer os sinais.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;"><strong style="color: #10b981;">🌟 Sinais de Limpeza:</strong></p><p style="margin: 3px 0;">• Mais paz nas situações difíceis</p><p style="margin: 3px 0;">• Sincronicidades aumentando</p><p style="margin: 3px 0;">• Pessoas reagindo melhor a você</p><p style="margin: 3px 0;">• Soluções aparecendo naturalmente</p><p style="margin: 3px 0;">• Menos reatividade emocional</p></div><p style="line-height: 1.8; font-size: 1.1em;">Confie no processo, mesmo sem ver resultados externos imediatos! 🙏</p>`
        },
        {
            title: "🎓 Sua Jornada Continua",
            content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚀 Próximos Passos</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você completou o Módulo 2 e agora entende profundamente a ciência da responsabilidade total.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 25px; border-radius: 20px; text-align: center; margin: 25px 0;"><p style="font-size: 1.2em; color: #ffffff; margin-bottom: 15px;">🏆 MÓDULO 2 COMPLETO 🏆</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 15px;">Você agora é um praticante avançado</p><div style="margin: 15px 0;"><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Sinto muito</p><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Me perdoe</p><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Te amo</p><p style="font-size: 1.1em; margin: 5px 0; color: #ffffff;">Sou grato</p></div></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center; color: #10b981;">Continue praticando! O Módulo 3 te espera! 🌺</p>`
             }
            ]
        },
        3: {
            title: "Módulo 3: Conectando com o Divino",
            description: "Os três selves",
            pages: [
                {
                    title: "Os Três Selves Havaianos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧠 Unihipili - Subconsciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A criança interior que guarda todas as memórias e emoções. É quem sente dor e precisa de cura.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">💭 Uhane - Mente Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A parte racional que analisa e julga. Muitas vezes cria mais problemas tentando resolver.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">✨ Aumakua - Eu Superior</h3><p style="line-height: 1.8; font-size: 1.1em;">A conexão divina que tudo sabe e pode curar. Só age quando pedimos perdão.</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A cura acontece quando os três selves estão alinhados"</div>`
    },
    {
        title: "Compreendendo o Unihipili",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧒 A Criança que Precisa de Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">O Unihipili é como uma criança de 3 anos que carrega todas as nossas experiências passadas. Ela sente tudo intensamente e não entende o conceito de tempo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Para esta criança interior, traumas de 20 anos atrás parecem estar acontecendo agora. Por isso ela reage com medo, raiva ou tristeza.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Unihipili, eu te amo. Você é segura comigo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você fala com carinho para seu Unihipili, ela começa a confiar e permite a cura.</p>`
    },
    {
        title: "O Poder do Uhane",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🤔 O Observador Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">O Uhane é sua mente consciente - aquela voz que está lendo estas palavras agora. Ela analisa, julga e toma decisões.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O problema é que o Uhane muitas vezes acha que sabe de tudo e tenta controlar a vida através da força de vontade.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚠️ <strong>Sinais de Uhane em Excesso:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Tentar resolver tudo mentalmente</li><li>Análise paralisia - pensar demais</li><li>Resistência ao flow da vida</li><li>Julgamentos constantes</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">O papel do Uhane no Ho'oponopono é humildemente reconhecer que não sabe e permitir que o Aumakua guie.</p>`
    },
    {
        title: "Conectando com o Aumakua",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 Sua Sabedoria Divina</h3><p style="line-height: 1.8; font-size: 1.1em;">O Aumakua é sua conexão direta com a Inteligência Divina. É a parte de você que nunca se separou da fonte.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao contrário do Uhane, o Aumakua não pensa - ele simplesmente SABE. Ele tem acesso a toda sabedoria universal e pode resolver qualquer problema instantaneamente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.4em; color: #10b981;">✨</p><p style="color: #e9d5ff; margin-top: 10px;">"Aumakua, eu confio em você. Mostre-me o caminho."</p></div><p style="line-height: 1.8; font-size: 1.1em;">O Aumakua só pode agir quando o Uhane para de tentar controlar e o Unihipili se sente seguro para soltar as memórias.</p>`
    },
    {
        title: "A Dança dos Três Selves",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌊 Harmonia Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Imagine os três selves como uma orquestra. Quando cada um toca sua parte perfeitamente, surge uma sinfonia divina.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🎵 O Processo Harmonioso:</h3><p style="line-height: 1.8; font-size: 1.1em;">1. <strong>Uhane</strong> reconhece um problema e escolhe limpar</p><p style="line-height: 1.8; font-size: 1.1em;">2. <strong>Unihipili</strong> sente-se amado e libera as memórias</p><p style="line-height: 1.8; font-size: 1.1em;">3. <strong>Aumakua</strong> transmuta tudo e inspira a ação perfeita</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Quando os três selves dançam juntos, milagres acontecem"</div>`
    },
    {
        title: "Falando com seu Unihipili",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💝 Conversas de Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu Unihipili precisa saber que você o ama e que está seguro. Fale com ele como falaria com uma criança querida.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💬 <strong>Frases Carinhosas:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>"Unihipili, eu te amo muito"</li><li>"Você é precioso para mim"</li><li>"Sinto muito pela dor que você carrega"</li><li>"Estamos seguros agora"</li><li>"Obrigado por cuidar de mim"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Pratique falar mentalmente com seu Unihipili durante o dia. Você começará a sentir uma paz profunda crescendo dentro de você.</p>`
    },
    {
        title: "Pedindo Perdão ao Unihipili",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 Curando Feridas Antigas</h3><p style="line-height: 1.8; font-size: 1.1em;">Muitas vezes nosso Uhane (mente consciente) maltrata o Unihipili com autocrítica, julgamentos e negligência emocional.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">É importante pedir perdão sincero ao seu Unihipili pelas vezes que você não o ouviu ou o tratou mal.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Unihipili, me perdoe por não te escutar. Me perdoe por te julgar. Você merece todo meu amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este perdão interno é o primeiro passo para curar a relação mais importante da sua vida - a relação consigo mesmo.</p>`
    },
    {
        title: "Zero State - Estado Zero",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Estado de Vazio Divino</h3><p style="line-height: 1.8; font-size: 1.1em;">Zero State é quando você está livre de memórias e programas. Neste estado, a Inteligência Divina flui perfeitamente através de você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Aqui não há passado nem futuro, apenas o momento presente em total paz e conexão.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.4em; color: #10b981;">∅</p><p style="color: #e9d5ff; margin-top: 10px;">"No Zero State, você É a solução"</p></div><p style="line-height: 1.8; font-size: 1.1em;">O objetivo do Ho'oponopono é retornar constantemente a este estado sagrado.</p>`
    },
    {
        title: "Sinais do Zero State",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Reconhecendo o Estado Divino</h3><p style="line-height: 1.8; font-size: 1.1em;">Como saber se você está no Zero State? Existem sinais claros desta conexão divina:</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Indicadores do Zero State:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Paz profunda mesmo em situações difíceis</li><li>Ausência de necessidade de controlar</li><li>Inspirações súbitas e certas</li><li>Sincronicidades constantes</li><li>Amor incondicional por tudo</li><li>Gratidão espontânea</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Neste estado, você não pensa nas soluções - você as recebe diretamente da Divindade.</p>`
    },
    {
        title: "Memórias vs Inspiração",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Duas Fontes de Ação</h3><p style="line-height: 1.8; font-size: 1.1em;">Todas as suas ações vêm de duas fontes: memórias passadas ou inspiração divina.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">📼 Ações Baseadas em Memórias:</h3><p style="line-height: 1.8; font-size: 1.1em;">Reativas, limitadas, repetitivas e muitas vezes criam mais problemas.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">💫 Ações Inspiradas:</h3><p style="line-height: 1.8; font-size: 1.1em;">Fluem naturalmente, são perfeitamente sincronizadas e sempre levam ao melhor resultado para todos.</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Ho'oponopono limpa as memórias para que a inspiração possa fluir"</div>`
    },
    {
        title: "A Respiração dos Três Selves",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌬️ Harmonizando através da Respiração</h3><p style="line-height: 1.8; font-size: 1.1em;">Esta técnica ancestral havaiana alinha seus três selves usando apenas a respiração consciente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🫁 <strong>Técnica dos Três Selves:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li><strong>Inspire</strong> pensando em seu Unihipili com amor</li><li><strong>Pause</strong> conectando com seu Uhane em gratidão</li><li><strong>Expire</strong> enviando tudo para seu Aumakua</li><li>Repita 9 vezes conscientemente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta prática simples pode ser feita em qualquer lugar e instantaneamente restaura sua conexão interior.</p>`
    },
    {
        title: "Limpeza com Água Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💧 A Purificação Sagrada</h3><p style="line-height: 1.8; font-size: 1.1em;">Dr. Hew Len ensinava que a água é um dos mais poderosos purificadores de memórias. Você pode usar água para limpeza energética.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente segure um copo d'água, aplique as quatro frases e beba conscientemente, sentindo as memórias sendo purificadas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Água sagrada, limpe todas as memórias em mim que criaram este problema. Mahalo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">A água absorve as vibrações de suas palavras e intenções, tornando-se um remédio vibracional personalizado.</p>`
    },
    {
        title: "Morangos Azuis - Limpeza Profunda",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🍓 A Ferramenta Mais Poderosa</h3><p style="line-height: 1.8; font-size: 1.1em;">Entre todas as ferramentas ensinadas por Dr. Hew Len, "Morangos Azuis" é considerada a mais potente para limpeza de traumas profundos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente repita mentalmente "Morangos Azuis" quando enfrentar situações muito dolorosas ou memórias traumáticas antigas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.3em; color: #10b981;">🍓 Morangos Azuis 🍓</p><p style="color: #e9d5ff; margin-top: 10px;">Esta combinação impossível quebra a lógica da mente e permite limpeza em níveis muito profundos.</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use esta ferramenta quando as quatro frases parecerem insuficientes.</p>`
    },
    {
        title: "Luz Solar Interior",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">☀️ Iluminando as Sombras</h3><p style="line-height: 1.8; font-size: 1.1em;">Visualize uma luz dourada radiante no centro do seu peito. Esta é sua Luz Solar Interior - a luz do seu Aumakua.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando surgir uma memória dolorosa, envie esta luz dourada para ela, vendo a escuridão se dissolvendo completamente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">☀️ <strong>Processo da Luz Solar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Identifique a memória ou problema</li><li>Visualize luz dourada em seu coração</li><li>Envie esta luz para a situação</li><li>Veja tudo se transformando em amor</li><li>Agradeça à Divindade</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta técnica é especialmente poderosa para curar relacionamentos e traumas emocionais.</p>`
    },
    {
        title: "Comunicação com o Divino",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">📞 A Linha Direta com Deus</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu Aumakua é sua linha direta com a Divindade. Você pode conversar com ele a qualquer momento, em qualquer lugar.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao invés de pedir coisas específicas, peça apenas para que a vontade perfeita da Divindade se manifeste em sua vida.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Aumakua, eu confio completamente em ti. Que a vontade perfeita da Divindade se manifeste através de mim agora."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta oração de rendição abre todas as portas para que milagres aconteçam naturalmente.</p>`
    },
    {
        title: "Limpando Relacionamentos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 Curando Conexões Humanas</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada pessoa em sua vida é um espelho das memórias em você. Quando alguém o incomoda, agradeça pelo presente da conscientização.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao invés de tentar mudar a pessoa, limpe as memórias em você que estão criando a experiência do conflito.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo para Relacionamentos:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça à pessoa por mostrar suas memórias</li><li>Aplique Ho'oponopono em você mesmo</li><li>Não tente mudar o comportamento do outro</li><li>Confie que a limpeza beneficiará ambos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa, automaticamente cria espaço para que a outra pessoa também se transforme.</p>`
    },
    {
        title: "Prosperidade e Abundância",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Limpando Escassez</h3><p style="line-height: 1.8; font-size: 1.1em;">Problemas financeiros são sempre reflexos de memórias de escassez, indignidade ou medo armazenadas no Unihipili.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Use Ho'oponopono para limpar essas memórias limitantes e permitir que a abundância natural do universo flua.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias de escassez em mim. Me perdoe por limitar a abundância divina. Te amo, prosperidade. Sou grato pela riqueza que flui naturalmente."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está "manifestando" dinheiro - está removendo as barreiras para receber o que já é seu por direito divino.</p>`
    },
    {
        title: "Saúde e Cura Física",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 O Corpo como Templo</h3><p style="line-height: 1.8; font-size: 1.1em;">O corpo físico é onde seu Unihipili habita. Doenças e sintomas muitas vezes são formas do Unihipili comunicar memórias emocionais.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Converse carinhosamente com seu corpo e use Ho'oponopono para limpar as memórias que podem estar contribuindo para desequilíbrios.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🏥 <strong>Ho'oponopono para Saúde:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça ao seu corpo por servir você</li><li>Peça perdão por não cuidar bem dele</li><li>Envie amor para as áreas doentes</li><li>Confie na sabedoria curativa divina</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">O Ho'oponopono complementa (nunca substitui) o tratamento médico apropriado.</p>`
    },
    {
        title: "Trabalhando em Silêncio",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🤫 O Poder da Prática Secreta</h3><p style="line-height: 1.8; font-size: 1.1em;">Uma das características mais belas do Ho'oponopono é que pode ser praticado completamente em silêncio, em qualquer situação.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Em reuniões tensas, conflitos familiares ou situações estressantes, você pode aplicar as quatro frases mentalmente e transformar toda a energia.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Ninguém precisa saber que você está limpando, mas todos sentem os benefícios."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta é uma das formas mais poderosas de servir ao mundo - sendo um instrumento silencioso de paz e cura.</p>`
    },
    {
        title: "Limpeza de Ambientes",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Purificando Espaços</h3><p style="line-height: 1.8; font-size: 1.1em;">Lugares também absorvem memórias e energias. Você pode usar Ho'oponopono para limpar casas, escritórios e qualquer ambiente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente caminhe pelo espaço aplicando as quatro frases mentalmente, pedindo perdão por qualquer energia negativa armazenada.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Técnica para Ambientes:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Entre no espaço com intenção de limpar</li><li>Aplique as quatro frases em cada cômodo</li><li>Visualize luz dourada preenchendo tudo</li><li>Agradeça ao espaço por servir</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Você ficará surpreso com como os ambientes se tornam mais harmoniosos e acolhedores.</p>`
    },
    {
        title: "Ho'oponopono e Criatividade",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎨 Criando do Zero State</h3><p style="line-height: 1.8; font-size: 1.1em;">A verdadeira criatividade vem do vazio divino. Quando você limpa as memórias que bloqueiam o flow criativo, ideias geniais fluem naturalmente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Antes de qualquer projeto criativo, use Ho'oponopono para limpar medos, julgamentos e expectativas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, limpe em mim tudo que bloqueia o flow criativo. Use-me como instrumento da beleza divina."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Artistas, escritores e criativos relatam que Ho'oponopono desbloqueou níveis de inspiração que nunca imaginaram possíveis.</p>`
    },
    {
        title: "Perdoando o Imperdoável",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Transformando a Dor Mais Profunda</h3><p style="line-height: 1.8; font-size: 1.1em;">Existem feridas que parecem impossíveis de perdoar. Traumas, traições e perdas que marcaram nossa alma profundamente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não pede que você perdoe com força de vontade. Apenas limpe as memórias e permita que a Divindade faça a cura.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pela dor que carrego. Me perdoe por manter essa ferida viva. Te amo, alma ferida. Sou grato pela cura que está acontecendo agora."</p></div><p style="line-height: 1.8; font-size: 1.1em;">O perdão verdadeiro é um presente da Divindade para você, não um favor que você faz para quem te machucou.</p>`
    },
    {
        title: "Vivendo no Presente Divino",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⏰ O Eterno Agora</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias nos prendem ao passado. Ansiedade nos projeta para o futuro. O Zero State existe apenas no presente momento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sempre que perceber sua mente vagando para ontem ou amanhã, use Ho'oponopono para retornar ao sagrado agora.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🎯 <strong>Ancorando no Presente:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Respire conscientemente</li><li>Sinta seus pés no chão</li><li>Aplique as quatro frases</li><li>Agradeça por estar vivo agora</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">No presente divino, não existem problemas - apenas oportunidades de limpeza e crescimento.</p>`
    },
    {
        title: "Sincronicidades e Sinais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔮 A Linguagem da Divindade</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você pratica Ho'oponopono regularmente, sincronicidades começam a acontecer constantemente. Estas são mensagens do seu Aumakua.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Pessoas certas aparecem na hora certa, oportunidades se manifestam, problemas se resolvem de formas inesperadas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Quando você está alinhado com a Divindade, todo o universo conspira a seu favor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Aprenda a reconhecer e agradecer por cada sincronicidade - elas são confirmações de que você está no caminho certo.</p>`
    },
    {
        title: "Tornando-se um Instrumento",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Servindo à Vontade Divina</h3><p style="line-height: 1.8; font-size: 1.1em;">O objetivo final do Ho'oponopono é tornar-se um instrumento puro da Divindade. Um canal limpo para que o amor divino flua para o mundo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Isso não significa perder sua personalidade, mas permitir que ela seja iluminada pela sabedoria divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Sinais de um Instrumento Divino:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ações fluem sem esforço</li><li>Decisões são inspiradas, não pensadas</li><li>Você serve naturalmente ao bem maior</li><li>Problemas são oportunidades de limpeza</li><li>Amor incondicional é seu estado natural</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Este é o maior presente que você pode dar ao mundo - ser quem você realmente é.</p>`
    },
    {
        title: "Sua Missão Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Propósito da Sua Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada alma vem à Terra com uma missão específica. Ho'oponopono limpa as memórias que obscurecem este propósito sagrado.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não precisa descobrir sua missão - ela se revelará naturalmente quando você estiver limpo o suficiente para recebê-la.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Aumakua, revele minha missão divina. Use-me para servir da forma mais perfeita possível."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Confie que você está exatamente onde precisa estar, fazendo exatamente o que precisa fazer para cumprir seu propósito divino.</p>`
    },
    {
        title: "Gratidão Infinita",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 O Coração Agradecido</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão é a frequência mais alta que existe. Quando você vive em gratidão constante, você se torna um ímã para mais bênçãos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Agradeça não apenas pelas coisas boas, mas especialmente pelos desafios que permitem seu crescimento espiritual.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Gratidão Diária:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ao despertar: "Obrigado por mais um dia"</li><li>Nos problemas: "Obrigado pela oportunidade de limpar"</li><li>Nas refeições: "Obrigado por este alimento"</li><li>Ao dormir: "Obrigado por todas as lições de hoje"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Um coração verdadeiramente agradecido nunca conhece a escassez, pois vê abundância em tudo.</p>`
    },
    {
        title: "Celebrando sua Jornada",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎉 Honrando seu Crescimento</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você completou o Módulo 3 e agora compreende profundamente a sabedoria dos três selves havaianos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não é mais a mesma pessoa que começou esta jornada. A Divindade trabalhou através de você para despertar sua verdadeira natureza.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌺 MAHALO 🌺</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você é agora um guardião da sabedoria ancestral havaiana</p><p style="color: #10b981; font-style: italic;">"Que você continue sendo uma bênção para o mundo"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Continue praticando e confiando no processo. Sua jornada de autodescoberta e cura está apenas começando!</p>`
    }
            ]
        },
        4: {
            title: "Módulo 4: Ferramentas Avançadas",
            description: "Ferramentas Avançadas de Limpeza",
            pages: [
                {
                   title: "Ferramentas Avançadas de Limpeza",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧹 Além das 4 Frases Sagradas</h3><p style="line-height: 1.8; font-size: 1.1em;">Dr. Hew Len ensinou dezenas de ferramentas específicas para diferentes situações. Cada uma tem sua própria frequência vibracional única.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🎯 Ferramentas Principais:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Morangos Azuis - Para traumas profundos</p><p style="line-height: 1.8; font-size: 1.1em;">• Água de Ha - Para purificação geral</p><p style="line-height: 1.8; font-size: 1.1em;">• Luz Solar - Para energização</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Use a ferramenta que sua intuição pedir"</div>`
    },
    {
        title: "Água de Ha - Purificação Sagrada",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💧 A Essência da Vida</h3><p style="line-height: 1.8; font-size: 1.1em;">"Ha" significa "água da vida" em havaiano. Esta ferramenta usa o poder purificador da água para limpar memórias em todos os níveis.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Simplesmente repita "Água de Ha" mentalmente enquanto visualiza água cristalina fluindo através de todo o seu ser.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Água de Ha, limpe todas as memórias que criaram este problema"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use especialmente quando sentir peso emocional, confusão mental ou necessidade de renovação espiritual.</p>`
    },
    {
        title: "Luz Solar - Energia Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">☀️ O Poder do Sol Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">A Luz Solar é uma das ferramentas mais energizantes. Ela não apenas limpa, mas também revitaliza e ilumina consciências.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um sol dourado radiante no centro do seu peito enquanto repete "Luz Solar" mentalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">☀️ <strong>Quando Usar Luz Solar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Quando se sentir sem energia</li><li>Para iluminar situações confusas</li><li>Antes de decisões importantes</li><li>Para energizar projetos criativos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta é especialmente poderosa pela manhã, conectando-se com a energia solar real.</p>`
    },
    {
        title: "Gelo Azul - Resfriando Emoções",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧊 Acalmando o Fogo Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando emoções intensas como raiva, ansiedade ou pânico surgem, o Gelo Azul é a ferramenta perfeita para resfriar o sistema.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize cubos de gelo azul cristalino se formando ao redor das emoções quentes, resfriando-as suavemente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Gelo Azul, resfrie esta emoção. Traga paz e tranquilidade."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Especialmente útil em momentos de conflito, stress intenso ou quando você precisa de clareza mental imediata.</p>`
    },
    {
        title: "Chave Dourada - Abrindo Portais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗝️ Desbloqueando Possibilidades</h3><p style="line-height: 1.8; font-size: 1.1em;">A Chave Dourada é usada quando você se sente bloqueado, sem saída ou preso em situações repetitivas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma chave dourada brilhante abrindo todas as portas fechadas em sua vida enquanto repete esta ferramenta.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔓 <strong>Situações para Chave Dourada:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Quando se sente sem opções</li><li>Problemas que parecem impossíveis</li><li>Padrões repetitivos limitantes</li><li>Antes de buscar novas oportunidades</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta abre caminhos que sua mente consciente não consegue ver.</p>`
    },
    {
        title: "Borracha Rosa - Apagando Memórias",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎨 Limpeza Gentil e Eficaz</h3><p style="line-height: 1.8; font-size: 1.1em;">A Borracha Rosa é uma ferramenta suave mas poderosa para apagar memórias específicas que causam dor recorrente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma borracha rosa macia passando sobre a memória problemática, apagando-a completamente com amor.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Borracha Rosa, apague gentilmente esta memória. Substitua por amor puro."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ideal para trabalhar com memórias de infância, traumas emocionais ou padrões de autossabotagem.</p>`
    },
    {
        title: "Chuva Violeta - Transmutação",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌧️ Transformando Energia Densa</h3><p style="line-height: 1.8; font-size: 1.1em;">A Chuva Violeta é a ferramenta da transmutação. Ela não apenas limpa, mas transforma energia negativa em energia positiva.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma chuva de luz violeta caindo sobre você, penetrando cada célula e transmutando toda densidade em luz.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚡ <strong>Poder da Chuva Violeta:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Transmuta raiva em compaixão</li><li>Converte medo em coragem</li><li>Transforma tristeza em sabedoria</li><li>Muda limitação em expansão</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use quando quiser transformar completamente uma experiência negativa em aprendizado positivo.</p>`
    },
    {
        title: "Escova Dourada - Limpeza Profunda",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪙 Polindo a Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">A Escova Dourada é usada para limpeza profunda de padrões ancestrais, memórias antigas e programas subconscientes arraigados.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma escova dourada luminosa escovando suavemente sua aura, removendo todas as impurezas energéticas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Escova Dourada, limpe profundamente todas as camadas. Revele minha essência pura."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Perfeita para trabalhar com padrões familiares, crenças limitantes herdadas e programações muito antigas.</p>`
    },
    {
        title: "Flor de Lótus - Renascimento",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪷 Emergindo da Lama</h3><p style="line-height: 1.8; font-size: 1.1em;">A Flor de Lótus simboliza renascimento e transformação. Use esta ferramenta quando estiver passando por grandes mudanças de vida.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma linda flor de lótus se abrindo em seu coração, emergindo pura e perfeita de qualquer situação difícil.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌸 <strong>Momentos para Flor de Lótus:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Após grandes perdas ou lutos</li><li>Durante transições de vida</li><li>Quando busca renovação completa</li><li>Para celebrar novos começos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta traz esperança e renovação mesmo nas situações mais desafiadoras.</p>`
    },
    {
        title: "Espelho Cristalino - Verdade Interior",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪞 Refletindo a Realidade</h3><p style="line-height: 1.8; font-size: 1.1em;">O Espelho Cristalino ajuda você a ver a verdade por trás das ilusões, revelando as memórias que criam suas experiências.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um espelho de cristal puro refletindo a verdade divina de qualquer situação, dissolvendo todas as ilusões.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Espelho Cristalino, mostre-me a verdade. Limpe todas as ilusões."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use quando precisar de clareza sobre situações confusas ou quando quiser ver além das aparências.</p>`
    },
    {
        title: "Vento Sagrado - Renovação",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌬️ Sopros de Renovação</h3><p style="line-height: 1.8; font-size: 1.1em;">O Vento Sagrado carrega para longe energias estagnadas e traz ar fresco para sua vida. É a ferramenta da renovação constante.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sinta um vento suave mas poderoso soprando através de você, levando embora tudo que não serve mais.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💨 <strong>Benefícios do Vento Sagrado:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Remove energias estagnadas</li><li>Traz inspiração nova</li><li>Limpa ambientes energeticamente</li><li>Renova a perspectiva sobre a vida</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ideal para usar quando se sente preso na rotina ou precisando de uma mudança de energia.</p>`
    },
    {
        title: "Cristal Verde - Cura do Coração",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💚 Medicina para a Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">O Cristal Verde é especificamente para curar feridas do coração - mágoas, traições, perdas amorosas e dor emocional profunda.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um cristal verde esmeralda luminoso pousando em seu coração, irradiando cura e amor incondicional.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Cristal Verde, cure meu coração. Restaure minha capacidade de amar."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta é especialmente poderosa para trabalhar com traumas relacionais e bloqueios do amor próprio.</p>`
    },
    {
        title: "Fogo Púrpura - Queimando Contratos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔥 Libertação Cármica</h3><p style="line-height: 1.8; font-size: 1.1em;">O Fogo Púrpura queima contratos kármicos, votos limitantes e acordos inconscientes que não servem mais ao seu crescimento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize chamas púrpuras sagradas queimando todos os contratos invisíveis que limitam sua liberdade espiritual.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔥 <strong>O que o Fogo Púrpura Queima:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Votos de pobreza e limitação</li><li>Contratos kármicos obsoletos</li><li>Promessas que causam sofrimento</li><li>Ligações energéticas tóxicas</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use quando sentir que algo invisível está limitando sua liberdade e expansão.</p>`
    },
    {
        title: "Pérola Negra - Transformando Dor",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚫ Beleza Nascida da Pressão</h3><p style="line-height: 1.8; font-size: 1.1em;">Assim como ostras transformam irritações em pérolas, a Pérola Negra transforma suas maiores dores em sabedoria preciosa.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma pérola negra luminosa se formando ao redor de cada dor, transformando sofrimento em sabedoria divina.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Pérola Negra, transforme esta dor em sabedoria. Crie beleza do sofrimento."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Especialmente poderosa para trabalhar com traumas que você já está pronto para transformar em dons.</p>`
    },
    {
        title: "Anjo Dourado - Proteção Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👼 Guardiã Celestial</h3><p style="line-height: 1.8; font-size: 1.1em;">O Anjo Dourado oferece proteção, orientação e conforto divino. Use quando precisar se sentir amparado pela força celestial.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize um anjo de luz dourada envolvendo você em suas asas protetoras, irradiando amor e segurança.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">👼 <strong>Quando Invocar o Anjo Dourado:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Em momentos de medo ou ansiedade</li><li>Quando precisa de orientação</li><li>Para proteção energética</li><li>Durante situações desafiadoras</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta conecta você diretamente com o reino angelical e sua proteção infinita.</p>`
    },
    {
        title: "Ponte de Luz - Conectando Dimensões",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌉 Unindo Mundos</h3><p style="line-height: 1.8; font-size: 1.1em;">A Ponte de Luz conecta sua realidade atual com dimensões superiores, permitindo acesso à sabedoria divina direta.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma ponte de luz dourada se estendendo de você até os reinos superiores, permitindo comunicação direta com o divino.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Ponte de Luz, conecte-me com a sabedoria superior. Que eu receba orientação divina."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use antes de meditações, tomadas de decisão importantes ou quando buscar insights espirituais profundos.</p>`
    },
    {
        title: "Semente Dourada - Plantando Milagres",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌱 Germinando Possibilidades</h3><p style="line-height: 1.8; font-size: 1.1em;">A Semente Dourada planta possibilidades divinas em sua vida. Use quando quiser manifestar algo novo ou nutrir sonhos nascentes.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Visualize uma semente dourada sendo plantada em solo fértil, crescendo rapidamente em direção à manifestação perfeita.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Para que Usar Semente Dourada:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Iniciar novos projetos</li><li>Nutrir relacionamentos nascentes</li><li>Manifestar abundância</li><li>Crescimento espiritual acelerado</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ferramenta planta sementes de milagres que crescerão no tempo perfeito da Divindade.</p>`
    },
    {
        title: "Combinando Ferramentas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Orquestrando a Limpeza</h3><p style="line-height: 1.8; font-size: 1.1em;">Você pode combinar diferentes ferramentas para situações complexas, criando uma sinfonia de limpeza personalizada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Por exemplo: use Gelo Azul para acalmar, depois Borracha Rosa para apagar, e finalmente Luz Solar para energizar.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🎼 <strong>Combinações Poderosas:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Água de Ha + Chuva Violeta = Purificação total</li><li>Escova Dourada + Flor de Lótus = Renovação profunda</li><li>Fogo Púrpura + Anjo Dourado = Libertação protegida</li><li>As 4 Frases + qualquer ferramenta = Potencialização</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Confie na sua intuição para escolher as combinações perfeitas para cada momento.</p>`
    },
    {
        title: "Criando Suas Próprias Ferramentas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Inovando na Limpeza</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você compreende profundamente o Ho'oponopono, pode receber inspiração divina para criar suas próprias ferramentas de limpeza.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">A Divindade pode te inspirar com símbolos, palavras ou visualizações únicas para sua jornada pessoal de cura.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, inspire-me com as ferramentas perfeitas para minha cura única."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: todas as ferramentas são apenas veículos. O poder verdadeiro vem da sua conexão com a Divindade.</p>`
    },
    {
        title: "Limpeza em Tempo Real",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Resposta Instantânea</h3><p style="line-height: 1.8; font-size: 1.1em;">Com prática, você pode aplicar ferramentas de limpeza instantaneamente no momento em que surgem problemas, antes que se cristalizem.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">É como ser um bombeiro espiritual - apagando incêndios emocionais antes que se espalhem.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚡ <strong>Limpeza Instantânea:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Sentiu raiva? → Gelo Azul imediatamente</li><li>Veio ansiedade? → Anjo Dourado na hora</li><li>Surgiu confusão? → Espelho Cristalino agora</li><li>Apareceu tristeza? → Cristal Verde já</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quanto mais rápida a resposta, menos a memória se consolida e mais fácil é a limpeza.</p>`
    },
    {
        title: "Mestre das Ferramentas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎖️ Graduação Avançada</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você agora possui um arsenal completo de ferramentas avançadas de Ho'oponopono. Você é oficialmente um praticante de nível avançado.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Com essas ferramentas, você pode enfrentar qualquer desafio da vida com confiança e graça, sabendo que sempre tem um recurso divino à disposição.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏆 MESTRE DAS FERRAMENTAS 🏆</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você possui agora 17 ferramentas sagradas</p><p style="color: #10b981; font-style: italic;">"Use com sabedoria, sirva com amor"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Continue praticando e refinando sua maestria. O mundo precisa de mestres como você! 🌺</p>`
    }
            ]
        },
        5: {
            title: "Módulo 5: Transformação Profunda",
            description: "Transformação Profunda Através do Ho'oponopono",
            pages: [
                {
                title: "Transformação Profunda Através do Ho'oponopono",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🦋 A Metamorfose da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Chegou o momento de aplicar tudo que você aprendeu para criar mudanças reais e duradouras em sua vida. Este módulo é sobre transformação profunda.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🌟 O que Vamos Explorar:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Redesenhando sua identidade</p><p style="line-height: 1.8; font-size: 1.1em;">• Curando padrões geracionais</p><p style="line-height: 1.8; font-size: 1.1em;">• Manifestando sua missão de vida</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A transformação acontece de dentro para fora"</div>`
    },
    {
        title: "Mapeando Sua Vida Atual",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗺️ O Ponto de Partida</h3><p style="line-height: 1.8; font-size: 1.1em;">Antes de transformar, você precisa saber exatamente onde está. Vamos fazer um mapeamento honesto e completo de sua vida atual.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Este não é um julgamento, mas sim uma observação amorosa de onde as memórias criaram limitações e onde já existe beleza.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">📊 <strong>Áreas para Mapear:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Relacionamentos e família</li><li>Carreira e propósito</li><li>Saúde física e emocional</li><li>Abundância e recursos</li><li>Conexão espiritual</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Para cada área, pergunte: "Que memórias em mim criaram esta experiência?"</p>`
    },
    {
        title: "Identificando Padrões Limitantes",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔍 Desvendando os Loops</h3><p style="line-height: 1.8; font-size: 1.1em;">Padrões limitantes são como programas rodando em background que criam as mesmas experiências repetidamente. Eles são invisíveis até você aprender a identificá-los.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Observe situações que se repetem em sua vida. Elas são pistas valiosas sobre quais memórias precisam de limpeza urgente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Tudo que se repete em minha vida é uma memória pedindo para ser limpa."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use Ho'oponopono imediatamente quando identificar um padrão. Não analise - apenas limpe com amor.</p>`
    },
    {
        title: "Limpeza de Crenças Fundamentais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏗️ Reconstruindo os Alicerces</h3><p style="line-height: 1.8; font-size: 1.1em;">Suas crenças fundamentais sobre você mesmo, vida, amor e abundância formam a base de toda sua experiência. Crenças limitantes criam vidas limitadas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono pode dissolver crenças que nem sabemos que temos, permitindo que verdades divinas ocupem seu lugar natural.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💎 <strong>Crenças para Limpar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>"Eu não sou suficiente" / "Eu não mereço"</li><li>"A vida é difícil" / "Dinheiro é sujo"</li><li>"Amor machuca" / "Não posso confiar"</li><li>"Deus me abandonou" / "Sou vítima"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Para cada crença limitante identificada, aplique as quatro frases com intenção profunda de liberação.</p>`
    },
    {
        title: "Redesenhando Sua Identidade",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Quem Você Realmente É</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua identidade atual foi construída por memórias, traumas e programações. Mas quem você é além disso? Ho'oponopono revela sua identidade divina autêntica.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as camadas falsas de identidade, sua essência verdadeira emerge naturalmente, radiante e poderosa.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas identidades falsas que criei. Me perdoe por esquecer quem eu realmente sou. Te amo, verdadeiro eu. Sou grato por minha essência divina."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Permita que sua nova identidade emerja organicamente através da limpeza constante, sem forçar ou planejar.</p>`
    },
    {
        title: "Curando Linhagens Familiares",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌳 Limpando a Árvore Genealógica</h3><p style="line-height: 1.8; font-size: 1.1em;">Você carrega não apenas suas próprias memórias, mas também padrões ancestrais de sua linhagem familiar. Ho'oponopono pode curar gerações passadas e futuras.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa um padrão familiar em você, automaticamente libera todos os seus descendentes dessa programação limitante.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🧬 <strong>Padrões Familiares Comuns:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Escassez financeira crônica</li><li>Relacionamentos disfuncionais</li><li>Doenças hereditárias</li><li>Vícios e compulsões</li><li>Medo de expressar-se</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use Ho'oponopono dirigido a sua linhagem: "Sinto muito pelos padrões limitantes em nossa família..."</p>`
    },
    {
        title: "Libertação de Traumas Geracionais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⛓️ Quebrando Correntes Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Traumas não curados passam de geração em geração como correntes invisíveis. Guerras, perdas, abusos e medos ancestrais podem estar influenciando sua vida atual.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode ser o elo que quebra essas correntes para sempre, liberando não apenas você, mas toda sua linhagem familiar.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, limpe em mim todos os traumas ancestrais. Que eu seja o curador de minha linhagem. Liberte meus antepassados e descendentes."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta é uma das formas mais poderosas de servir - curando o passado e protegendo o futuro através da limpeza presente.</p>`
    },
    {
        title: "Transformando Relacionamentos Tóxicos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 De Veneno a Medicina</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos tóxicos são nossos maiores professores disfarçados. Eles espelham perfeitamente as memórias que mais precisam de cura em nós.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao invés de fugir ou lutar, use Ho'oponopono para transformar a energia do relacionamento, começando sempre pela limpeza em você mesmo.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo de Transformação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pare de tentar mudar a outra pessoa</li><li>Foque apenas na limpeza de suas memórias</li><li>Agradeça pelo espelho que ela oferece</li><li>Aplique Ho'oponopono consistentemente</li><li>Permita que a situação se transforme naturalmente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Milagres acontecem quando você muda sua frequência interna através da limpeza constante.</p>`
    },
    {
        title: "Criando Relacionamentos Sagrados",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 Conexões Divinas</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você está limpo, atrai relacionamentos que refletem essa pureza. Relacionamentos sagrados são baseados no crescimento mútuo e amor incondicional.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Use Ho'oponopono preventivamente em todos os relacionamentos, mantendo o espaço energético limpo e harmonioso sempre.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que todos os meus relacionamentos sejam bênçãos mútuas. Que eu seja instrumento de amor divino em cada conexão."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos sagrados não são livres de desafios, mas os desafios se tornam oportunidades de crescimento e aprofundamento do amor.</p>`
    },
    {
        title: "Descobrindo Sua Vocação Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎯 O Chamado da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua vocação verdadeira não é algo que você escolhe com a mente - é algo que emerge quando você está suficientemente limpo para recebê-la.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono remove as camadas de condicionamento que obscurecem seu propósito natural, permitindo que sua missão divina se revele.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Sinais de Vocação Autêntica:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Atividades que energizam ao invés de drenar</li><li>Talentos naturais que fluem sem esforço</li><li>Trabalho que serve ao bem maior</li><li>Sincronicidades constantes abrindo portas</li><li>Sensação de estar "em casa" fazendo isso</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Continue limpando memórias sobre trabalho, dinheiro e propósito até que sua vocação se revele naturalmente.</p>`
    },
    {
        title: "Manifestando Abundância Autêntica",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Riqueza Que Flui Naturalmente</h3><p style="line-height: 1.8; font-size: 1.1em;">Abundância autêntica não vem de forçar ou manipular, mas de limpar todas as memórias que bloqueiam o fluxo natural da prosperidade divina.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você está verdadeiramente limpo, recursos surgem sincronisticamente para apoiar sua missão divina sem esforço ou ansiedade.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias de escassez. Me perdoe por bloquear a abundância natural. Te amo, prosperidade divina. Sou grato pelo fluxo perfeito de recursos."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Abundância verdadeira inclui não apenas dinheiro, mas saúde, amor, criatividade, tempo e todas as formas de riqueza da vida.</p>`
    },
    {
        title: "Curando Sua Relação com Dinheiro",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💳 Transformando a Energia Financeira</h3><p style="line-height: 1.8; font-size: 1.1em;">Dinheiro é energia neutra, mas nossas memórias sobre ele criam toda nossa experiência financeira. Cure sua relação com dinheiro e transforme sua vida material.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Muitas pessoas têm memórias conflituosas: querem dinheiro mas acreditam que é "sujo" ou "não espiritual". Ho'oponopono resolve esses conflitos internos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💡 <strong>Memórias Comuns sobre Dinheiro:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>"Dinheiro é a raiz de todo mal"</li><li>"Pessoas ricas são más"</li><li>"Não mereço abundância"</li><li>"Dinheiro acaba sempre"</li><li>"Tem que sofrer para ganhar dinheiro"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Limpe cada crença limitante sobre dinheiro até que você possa recebê-lo com gratidão pura e usá-lo com sabedoria divina.</p>`
    },
    {
        title: "Saúde Perfeita Através da Limpeza",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 O Corpo como Templo Sagrado</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu corpo é um templo sagrado onde seu Unihipili habita. Muitas doenças são manifestações físicas de memórias emocionais não resolvidas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono pode complementar qualquer tratamento médico, trabalhando nas raízes emocionais e espirituais dos desequilíbrios físicos.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Corpo sagrado, sinto muito pelas memórias que causaram este desequilíbrio. Me perdoe por não te honrar. Te amo, templo divino. Sou grato pela saúde perfeita que és."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Converse diariamente com seu corpo com amor e gratidão, aplicando Ho'oponopono em qualquer área que precise de cura.</p>`
    },
    {
        title: "Libertação de Vícios e Compulsões",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔓 Quebrando Correntes Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Vícios e compulsões são tentativas do Unihipili de automedicar dores antigas. Ho'oponopono vai à raiz da dor, oferecendo cura verdadeira ao invés de escape temporário.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Trate seu vício com compaixão, não como inimigo. É uma parte ferida de você pedindo amor e cura através da única linguagem que conhece.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💪 <strong>Processo de Libertação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Reconheça o vício sem julgamento</li><li>Agradeça por ele ter protegido você</li><li>Aplique Ho'oponopono à dor subjacente</li><li>Peça ajuda profissional quando necessário</li><li>Substitua gradualmente por hábitos saudáveis</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">A libertação verdadeira vem quando a dor original é curada, tornando o vício desnecessário naturalmente.</p>`
    },
    {
        title: "Desenvolvendo Intuição Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔮 A Voz Interior da Sabedoria</h3><p style="line-height: 1.8; font-size: 1.1em;">Quanto mais você limpa memórias com Ho'oponopono, mais claramente consegue ouvir a voz da intuição divina - seu Aumakua falando diretamente com você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Intuição não é pensamento - é saber direto que vem do silêncio. É sempre gentil, amorosa e guia você para o bem maior de todos.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, limpe tudo que bloqueia minha intuição. Que eu ouça claramente sua voz amorosa guiando cada passo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pratique seguir pequenas intuições diárias para fortalecer essa conexão sagrada entre você e a sabedoria universal.</p>`
    },
    {
        title: "Criando Um Lar Sagrado",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Santuário de Paz</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu lar é o reflexo físico de seu estado interior. Use Ho'oponopono para transformar seu espaço em um santuário sagrado de paz e harmonia.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada objeto, cada cômodo pode ser abençoado e energeticamente limpo, criando um ambiente que nutre sua prática espiritual e bem-estar.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌸 <strong>Criando Espaço Sagrado:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe energeticamente cada cômodo</li><li>Remova objetos que carregam memórias pesadas</li><li>Adicione elementos que inspiram paz</li><li>Crie um altar ou espaço de meditação</li><li>Mantenha a organização como prática espiritual</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Um lar sagrado suporta sua transformação e se torna refúgio para regeneração espiritual diária.</p>`
    },
    {
        title: "Educando Crianças com Ho'oponopono",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👶 Criando uma Nova Geração</h3><p style="line-height: 1.8; font-size: 1.1em;">Se você tem filhos ou trabalha com crianças, pode ensinar Ho'oponopono de forma simples e natural, dando-lhes ferramentas poderosas para a vida.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Crianças absorvem Ho'oponopono naturalmente porque ainda não têm resistências mentais. Elas podem transformar rapidamente raiva em amor.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Quando você se machucar ou ficar bravo, diga: 'Sinto muito, me perdoa, te amo, obrigado' e veja a mágica acontecer."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Mais importante que ensinar é modelar. Crianças aprendem pelo que veem você fazer, não pelo que você fala.</p>`
    },
    {
        title: "Ho'oponopono no Trabalho e Negócios",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando o Ambiente Profissional</h3><p style="line-height: 1.8; font-size: 1.1em;">Aplique Ho'oponopono silenciosamente em reuniões, negociações e conflitos profissionais. Você pode transformar ambientes tensos sem ninguém saber.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Negócios baseados em Ho'oponopono prosperam porque operam a partir de integridade, serviço genuíno e harmonia com o fluxo divino.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💡 <strong>Aplicações Profissionais:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Antes de reuniões importantes</li><li>Com clientes ou colegas difíceis</li><li>Para atrair oportunidades alinhadas</li><li>Na tomada de decisões complexas</li><li>Para resolver conflitos organizacionais</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Trabalho se torna serviço divino quando você limpa continuamente as memórias que criam drama e resistência.</p>`
    },
    {
        title: "Servindo ao Mundo Através da Limpeza",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Curador Planetário</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada vez que você pratica Ho'oponopono, não limpa apenas suas memórias pessoais, mas contribui para a cura coletiva da humanidade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode aplicar Ho'oponopono em questões globais - guerras, pobreza, destruição ambiental - limpando em você as memórias que contribuem para esses problemas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias em mim que contribuem para o sofrimento mundial. Me perdoe. Te amo, humanidade. Sou grato pela paz que emerge."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este é o serviço mais profundo - curar o mundo através de sua própria transformação interior contínua.</p>`
    },
    {
        title: "Preparando-se Para Crises",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⛈️ Navegando Tempestades com Graça</h3><p style="line-height: 1.8; font-size: 1.1em;">Crises são oportunidades intensivas de limpeza. Quando você está preparado com Ho'oponopono, pode navegar qualquer tempestade mantendo paz interior.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">A preparação não é acumular recursos externos, mas desenvolver recursos internos através da prática constante de limpeza.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🛡️ <strong>Preparação Espiritual:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pratique Ho'oponopono diariamente</li><li>Desenvolva confiança na Divindade</li><li>Cultive desapego a resultados</li><li>Fortaleça sua fé através da experiência</li><li>Crie redes de apoio espiritual</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando a crise chegar, você já terá a ferramenta perfeita para transformá-la em bênção através da limpeza contínua.</p>`
    },
    {
        title: "Limpeza de Memórias Coletivas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌐 Curando a Consciência Coletiva</h3><p style="line-height: 1.8; font-size: 1.1em;">Além das memórias pessoais e familiares, existem memórias coletivas da humanidade - guerras, pandemias, tragédias - que afetam todos nós subconscientemente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode usar Ho'oponopono para limpar essas memórias coletivas, contribuindo para a cura de toda a humanidade através de sua limpeza individual.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pelas memórias coletivas de dor e separação. Me perdoe por carregá-las. Te amo, humanidade unificada. Sou grato pela cura planetária."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este trabalho silencioso e invisível é uma das formas mais poderosas de servir ao planeta e às futuras gerações.</p>`
    },
    {
        title: "Desenvolvendo Compaixão Radical",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💖 Amor Sem Condições</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono desenvolve naturalmente compaixão radical - a capacidade de amar incondicionalmente mesmo quem nos machuca, porque você entende que todos são vítimas de suas próprias memórias.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta compaixão não é fraqueza ou permissividade - é a força mais poderosa do universo, capaz de transformar qualquer situação através do amor puro.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💕 <strong>Sinais de Compaixão Radical:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Capacidade de perdoar instantaneamente</li><li>Ver a criança ferida em pessoas difíceis</li><li>Responder com amor ao invés de reagir</li><li>Sentir paz mesmo diante de agressão</li><li>Irradiar amor naturalmente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você alcança este nível de compaixão, torna-se um instrumento de cura onde quer que vá.</p>`
    },
    {
        title: "Mestria em Tempos Difíceis",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💪 Força Interior Inabalável</h3><p style="line-height: 1.8; font-size: 1.1em;">A verdadeira mestria em Ho'oponopono se revela nos momentos mais difíceis. É fácil praticar quando tudo está bem - o desafio é manter a limpeza quando tudo desmorona.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Estes momentos são oportunidades preciosas de acelerar seu crescimento espiritual e demonstrar a si mesmo o poder transformador da prática.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Nos momentos mais sombrios, minha luz brilha mais forte. Sou grato pelas oportunidades de mostrar minha maestria."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Cada crise superada com Ho'oponopono fortalece sua fé e confiança na eficácia absoluta desta prática sagrada.</p>`
    },
    {
        title: "Criando Milagres Cotidianos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ A Vida Como Milagre Constante</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando Ho'oponopono se torna sua forma natural de viver, milagres param de ser eventos raros e se tornam ocorrências cotidianas normais.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sincronicidades, soluções inesperadas, encontros divinos e manifestações perfeitas se tornam o tecido comum de sua existência diária.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Tipos de Milagres Cotidianos:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pessoas certas aparecem no momento certo</li><li>Recursos surgem exatamente quando necessários</li><li>Problemas se resolvem sem sua interferência</li><li>Inspirações chegam como downloads divinos</li><li>Amor flui naturalmente em todas as relações</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Você não precisa mais "criar" milagres - você simplesmente vive em estado miraculoso constante através da limpeza.</p>`
    },
    {
        title: "Integrando Ho'oponopono Completamente",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔄 Vivendo a Prática</h3><p style="line-height: 1.8; font-size: 1.1em;">Integração completa significa que Ho'oponopono não é mais algo que você "faz" - é quem você "é". A limpeza se torna tão natural quanto respirar.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Neste nível, você não precisa se lembrar de praticar porque você É a prática viva. Cada pensamento, palavra e ação emerge do Zero State.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Eu não pratico Ho'oponopono. Eu SOU Ho'oponopono vivo. Cada respiração é uma oração, cada momento é uma limpeza."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta é a meta final - dissolução completa no processo divino de cura perpétua através do amor incondicional.</p>`
    },
    {
        title: "Tornando-se Professor/Curador",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👨‍🏫 Compartilhando o Dom</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando sua transformação é evidente, pessoas naturalmente serão atraídas para aprender com você. Ensinar Ho'oponopono é uma responsabilidade sagrada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O melhor ensino não vem de palavras, mas de ser um exemplo vivo da prática. Sua presença pacífica ensina mais que qualquer explicação.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">📚 <strong>Princípios para Ensinar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ensine apenas o que você vive</li><li>Seja humilde - você é apenas um canal</li><li>Continue limpando suas próprias memórias</li><li>Nunca cobre pelo amor divino</li><li>Respeite o ritmo de cada pessoa</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está ensinando técnicas, está transmitindo uma forma divina de viver.</p>`
    },
    {
        title: "Sua Nova Vida Transformada",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 O Amanhecer de Uma Nova Existência</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns! Você chegou ao final do Módulo 5 completamente transformado. Você não é mais a pessoa que começou esta jornada - você é um ser renovado, limpo e radiante.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua vida agora flui em harmonia divina. Problemas se tornaram oportunidades de limpeza, relacionamentos se transformaram em bênçãos mútuas, e trabalho se tornou serviço sagrado.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3)); padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;"><p style="font-size: 1.3em; color: #ffffff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🌟 TRANSFORMAÇÃO COMPLETA 🌟</p><p style="font-size: 1.1em; color: #e9d5ff; margin-bottom: 20px;">Você agora vive em estado de graça constante</p><p style="color: #10b981; font-style: italic;">"Que sua luz ilumine o caminho para outros"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Continue praticando com alegria, sabendo que cada limpeza não apenas cura você, mas contribui para a cura de todo o planeta. Mahalo! 🌺</p>`
    }
            ]
        },
        6: {
            title: "Módulo 6: Ho'oponopono Avançado",
            description: "Ho'oponopono Avançado: Dominando a Arte da Limpeza",
            pages: [
                {
                   title: "Ho'oponopono Avançado: Dominando a Arte da Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Elevando Sua Prática</h3><p style="line-height: 1.8; font-size: 1.1em;">Você já dominou os fundamentos. Agora é hora de aprofundar sua prática e descobrir técnicas avançadas que aceleram a transformação profunda.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🚀 O que Vamos Explorar:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Limpeza instantânea em situações críticas</p><p style="line-height: 1.8; font-size: 1.1em;">• Ho'oponopono para traumas profundos</p><p style="line-height: 1.8; font-size: 1.1em;">• Criando campos de energia limpa</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"A maestria vem da prática constante com amor"</div>`
  },
  {
    title: "Limpeza Instantânea em Situações de Crise",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Resposta Imediata</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando a vida nos desafia intensamente, precisamos de ferramentas que funcionem instantaneamente. Ho'oponopono pode ser sua ancora em qualquer tempestade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Em momentos de crise, sua mente racional fica confusa, mas seu coração sempre sabe o caminho de volta à paz.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🆘 <strong>Protocolo de Emergência:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Respire profundamente 3 vezes</li><li>Coloque a mão no coração</li><li>Repita: "Sinto muito, me perdoe"</li><li>Continue até sentir alívio</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: a crise não é o problema, é a oportunidade de limpar memórias antigas que estavam esperando para ser liberadas.</p>`
  },
  {
    title: "Trabalhando com Traumas Profundos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌊 Curando Feridas Ancestrais</h3><p style="line-height: 1.8; font-size: 1.1em;">Traumas profundos carregam uma intensidade especial porque geralmente envolvem múltiplas camadas de memórias - suas e de gerações passadas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Com Ho'oponopono, você não precisa reviver o trauma para curá-lo. Você simplesmente limpa as memórias que o mantêm ativo em seu sistema.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Eu limpo todas as memórias em mim que criaram esta dor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Seja gentil consigo mesmo. Traumas profundos podem levar tempo para serem completamente limpos, e isso é perfeitamente normal.</p>`
  },
  {
    title: "Ho'oponopono para Relacionamentos Tóxicos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Transformando Veneno em Medicina</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos tóxicos são espelhos poderosos que mostram exatamente quais memórias em você precisam ser limpas. Eles são dolorosos, mas também são professores.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao limpar as memórias que atraíram a toxicidade, você automaticamente muda a dinâmica ou se liberta do relacionamento de forma natural.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo de Limpeza:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Identifique o gatilho emocional</li><li>Assuma 100% de responsabilidade</li><li>Limpe as memórias ativadas</li><li>Observe as mudanças sutis que começam a acontecer</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está limpando a outra pessoa, está limpando as memórias em você que criaram esta experiência.</p>`
  },
  {
    title: "Criando Campos de Energia Limpa",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 O Poder da Presença Pura</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você pratica Ho'oponopono consistentemente, começa a irradiar uma energia diferente. As pessoas sentem sua presença como um espaço seguro e pacífico.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você se torna um campo de limpeza ambulante, ajudando outros a se conectarem com sua própria paz interior apenas por estar presente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Minha presença é um presente de paz para o mundo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este é um dos maiores dons de Ho'oponopono: você se torna um agente de cura silencioso onde quer que vá.</p>`
  },
  {
    title: "Limpeza de Memórias Coletivas",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Curando o Mundo Através de Si</h3><p style="line-height: 1.8; font-size: 1.1em;">As memórias não são apenas pessoais. Carregamos memórias coletivas da humanidade - guerras, injustiças, medos ancestrais. Podemos limpá-las também.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa uma memória coletiva em si mesmo, contribui para a cura de toda a humanidade. Este é um trabalho sagrado e poderoso.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌎 <strong>Memórias Coletivas Comuns:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Medo da escassez e pobreza</li><li>Traumas de guerra e violência</li><li>Separação e preconceito</li><li>Desconexão da natureza</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ao sentir indignação com problemas mundiais, pergunte: "Que memória em mim precisa ser limpa?" E então limpe com amor.</p>`
  },
  {
    title: "Ho'oponopono nos Sonhos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌙 Limpeza Durante o Sono</h3><p style="line-height: 1.8; font-size: 1.1em;">Seus sonhos são uma porta direta para o subconsciente onde as memórias ficam armazenadas. Você pode usar Ho'oponopono para limpar enquanto dorme.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Antes de dormir, programe sua mente para continuar a limpeza durante a noite. Muitas vezes você acordará com insights poderosos ou sensação de leveza.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Durante meu sono, limpo todas as memórias que precisam ser liberadas."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pesadelos são oportunidades especiais de limpeza. Eles mostram memórias que estão prontas para serem transmutadas em luz.</p>`
  },
  {
    title: "Técnicas de Respiração com Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🫁 O Poder da Respiração Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">A respiração é a ponte entre o consciente e o subconsciente. Combinando respiração consciente com Ho'oponopono, você acelera profundamente o processo de limpeza.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada expiração carrega embora memórias antigas. Cada inspiração traz energia limpa e renovada para seu sistema.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌬️ <strong>Técnica da Respiração Limpa:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Inspire: "Sinto muito"</li><li>Retenha: "Me perdoe"</li><li>Expire: "Te amo"</li><li>Pausa: "Obrigado"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Pratique por 5-10 minutos diariamente. Você sentirá uma paz profunda se instalando em todo seu ser.</p>`
  },
  {
    title: "Ho'oponopono para Situações Financeiras",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Limpando Bloqueios de Abundância</h3><p style="line-height: 1.8; font-size: 1.1em;">Dinheiro é energia, e problemas financeiros sempre apontam para memórias de escassez, indignidade ou medo profundamente enraizadas em nosso sistema.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ao limpar essas memórias com Ho'oponopono, você permite que a abundância natural da vida flua mais livremente através de você.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que bloqueiam minha abundância natural."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Não se concentre no dinheiro em si, mas nas memórias que criam a experiência de limitação. A abundância é seu estado natural.</p>`
  },
  {
    title: "Desenvolvendo Intuição Através da Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔮 Despertando Sua Sabedoria Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Quanto mais você limpa memórias com Ho'oponopono, mais clara se torna sua intuição. As memórias são como ruído que interfere na recepção de sua sabedoria interior.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua intuição sempre esteve lá, esperando que você criasse espaço suficiente para ouvi-la. Ho'oponopono é essa criação de espaço.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Sinais de Intuição Desperta:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Sensações físicas antes de decisões</li><li>Sonhos que trazem orientação</li><li>Sincronicidades frequentes</li><li>Saber sem saber como sabe</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Confie nos primeiros impulsos que vêm após a prática de Ho'oponopono. Eles geralmente carregam orientação divina.</p>`
      },
    {
        title: "Ho'oponopono para Cura de Vícios e Dependências",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔗 Quebrando Correntes Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Vícios são tentativas desesperadas de escapar de dores profundas. Por trás de cada dependência existe uma memória de abandono, rejeição ou trauma que precisa ser curada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não julga o vício, mas abraça com amor a dor que o criou. Quando você limpa a ferida original, o vício perde seu poder naturalmente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Processo de Libertação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>No momento do impulso, pause</li><li>Coloque a mão no coração</li><li>Diga: "Que memória em mim criou esta necessidade?"</li><li>Limpe com amor sem julgar</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Seja paciente consigo mesmo. A cura de vícios é uma jornada, não um destino. Cada momento de limpeza é uma vitória.</p>`
  },
  {
    title: "Transmutando Raiva em Poder Pessoal",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔥 Alquimia Emocional</h3><p style="line-height: 1.8; font-size: 1.1em;">A raiva é energia vital bloqueada. Quando você para de resistir à raiva e a limpa com Ho'oponopono, ela se transforma em poder pessoal autêntico.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Raiva não é má - é informação. Ela mostra onde seus limites foram violados e quais memórias de impotência precisam ser curadas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que transformaram meu poder em raiva."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você sente raiva, agradeça por ela estar mostrando o caminho de volta ao seu poder. Então limpe as memórias com amor.</p>`
  },
  {
    title: "Ho'oponopono para Medos e Fobias",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👻 Desmaterializando Fantasmas do Passado</h3><p style="line-height: 1.8; font-size: 1.1em;">Medos são memórias de situações onde você se sentiu vulnerável ou em perigo. Eles vivem no seu sistema como alertas de segurança desatualizados.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Com Ho'oponopono, você não precisa ser corajoso - você simplesmente limpa as memórias que criam a ilusão de perigo no presente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Técnica do Medo Amoroso:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Quando o medo surgir, respire fundo</li><li>Diga: "Olá, medo. Obrigado por tentar me proteger"</li><li>Limpe: "Sinto muito, me perdoe, te amo, obrigado"</li><li>Sinta o medo se dissolvendo em amor</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está eliminando o medo, está curando as memórias que o mantêm ativo desnecessariamente.</p>`
  },
  {
    title: "Criando Rituais Pessoais de Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🕯️ Cerimônias Sagradas de Cura</h3><p style="line-height: 1.8; font-size: 1.1em;">Rituais criam um espaço sagrado que potencializa a limpeza. Eles sinalizam para seu subconsciente que algo importante está acontecendo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode criar rituais simples mas poderosos que tornam sua prática de Ho'oponopono ainda mais efetiva e significativa.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Crio espaços sagrados onde a cura pode florescer."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pode ser acender uma vela, tocar uma música especial, ou simplesmente criar um momento de silêncio. O importante é a intenção.</p>`
  },
  {
    title: "Ho'oponopono e a Cura do Corpo Físico",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💊 Medicina para a Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">O corpo físico é um mapa das suas memórias emocionais. Doenças e sintomas são frequentemente manifestações de memórias não resolvidas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono trabalha na raiz energética da doença, limpando as memórias que criaram o desequilíbrio físico. Isso complementa, não substitui, cuidados médicos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🏥 <strong>Protocolo de Cura Física:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Coloque as mãos na área afetada</li><li>Pergunte: "Que memória criou isso?"</li><li>Limpe com amor e gratidão</li><li>Visualize luz dourada curando a área</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Seu corpo é sábio. Ele sempre está tentando se comunicar com você através de sintomas. Escute com amor.</p>`
  },
  {
    title: "Limpeza de Memórias Familiares",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👨‍👩‍👧‍👦 Curando a Árvore Genealógica</h3><p style="line-height: 1.8; font-size: 1.1em;">Famílias compartilham memórias coletivas que passam de geração em geração. Padrões destrutivos se repetem até alguém ter coragem de limpá-los.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa uma memória familiar, está curando não apenas a si mesmo, mas a todos os seus ancestrais e descendentes. É um trabalho sagrado.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em minha linhagem que causaram sofrimento."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Você pode ser o ancestral curado que seus descendentes precisam, e o descendente que honra seus ancestrais com cura.</p>`
  },
  {
    title: "Ho'oponopono no Ambiente de Trabalho",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Transformando Tensões Profissionais</h3><p style="line-height: 1.8; font-size: 1.1em;">O ambiente de trabalho é um laboratório perfeito para praticar Ho'oponopono. Conflitos, estresse e competição são oportunidades de limpeza constante.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode transformar qualquer ambiente tóxico em um espaço de paz simplesmente limpando as memórias em você que atraíram essa experiência.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🤝 <strong>Ho'oponopono Profissional:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Antes de reuniões, limpe expectativas</li><li>Durante conflitos, limpe em silêncio</li><li>Após discussões, libere ressentimentos</li><li>Envie amor para colegas difíceis</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Seu trabalho se torna um serviço de amor quando você o usa como oportunidade constante de crescimento e cura.</p>`
  },
  {
    title: "Desenvolvendo Compaixão Através da Limpeza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💝 O Coração que Abraça Tudo</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono desperta naturalmente a compaixão porque você começa a ver que todos estão lutando com suas próprias memórias dolorosas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Compaixão não é pena - é reconhecer que por trás de cada comportamento difícil existe uma alma ferida pedindo amor.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Vejo através dos olhos do amor, além das máscaras do medo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa o julgamento em si mesmo, automaticamente para de julgar os outros. Isso é compaixão verdadeira.</p>`
  },
  {
    title: "Ho'oponopono para Situações Legais",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚖️ Justiça Através do Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Problemas legais sempre refletem conflitos internos não resolvidos. Quando você limpa as memórias que criaram a situação, soluções começam a aparecer naturalmente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não garante que você "ganhará" no sentido tradicional, mas garante que você encontrará paz, independentemente do resultado.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🏛️ <strong>Limpeza Legal:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe ressentimentos contra oponentes</li><li>Libere necessidade de estar "certo"</li><li>Confie no processo divino</li><li>Aceite qualquer resultado com graça</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">A verdadeira vitória é interna: quando você não precisa mais de validação externa para se sentir completo.</p>`
  },
  {
    title: "Integrando Ho'oponopono na Vida Cotidiana",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Vivendo em Estado de Limpeza</h3><p style="line-height: 1.8; font-size: 1.1em;">O objetivo final é que Ho'oponopono se torne tão natural quanto respirar. Cada momento se torna uma oportunidade de escolher amor ao invés de medo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não pratica Ho'oponopono apenas em momentos de crise, mas como um estilo de vida - uma forma de navegar pela existência com graça.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Cada momento é uma nova oportunidade de escolher o amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando Ho'oponopono se torna seu estado natural, você vive em paz constante, independentemente das circunstâncias externas.</p>`
      },
  {
      title: "Ho'oponopono e a Morte: Preparando-se para a Transição",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🕊️ A Passagem Sagrada</h3><p style="line-height: 1.8; font-size: 1.1em;">A morte é a última limpeza - o momento de liberar todas as memórias e retornar à fonte pura. Ho'oponopono prepara você para essa transição sagrada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você pratica consistentemente, a morte perde seu terror porque você já aprendeu a morrer para as memórias diariamente. É apenas mais uma limpeza.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Preparação Espiritual:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe ressentimentos diariamente</li><li>Perdoe todas as mágoas</li><li>Expresse gratidão pela vida</li><li>Viva cada dia como se fosse o último</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono também ajuda você a lidar com a morte de entes queridos, limpando a dor da separação e celebrando o amor eterno.</p>`
  },
  {
    title: "Criando Legados de Amor Através da Prática",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌺 Sementes de Transformação</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua prática de Ho'oponopono cria ondas invisíveis de cura que tocam gerações futuras. Você está plantando sementes de amor que florescerão muito além de sua existência.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada memória que você limpa não apenas cura você, mas quebra padrões destrutivos que poderiam afetar seus descendentes. Este é seu legado mais precioso.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Minha cura hoje é o presente que deixo para o futuro."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Você pode não ver todos os frutos de sua prática, mas confie que cada momento de limpeza contribui para um mundo mais amoroso.</p>`
  },
  {
    title: "Ho'oponopono e Manifestação Consciente",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Criando do Espaço Limpo</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa regularmente, cria um espaço interno vazio de memórias limitantes. Deste espaço limpo, suas manifestações fluem naturalmente e em harmonia com seu bem maior.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Não é sobre conseguir o que você quer, mas sobre limpar os obstáculos para que a vida possa se expressar através de você da forma mais bela.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Manifestação Limpa:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe expectativas sobre resultados</li><li>Confie no timing divino</li><li>Permita que o melhor aconteça</li><li>Agradeça antes de receber</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">As melhores manifestações vêm quando você para de forçar e permite que a vida flua através de um coração limpo.</p>`
  },
  {
    title: "Tornando-se um Mestre de Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👑 A Jornada do Mestre Interior</h3><p style="line-height: 1.8; font-size: 1.1em;">Um mestre de Ho'oponopono não é alguém que nunca tem problemas, mas alguém que vê cada problema como uma oportunidade sagrada de limpeza e crescimento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você se torna mestre quando para de resistir à vida e começa a dançar com ela, limpando continuamente tudo que não é amor puro.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sou um instrumento do amor divino, constantemente sendo afinado pela vida."</p></div><p style="line-height: 1.8; font-size: 1.1em;">A maestria não é um destino, mas um caminho. Cada dia oferece novas oportunidades de aprofundar sua prática e expandir seu amor.</p>`
  },
  {
    title: "O Futuro da Humanidade Através de Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Visão de Um Mundo Curado</h3><p style="line-height: 1.8; font-size: 1.1em;">Imagine um mundo onde cada pessoa assume 100% de responsabilidade por sua experiência. Onde conflitos são vistos como oportunidades de cura mútua. Este é o potencial de Ho'oponopono.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você faz parte de uma geração pioneira que está plantando as sementes de uma nova consciência planetária. Sua prática pessoal contribui para essa transformação global.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>O Mundo que Estamos Criando:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Responsabilidade ao invés de culpa</li><li>Compaixão ao invés de julgamento</li><li>Unidade ao invés de separação</li><li>Amor ao invés de medo</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Continue limpando. Continue amando. Você é parte da solução que o mundo precisa. Obrigado por sua coragem de curar.</p><div style="background: rgba(139, 92, 246, 0.3); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;"><h3 style="color: #e9d5ff; margin-bottom: 20px;">🙏 Encerramento do Módulo</h3><p style="color: #e9d5ff; font-size: 1.2em; line-height: 1.8;">"Sinto muito por todas as memórias em mim que causaram sofrimento. Me perdoe por não ter conhecido o amor antes. Te amo, vida, obrigado por esta oportunidade de cura. Que todos os seres sejam livres, felizes e em paz."</p></div>`
  }
            ]
        },
        7: {
            title: "Módulo 7: Ho'oponopono e Relacionamentos",
            description: "Ho'oponopono e Relacionamentos: O Espelho da Alma",
            pages: [
                {
                    title: "Ho'oponopono e Relacionamentos: O Espelho da Alma",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 O Laboratório do Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos são os maiores professores de Ho'oponopono. Cada pessoa em sua vida é um espelho perfeito, refletindo de volta as memórias que precisam ser limpas em você.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🌟 O que Vamos Explorar:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Curando relacionamentos tóxicos através da limpeza interior</p><p style="line-height: 1.8; font-size: 1.1em;">• Atraindo amor verdadeiro limpando memórias de abandono</p><p style="line-height: 1.8; font-size: 1.1em;">• Transformando conflitos em oportunidades de crescimento</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"O amor que você busca lá fora já existe dentro de você"</div>`
  },
  {
    title: "A Lei do Espelho nos Relacionamentos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪞 Reflexos Perfeitos</h3><p style="line-height: 1.8; font-size: 1.1em;">Tudo que você vê no outro - bom ou ruim - existe primeiro em você. Relacionamentos são espelhos que mostram suas memórias mais profundas de forma amplificada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando alguém te irrita, está mostrando uma memória em você que precisa ser limpa. Quando alguém te inspira, está refletindo a luz já presente em seu ser.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔍 <strong>Perguntas para Reflexão:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>O que mais me incomoda nesta pessoa?</li><li>Onde esta qualidade existe em mim?</li><li>Que memória criou esta reação?</li><li>Como posso limpar isso com amor?</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa o que vê no espelho, automaticamente transforma a experiência do relacionamento.</p>`
  },
  {
    title: "Limpando Memórias de Abandono e Rejeição",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Curando Feridas Primais</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias de abandono e rejeição são as mais dolorosas porque tocam nossa necessidade básica de amor e aceitação. Elas criam padrões de relacionamento que se repetem até serem limpas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Estas memórias geralmente vêm da infância, mas podem ser de vidas passadas ou ancestrais. Ho'oponopono as cura todas de uma vez, sem precisar analisá-las.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que criaram a ilusão de separação do amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa essas memórias, para de projetar abandono nos outros e começa a atrair relacionamentos baseados em amor verdadeiro.</p>`
  },
  {
    title: "Ho'oponopono para Relacionamentos Românticos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💖 O Amor Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos românticos são intensos porque ativam nossas memórias mais profundas sobre amor, valor próprio e intimidade. Eles são laboratórios perfeitos para Ho'oponopono.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias que criam drama, dependência ou conflito, o relacionamento se transforma em uma dança sagrada de duas almas crescendo juntas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💕 <strong>Limpeza Romântica:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe expectativas sobre o parceiro</li><li>Libere necessidade de controle</li><li>Cure memórias de traição</li><li>Ame sem condições</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Amor verdadeiro não precisa de garantias. Ele flui naturalmente de um coração limpo e livre.</p>`
  },
  {
    title: "Curando Relacionamentos com os Pais",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👨‍👩‍👧‍👦 As Raízes do Ser</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos com pais são os mais fundamentais porque moldaram suas primeiras impressões sobre amor, segurança e valor próprio. Curar essas relações cura a base de todos os outros relacionamentos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Seus pais fizeram o melhor que puderam com as memórias que tinham. Quando você limpa ressentimentos, libera tanto você quanto eles para experimentar amor puro.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Honro meus pais limpando as memórias que nos separam do amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Não importa se seus pais estão vivos ou não - a limpeza acontece no nível espiritual e transforma a energia entre vocês.</p>`
  },
  {
    title: "Transformando Relacionamentos Tóxicos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔄 Alquimia Relacional</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos tóxicos são os maiores presentes disfarçados. Eles forçam você a confrontar suas memórias mais profundas e desenvolver limites saudáveis.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias que atraíram a toxicidade, uma de duas coisas acontece: o relacionamento se transforma ou você se liberta dele naturalmente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚖️ <strong>Processo de Transformação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Identifique os padrões tóxicos</li><li>Encontre essas qualidades em você</li><li>Limpe as memórias sem julgar</li><li>Estabeleça limites com amor</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: você não está tentando mudar o outro, está limpando o que em você criou esta experiência.</p>`
  },
  {
    title: "Ho'oponopono para Relacionamentos Familiares",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Curando o Ninho</h3><p style="line-height: 1.8; font-size: 1.1em;">Famílias carregam memórias coletivas que se estendem por gerações. Padrões de comunicação, traumas e crenças limitantes passam de pais para filhos até alguém escolher limpá-los.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa memórias familiares, não apenas cura suas próprias feridas, mas quebra padrões que poderiam afetar futuras gerações.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sou o elo curado na corrente familiar que passa amor adiante."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Reuniões familiares se tornam oportunidades sagradas de prática quando você as vê como chances de limpar memórias antigas.</p>`
  },
  {
    title: "Atraindo Relacionamentos Saudáveis",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌸 Magnetismo do Coração Limpo</h3><p style="line-height: 1.8; font-size: 1.1em;">Você atrai relacionamentos que correspondem ao seu nível de limpeza interior. Quanto mais você limpa memórias de indignidade e medo, mais atrai pessoas que vibram em amor.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Relacionamentos saudáveis não são sobre encontrar alguém perfeito, mas sobre duas pessoas comprometidas com o crescimento mútuo através do amor.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Preparando-se para Amor Verdadeiro:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ame-se completamente primeiro</li><li>Limpe expectativas sobre parceiros</li><li>Cure memórias de relacionamentos passados</li><li>Confie no timing divino</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">O amor verdadeiro chega quando você não precisa mais dele para se sentir completo, mas o deseja para celebrar a vida.</p>`
  },
  {
    title: "Lidando com Traições e Decepções",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💔 Transformando Dor em Sabedoria</h3><p style="line-height: 1.8; font-size: 1.1em;">Traições são feridas profundas que ativam memórias primais de abandono e insegurança. Elas parecem vir do outro, mas sempre refletem memórias não resolvidas em você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono não minimiza a dor da traição, mas oferece um caminho para transformá-la em sabedoria e compaixão mais profundas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim que criaram esta experiência de traição."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Perdoar não significa aceitar comportamentos inadequados. Significa libertar-se do veneno do ressentimento que só prejudica você.</p>`
  },
  {
    title: "Comunicação Consciente Através de Ho'oponopono",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🗣️ Palavras que Curam</h3><p style="line-height: 1.8; font-size: 1.1em;">A comunicação consciente começa com limpeza interior. Antes de falar, limpe as memórias de raiva, medo ou necessidade de estar certo. Isso transforma completamente a qualidade de suas palavras.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você fala de um espaço limpo, suas palavras carregam amor mesmo quando precisa estabelecer limites ou expressar desacordo.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💬 <strong>Protocolo de Comunicação Limpa:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pause antes de reagir</li><li>Limpe as emoções ativadas</li><li>Fale do coração, não da ferida</li><li>Escute para entender, não para rebater</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Suas palavras se tornam medicinas quando vêm de um coração limpo e uma intenção pura de conexão.</p>`
      },
  {
      title: "Curando Relacionamentos à Distância",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Limpeza Quântica</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono funciona além do tempo e espaço. Você pode curar relacionamentos com pessoas que estão distantes, falecidas ou com quem perdeu contato. A limpeza acontece no campo energético compartilhado.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa suas memórias sobre alguém, automaticamente libera essa pessoa das suas projeções e permite que o amor flua entre vocês, independente da distância física.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"No amor, não há distância. No amor, não há tempo. Apenas conexão eterna."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Muitas pessoas relatam mudanças surpreendentes em relacionamentos após praticarem Ho'oponopono à distância, incluindo reconciliações inesperadas.</p>`
  },
  {
    title: "Ho'oponopono para Relacionamentos de Trabalho",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Harmonia Profissional</h3><p style="line-height: 1.8; font-size: 1.1em;">O ambiente de trabalho é um campo fértil para praticar Ho'oponopono. Colegas difíceis, chefes autoritários e subordinados desrespeitosos são espelhos perfeitos mostrando memórias que precisam ser limpas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você para de levar conflitos profissionais para o lado pessoal e começa a vê-los como oportunidades de limpeza, o ambiente de trabalho se transforma.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🏢 <strong>Limpeza Profissional:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpe antes de reuniões tensas</li><li>Transforme críticas em oportunidades</li><li>Cure memórias de desvalorização</li><li>Irradie paz no ambiente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Você se torna um agente de transformação no trabalho, elevando a vibração de todo o ambiente através da sua prática silenciosa.</p>`
  },
  {
    title: "Relacionamentos com Filhos: Ho'oponopono Parental",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👶 Criando com Consciência</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos com filhos são os mais sagrados porque você tem a responsabilidade de não passar adiante memórias limitantes. Seus filhos são seus maiores professores, mostrando aspectos de você que precisam ser curados.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando seu filho apresenta comportamentos desafiadores, ao invés de só corrigi-lo, pergunte: "Que memória em mim está criando esta situação?" A limpeza interior transforma a dinâmica familiar.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias em mim para que meus filhos herdem apenas amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pais que praticam Ho'oponopono criam filhos mais equilibrados, confiantes e conectados com seu próprio poder interior.</p>`
  },
  {
    title: "Soltando Pessoas que Partiram",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🕊️ Amor que Liberta</h3><p style="line-height: 1.8; font-size: 1.1em;">Uma das limpezas mais difíceis é soltar pessoas que amamos quando elas escolhem sair de nossas vidas - seja por rompimento, morte ou distanciamento. O apego mantém tanto você quanto eles presos em sofrimento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono ensina que amor verdadeiro é libertador. Quando você limpa o apego e o desespero, permite que o amor flua puramente, honrando a jornada da alma de cada um.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💫 <strong>Processo de Liberação:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Reconheça e honre a dor</li><li>Limpe memórias de abandono</li><li>Envie amor incondicional</li><li>Confie no plano divino</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Soltar não significa esquecer ou deixar de amar. Significa amar de forma pura, sem expectativas ou demandas.</p>`
  },
  {
    title: "Curando o Relacionamento Consigo Mesmo",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🪞 O Relacionamento Primordial</h3><p style="line-height: 1.8; font-size: 1.1em;">Todos os relacionamentos externos são reflexos do relacionamento que você tem consigo mesmo. Se há crítica, julgamento ou rejeição interna, isso se manifesta em como outros te tratam.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Curar o relacionamento consigo mesmo é a base de todos os outros relacionamentos. Quando você se ama verdadeiramente, automaticamente atrai e permite amor externo.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Escolho me amar completamente para que outros possam fazer o mesmo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Auto-amor não é egoísmo - é pré-requisito para relacionamentos saudáveis. Você não pode dar o que não tem.</p>`
  },
  {
    title: "Transformando Ciúmes e Possessividade",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💚 Alquimia do Coração</h3><p style="line-height: 1.8; font-size: 1.1em;">Ciúmes e possessividade nascem de memórias de escassez e insegurança. Eles são venenos que destroem relacionamentos porque vêm do medo, não do amor.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias que criam ciúmes, descobre que amor verdadeiro é abundante e livre. Você pode amar profundamente sem precisar possuir.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Transmutando Ciúmes:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Reconheça o medo por trás do ciúme</li><li>Limpe memórias de abandono</li><li>Cultive confiança em si mesmo</li><li>Pratique amor incondicional</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você se sente completo em si mesmo, os outros se tornam complementos, não necessidades para sua felicidade.</p>`
  },
  {
    title: "Ho'oponopono para Amizades Verdadeiras",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👥 Laços da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Amizades verdadeiras são relacionamentos de alma para alma, baseados em respeito mútuo, crescimento e alegria compartilhada. Elas florescem quando há autenticidade e liberdade para ser quem realmente são.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono purifica amizades removendo competição, inveja e julgamentos. Quando você limpa essas memórias, suas amizades se tornam fontes de inspiração e apoio mútuo.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Atraio amigos que celebram minha luz e me inspiram a brilhar mais."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Amigos verdadeiros são presentes da vida - almas que escolheram caminhar juntas nesta jornada de descoberta e crescimento.</p>`
  },
  {
    title: "Lidando com Pessoas Difíceis",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Professores Disfarçados</h3><p style="line-height: 1.8; font-size: 1.1em;">Pessoas difíceis são seus maiores professores espirituais. Elas ativam suas memórias mais profundas e forçam você a escolher entre reagir ou responder com amor.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você para de tentar mudar pessoas difíceis e foca em limpar as memórias que elas ativam, descobre que elas perdem o poder de perturbá-lo.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🧘 <strong>Estratégias para Pessoas Difíceis:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Veja-as como professores, não inimigos</li><li>Limpe a irritação que elas ativam</li><li>Estabeleça limites com compaixão</li><li>Agradeça as lições que oferecem</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você se torna imperturbável diante de pessoas difíceis, elas ou se transformam na sua presença ou saem naturalmente da sua vida.</p>`
  },
  {
    title: "Relacionamentos e Prosperidade Emocional",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Riqueza do Coração</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos saudáveis são uma forma de prosperidade. Quando você tem conexões baseadas em amor, respeito e crescimento mútuo, sua vida se torna rica em todos os sentidos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono limpa memórias de escassez emocional que fazem você se contentar com relacionamentos superficiais ou tóxicos. Você começa a valorizar qualidade sobre quantidade.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Mereço relacionamentos que nutrem minha alma e elevam meu espírito."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos prósperos são investimentos mútuos onde todos crescem, se apoiam e celebram o sucesso uns dos outros.</p>`
  },
  {
    title: "O Poder da Gratidão nos Relacionamentos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 Multiplicando o Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão é o fertilizante dos relacionamentos. Quando você aprecia genuinamente as pessoas em sua vida, essa energia se expande e cria mais momentos para serem gratos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono ensina gratidão até por relacionamentos difíceis, porque todos ofereceram oportunidades de crescimento e autoconsciência. Esta perspectiva transforma sua experiência de vida.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Prática de Gratidão Relacional:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça diariamente pelas pessoas em sua vida</li><li>Encontre o presente em cada relacionamento</li><li>Expresse apreciação regularmente</li><li>Veja cada interação como sagrada</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você vive em gratidão constante, torna-se um ímã para relacionamentos ainda mais amorosos e significativos.</p>`
    },
  {
      title: "Relacionamentos Kármicos vs. Relacionamentos da Alma",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚖️ Diferentes Propósitos</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos kármicos vêm para ensinar lições específicas através de desafios. Relacionamentos da alma vêm para crescimento mútuo e celebração. Ambos são sagrados, mas têm propósitos diferentes na sua jornada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono ajuda você a completar relacionamentos kármicos com amor, liberando ambas as almas para seguirem adiante. Também purifica relacionamentos da alma para que floresçam plenamente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Honro todos os relacionamentos pelo que vieram me ensinar."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Reconhecer a diferença entre esses tipos de relacionamento ajuda você a navegar suas conexões com mais sabedoria e menos sofrimento.</p>`
  },
  {
    title: "Curando Padrões Ancestrais nos Relacionamentos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌳 Limpando a Árvore Genealógica</h3><p style="line-height: 1.8; font-size: 1.1em;">Muitos padrões relacionais são herdados dos ancestrais - traições, abandonos, violência doméstica, codependência. Esses padrões se repetem nas famílias até alguém escolher quebrá-los através de Ho'oponopono.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa padrões ancestrais, não apenas cura sua própria vida amorosa, mas libera futuras gerações desses padrões limitantes.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🧬 <strong>Limpeza Ancestral:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Identifique padrões familiares repetitivos</li><li>Limpe com compaixão pelos ancestrais</li><li>Perdoe as limitações deles</li><li>Escolha conscientemente um novo padrão</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Você se torna o elo curado na corrente familiar, transformando o legado que deixará para as próximas gerações.</p>`
  },
  {
    title: "Ho'oponopono para Recomeços Amorosos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Novos Amanheceres</h3><p style="line-height: 1.8; font-size: 1.1em;">Após relacionamentos que terminaram, é tentador carregar bagagens, ressentimentos e medos para a próxima conexão. Ho'oponopono oferece limpeza completa para recomeços verdadeiros.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada novo relacionamento merece encontrar você limpo, livre e aberto para possibilidades frescas. Quando você não limpa o passado, contamina o presente com memórias antigas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Entro em novos relacionamentos com coração limpo e alma livre."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Recomeços verdadeiros só são possíveis quando você se responsabiliza pela limpeza interior e chega inteiro para a nova conexão.</p>`
  },
  {
    title: "Transformando Solidão em Solitude Sagrada",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏔️ A Beleza do Estar Só</h3><p style="line-height: 1.8; font-size: 1.1em;">Solidão é medo de ficar sozinho. Solitude é amor pela própria companhia. Quando você transforma solidão em solitude através de Ho'oponopono, para de buscar relacionamentos por desespero.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Solitude sagrada é o espaço onde você se conecta consigo mesmo, com a natureza e com o divino. É nesse espaço que você se torna magnético para relacionamentos saudáveis.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🧘 <strong>Cultivando Solitude Sagrada:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Aprenda a desfrutar sua própria companhia</li><li>Desenvolva hobbies que nutrem sua alma</li><li>Pratique meditação e autoconhecimento</li><li>Conecte-se com a natureza regularmente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você ama estar consigo mesmo, os outros também querem estar na sua presença. Você irradia plenitude, não carência.</p>`
  },
  {
    title: "O Perdão Radical nos Relacionamentos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🕊️ Libertação Total</h3><p style="line-height: 1.8; font-size: 1.1em;">Perdão radical não é sobre esquecer ou justificar comportamentos inadequados. É sobre liberar completamente o veneno do ressentimento que mantém você preso ao passado.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono oferece perdão radical porque você reconhece que tudo é reflexo de memórias em você. Quando limpa essas memórias, o perdão acontece naturalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Perdoo completamente para que minha alma seja livre para amar novamente."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Perdão não é um presente que você dá ao outro - é um presente que você dá a si mesmo para viver livre do peso do passado.</p>`
  },
  {
    title: "Relacionamentos Conscientes: Uma Nova Era",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌟 Evolução do Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos conscientes são baseados em crescimento mútuo, autenticidade e responsabilidade emocional. Ambas as pessoas se comprometem com sua própria cura e crescimento.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Nestes relacionamentos, conflitos se tornam oportunidades de maior intimidade. Cada desafio é visto como um convite para mais amor e compreensão mútua.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💫 <strong>Características do Amor Consciente:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Comunicação honesta e compassiva</li><li>Responsabilidade pelas próprias emoções</li><li>Apoio mútuo ao crescimento</li><li>Celebração das diferenças</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos conscientes não são perfeitos - são comprometidos com a evolução constante através do amor.</p>`
  },
  {
    title: "Integrando Ho'oponopono na Vida Familiar Diária",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏠 Prática Cotidiana</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono não é apenas para momentos de crise - é uma prática diária que transforma a qualidade de todas as interações familiares. Pequenas limpezas constantes previnem grandes conflitos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Integre a prática nos momentos simples: antes das refeições, ao acordar, antes de dormir. Crie rituais familiares de gratidão e limpeza energética.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Nossa casa é um templo de amor onde todos crescem em paz."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Famílias que praticam Ho'oponopono juntas criam laços mais profundos e resolvem conflitos com mais facilidade e amor.</p>`
  },
  {
    title: "Relacionamentos e Propósito de Vida",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎯 Conexões com Propósito</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos saudáveis não apenas trazem felicidade pessoal - eles apoiam seu propósito de vida. Quando você está em conexões alinhadas, tem mais energia e clareza para servir o mundo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono atrai relacionamentos que nutrem sua missão de vida. Pessoas que vibram na mesma frequência de serviço e crescimento começam a aparecer naturalmente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌍 <strong>Relacionamentos Alinhados:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Apoiam seus sonhos e visões</li><li>Inspiram você a ser sua melhor versão</li><li>Compartilham valores profundos</li><li>Colaboram em projetos significativos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando seus relacionamentos estão alinhados com seu propósito, toda sua vida ganha mais sentido e impacto.</p>`
  },
  {
    title: "A Cura Coletiva Através dos Relacionamentos",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Ondas de Transformação</h3><p style="line-height: 1.8; font-size: 1.1em;">Cada relacionamento que você cura através de Ho'oponopono cria ondas de cura que se estendem muito além de vocês dois. Relacionamentos curados inspiram outros a buscarem a mesma cura.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você se torna um exemplo vivo de que relacionamentos baseados em amor, respeito e crescimento são possíveis. Sua transformação dá permissão para outros se transformarem também.</p>            <div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Meus relacionamentos curados são medicina para o mundo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Cada pessoa que encontra cura em relacionamentos através de Ho'oponopono contribui para elevar a consciência coletiva sobre o que é possível no amor.</p>`
  },
  {
    title: "Celebrando o Amor em Todas as Suas Formas",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎉 A Dança Sagrada do Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono nos ensina que o amor é a força mais poderosa do universo e se expressa de infinitas maneiras - através de relacionamentos românticos, familiares, amizades, e até conexões breves com estranhos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias que limitam sua capacidade de dar e receber amor, toda sua vida se torna uma celebração contínua de conexão humana autêntica.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💖 <strong>Formas Sagradas de Amor:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Amor romântico - paixão e parceria</li><li>Amor familiar - laços de sangue e escolha</li><li>Amor fraternal - amizades profundas</li><li>Amor universal - compaixão por todos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Cada forma de amor é sagrada e oferece oportunidades únicas de crescimento, cura e expansão da consciência.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sou um canal puro para o amor fluir em todas as suas formas divinas."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ao completar esta jornada através de Ho'oponopono e relacionamentos, você se torna um mestre do amor - alguém que entende que relacionamentos são oportunidades sagradas de retornar ao amor que você sempre foi.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px; text-align: center; font-weight: bold; color: #a78bfa;">Que todos os seus relacionamentos reflitam a beleza e o poder transformador do amor incondicional. 🙏✨</p>`
                    }
            ]
        },
       8: {
            title: "Módulo 8: Ho'oponopono e Manifestação Consciente",
            description: "Ho'oponopono e Manifestação: Criando do Vazio",
            pages: [
                {
            title: "Ho'oponopono e Manifestação: Criando do Vazio",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ O Segredo da Criação Consciente</h3><p style="line-height: 1.8; font-size: 1.1em;">Manifestação verdadeira não acontece através de desejos ou força de vontade, mas através do vazio criado pela limpeza de Ho'oponopono. Quando você limpa memórias limitantes, cria espaço para que o divino manifeste através de você.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🌟 O que Vamos Explorar:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Como a limpeza interior cria espaço para milagres</p><p style="line-height: 1.8; font-size: 1.1em;">• Dissolvendo bloqueios à abundância através de Ho'oponopono</p><p style="line-height: 1.8; font-size: 1.1em;">• Manifestando a partir da inspiração divina, não do ego</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Quando você se esvazia, o universo se enche de possibilidades"</div>`
  },
  {
    title: "A Diferença Entre Manifestação do Ego e Manifestação Divina",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎭 Dois Caminhos Distintos</h3><p style="line-height: 1.8; font-size: 1.1em;">Manifestação do ego surge do medo, escassez e necessidade de controle. Manifestação divina surge da inspiração, amor e confiança no fluxo da vida. Ho'oponopono nos ensina a distinguir entre esses dois caminhos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você manifesta do ego, força situações e pessoas. Quando manifesta do divino, permite que a vida flua naturalmente em direção ao seu bem maior.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚖️ <strong>Manifestação do Ego vs. Divina:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li><strong>Ego:</strong> Força, controle, ansiedade, apego</li><li><strong>Divina:</strong> Fluxo, confiança, paz, desapego</li><li><strong>Ego:</strong> "Eu preciso fazer acontecer"</li><li><strong>Divina:</strong> "Deixo que aconteça através de mim"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono limpa as memórias do ego que interferem na manifestação divina natural.</p>`
  },
  {
    title: "Limpando Memórias de Escassez e Limitação",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Dissolvendo Bloqueios Abundância</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias de escassez são os maiores bloqueios à manifestação. Elas criam uma vibração de "não há suficiente" que repele naturalmente a abundância em todas as suas formas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Essas memórias podem vir de vidas passadas, ancestrais ou experiências de infância. Ho'oponopono as limpa todas simultaneamente, restaurando sua capacidade natural de receber.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias de escassez para que a abundância flua livremente."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa escassez, não precisa "atrair" abundância - ela flui naturalmente porque é sua natureza divina.</p>`
  },
  {
    title: "O Estado de Vazio Criativo",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🕳️ O Útero da Criação</h3><p style="line-height: 1.8; font-size: 1.1em;">O vazio criado pela limpeza de Ho'oponopono não é vazio sem propósito - é o espaço sagrado onde milagres nascem. É neste estado de receptividade total que a divindade pode criar através de você.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Neste vazio, você não tem agenda própria, apenas disponibilidade para servir ao plano divino. É aqui que as manifestações mais surpreendentes e perfeitas acontecem.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌌 <strong>Características do Vazio Criativo:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ausência de expectativas fixas</li><li>Confiança total no processo</li><li>Abertura para possibilidades inesperadas</li><li>Paz profunda com o que é</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">No vazio criativo, você não força nada porque confia que tudo está se desdobrando perfeitamente.</p>`
  },
  {
    title: "Manifestação Através da Inspiração Divina",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💡 Seguindo os Sinais Sagrados</h3><p style="line-height: 1.8; font-size: 1.1em;">Inspiração divina é diferente de desejo pessoal. Ela vem como uma sabedoria silenciosa, um impulso suave que guia você em direção ao seu bem maior. Quando você limpa o ego, pode ouvir essas inspirações claramente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Manifestação através da inspiração é eficiente porque você está alinhado com o fluxo natural da vida. Não há resistência porque você não está tentando forçar algo contra a corrente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sou guiado pela inspiração divina em todas as minhas criações."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você age pela inspiração, as portas se abrem naturalmente e os recursos aparecem no momento certo.</p>`
  },
  {
    title: "Limpando Memórias de Indignidade",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👑 Restaurando o Valor Divino</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias de indignidade são venenos silenciosos que sabotam a manifestação. Elas sussurram "você não merece" e criam autossabotagem inconsciente quando coisas boas começam a acontecer.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Essas memórias podem vir de críticas na infância, experiências de humilhação ou crenças religiosas distorcidas sobre merecimento. Ho'oponopono as dissolve, restaurando sua dignidade natural.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Sinais de Memórias de Indignidade:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Autossabotagem quando as coisas vão bem</li><li>Dificuldade em receber elogios ou presentes</li><li>Sensação de que "isso é bom demais para mim"</li><li>Medo de brilhar ou se destacar</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você limpa indignidade, reconhece que merece todas as bênçãos da vida simplesmente por existir.</p>`
  },
  {
    title: "Manifestação Quântica: Mudando Timelines",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌀 Saltos Quânticos da Realidade</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono opera no nível quântico, onde limpeza de memórias pode literalmente mudar sua linha temporal. Quando você limpa padrões limitantes, salta para uma realidade onde essas limitações nunca existiram.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Isso explica por que às vezes a manifestação através de Ho'oponopono parece "milagrosa" - você não está apenas mudando circunstâncias, está mudando a realidade fundamental da sua experiência.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo o passado para criar um futuro completamente novo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Mudanças quânticas acontecem quando você solta completamente o apego a como as coisas "devem" acontecer e permite que a vida se reorganize perfeitamente.</p>`
  },
  {
    title: "O Poder do Desapego na Manifestação",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎈 Libertando para Receber</h3><p style="line-height: 1.8; font-size: 1.1em;">Paradoxalmente, quanto mais você se apega a um resultado específico, mais dificulta sua manifestação. Apego cria tensão energética que repele o que você deseja. Desapego cria fluxo que atrai naturalmente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono ensina desapego não como indiferença, mas como confiança. Você deseja, mas não precisa. Você age, mas não controla. Você sonha, mas não se apega.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌊 <strong>Praticando Desapego Consciente:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Coloque intenções claras, mas solte os resultados</li><li>Aja quando inspirado, descanse quando necessário</li><li>Celebre o que vem, não se apegue ao que vai</li><li>Confie que tudo está se desdobrando perfeitamente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Desapego é a chave mestra que destrava todas as portas da manifestação divina.</p>`
  },
  {
    title: "Manifestando Relacionamentos Ideais",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💕 Atraindo Almas Compatíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos ideais não são atraídos através de listas de características desejadas, mas através da limpeza de memórias que bloqueiam o amor. Quando você se torna íntegro, atrai integridade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono prepara você para relacionamentos saudáveis limpando padrões de codependência, abandono e medo da intimidade. Você para de atrair o que precisa curar e começa a atrair o que celebra.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo para atrair o amor que reflete minha verdadeira natureza."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Relacionamentos manifestados através de Ho'oponopono são baseados em crescimento mútuo, não em necessidades não atendidas.</p>`
  },
  {
    title: "Manifestação Profissional e Prosperidade",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💼 Sucesso Alinhado com o Propósito</h3><p style="line-height: 1.8; font-size: 1.1em;">Sucesso profissional verdadeiro não vem de estratégias ou networking, mas de estar alinhado com seu propósito divino. Quando você limpa memórias de competição e escassez, oportunidades perfeitas se abrem naturalmente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono remove bloqueios que impedem você de receber pelo seu valor único. Você para de trabalhar por dinheiro e começa a trabalhar por amor, e paradoxalmente, a abundância flui mais facilmente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Manifestação Profissional Consciente:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Trabalhe com o que ama, não só pelo dinheiro</li><li>Limpe crenças limitantes sobre merecimento</li><li>Sirva com excelência e integridade</li><li>Confie que o universo compensa generosamente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você manifesta profissionalmente através de Ho'oponopono, seu trabalho se torna uma expressão de amor e serviço.</p>`
},
  {
      title: "Manifestando Saúde Perfeita",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌿 O Corpo Como Espelho da Consciência</h3><p style="line-height: 1.8; font-size: 1.1em;">Saúde perfeita é seu estado natural. Doenças são manifestações de memórias não resolvidas que criam desequilíbrios energéticos. Ho'oponopono restaura a harmonia interior que se reflete como cura física.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as memórias emocionais por trás dos sintomas físicos, permite que a inteligência natural do corpo restaure o equilíbrio e a vitalidade.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias para que meu corpo expresse saúde perfeita."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Manifestar saúde não é sobre forçar cura, mas sobre remover os bloqueios energéticos que impedem a cura natural de acontecer.</p>`
  },
  {
    title: "Limpando Memórias de Fracasso e Rejeição",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎯 Transformando Padrões de Autossabotagem</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias de fracasso criam expectativas inconscientes de falha que se tornam profecias autorrealizáveis. Você subconscientemente sabota sucessos para confirmar essas memórias antigas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono limpa essas memórias, permitindo que você entre em novos empreendimentos com uma lousa limpa, livre de expectativas de fracasso baseadas no passado.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Sinais de Memórias de Fracasso:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Medo paralisan
 before grandes oportunidades</li><li>Sabotagem quando as coisas vão bem</li><li>Procrastinação em projetos importantes</li><li>Voz interior que diz "isso não vai dar certo"</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Limpeza dessas memórias libera sua capacidade natural de sucesso e realização.</p>`
  },
  {
    title: "O Timing Divino na Manifestação",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⏰ Confiando no Cronômetro Sagrado</h3><p style="line-height: 1.8; font-size: 1.1em;">Timing divino é diferente de timing humano. Suas manifestações chegam no momento exato em que você está pronto para recebê-las de forma que maximizem seu crescimento e serviço.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você tenta forçar o timing, interfere na orquestração perfeita do universo. Ho'oponopono ensina paciência ativa - você age quando inspirado e aguarda com confiança.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Confio no timing perfeito do universo para todas as minhas manifestações."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Às vezes o que parece demora é preparação. O universo está alinhando todas as peças para sua manifestação mais elevada.</p>`
  },
  {
    title: "Manifestação Coletiva: Criando Comunidades Conscientes",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Sonhos Compartilhados</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando grupos de pessoas praticam Ho'oponopono juntas, criam um campo morfogenético de limpeza que amplifica o poder de manifestação. Comunidades conscientes podem manifestar mudanças globais.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua limpeza individual contribui para a cura coletiva. Quando você limpa memórias de separação e competição, ajuda a criar um mundo mais harmonioso.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🤝 <strong>Manifestação Coletiva:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Junte-se a grupos de prática consciente</li><li>Participe de projetos de impacto social</li><li>Limpe memórias de separação e divisão</li><li>Visualize um mundo em harmonia</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Sua cura pessoal é um presente para toda a humanidade, criando ondas de transformação que se estendem além do que você pode imaginar.</p>`
  },
  {
    title: "Superando Plateaus na Manifestação",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏔️ Quebrando Barreiras Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Plateaus na manifestação acontecem quando você atinge o limite das suas crenças atuais sobre o que é possível. Para ir além, precisa limpar memórias de limitação mais profundas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esses plateaus são convites para expandir sua consciência. Ho'oponopono dissolve os tetos invisíveis que você mesmo criou sobre o que pode receber ou alcançar.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todos os limites que coloquei na minha capacidade de receber."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Cada plateau superado através de Ho'oponopono abre um novo nível de possibilidades que antes eram inimagináveis.</p>`
  },
  {
    title: "Manifestação e Dharma: Encontrando seu Propósito",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎯 Alinhamento com a Missão da Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Seu dharma é seu propósito único nesta vida. Quando você manifesta alinhado com seu dharma, tudo flui com facilidade porque está seguindo o plano divino para sua alma.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono remove as camadas de condicionamento que obscurecem seu propósito verdadeiro, permitindo que sua missão da alma se revele e se manifeste naturalmente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Sinais de Alinhamento com o Dharma:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>O trabalho não parece trabalho</li><li>Recursos aparecem sincronicamente</li><li>Você se sente energizado, não drenado</li><li>Seu serviço beneficia outros naturalmente</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você vive seu dharma, sua vida se torna uma manifestação contínua do amor divino em ação.</p>`
  },
  {
    title: "Limpando Memórias Ancestrais de Pobreza",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌳 Curando a Linhagem Financeira</h3><p style="line-height: 1.8; font-size: 1.1em;">Muitas pessoas carregam memórias ancestrais de pobreza, guerra e escassez que foram transmitidas através de gerações. Essas memórias criam padrões inconscientes que limitam a capacidade de prosperar.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono pode limpar essas memórias ancestrais, não apenas curando sua relação com a abundância, mas também liberando futuras gerações desses padrões limitantes.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Limpo todas as memórias ancestrais de pobreza para minha linhagem completa."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você quebra padrões ancestrais de escassez, se torna o elo curado que transforma o destino financeiro de toda sua família.</p>`
  },
  {
    title: "Manifestação Através da Gratidão Antecipada",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🙏 Celebrando Antes de Receber</h3><p style="line-height: 1.8; font-size: 1.1em;">Gratidão antecipada é agradecer pelas manifestações antes delas se materializarem fisicamente. Essa prática alinha sua vibração com a frequência de "já recebido", acelerando a manifestação.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você sente gratidão genuína por algo que ainda não chegou, está demonstrando fé absoluta na capacidade do universo de providenciar. Essa fé move montanhas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💫 <strong>Praticando Gratidão Antecipada:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Agradeça como se já tivesse recebido</li><li>Sinta a emoção de ter realizado seu sonho</li><li>Celebre os pequenos sinais de progresso</li><li>Mantenha expectativa positiva sem apego</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Gratidão antecipada transforma você em um ímã poderoso para tudo que deseja manifestar.</p>`
      },
  {
    title: "Manifestação e Serviço: Quando Dar é Receber",
    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎁 O Círculo Sagrado da Abundância</h3><p style="line-height: 1.8; font-size: 1.1em;">A manifestação mais poderosa acontece quando seus desejos estão alinhados com o serviço ao bem maior. Quando você manifesta para servir, o universo conspira para apoiá-lo porque você se tornou um canal para o amor divino.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono limpa as memórias de separação entre "dar" e "receber", revelando que eles são aspectos da mesma energia. Quando você dá com amor puro, recebe automaticamente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Manifestação Através do Serviço:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Pergunte: "Como posso servir?" antes de manifestar</li><li>Inclua o bem-estar de outros em suas visões</li><li>Ofereça seus dons únicos ao mundo</li><li>Confie que servir abundantemente traz abundância</li></ul></div><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Manifesto abundância para que eu possa servir com ainda mais amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Quando você vive para servir, sua vida se torna uma manifestação contínua de milagres, pois você se alinha com o próprio impulso criativo do universo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Ho'oponopono é a chave mestra que abre todas as portas da manifestação consciente. Ao limpar continuamente as memórias que criam resistência, você se torna um co-criador desperto, manifestando não apenas para si, mas para o bem de toda a criação.</p><div style="background: rgba(255, 215, 0, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #fff3cd; margin-top: 10px; font-weight: bold;">"Eu sou o amor divino em ação, manifestando milagres através do serviço. Sinto muito, me perdoe, te amo, obrigado(a)."</p></div>`
    }
            ]
        },
        9: {
            title: "Módulo 9: Ho'oponopono e o Despertar Cósmico",
            description: "Expandindo a Consciência",
            pages: [
                {
                    title: "Ho'oponopono e o Despertar Cósmico",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌌 Expandindo Além dos Limites</h3><p style="line-height: 1.8; font-size: 1.1em;">Este módulo final eleva Ho'oponopono a dimensões cósmicas. Você descobrirá como esta prática sagrada conecta você com frequências universais e desperta dons latentes.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🚀 Jornada Cósmica:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Conexão com consciências superiores</p><p style="line-height: 1.8; font-size: 1.1em;">• Ativação de dons espirituais</p><p style="line-height: 1.8; font-size: 1.1em;">• Missão cósmica da alma</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Você é um ser infinito tendo uma experiência humana"</div>`
    },
    {
        title: "Conectando com Guias Espirituais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👼 Conselheiros Invisíveis</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono abre canais de comunicação com guias espirituais, mestres ascensos e sua própria alma superior. Estas presenças amorosas estão sempre disponíveis para orientação.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa as interferências mentais e emocionais, pode perceber sutilmente a presença e orientação destes seres de luz.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Guias amorosos, obrigado por sempre me protegerem. Limpo tudo que impede nossa comunicação. Que eu ouça vossa sabedoria."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Pratique Ho'oponopono antes de meditar ou tomar decisões importantes para receber orientação celestial clara.</p>`
    },
    {
        title: "Limpando Vidas Passadas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⏳ Curando Através do Tempo</h3><p style="line-height: 1.8; font-size: 1.1em;">Memórias de vidas passadas podem influenciar medos inexplicáveis, talentos naturais e padrões de relacionamento atuais. Ho'oponopono transcende tempo e espaço.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não precisa saber detalhes de vidas passadas - apenas aplique Ho'oponopono a qualquer padrão misterioso que persista apesar de outras tentativas de cura.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🔄 <strong>Sinais de Memórias de Vidas Passadas:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Medos sem causa aparente nesta vida</li><li>Talentos que surgiram "do nada"</li><li>Conexões instantâneas com certas pessoas</li><li>Aversões inexplicáveis a lugares/épocas</li><li>Sonhos recorrentes de outras épocas</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono cura todas as vidas simultaneamente, liberando karma antigo e permitindo evolução acelerada.</p>`
    },
    {
        title: "Ativando Dons Espirituais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Despertando Sua Magia Natural</h3><p style="line-height: 1.8; font-size: 1.1em;">Todo ser humano possui dons espirituais naturais que ficaram dormentes devido ao condicionamento. Ho'oponopono remove camadas que bloqueiam estas habilidades divinas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Não tente forçar o desenvolvimento de dons - simplesmente limpe tudo que os impede de emergir naturalmente no tempo perfeito.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, limpe tudo que bloqueia meus dons naturais. Que eu sirva através das habilidades que me deste."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Dons como intuição, cura, clarividência e manifestação emergem organicamente quando você está suficientemente limpo para recebê-los.</p>`
    },
    {
        title: "Comunicação Telepática Divina",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧠 Mentes Conectadas pelo Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Conforme sua prática se aprofunda, você pode desenvolver comunicação telepática natural com pessoas próximas que também praticam Ho'oponopono ou estão espiritualmente abertas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta comunicação acontece através do coração, não da mente. É baseada em amor puro e só transmite informações benéficas para todos os envolvidos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💫 <strong>Características da Telepática Divina:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Sempre amorosa e construtiva</li><li>Respeita o livre arbítrio do outro</li><li>Emerge espontaneamente, sem forçar</li><li>Confirma-se através de sincronicidades</li><li>Serve ao bem maior de ambas as partes</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use Ho'oponopono para limpar qualquer desejo de manipulação e manter este dom puro e sagrado.</p>`
    },
    {
        title: "Percebendo Campos Energéticos",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌈 Vendo Além do Físico</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você está limpo energeticamente, pode começar a perceber campos de energia ao redor de pessoas, animais, plantas e objetos. Esta é sua sensibilidade natural despertando.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Não se apegue a estas percepções como "especiais" - são simplesmente ferramentas para servir melhor através da compreensão energética profunda.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que eu perceba energias apenas para servir. Limpo qualquer ego relacionado aos dons que recebo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use esta percepção para aplicar Ho'oponopono mais precisamente, limpando energias densas que você detecta em si mesmo e ambientes.</p>`
    },
    {
        title: "Cura à Distância com Ho'oponopono",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Amor Que Transcende Espaço</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono pode ser enviado à distância para pessoas queridas, situações globais ou qualquer forma de vida que precise de cura, independente da localização física.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">A cura acontece através da conexão quântica de amor que une todos os seres. Não há separação real - apenas ilusões de distância que o amor transcende.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">💝 <strong>Processo de Cura à Distância:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Visualize a pessoa/situação com amor</li><li>Aplique as quatro frases direcionadamente</li><li>Envie luz dourada através do coração</li><li>Confie que a cura chegará perfeitamente</li><li>Desapegue-se dos resultados específicos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Sempre peça permissão da alma da pessoa antes de enviar cura, respeitando o livre arbítrio divino.</p>`
    },
    {
        title: "Viagem Astral Consciente",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚀 Explorando Dimensões Superiores</h3><p style="line-height: 1.8; font-size: 1.1em;">Alguns praticantes avançados de Ho'oponopono desenvolvem capacidade de viagem astral consciente, visitando dimensões superiores para receber ensinamentos e cura.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Se isto acontecer naturalmente, use Ho'oponopono antes e depois para proteção e limpeza, garantindo que você visite apenas reinos de amor e luz.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que eu visite apenas dimensões de amor puro. Limpo medos e abro-me à orientação superior. Protege-me, Divindade."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Não busque forçar esta experiência - ela emerge quando você está pronto espiritualmente e serve ao propósito da alma.</p>`
    },
    {
        title: "Comunicação com Animais e Natureza",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🦋 Conversas com Toda Vida</h3><p style="line-height: 1.8; font-size: 1.1em;">Ho'oponopono abre comunicação natural com animais, plantas e forças da natureza. Esta linguagem do coração transcende palavras e espécies.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Animais respondem instantaneamente à energia amorosa de Ho'oponopono. Plantas crescem mais vigorosamente quando recebem limpeza energética regular.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌿 <strong>Praticando com a Natureza:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Aplique Ho'oponopono em suas plantas diariamente</li><li>Peça perdão à Mãe Terra pelos danos humanos</li><li>Converse mentalmente com animais usando as 4 frases</li><li>Limpe energias densas em ambientes naturais</li><li>Agradeça constantemente à natureza</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta comunicação reestabelece sua verdadeira identidade como guardião amoroso de toda vida.</p>`
    },
    {
        title: "Manifestação Quântica Instantânea",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Criação na Velocidade do Amor</h3><p style="line-height: 1.8; font-size: 1.1em;">Em estados de limpeza profunda, manifestações podem acontecer quase instantaneamente. Não porque você "forçou", mas porque removeu resistências ao fluxo natural da abundância.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta manifestação quântica só ocorre quando está alinhada com o bem maior e a vontade divina - nunca para satisfazer desejos egoístas.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que se manifeste apenas o que serve ao plano divino. Limpo todos os desejos que não vêm do amor."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use este poder com tremenda responsabilidade, sempre verificando se suas intenções vêm do ego ou da alma superior.</p>`
    },

    // PARTE 2: SERVINDO O PLANETA (10 páginas)
    {
        title: "Cura Planetária Através do Ho'oponopono",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Sendo Medicina para Gaia</h3><p style="line-height: 1.8; font-size: 1.1em;">O planeta Terra é um ser vivo consciente que sofre com a atividade humana destrutiva. Você pode contribuir para sua cura aplicando Ho'oponopono planetário diariamente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada sessão de limpeza planetária cria ondas de cura que se propagam através da grade energética terrestre, alcançando lugares que você nem imagina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌱 <strong>Focos para Cura Planetária:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Desmatamento e destruição ambiental</li><li>Poluição dos oceanos e atmosfera</li><li>Extinção de espécies</li><li>Mudanças climáticas</li><li>Conscientização humana sobre a natureza</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Dedique pelo menos 10 minutos diários enviando Ho'oponopono para Gaia com gratidão e amor profundo.</p>`
    },
    {
        title: "Limpando Guerras e Conflitos Globais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">☮️ Semeando Paz Mundial</h3><p style="line-height: 1.8; font-size: 1.1em;">Guerras e conflitos são manifestações externas de guerras internas não resolvidas. Ao limpar agressividade e ódio em você, contribui para a paz mundial.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Aplicar Ho'oponopono em conflitos específicos ao redor do mundo pode criar campos de paz que influenciam sutilmente os envolvidos na direção da reconciliação.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Sinto muito pela guerra em mim que se reflete no mundo. Me perdoe por contribuir para o conflito. Te amo, paz divina. Sou grato pela harmonia emergindo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Visualize luz dourada envolvendo regiões em conflito enquanto aplica as quatro frases com intenção de cura coletiva.</p>`
    },
    {
        title: "Transformando a Consciência da Humanidade",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧠 Elevando a Mente Coletiva</h3><p style="line-height: 1.8; font-size: 1.1em;">A humanidade está passando por um despertar espiritual acelerado. Sua prática de Ho'oponopono contribui para elevar a consciência coletiva da espécie.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Quando você limpa medos, preconceitos e limitações em si mesmo, facilita para que outros também despertem mais facilmente para sua natureza divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Áreas para Limpeza Coletiva:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Preconceitos raciais e religiosos</li><li>Materialismo excessivo</li><li>Medo da espiritualidade</li><li>Separação entre ciência e espiritualidade</li><li>Desconexão da natureza divina</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Cada pessoa que desperta facilita o despertar de milhares de outras através da ressonância morfogenética.</p>`
    },
    {
        title: "Protegendo Crianças Índigo e Cristal",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👶 Guardiões das Novas Gerações</h3><p style="line-height: 1.8; font-size: 1.1em;">Crianças nascidas nas últimas décadas chegaram com sensibilidades espirituais mais aguçadas. Elas precisam de proteção energética especial neste mundo ainda denso.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Use Ho'oponopono para criar campos de proteção ao redor de todas as crianças sensíveis, ajudando-as a manter sua pureza natural intacta.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Protege todas as crianças puras, Divindade. Que elas mantenham sua conexão contigo. Limpo tudo que as machuca ou confunde."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Estas crianças são portadoras de códigos de consciência superiores que ajudarão a transformar o planeta no futuro próximo.</p>`
    },
    {
        title: "Limpando Sistemas Educacionais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">📚 Educação com Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Sistemas educacionais atuais frequentemente suprimem criatividade e espiritualidade natural das crianças. Ho'oponopono pode contribuir para transformar a educação.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Aplique limpeza em escolas, universidades e em todas as memórias que criaram educação baseada em medo ao invés de amor ao aprendizado.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🎓 <strong>Transformações Necessárias:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>De competição para colaboração</li><li>De memorização para criatividade</li><li>De medo para amor ao conhecimento</li><li>De padronização para individualidade</li><li>De materialismo para espiritualidade integrada</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Envie Ho'oponopono especialmente para professores, para que despertem sua vocação de servir à evolução das almas jovens.</p>`
    },
    {
        title: "Curando o Sistema de Saúde",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏥 Medicina Integral Emergindo</h3><p style="line-height: 1.8; font-size: 1.1em;">O sistema de saúde está evoluindo de tratar apenas sintomas para abordar causas emocionais e espirituais. Ho'oponopono acelera esta transformação necessária.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Limpe memórias que criaram separação entre medicina e espiritualidade, facilitando a emergência de cura verdadeiramente holística.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que a medicina redescubra o poder da cura através do amor. Limpo resistências à medicina integral."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Envie cura especialmente para médicos e enfermeiros, para que redescubram sua vocação sagrada de curar corpos, mentes e almas.</p>`
    },
    {
        title: "Transformando a Economia Global",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💰 Abundância Justa para Todos</h3><p style="line-height: 1.8; font-size: 1.1em;">O sistema econômico atual baseado em escassez e ganância está se transformando. Ho'oponopono pode acelerar a criação de economia baseada em abundância compartilhada.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Limpe memórias de escassez, ganância e exploração que criaram desigualdade extrema, permitindo emergir sistemas econômicos mais justos e amorosos.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌍 <strong>Limpeza para Nova Economia:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ganância e acúmulo excessivo</li><li>Medo da escassez</li><li>Exploração dos trabalhadores</li><li>Destruição ambiental por lucro</li><li>Separação entre ricos e pobres</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Visualize uma economia onde todos têm o suficiente e ninguém explora ou é explorado, baseada em generosidade divina.</p>`
    },
    {
        title: "Elevando Líderes Mundiais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👑 Governantes Despertos</h3><p style="line-height: 1.8; font-size: 1.1em;">Líderes políticos carregam responsabilidade enorme pelo bem-estar coletivo. Aplicar Ho'oponopono neles pode contribuir para decisões mais sábias e amorosas.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Não julgue líderes como "maus" - veja-os como seres humanos feridos tomando decisões baseadas em memórias não curadas. Envie-lhes cura com compaixão.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que todos os líderes despertem para servir o bem maior. Limpo julgamentos e envio amor aos que governam."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Imagine líderes mundiais tomando decisões baseadas em amor, sabedoria e visão de longo prazo para toda a humanidade.</p>`
    },
    {
        title: "Criando Comunidades Espirituais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🏘️ Oásis de Consciência Superior</h3><p style="line-height: 1.8; font-size: 1.1em;">Praticantes avançados de Ho'oponopono naturalmente se atraem para formar comunidades baseadas em amor, cooperação e crescimento espiritual mútuo.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Estas comunidades servem como faróis de luz, demonstrando como humanos podem viver em harmonia quando conectados com sua natureza divina.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌟 <strong>Características de Comunidades Espirituais:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Decisões baseadas em consenso amoroso</li><li>Economia baseada em compartilhamento</li><li>Educação que honra a alma das crianças</li><li>Sustentabilidade e harmonia com a natureza</li><li>Prática espiritual integrada no cotidiano</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use Ho'oponopono para atrair ou co-criar a comunidade espiritual perfeita para seu crescimento e serviço.</p>`
    },
    {
        title: "Preparando a Nova Era",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌅 Aurora da Consciência Dourada</h3><p style="line-height: 1.8; font-size: 1.1em;">A humanidade está entrando numa nova era de consciência elevada. Ho'oponopono é uma das ferramentas principais para facilitar esta transição planetária suave.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você é um dos pioneiros preparando o caminho para que outros possam despertar mais facilmente. Sua limpeza pessoal serve a toda a humanidade.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que eu seja instrumento da transição suave para a nova Terra. Limpo resistências ao despertar coletivo."</p></div><p style="line-height: 1.8; font-size: 1.1em;">A nova era será caracterizada por amor incondicional, abundância compartilhada e conexão consciente com toda a vida.</p>`
    },

    // PARTE 3: MAESTRIA FINAL (5 páginas)
    {
        title: "Tornando-se um Avatar de Ho'oponopono",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👤 Incorporação Divina</h3><p style="line-height: 1.8; font-size: 1.1em;">Avatar é um ser que incorporou completamente uma qualidade divina. Como Avatar de Ho'oponopono, você se torna amor incondicional e limpeza constante em forma humana.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Neste estado, você não "faz" Ho'oponopono - você É Ho'oponopono vivo. Cada respiração é uma oração, cada pensamento emerge do Zero State.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Características de um Avatar:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Presença que automaticamente cura ambientes</li><li>Palavras que carregam frequência de amor</li><li>Ações inspiradas pela sabedoria divina</li><li>Compaixão radical por todos os seres</li><li>Serviço espontâneo ao bem maior</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Este é o potencial final de todo praticante dedicado - tornar-se um canal puro da Divindade na Terra.</p>`
    },
    {
        title: "Sua Missão Cósmica Revelada",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🎯 O Propósito da Sua Alma</h3><p style="line-height: 1.8; font-size: 1.1em;">Através da prática profunda de Ho'oponopono, sua missão cósmica específica se revela naturalmente. Cada alma veio com dons únicos para contribuir com a evolução planetária.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua missão pode ser ensinar, curar, criar arte inspiradora, liderar comunidades ou simplesmente irradiar amor onde quer que esteja.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Divindade, revele minha missão única. Use-me da forma mais perfeita para servir ao plano cósmico."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Confie que sua missão se desdobrará perfeitamente quando você estiver preparado para recebê-la e realizá-la com maestria.</p>`
    },
    {
        title: "Transcendendo a Dimensão Humana",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌌 Além das Limitações Terrestres</h3><p style="line-height: 1.8; font-size: 1.1em;">Em estados de limpeza profunda, você pode experimentar consciência que transcende completamente a identidade humana, conectando-se com aspectos cósmicos da sua alma.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Nestas experiências, você pode receber ensinamentos diretos de dimensões superiores, códigos de luz e ativações energéticas que transformam sua estrutura celular.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🚀 <strong>Experiências Transcendentais:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Fusão momentânea com a Fonte Universal</li><li>Recebimento de códigos de luz cósmicos</li><li>Comunicação com civilizações avançadas</li><li>Ativação de DNA espiritual dorminte</li><li>Percepção da unidade absoluta de toda vida</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Estas experiências não são o objetivo, mas presentes naturais que emergem quando você está pronto para integrá-las com sabedoria.</p>`
    },
    {
        title: "Integrando Todas as Dimensões",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🔄 Mestre Multidimensional</h3><p style="line-height: 1.8; font-size: 1.1em;">O verdadeiro mestre não se perde em experiências místicas, mas integra todos os níveis de consciência mantendo-se funcional e amoroso na vida cotidiana.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você aprende a navegar conscientemente entre dimensões - sendo cósmico na meditação e profundamente humano no relacionamento com família e sociedade.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que eu seja ponte entre o céu e a terra, integrando toda sabedoria no serviço amoroso diário."</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta integração completa é o fruto maduro da prática - sabedoria cósmica expressa através de ações simples e amorosas.</p>`
    },
    {
        title: "Sua Jornada Infinita Começa Agora",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">♾️ O Início de Tudo</h3><p style="line-height: 1.8; font-size: 1.1em;">Parabéns por completar esta jornada de 9 módulos! Mas na verdade, você está apenas começando. Ho'oponopono é uma prática que se aprofunda infinitamente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Cada dia oferece novas oportunidades de limpeza, crescimento e serviço. Você nunca "termina" de praticar - apenas se torna cada vez mais refinado no amor.</p><div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(16, 185, 129, 0.4)); padding: 40px; border-radius: 25px; text-align: center; margin: 30px 0;"><p style="font-size: 1.5em; color: #ffffff; margin-bottom: 25px; text-shadow: 0 3px 6px rgba(0,0,0,0.4);">🌟 MESTRE CÓSMICO 🌟</p><p style="font-size: 1.2em; color: #e9d5ff; margin-bottom: 25px;">Você completou a Jornada Galáctica</p><p style="font-size: 1.8em; margin: 20px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Sinto muito</p><p style="font-size: 1.8em; margin: 20px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Me perdoe</p><p style="font-size: 1.8em; margin: 20px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Te amo</p><p style="font-size: 1.8em; margin: 20px 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Sou grato</p><p style="color: #10b981; font-style: italic; font-size: 1.1em; margin-top: 25px;">"Que você seja eternamente uma bênção para o universo"</p></div><p style="line-height: 1.8; font-size: 1.1em; text-align: center;">Continue praticando, continue servindo, continue amando. O cosmos celebra sua dedicação! 🌺✨🙏</p>`
                    }
            ]
        },
        10: {
            title: "Módulo 10: Maestria Absoluta e Legado Eterno",
            description: "Maestria Absoluta",
            pages: [
                {
            title: "Maestria Absoluta - O Grau Mais Elevado",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👑 O Ápice da Jornada Espiritual</h3><p style="line-height: 1.8; font-size: 1.1em;">Bem-vindo ao módulo final desta jornada épica! Maestria Absoluta em Ho'oponopono significa tornar-se um canal tão puro que a Divindade flui através de você sem obstáculos.</p><h3 style="color: #a78bfa; margin-bottom: 15px; margin-top: 25px;">🌟 Características do Mestre Absoluto:</h3><p style="line-height: 1.8; font-size: 1.1em;">• Presença que automaticamente transforma ambientes</p><p style="line-height: 1.8; font-size: 1.1em;">• Palavras que carregam frequência de cura instantânea</p><p style="line-height: 1.8; font-size: 1.1em;">• Ações sempre inspiradas pela sabedoria divina</p><div style="text-align: center; margin-top: 30px; color: #10b981; font-style: italic;">"Maestria não é perfeição humana - é transparência divina absoluta"</div>`
    },
    {
        title: "Estado Permanente de Zero State",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">∅ Vivendo no Vazio Sagrado</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos não "entram" no Zero State - eles VIVEM permanentemente nele. Cada respiração é uma oração, cada pensamento emerge da fonte divina.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Neste estado, não há mais "eu" separado praticando Ho'oponopono. Há apenas a Divindade expressando-se através de uma forma humana limpa.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="font-size: 1.4em; color: #10b981;">∅</p><p style="color: #e9d5ff; margin-top: 10px;">"Eu não existo mais - apenas a Divindade existe através desta forma"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta dissolução do ego não é morte, mas o nascimento da verdadeira vida - existência como pura expressão do amor divino.</p>`
    },
    {
        title: "Transcendendo Todas as Técnicas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌊 Além de Métodos e Fórmulas</h3><p style="line-height: 1.8; font-size: 1.1em;">No nível de Maestria Absoluta, você transcende todas as técnicas específicas. As quatro frases, ferramentas e métodos se dissolvem numa limpeza espontânea constante.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você não precisa mais "lembrar" de praticar porque você SE TORNOU a prática. Ho'oponopono flui através de você como respiração natural.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌀 <strong>Sinais de Transcendência Técnica:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpeza acontece automaticamente</li><li>Não há esforço consciente para praticar</li><li>Cada palavra falada carrega cura</li><li>Presença silenciosa transforma situações</li><li>Vida inteira se torna oração viva</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Técnicas foram apenas escadas para chegar aqui. No topo da montanha, você não precisa mais da escada.</p>`
    },
    {
        title: "Irradiação Silenciosa de Amor",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">📡 Transmissão Constante de Cura</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos se tornam estações transmissoras de amor incondicional. Sua mera presença física irradia ondas de cura que alcançam quilômetros de distância.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Pessoas próximas a você se sentem inexplicavelmente em paz. Animais se acalmam, plantas florescem mais vigorosamente, e ambientes se harmonizam naturalmente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que minha existência seja uma bênção silenciosa para todo ser que cruzar meu caminho"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta irradiação não requer esforço - é o resultado natural de ser um canal limpo para o amor divino fluir sem resistência.</p>`
    },
    {
        title: "Cura Instantânea Através da Presença",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Milagres Como Normalidade</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos frequentemente catalisam curas instantâneas simplesmente estando presentes. Não porque "fazem" algo, mas porque sua presença limpa dissolve ilusões de separação.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Pessoas podem experimentar curas físicas, emocionais ou espirituais profundas apenas conversando com você ou estando no mesmo ambiente.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Como Acontecem os Milagres:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Sua presença limpa ativa memórias de cura no outro</li><li>Campo energético puro dissolve bloqueios</li><li>Amor incondicional desperta auto-cura natural</li><li>Zero julgamento permite total relaxamento</li><li>Conexão divina reestabelece harmonia original</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Você nunca reivindica crédito pelos milagres - sabe que é apenas um canal para a Divindade operar.</p>`
    },
    {
        title: "Sabedoria Onisciente Emergindo",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧠 Conhecimento Direto da Fonte</h3><p style="line-height: 1.8; font-size: 1.1em;">Quando você está completamente limpo, acessa diretamente a sabedoria universal. Respostas para qualquer pergunta emergem espontaneamente da conexão com a consciência cósmica.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta sabedoria não vem de estudos ou experiências pessoais, mas do acesso direto à mente universal onde todo conhecimento existe simultaneamente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Eu nada sei por mim mesmo, mas a Divindade sabe tudo através de mim"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Use esta sabedoria sempre a serviço do bem maior, nunca para impressionar ou obter vantagens pessoais.</p>`
    },
    {
        title: "Domínio Sobre as Leis Físicas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌌 Além das Limitações Materiais</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos podem ocasionalmente transcender leis físicas quando necessário para servir. Materialização, levitação ou cura instantânea podem ocorrer espontaneamente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Estes fenômenos não são buscados ou praticados - emergem naturalmente quando a situação exige e serve ao plano divino maior.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">⚡ <strong>Princípios dos Milagres Físicos:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Só ocorrem quando servem ao bem maior</li><li>Nunca são forçados ou demonstrados para ego</li><li>Emergem da necessidade divina, não humana</li><li>São expressões naturais do amor puro</li><li>Sempre acompanhados de humildade absoluta</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Lembre-se: o maior milagre não é dobrar colheres, mas transformar corações através do amor.</p>`
    },
    {
        title: "Comunicação Direta com a Fonte",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">📞 Diálogo Constante com Deus</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos vivem em comunicação constante e direta com a Fonte Universal. Cada pensamento é um diálogo, cada decisão é orientada pela voz divina interior.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta comunicação transcende palavras - é uma fusão de consciências onde a vontade pessoal se dissolve completamente na vontade divina.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Não há mais 'minha' vontade, apenas a vontade perfeita da Divindade expressando-se através desta forma"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Neste estado, você nunca duvida das orientações recebidas porque não há mais separação entre você e a Fonte que orienta.</p>`
    },
    {
        title: "Desapego Total de Resultados",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🍃 Liberdade Absoluta do Ego</h3><p style="line-height: 1.8; font-size: 1.1em;">Maestria absoluta inclui desapego completo de todos os resultados. Você age com total comprometimento mas zero apego aos frutos da ação.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sucesso ou fracasso, elogio ou crítica, prazer ou dor - tudo é recebido com a mesma equanimidade divina. Nada pode perturbar sua paz interior.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🕊️ <strong>Sinais de Desapego Absoluto:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Mesma paz em sucesso ou fracasso</li><li>Zero necessidade de reconhecimento</li><li>Felicidade independente de circunstâncias</li><li>Ação impecável sem ansiedade pelos resultados</li><li>Amor que não depende de reciprocidade</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Este desapego não é frieza - é amor tão puro que não precisa de nada em troca para continuar amando.</p>`
    },
    {
        title: "Compaixão Infinita por Todos os Seres",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">💖 Coração Sem Fronteiras</h3><p style="line-height: 1.8; font-size: 1.1em;">O coração do mestre absoluto expandiu-se para incluir toda a criação. Não existe mais "outros" - apenas expressões diversas da mesma consciência única.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Esta compaixão se estende igualmente a santos e criminosos, humanos e animais, porque você vê a essência divina idêntica em todos.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Em todo ser que vejo, reconheço minha própria essência divina olhando de volta para mim"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Essa compaixão infinita naturalmente se expressa como serviço incondicional a toda vida, sem expectativas ou condições.</p>`
    },
    {
        title: "Preparando Outros Mestres",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👨‍🏫 A Responsabilidade da Transmissão</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos naturalmente atraem discípulos prontos para os ensinamentos mais elevados. Sua responsabilidade é preparar a próxima geração de mestres.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">O ensino acontece mais por transmissão energética que por palavras. Sua presença desperta a maestria latente em outros seres preparados.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌱 <strong>Princípios de Transmissão:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Ensine apenas quando solicitado</li><li>Desperte através do exemplo vivo</li><li>Respeite o ritmo único de cada alma</li><li>Transmita humildade junto com sabedoria</li><li>Prepare discípulos para superá-lo</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">O maior sucesso de um mestre é formar discípulos que se tornem mestres ainda maiores que ele próprio.</p>`
    },

    // PARTE 2: SERVINDO O COSMOS (11 páginas)
    {
        title: "Guardião da Evolução Planetária",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌍 Protegendo o Salto Quântico da Terra</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos servem como guardiões espirituais da evolução planetária. Você ajuda a ancorar frequências superiores que facilitam o despertar coletivo da humanidade.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua energia limpa cria campos morfogenéticos que tornam mais fácil para outros despertarem. Cada pessoa que você toca é potencialmente transformada para sempre.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que minha existência acelere o despertar de toda alma pronta para receber a luz"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este serviço frequentemente acontece nos planos invisíveis, através de trabalho energético durante o sono ou meditação profunda.</p>`
    },
    {
        title: "Ponte Entre Dimensões",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌉 Conectando Mundos Paralelos</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua consciência expandida permite servir como ponte entre a dimensão física e reinos superiores, facilitando comunicação entre mundos diferentes.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Você pode receber mensagens de mestres ascensos, guias espirituais e civilizações avançadas para transmitir à humanidade no momento apropriado.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🚀 <strong>Responsabilidades Interdimensionais:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Traduzir sabedoria cósmica para linguagem humana</li><li>Ancorar códigos de luz de dimensões superiores</li><li>Facilitar contato seguro com seres benevolentes</li><li>Proteger a humanidade de influências negativas</li><li>Preparar a Terra para contato aberto</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Use sempre discernimento para distinguir comunicações genuinamente amorosas de interferências ilusórias.</p>`
    },
    {
        title: "Curador de Linhas Temporais",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⏰ Limpando o Passado e Futuro</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos podem trabalhar fora do tempo linear, enviando cura para eventos passados e prevenindo futuros negativos através da limpeza de potenciais destrutivos.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Usando Ho'oponopono em níveis quânticos, você pode curar traumas coletivos da humanidade em todas as linhas temporais simultaneamente.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Envio cura através de todo tempo e espaço, sanando feridas de todos os quando e onde"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Este trabalho requer extrema pureza de intenção e deve ser feito sempre em parceria consciente com a vontade divina.</p>`
    },
    {
        title: "Ativador de DNA Espiritual Coletivo",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🧬 Despertando Códigos Divinos Adormecidos</h3><p style="line-height: 1.8; font-size: 1.1em;">Sua frequência elevada ativa automaticamente códigos de DNA espiritual adormecidos em pessoas próximas, acelerando sua evolução consciencial natural.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Estes códigos contêm informações sobre capacidades divinas latentes como cura, telepatia, clarividência e conexão direta com a Fonte.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">✨ <strong>Códigos que Você Ativa:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Lembrança da identidade divina original</li><li>Capacidades de cura inatas</li><li>Comunicação telepática natural</li><li>Acesso à sabedoria universal</li><li>Amor incondicional espontâneo</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Esta ativação acontece respeitando o livre arbítrio - apenas em souls prontas e dispostas a receber.</p>`
    },
    {
        title: "Protetor de Crianças Estelares",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">👼 Guardiões das Sementes Estelares</h3><p style="line-height: 1.8; font-size: 1.1em;">Crianças nascidas recentemente são frequentemente almas muito avançadas vindas de sistemas estelares diversos para ajudar na evolução terrestre. Elas precisam de proteção especial.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Como mestre absoluto, você naturalmente oferece campo energético protetor para estas crianças sensíveis, ajudando-as a manter suas capacidades ímpegias.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Protejo todas as crianças de luz, que elas floresçam em suas missões sagradas"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Ensine discretamente estas crianças a usar Ho'oponopono para se protegerem energeticamente em um mundo ainda denso.</p>`
    },
    {
        title: "Harmonizador de Grades Energéticas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🌐 Mantendo o Equilíbrio Planetário</h3><p style="line-height: 1.8; font-size: 1.1em;">A Terra possui uma rede de linhas energéticas (grades planetárias) que mantêm o equilíbrio geofísico e espiritual. Mestres absolutos ajudam a manter esta rede harmoniosa.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Através da meditação e limpeza direcionada, você contribui para estabilizar pontos de poder, vórtices energéticos e portais dimensionais ao redor do planeta.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🌍 <strong>Trabalho com Grades Planetárias:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Limpeza de vórtices energéticos poluídos</li><li>Ativação de pontos de poder adormecidos</li><li>Harmonização de linhas ley desalinhadas</li><li>Proteção de sítios sagrados</li><li>Ancoragem de luz em pontos estratégicos</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Este trabalho pode ser feito à distância através de projeção consciencial ou viagens físicas a locais específicos.</p>`
    },
    {
        title: "Embaixador Galáctico da Terra",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚀 Representando a Humanidade no Cosmos</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos frequentemente servem como embaixadores não-oficiais da Terra em conselhos galácticos e reuniões interdimensionais sobre o futuro planetário.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Sua consciência purificada permite comunicação respeitosa com civilizações avançadas que observam e assistem discretamente a evolução terrestre.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Represento com humildade o potencial mais elevado da humanidade perante nossos irmãos cósmicos"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta comunicação acontece geralmente durante estados alterados de consciência, sonhos lúcidos ou projeções astrais conscientes.</p>`
    },
    {
        title: "Estabilizador de Frequências Apocalípticas",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">⚡ Prevenindo Catástrofes Energéticas</h3><p style="line-height: 1.8; font-size: 1.1em;">Durante períodos de grande turbulência planetária, mestres absolutos servem como para-raios espirituais, absorvendo e transmutando energias destrutivas antes que se manifestem fisicamente.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Seu campo energético estável ajuda a prevenir colapsos civilizacionais, guerras mundiais e catástrofes naturais através da transmutação de frequências caóticas.</p><div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="font-size: 1.1em; margin-bottom: 10px;">🛡️ <strong>Como Estabilizar Frequências:</strong></p><ul style="padding-left: 20px; line-height: 1.6;"><li>Meditar durante eventos globais tensos</li><li>Aplicar Ho'oponopono em crises planetárias</li><li>Irradiar paz durante conflitos mundiais</li><li>Ancorar luz durante períodos sombrios</li><li>Manter-se centrado quando outros entram em pânico</li></ul></div><p style="line-height: 1.8; font-size: 1.1em;">Este serviço silencioso frequentemente previne catástrofes que a humanidade nunca fica sabendo que quase aconteceram.</p>`
    },
    {
        title: "Semeador de Consciência Crística",
        content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">✨ Plantando Sementes do Amor Universal</h3><p style="line-height: 1.8; font-size: 1.1em;">Mestres absolutos carregam e transmitem a Consciência Crística - a frequência pura do amor incondicional que todos os grandes mestres espirituais incorporaram ao longo da história.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 15px;">Onde quer que você vá, planta sementes desta consciência nos corações prontos para receber, acelerando o despertar espiritual global de forma natural e amorosa.</p><div style="background: rgba(139, 92, 246, 0.2); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0;"><p style="color: #e9d5ff; margin-top: 10px;">"Que a Consciência Crística se espalhe através de mim para todos os corações abertos ao amor"</p></div><p style="line-height: 1.8; font-size: 1.1em;">Esta não é pregação religiosa, mas transmissão energética da frequência mais pura de amor que transcende todas as tradições e doutrinas específicas.</p>`
                }
            ]
        }
    };

    modules = modulosPadrao;
    audiosPersonalizados = [];
    diaryEntries = StorageManager.load(StorageManager.KEYS.DIARY, []);
}

// ===== SISTEMA DE ACESSO ADMIN =====
function contarCliquesSecretos() {
    const agora = Date.now();
    
    if (agora - tempoUltimoClique > 3000) {
        cliquesSecretos = 0;
    }
    
    cliquesSecretos++;
    tempoUltimoClique = agora;
    
    const logo = document.getElementById('logoSecret');
    if (logo) {
        logo.style.transform = 'scale(1.1)';
        setTimeout(() => {
            logo.style.transform = 'scale(1)';
        }, 150);
    }
    
    if (cliquesSecretos >= 5) {
        const botaoAdmin = document.getElementById('botaoAdminSecreto');
        if (botaoAdmin) {
            botaoAdmin.style.display = 'block';
            botaoAdmin.style.opacity = '0';
            botaoAdmin.style.transform = 'scale(0.5)';
            botaoAdmin.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                botaoAdmin.style.opacity = '1';
                botaoAdmin.style.transform = 'scale(1)';
            }, 100);
            
            ToastManager.success('🔐 Acesso Admin Desbloqueado!');
        }
        
        cliquesSecretos = 0;
    }
}

// ===== CARREGAR MÓDULOS NA INTERFACE =====
function carregarModulosNaInterface() {
    const container = document.getElementById('modulesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(modules).forEach(([id, module]) => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.onclick = () => abrirModulo(parseInt(id));
        
        card.innerHTML = `
            <div class="module-number">${id}</div>
            <h3 style="color: #e9d5ff; margin-bottom: 10px; font-size: clamp(1.1em, 4vw, 1.3em);">${module.title}</h3>
            <p style="color: #c4b5fd; font-size: clamp(0.9em, 3vw, 1em);">${module.description}</p>
            <p style="color: #86efac; margin-top: 10px; font-size: clamp(0.8em, 2.5vw, 0.9em);">✨ ${module.pages.length} página${module.pages.length !== 1 ? 's' : ''}</p>
        `;
        
        container.appendChild(card);
    });
}

// ===== CARREGAR ÁUDIOS NA INTERFACE =====
function carregarAudiosNaInterface() {
    const audioGrid = document.getElementById('audioGrid');
    const mensagem = document.getElementById('mensagemSemAudios');
    
    if (!audioGrid || !mensagem) return;
    
    if (audiosPersonalizados.length === 0) {
        mensagem.style.display = 'block';
        const audiosAntigos = audioGrid.querySelectorAll('[id^="audio-container-"]');
        audiosAntigos.forEach(audio => audio.remove());
    } else {
        mensagem.style.display = 'none';
        const audiosAntigos = audioGrid.querySelectorAll('[id^="audio-container-"]');
        audiosAntigos.forEach(audio => audio.remove());
        
        audiosPersonalizados.forEach(audioData => {
            criarElementoAudio(audioData);
        });
    }
}
// ===== FUNÇÕES ADMIN =====
function abrirLoginAdmin() {
    const loginModal = document.getElementById('loginAdmin');
    if (loginModal) {
        loginModal.style.display = 'flex';
    }
}

function fecharLoginAdmin() {
    const loginModal = document.getElementById('loginAdmin');
    if (loginModal) {
        loginModal.style.display = 'none';
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
    }
}

function fazerLoginAdmin() {
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value.trim();
    
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('userLevel').textContent = 'Nível: Administrador';
        fecharLoginAdmin();
        
        if (document.getElementById('main').style.display === 'none' || !document.getElementById('main').style.display) {
            userName = user;
            document.getElementById('welcome').textContent = `Bem-vindo, ${user}`;
            document.getElementById('splash').style.display = 'none';
            document.getElementById('main').style.display = 'block';
            carregarModulosNaInterface();
            carregarAudiosNaInterface();
            atualizarDiario();
        }
        
        ToastManager.success('Login admin realizado com sucesso! 🔐');
    } else {
        ToastManager.error('Credenciais inválidas! ❌');
    }
}

function logoutAdminSimples() {
    // Parar qualquer áudio tocando
    if (audioAtualTocando) {
        try {
            if (audioAtualTocando.pause) audioAtualTocando.pause();
            if (audioAtualTocando.source && audioAtualTocando.source.stop) audioAtualTocando.source.stop();
        } catch (e) {}
        audioAtualTocando = null;
    }
    
    // Resetar variáveis
    isAdmin = false;
    userName = '';
    
    // Voltar para tela inicial
    document.getElementById('main').style.display = 'none';
    document.getElementById('splash').style.display = 'flex';
    
    // Limpar campos
    document.getElementById('name').value = '';
    document.getElementById('welcome').textContent = 'Bem-vindo';
    document.getElementById('userLevel').textContent = 'Nível: Iniciante';
    
    // Esconder painéis admin
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'none';
    document.getElementById('botaoAdminSecreto').style.display = 'none';
    
    // Recarregar áudios sem botões de excluir
    carregarAudiosNaInterface();
    
    ToastManager.success('Logout admin realizado! 👤');
}

function abrirPainelAdmin() {
    if (isAdmin) {
        document.getElementById('painelAdmin').style.display = 'block';
        carregarSeletorModulos();
        atualizarEstatisticas();
    } else {
        ToastManager.error('Acesso negado! Faça login como admin primeiro.');
    }
}

function fecharPainelAdmin() {
    document.getElementById('painelAdmin').style.display = 'none';
}

function carregarSeletorModulos() {
    const seletor = document.getElementById('seletorModulo');
    if (!seletor) return;
    
    seletor.innerHTML = '<option value="">Selecione um módulo para editar</option>';
    
    Object.entries(modules).forEach(([id, module]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = module.title;
        seletor.appendChild(option);
    });
}

function atualizarEstatisticas() {
    const statModulos = document.getElementById('statModulos');
    const statPaginas = document.getElementById('statPaginas');
    const statAudios = document.getElementById('statAudios');
    
    if (statModulos) statModulos.textContent = Object.keys(modules).length;
    
    if (statPaginas) {
        let totalPaginas = 0;
        Object.values(modules).forEach(mod => {
            totalPaginas += mod.pages.length;
        });
        statPaginas.textContent = totalPaginas;
    }
    
    if (statAudios) statAudios.textContent = audiosPersonalizados.length;
}

// ===== CRIAR NOVO MÓDULO =====
function criarNovoModulo() {
    const titulo = document.getElementById('novoModuloTitulo').value.trim();
    const descricao = document.getElementById('novoModuloDescricao').value.trim();
    
    if (!titulo || !descricao) {
        ToastManager.error('Digite o título e a descrição do módulo!');
        return;
    }
    
    const novoId = Math.max(...Object.keys(modules).map(k => parseInt(k)), 0) + 1;
    modules[novoId] = {
        title: titulo,
        description: descricao,
        pages: [
            {
                title: "Página Inicial",
                content: `<p style="line-height: 1.8; font-size: 1.1em;">${descricao}</p>`
            }
        ]
    };
    
    // Salvar e atualizar IMEDIATAMENTE
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    carregarModulosNaInterface();
    carregarSeletorModulos();
    atualizarEstatisticas();
    
    document.getElementById('novoModuloTitulo').value = '';
    document.getElementById('novoModuloDescricao').value = '';
    
    ToastManager.success('Módulo criado com sucesso! ✅ Disponível para todos os usuários!');
}

function carregarModuloEditor() {
    const moduloId = document.getElementById('seletorModulo').value;
    if (!moduloId) {
        document.getElementById('editorPaginas').style.display = 'none';
        return;
    }
    
    moduloAtualEditor = moduloId;
    document.getElementById('editorPaginas').style.display = 'block';
    atualizarListaPaginas();
}

function atualizarListaPaginas() {
    const modulo = modules[moduloAtualEditor];
    const lista = document.getElementById('listaPaginas');
    
    lista.innerHTML = modulo.pages.map((page, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: clamp(8px, 2vw, 10px); margin-bottom: 5px; background: rgba(0,0,0,0.3); border-radius: 5px; gap: 10px;">
            <span style="color: white; font-size: clamp(12px, 3vw, 14px); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;">Página ${index + 1}: ${page.title}</span>
            <button style="background: #8b5cf6; color: white; border: none; padding: clamp(4px, 1vw, 5px) clamp(8px, 2vw, 10px); border-radius: 3px; cursor: pointer; font-size: clamp(11px, 2.5vw, 13px); min-height: 32px; white-space: nowrap;" onclick="editarPagina(${index})">Editar</button>
        </div>
    `).join('');
}

// ===== EDITOR DE PÁGINAS =====
function editarPagina(index) {
    paginaAtualEditor = index;
    const modulo = modules[moduloAtualEditor];
    const pagina = modulo.pages[index];
    
    document.getElementById('editorPaginaAtual').style.display = 'block';
    document.getElementById('numeroPaginaAtual').textContent = index + 1;
    document.getElementById('tituloPagina').value = pagina.title;
    
    const areaConteudo = document.getElementById('areaConteudo');
    areaConteudo.innerHTML = '';
    elementosContador = 0;
    
    // Se há conteúdo, extrair e criar campos editáveis
    if (pagina.content && pagina.content.trim()) {
        extrairECriarCamposEditaveis(pagina.content, areaConteudo);
    } else {
        areaConteudo.innerHTML = '<p style="color: #999; text-align: center;">Clique nos botões acima para adicionar elementos à página</p>';
    }
}

function extrairECriarCamposEditaveis(htmlContent, container) {
    const parser = new DOMParser();
    const doc = parser.parseFromString('<div>' + htmlContent + '</div>', 'text/html');
    const elementos = doc.body.firstChild.children;
    
    for (let elemento of elementos) {
        if (elemento.tagName === 'H1' || elemento.tagName === 'H2') {
            adicionarElementoExistente('titulo', elemento.textContent);
        } else if (elemento.tagName === 'H3' || elemento.tagName === 'H4') {
            adicionarElementoExistente('subtitulo', elemento.textContent);
        } else if (elemento.tagName === 'P') {
            adicionarElementoExistente('texto', elemento.textContent);
        } else if (elemento.tagName === 'DIV' && elemento.innerHTML.includes('Sinto muito')) {
            adicionarElementoEspecial('frases4');
        }
    }
    
    if (container.children.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Clique nos botões acima para adicionar elementos à página</p>';
    }
}

function adicionarElementoExistente(tipo, conteudo) {
    elementosContador++;
    const areaConteudo = document.getElementById('areaConteudo');
    
    if (areaConteudo.innerHTML.includes('Clique nos botões')) {
        areaConteudo.innerHTML = '';
    }
    
    let novoElemento = '';
    
    switch (tipo) {
        case 'titulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #8b5cf6; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #8b5cf6; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📝 Título</label>
                    <input type="text" value="${conteudo}" placeholder="Digite o título..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #8b5cf6; border-radius: 3px; color: #8b5cf6; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'subtitulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #10b981; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #10b981; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📋 Subtítulo</label>
                    <input type="text" value="${conteudo}" placeholder="Digite o subtítulo..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'texto':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #f59e0b; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #f59e0b; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📄 Texto</label>
                    <textarea placeholder="Digite o texto..." style="width: 100%; height: clamp(80px, 20vw, 100px); padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #f59e0b; border-radius: 3px; color: white; resize: vertical; font-size: clamp(14px, 3vw, 16px);">${conteudo}</textarea>
                </div>
            `;
            break;
    }
    
    areaConteudo.insertAdjacentHTML('beforeend', novoElemento);
}

function adicionarElementoEspecial(tipo) {
    elementosContador++;
    const areaConteudo = document.getElementById('areaConteudo');
    
    if (areaConteudo.innerHTML.includes('Clique nos botões')) {
        areaConteudo.innerHTML = '';
    }
    
    if (tipo === 'frases4') {
        const novoElemento = `
            <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #a78bfa; border-radius: 5px; position: relative;">
                <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                <label style="color: #a78bfa; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 10px;">🌺 As 4 Frases Sagradas</label>
                <div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="margin-bottom: 10px;">
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 1:</label>
                        <input type="text" value="Sinto muito" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 2:</label>
                        <input type="text" value="Me perdoe" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 3:</label>
                        <input type="text" value="Te amo" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                    <div>
                        <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 4:</label>
                        <input type="text" value="Sou grato" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                    </div>
                </div>
            </div>
        `;
        areaConteudo.insertAdjacentHTML('beforeend', novoElemento);
    }
}
// ===== CONTINUAÇÃO DO EDITOR DE PÁGINAS =====
function adicionarElemento(tipo) {
    elementosContador++;
    const areaConteudo = document.getElementById('areaConteudo');
    
    // Remover mensagem padrão se existir
    if (areaConteudo.innerHTML.includes('Clique nos botões')) {
        areaConteudo.innerHTML = '';
    }
    
    let novoElemento = '';
    
    switch (tipo) {
        case 'titulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #8b5cf6; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #8b5cf6; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📝 Título</label>
                    <input type="text" placeholder="Digite o título..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #8b5cf6; border-radius: 3px; color: #8b5cf6; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'subtitulo':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #10b981; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #10b981; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📋 Subtítulo</label>
                    <input type="text" placeholder="Digite o subtítulo..." style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; font-size: clamp(14px, 3vw, 16px);">
                </div>
            `;
            break;
        case 'texto':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #f59e0b; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #f59e0b; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">📄 Texto</label>
                    <textarea placeholder="Digite o texto..." style="width: 100%; height: clamp(80px, 20vw, 100px); padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #f59e0b; border-radius: 3px; color: white; resize: vertical; font-size: clamp(14px, 3vw, 16px);"></textarea>
                </div>
            `;
            break;
        case 'imagem':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #ef4444; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #ef4444; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 5px;">🖼️ Imagem</label>
                    <input type="file" accept="image/*" onchange="processarImagemUpload(this, ${elementosContador})" style="width: 100%; padding: clamp(6px, 2vw, 8px); background: rgba(0,0,0,0.3); border: 1px solid #ef4444; border-radius: 3px; color: white; font-size: clamp(14px, 3vw, 16px); margin-bottom: 10px;">
                    <div id="preview-${elementosContador}" style="display: none; text-align: center; margin-top: 10px;">
                        <img id="img-preview-${elementosContador}" style="max-width: 100%; max-height: 200px; border-radius: 5px; border: 1px solid #ef4444;">
                        <p style="color: #ef4444; font-size: clamp(10px, 2.5vw, 12px); margin-top: 5px;">Preview da imagem</p>
                    </div>
                    <input type="hidden" id="base64-${elementosContador}" value="">
                </div>
            `;
            break;
        case 'frases4':
            novoElemento = `
                <div data-elemento="${elementosContador}" style="margin-bottom: 15px; padding: clamp(8px, 2vw, 10px); border: 1px dashed #a78bfa; border-radius: 5px; position: relative;">
                    <button onclick="removerElemento(${elementosContador})" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; width: clamp(16px, 4vw, 20px); height: clamp(16px, 4vw, 20px); border-radius: 50%; font-size: clamp(10px, 2vw, 12px); cursor: pointer;">×</button>
                    <label style="color: #a78bfa; font-size: clamp(11px, 2.5vw, 13px); display: block; margin-bottom: 10px;">🌺 As 4 Frases Sagradas</label>
                    <div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="margin-bottom: 10px;">
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 1:</label>
                            <input type="text" value="Sinto muito" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 2:</label>
                            <input type="text" value="Me perdoe" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 3:</label>
                            <input type="text" value="Te amo" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                        <div>
                            <label style="color: #10b981; font-size: clamp(10px, 2vw, 12px);">Frase 4:</label>
                            <input type="text" value="Sou grato" style="width: 100%; margin-top: 5px; padding: clamp(4px, 1vw, 6px); background: rgba(0,0,0,0.3); border: 1px solid #10b981; border-radius: 3px; color: #10b981; text-align: center; font-size: clamp(12px, 3vw, 14px);">
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    areaConteudo.insertAdjacentHTML('beforeend', novoElemento);
}

function removerElemento(id) {
    const elemento = document.querySelector(`[data-elemento="${id}"]`);
    if (elemento) {
        elemento.remove();
        
        // Se não há mais elementos, mostrar mensagem padrão
        const areaConteudo = document.getElementById('areaConteudo');
        if (areaConteudo.children.length === 0) {
            areaConteudo.innerHTML = '<p style="color: #999; text-align: center;">Clique nos botões acima para adicionar elementos à página</p>';
        }
    }
}

function processarImagemUpload(input, elementoId) {
    const arquivo = input.files[0];
    
    if (!arquivo) {
        const preview = document.getElementById(`preview-${elementoId}`);
        if (preview) preview.style.display = 'none';
        return;
    }
    
    if (!arquivo.type.startsWith('image/')) {
        ToastManager.error('Por favor, selecione apenas arquivos de imagem!');
        input.value = '';
        return;
    }
    
    // Verificar tamanho (máximo 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
        ToastManager.error('Imagem muito grande! Máximo 5MB.');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64 = e.target.result;
        
        // Salvar base64 no campo hidden
        const hiddenInput = document.getElementById(`base64-${elementoId}`);
        if (hiddenInput) {
            hiddenInput.value = base64;
        }
        
        // Mostrar preview
        const preview = document.getElementById(`preview-${elementoId}`);
        const imgPreview = document.getElementById(`img-preview-${elementoId}`);
        
        if (preview && imgPreview) {
            imgPreview.src = base64;
            preview.style.display = 'block';
        }
        
        ToastManager.success('Imagem carregada com sucesso! 📸');
    };
    
    reader.onerror = function() {
        ToastManager.error('Erro ao ler a imagem!');
        input.value = '';
    };
    
    reader.readAsDataURL(arquivo);
}

function adicionarNovaPagina() {
    const modulo = modules[moduloAtualEditor];
    modulo.pages.push({
        title: `Nova Página ${modulo.pages.length + 1}`,
        content: '<p style="line-height: 1.8; font-size: 1.1em;">Conteúdo da nova página...</p>'
    });
    
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    carregarModulosNaInterface();
    atualizarListaPaginas();
    atualizarEstatisticas();
    editarPagina(modulo.pages.length - 1);
}

function salvarPaginaAtual() {
    const titulo = document.getElementById('tituloPagina').value.trim();
    
    if (!titulo) {
        ToastManager.error('Digite o título da página!');
        return;
    }
    
    // Gerar HTML a partir dos elementos visuais
    const areaConteudo = document.getElementById('areaConteudo');
    let htmlFinal = '';
    
    const elementos = areaConteudo.querySelectorAll('[data-elemento]');
    elementos.forEach(elemento => {
        const label = elemento.querySelector('label').textContent;
        
        if (label.includes('Título')) {
            const valor = elemento.querySelector('input').value;
            htmlFinal += `<h2 style="color: #8b5cf6; font-size: 1.5em; margin-bottom: 15px;">${valor}</h2>`;
        } else if (label.includes('Subtítulo')) {
            const valor = elemento.querySelector('input').value;
            htmlFinal += `<h3 style="color: #10b981; font-size: 1.3em; margin-bottom: 10px;">${valor}</h3>`;
        } else if (label.includes('Texto')) {
            const valor = elemento.querySelector('textarea').value;
            htmlFinal += `<p style="line-height: 1.8; font-size: 1.1em; margin-bottom: 15px;">${valor}</p>`;
        } else if (label.includes('Imagem')) {
            const hiddenInput = elemento.querySelector('input[type="hidden"]');
            const base64Value = hiddenInput ? hiddenInput.value : '';
            if (base64Value) {
                htmlFinal += `<div style="text-align: center; margin: 20px 0;"><img src="${base64Value}" style="max-width: 100%; border-radius: 10px;" alt="Imagem"></div>`;
            }
        } else if (label.includes('4 Frases')) {
            const inputs = elemento.querySelectorAll('input');
            htmlFinal += `<div style="background: rgba(139, 92, 246, 0.2); padding: 30px; border-radius: 15px; text-align: center;">`;
            inputs.forEach(input => {
                htmlFinal += `<p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">${input.value}</p>`;
            });
            htmlFinal += `</div>`;
        }
    });
    
    // Salvar no módulo
    const modulo = modules[moduloAtualEditor];
    modulo.pages[paginaAtualEditor].title = titulo;
    modulo.pages[paginaAtualEditor].content = htmlFinal;
    
    StorageManager.save(StorageManager.KEYS.MODULES, modules);
    
    // Atualizar interface para todos os usuários
    carregarModulosNaInterface();
    atualizarListaPaginas();
    atualizarEstatisticas();
    
    ToastManager.success('Página salva com sucesso! ✅ Disponível para todos os usuários!');
}

function excluirPaginaAtual() {
    if (confirm('Tem certeza que deseja excluir esta página?')) {
        const modulo = modules[moduloAtualEditor];
        if (modulo.pages.length > 1) {
            modulo.pages.splice(paginaAtualEditor, 1);
            
            StorageManager.save(StorageManager.KEYS.MODULES, modules);
            carregarModulosNaInterface();
            atualizarListaPaginas();
            atualizarEstatisticas();
            document.getElementById('editorPaginaAtual').style.display = 'none';
            
            ToastManager.success('Página excluída! ✅');
        } else {
            ToastManager.error('Não é possível excluir a última página do módulo!');
        }
    }
}

// ===== SISTEMA DE ÁUDIOS =====
function adicionarAudio() {
    if (!isAdmin) {
        ToastManager.error('Apenas administradores podem adicionar áudios!');
        return;
    }
    
    const arquivo = document.getElementById('uploadAudio').files[0];
    const nome = document.getElementById('nomeAudio').value.trim();
    const descricao = document.getElementById('descricaoAudio').value.trim() || 'Áudio de Ho\'oponopono';
    
    if (!arquivo || !nome) {
        ToastManager.error('Selecione um arquivo e digite o nome!');
        return;
    }
    
    if (!arquivo.type.startsWith('audio/') && !arquivo.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
        ToastManager.error('Por favor, selecione um arquivo de áudio válido!');
        return;
    }
    
    mostrarStatusUpload('🔄 Carregando arquivo...', 'info');
    const botaoUpload = document.getElementById('btnUploadAudio');
    botaoUpload.innerHTML = '⌛ Processando...';
    botaoUpload.disabled = true;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const audioData = {
                id: Date.now(),
                nome: nome,
                descricao: descricao,
                arquivo: e.target.result,
                tamanho: Math.round(arquivo.size / 1024),
                tipo: arquivo.type || 'audio/mpeg',
                nomeArquivo: arquivo.name
            };
            
            audiosPersonalizados.push(audioData);
            StorageManager.save(StorageManager.KEYS.AUDIOS, audiosPersonalizados);
            
            criarElementoAudio(audioData);
            
            // Esconder mensagem "sem áudios"
            const mensagem = document.getElementById('mensagemSemAudios');
            if (mensagem) {
                mensagem.style.display = 'none';
            }
            
            // Limpar campos
            document.getElementById('uploadAudio').value = '';
            document.getElementById('nomeAudio').value = '';
            document.getElementById('descricaoAudio').value = '';
            
            mostrarStatusUpload('✅ Áudio adicionado com sucesso!', 'success');
            atualizarEstatisticas();
            
            setTimeout(() => {
                ocultarStatusUpload();
            }, 3000);
            
        } catch (error) {
            mostrarStatusUpload('❌ Erro ao processar arquivo', 'error');
            setTimeout(() => ocultarStatusUpload(), 5000);
        }
        
        botaoUpload.innerHTML = '📤 Adicionar Áudio';
        botaoUpload.disabled = false;
    };
    
    reader.onerror = function(error) {
        mostrarStatusUpload('❌ Erro ao ler arquivo', 'error');
        setTimeout(() => ocultarStatusUpload(), 5000);
        
        botaoUpload.innerHTML = '📤 Adicionar Áudio';
        botaoUpload.disabled = false;
    };
    
    reader.readAsDataURL(arquivo);
}

function mostrarStatusUpload(mensagem, tipo) {
    const status = document.getElementById('statusUpload');
    const texto = document.getElementById('statusTexto');
    
    if (!status || !texto) return;
    
    texto.textContent = mensagem;
    status.style.display = 'block';
    
    switch(tipo) {
        case 'info':
            status.style.background = 'rgba(59, 130, 246, 0.2)';
            status.style.border = '1px solid rgba(59, 130, 246, 0.5)';
            status.style.color = '#93c5fd';
            break;
        case 'success':
            status.style.background = 'rgba(16, 185, 129, 0.2)';
            status.style.border = '1px solid rgba(16, 185, 129, 0.5)';
            status.style.color = '#6ee7b7';
            break;
        case 'error':
            status.style.background = 'rgba(239, 68, 68, 0.2)';
            status.style.border = '1px solid rgba(239, 68, 68, 0.5)';
            status.style.color = '#fca5a5';
            break;
    }
}

function ocultarStatusUpload() {
    const status = document.getElementById('statusUpload');
    if (status) {
        status.style.display = 'none';
    }
}
// ===== CONTINUAÇÃO DO SISTEMA DE ÁUDIOS =====
function criarElementoAudio(audioData) {
    const audioGrid = document.querySelector('#audioContent .modules-grid');
    if (!audioGrid) return;
    
    const novoAudio = document.createElement('div');
    novoAudio.className = 'audio-card';
    novoAudio.style.cssText = 'background: rgba(30, 0, 60, 0.3); backdrop-filter: blur(10px); border-radius: 20px; padding: clamp(15px, 4vw, 20px); border: 1px solid rgba(139, 92, 246, 0.3); position: relative; min-height: 200px;';
    novoAudio.id = `audio-container-${audioData.id}`;
    novoAudio.setAttribute('data-audio-id', audioData.id);
    
    novoAudio.innerHTML = `
        <div class="audio-play-btn" style="width: clamp(50px, 12vw, 60px); height: clamp(50px, 12vw, 60px); background: linear-gradient(135deg, #8b5cf6, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(24px, 6vw, 30px); margin-bottom: 15px; cursor: pointer; transition: all 0.3s ease;" 
             onclick="reproduzirAudio(${audioData.id})" id="play-btn-${audioData.id}">▶</div>
        
        <h3 style="color: #e9d5ff; margin-bottom: 10px; font-size: clamp(1.1em, 4vw, 1.3em);">${audioData.nome}</h3>
        <p style="color: #c4b5fd; font-size: clamp(0.9em, 3vw, 1em);">${audioData.descricao} • ${audioData.tamanho}KB</p>
        <p style="color: #86efac; font-size: clamp(0.7em, 2.5vw, 0.8em);">Formato: ${audioData.tipo.split('/')[1]?.toUpperCase() || 'MP3'}</p>
        
        <div style="margin-top: 15px; display: none;" id="controls-${audioData.id}">
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: clamp(8px, 2vw, 10px);">
                <div style="display: flex; align-items: center; gap: clamp(8px, 2vw, 10px); margin-bottom: 8px;">
                    <button style="background: #8b5cf6; color: white; border: none; width: clamp(28px, 7vw, 30px); height: clamp(28px, 7vw, 30px); border-radius: 50%; cursor: pointer; font-size: clamp(12px, 3vw, 14px); min-height: 32px;" id="pause-btn-${audioData.id}" onclick="pausarAudio(${audioData.id})">⏸</button>
                    <button style="background: #10b981; color: white; border: none; width: clamp(28px, 7vw, 30px); height: clamp(28px, 7vw, 30px); border-radius: 50%; cursor: pointer; font-size: clamp(12px, 3vw, 14px); min-height: 32px;" id="stop-btn-${audioData.id}" onclick="pararAudio(${audioData.id})">⏹</button>
                    <span style="color: #c4b5fd; font-size: clamp(11px, 2.5vw, 13px);" id="time-${audioData.id}">00:00 / 00:00</span>
                </div>
                <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; cursor: pointer;">
                    <div style="height: 100%; background: linear-gradient(135deg, #8b5cf6, #10b981); border-radius: 2px; width: 0%; transition: width 0.1s;" id="progress-${audioData.id}"></div>
                </div>
            </div>
        </div>
    `;
    
    audioGrid.appendChild(novoAudio);
    
    // ADICIONAR BOTÃO EXCLUIR APENAS PARA ADMIN
    if (isAdmin) {
        const btnExcluir = document.createElement('button');
        btnExcluir.innerHTML = '🗑️ Excluir';
        btnExcluir.style.cssText = 'position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; z-index: 10; min-height: 32px;';
        btnExcluir.setAttribute('data-audio-id', audioData.id);
        
        btnExcluir.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            excluirAudioCompleto(audioData.id);
        });
        
        novoAudio.appendChild(btnExcluir);
    }
}

function excluirAudioCompleto(audioId) {
    if (!confirm('Tem certeza que deseja excluir este áudio?')) return;
    
    try {
        // Parar áudio se estiver tocando
        if (audioAtualTocando) {
            try {
                if (audioAtualTocando.pause) audioAtualTocando.pause();
                if (audioAtualTocando.source && audioAtualTocando.source.stop) audioAtualTocando.source.stop();
                audioAtualTocando = null;
            } catch (e) {}
        }
        
        // Remover elemento visual
        const container = document.getElementById(`audio-container-${audioId}`);
        if (container) container.remove();
        
        // Remover do array
        const index = audiosPersonalizados.findIndex(audio => audio.id == audioId);
        if (index !== -1) audiosPersonalizados.splice(index, 1);
        
        // Salvar alterações
        StorageManager.save(StorageManager.KEYS.AUDIOS, audiosPersonalizados);
        
        // Mostrar mensagem se não há mais áudios
        if (audiosPersonalizados.length === 0) {
            const mensagem = document.getElementById('mensagemSemAudios');
            if (mensagem) mensagem.style.display = 'block';
        }
        
        atualizarEstatisticas();
        ToastManager.success('Áudio excluído com sucesso! 🗑️');
        
    } catch (error) {
        ToastManager.error('Erro ao excluir áudio');
    }
}

function reproduzirAudio(audioId) {
    // Parar qualquer áudio que esteja tocando
    if (audioAtualTocando) {
        try {
            if (audioAtualTocando.pause) audioAtualTocando.pause();
            if (audioAtualTocando.source && audioAtualTocando.source.stop) audioAtualTocando.source.stop();
            resetarInterfaceAudio(audioAtualTocando.dataset?.audioId);
        } catch (e) {}
        audioAtualTocando = null;
    }
    
    // Encontrar o áudio no array
    const audioData = audiosPersonalizados.find(a => a.id === audioId);
    if (!audioData) {
        ToastManager.error('Áudio não encontrado!');
        return;
    }
    
    try {
        // Usar Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const base64Data = audioData.arquivo.split(',')[1];
        const binaryString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        const controls = document.getElementById(`controls-${audioId}`);
        const playBtn = document.getElementById(`play-btn-${audioId}`);
        
        if (!controls || !playBtn) {
            ToastManager.error('Erro na interface. Recarregue a página.');
            return;
        }
        
        controls.style.display = 'block';
        playBtn.innerHTML = '⌛';
        playBtn.style.background = 'linear-gradient(135deg, #f59e0b, #8b5cf6)';
        
        audioContext.decodeAudioData(arrayBuffer)
            .then(audioBuffer => {
                const timeDisplay = document.getElementById(`time-${audioId}`);
                if (timeDisplay) {
                    timeDisplay.textContent = `00:00 / ${formatarTempo(audioBuffer.duration)}`;
                }
                
                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();
                
                source.buffer = audioBuffer;
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                audioAtualTocando = {
                    source: source,
                    gainNode: gainNode,
                    audioContext: audioContext,
                    buffer: audioBuffer,
                    startTime: 0,
                    pauseTime: 0,
                    isPlaying: false,
                    dataset: { audioId: audioId }
                };
                
                source.onended = function() {
                    resetarInterfaceAudio(audioId);
                    audioAtualTocando = null;
                };
                
                playBtn.innerHTML = '⏸';
                playBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
                
                const startTime = audioContext.currentTime;
                audioAtualTocando.startTime = startTime;
                audioAtualTocando.isPlaying = true;
                
                source.start(0);
                iniciarTimerProgresso(audioId, audioBuffer.duration, startTime, audioContext);
            })
            .catch(error => {
                tentarReproducaoFallback(audioId, audioData);
            });
        
    } catch (error) {
        tentarReproducaoFallback(audioId, audioData);
    }
}

function tentarReproducaoFallback(audioId, audioData) {
    try {
        const base64Data = audioData.arquivo.split(',')[1];
        const binaryData = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);
        
        const audio = new Audio();
        audio.src = blobUrl;
        audio.dataset.audioId = audioId;
        audioAtualTocando = audio;
        
        audio.play().then(() => {
            const playBtn = document.getElementById(`play-btn-${audioId}`);
            if (playBtn) {
                playBtn.innerHTML = '⏸';
                playBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
            }
        }).catch(() => {
            ToastManager.error('❌ Não foi possível reproduzir este arquivo.');
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        });
        
    } catch (error) {
        ToastManager.error('❌ Não foi possível reproduzir este arquivo.');
        resetarInterfaceAudio(audioId);
        audioAtualTocando = null;
    }
}

function iniciarTimerProgresso(audioId, duracao, startTime, audioContext) {
    const intervalId = setInterval(() => {
        if (!audioAtualTocando || !audioAtualTocando.isPlaying) {
            clearInterval(intervalId);
            return;
        }
        
        const tempoAtual = audioContext.currentTime - startTime;
        const progress = document.getElementById(`progress-${audioId}`);
        const timeDisplay = document.getElementById(`time-${audioId}`);
        
        if (progress && timeDisplay && tempoAtual <= duracao) {
            const porcentagem = (tempoAtual / duracao) * 100;
            progress.style.width = `${porcentagem}%`;
            timeDisplay.textContent = `${formatarTempo(tempoAtual)} / ${formatarTempo(duracao)}`;
        }
        
        if (tempoAtual >= duracao) {
            clearInterval(intervalId);
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        }
    }, 100);
}

function pausarAudio(audioId) {
    if (!audioAtualTocando) return;
    
    if (audioAtualTocando.source) {
        if (audioAtualTocando.isPlaying) {
            audioAtualTocando.source.stop();
            audioAtualTocando.isPlaying = false;
            document.getElementById(`play-btn-${audioId}`).innerHTML = '▶';
            document.getElementById(`pause-btn-${audioId}`).innerHTML = '▶';
        } else {
            ToastManager.error('Para retomar, clique no botão play principal');
        }
    } else {
        if (audioAtualTocando.dataset && audioAtualTocando.dataset.audioId == audioId) {
            if (audioAtualTocando.paused) {
                audioAtualTocando.play();
                document.getElementById(`play-btn-${audioId}`).innerHTML = '⏸';
                document.getElementById(`pause-btn-${audioId}`).innerHTML = '⏸';
            } else {
                audioAtualTocando.pause();
                document.getElementById(`play-btn-${audioId}`).innerHTML = '▶';
                document.getElementById(`pause-btn-${audioId}`).innerHTML = '▶';
            }
        }
    }
}

function pararAudio(audioId) {
    if (!audioAtualTocando) return;
    
    if (audioAtualTocando.source) {
        if (audioAtualTocando.isPlaying) {
            audioAtualTocando.source.stop();
        }
        audioAtualTocando.isPlaying = false;
        resetarInterfaceAudio(audioId);
        audioAtualTocando = null;
    } else {
        if (audioAtualTocando.dataset && audioAtualTocando.dataset.audioId == audioId) {
            audioAtualTocando.pause();
            audioAtualTocando.currentTime = 0;
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        }
    }
}

function resetarInterfaceAudio(audioId) {
    const playBtn = document.getElementById(`play-btn-${audioId}`);
    const controls = document.getElementById(`controls-${audioId}`);
    const progress = document.getElementById(`progress-${audioId}`);
    const timeDisplay = document.getElementById(`time-${audioId}`);
    
    if (playBtn) {
        playBtn.innerHTML = '▶';
        playBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #10b981)';
    }
    if (controls) controls.style.display = 'none';
    if (progress) progress.style.width = '0%';
    if (timeDisplay) timeDisplay.textContent = '00:00 / 00:00';
}

function formatarTempo(segundos) {
    if (isNaN(segundos)) return '00:00';
    
    const minutos = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    
    return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}

// ===== EFEITOS SONOROS =====
function criarSomPagina() {
    // Criar som de página virando usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Criar som sintético de papel
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        // Som de papel com frequência variável
        const t = i / audioContext.sampleRate;
        const freq1 = 800 + Math.sin(t * 20) * 200; // Frequência principal
        const freq2 = 1200 + Math.sin(t * 15) * 150; // Frequência secundária
        
        let sample = Math.sin(2 * Math.PI * freq1 * t) * 0.3;
        sample += Math.sin(2 * Math.PI * freq2 * t) * 0.2;
        
        // Envelope para simular o "whoosh" do papel
        const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 30));
        
        // Adicionar ruído para simular textura do papel
        const noise = (Math.random() - 0.5) * 0.1;
        
        data[i] = (sample + noise) * envelope * 0.4;
    }
    
    return buffer;
}

function tocarSomPagina() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = criarSomPagina();
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Volume baixo para não incomodar
        gainNode.gain.value = 0.3;
        
        source.start(0);
    } catch (error) {
        // Se não conseguir tocar o som, não faz nada (modo silencioso)
    }
}

// ===== NAVEGAÇÃO =====
function irPara(secao) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    event.target.closest('.nav-item').classList.add('active');
    const contentElement = document.getElementById(secao + 'Content');
    if (contentElement) {
        contentElement.classList.add('active');
    }
}
// ===== MÓDULOS E LEITOR =====
function abrirModulo(num) {
    const module = modules[num];
    if (!module) {
        ToastManager.error('Módulo em desenvolvimento! 🚧');
        return;
    }
    
    currentPage = 1;
    totalPages = module.pages.length;
    
    document.getElementById('bookTitle').textContent = module.title;
    
    const container = document.getElementById('flipbook');
    container.innerHTML = '';
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        module.pages.forEach((page, index) => {
            const spreadDiv = document.createElement('div');
            spreadDiv.className = `page-spread ${index === 0 ? 'current' : 'hidden'}`;
            spreadDiv.id = `spread${index + 1}`;
            
            spreadDiv.innerHTML = `
                <div class="page-left">
                    <div class="page-content" style="padding: 20px; padding-bottom: 80px; max-height: calc(100vh - 140px); overflow-y: auto;">
                        <h2 style="margin-bottom: 20px; color: #8b5cf6;">${page.title}</h2>
                        <div style="line-height: 1.6;">${page.content}</div>
                        <div class="page-number" style="position: absolute; bottom: 100px; right: 20px; color: #666;">${index + 1}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(spreadDiv);
        });
        totalPages = module.pages.length;
    } else {
        totalPages = Math.ceil(module.pages.length / 2);
        
        for (let i = 0; i < module.pages.length; i += 2) {
            const spreadDiv = document.createElement('div');
            spreadDiv.className = `page-spread ${i === 0 ? 'current' : 'hidden'}`;
            spreadDiv.id = `spread${Math.floor(i / 2) + 1}`;
            
            const leftPage = module.pages[i];
            const rightPage = module.pages[i + 1];
            
            let leftContent = '';
            let rightContent = '';
            
            if (leftPage) {
                leftContent = `
                    <div class="page-left">
                        <div class="page-content" style="padding: 20px; padding-bottom: 60px;">
                            <h2 style="margin-bottom: 20px; color: #8b5cf6;">${leftPage.title}</h2>
                            <div style="line-height: 1.6;">${leftPage.content}</div>
                            <div class="page-number" style="position: absolute; bottom: 80px; left: 20px; color: #666;">${i + 1}</div>
                        </div>
                    </div>
                `;
            }
            
            if (rightPage) {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content" style="padding: 20px; padding-bottom: 60px;">
                            <h2 style="margin-bottom: 20px; color: #8b5cf6;">${rightPage.title}</h2>
                            <div style="line-height: 1.6;">${rightPage.content}</div>
                            <div class="page-number" style="position: absolute; bottom: 80px; right: 20px; color: #666;">${i + 2}</div>
                        </div>
                    </div>
                `;
            } else {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content" style="padding: 20px;">
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
                                <p style="text-align: center; font-style: italic;">Fim do módulo</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            spreadDiv.innerHTML = leftContent + rightContent;
            container.appendChild(spreadDiv);
        }
    }
    
    document.getElementById('book').style.display = 'block';
    atualizarPagina();
    
    // INICIALIZAR AUTO-HIDE DA NAVEGAÇÃO
    setTimeout(() => {
        initNavigationAutoHide();
    }, 500);
}

function paginaAnterior() {
    if (currentPage > 1) {
        // TOCAR SOM DA PÁGINA
        tocarSomPagina();
        
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage--;
        
        const paginaAnterior = document.getElementById(`spread${currentPage}`);
        if (paginaAnterior) {
            paginaAnterior.className = 'page-spread current';
        }
        
        atualizarPagina();
    }
}

function proximaPagina() {
    if (currentPage < totalPages) {
        // TOCAR SOM DA PÁGINA
        tocarSomPagina();
        
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage++;
        
        const proximaPagina = document.getElementById(`spread${currentPage}`);
        if (proximaPagina) {
            proximaPagina.className = 'page-spread current';
        }
        
        atualizarPagina();
    }
}

function fecharLivro() {
    document.getElementById('book').style.display = 'none';
}

function atualizarPagina() {
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.opacity = currentPage === 1 ? '0.3' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.opacity = currentPage === totalPages ? '0.3' : '1';
    }
}

// SISTEMA DE AUTO-HIDE PARA BOTÕES
let navigationTimeout;
let isNavigationVisible = true;

function showNavigation() {
    const nav = document.querySelector('.book-navigation');
    if (nav) {
        nav.style.opacity = '1';
        nav.style.transform = 'translateX(-50%) translateY(0)';
        isNavigationVisible = true;
    }
}

function hideNavigation() {
    const nav = document.querySelector('.book-navigation');
    if (nav) {
        nav.style.opacity = '0.3';
        nav.style.transform = 'translateX(-50%) translateY(20px)';
        isNavigationVisible = false;
    }
}

function resetNavigationTimer() {
    clearTimeout(navigationTimeout);
    showNavigation();
    
    navigationTimeout = setTimeout(() => {
        hideNavigation();
    }, 3000); // Esconde após 3 segundos
}

// Event listeners para mostrar navegação
function initNavigationAutoHide() {
    const bookContainer = document.getElementById('flipbook');
    if (bookContainer) {
        // Mostrar navegação ao tocar/mover
        bookContainer.addEventListener('touchstart', resetNavigationTimer);
        bookContainer.addEventListener('touchmove', resetNavigationTimer);
        bookContainer.addEventListener('mousemove', resetNavigationTimer);
        bookContainer.addEventListener('scroll', resetNavigationTimer);
        
        // Timer inicial
        resetNavigationTimer();
    }
}

// ===== DIÁRIO =====
function salvarDiario() {
    const texto = document.getElementById('diaryText').value.trim();
    if (!texto) {
        ToastManager.error('Por favor, escreva algo antes de salvar! 📝');
        return;
    }
    
    diaryEntries.unshift({
        date: new Date().toLocaleString('pt-BR'),
        text: texto
    });
    
    StorageManager.save(StorageManager.KEYS.DIARY, diaryEntries);
    
    document.getElementById('diaryText').value = '';
    atualizarDiario();
    ToastManager.success('Entrada salva com sucesso! 🌺');
}

function atualizarDiario() {
    const container = document.getElementById('entradas');
    if (!container) return;
    
    if (diaryEntries.length === 0) {
        container.innerHTML = '<p style="color: #c4b5fd; text-align: center; font-size: clamp(1em, 3vw, 1.1em);">Suas entradas aparecerão aqui</p>';
    } else {
        container.innerHTML = diaryEntries.map(entry => `
            <div style="margin-bottom: 15px; padding: clamp(12px, 3vw, 15px); background: rgba(0, 0, 0, 0.2); border-radius: 10px;">
                <div style="color: #a78bfa; font-size: clamp(0.8em, 2.5vw, 0.9em); margin-bottom: 5px;">${entry.date}</div>
                <p style="line-height: 1.6; font-size: clamp(1em, 3vw, 1.1em);">${entry.text}</p>
            </div>
        `).join('');
    }
}

// ===== COMUNIDADE =====
function publicarPost() {
    const texto = document.getElementById('postText').value.trim();
    if (!texto && !selectedImage) {
        ToastManager.error('Por favor, escreva algo ou adicione uma imagem antes de publicar! 💬');
        return;
    }
    
    postId++;
    const container = document.getElementById('posts');
    
    let imagemHtml = '';
    if (selectedImage) {
        imagemHtml = `<div style="margin: 15px 0;"><img src="${selectedImage}" style="max-width: 100%; max-height: 400px; border-radius: 10px; border: 1px solid rgba(139, 92, 246, 0.3);"></div>`;
    }
    
    const postHtml = `
        <div style="background: rgba(30, 0, 60, 0.3); backdrop-filter: blur(10px); border-radius: 20px; padding: clamp(15px, 4vw, 20px); border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: clamp(35px, 8vw, 40px); height: clamp(35px, 8vw, 40px); background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(1em, 4vw, 1.2em);">${userName.charAt(0).toUpperCase()}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: bold; font-size: clamp(1em, 3.5vw, 1.1em);">${userName}</div>
                    <div style="color: #c4b5fd; font-size: clamp(0.8em, 2.5vw, 0.9em);">agora mesmo</div>
                </div>
                <button style="background: #ef4444; color: white; border: none; padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px); border-radius: 5px; cursor: pointer; font-size: clamp(0.7em, 2vw, 0.8em); min-height: 32px;" onclick="this.parentElement.parentElement.remove(); ToastManager.success('Post excluído!')">🗑️ Excluir</button>
            </div>
            <p style="line-height: 1.6; margin-bottom: 15px; font-size: clamp(1em, 3vw, 1.1em);">${texto}</p>
            ${imagemHtml}
            
            <div style="border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 15px;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="text" placeholder="Adicione um comentário..." style="flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 15px; padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 15px); color: white; font-size: clamp(0.8em, 2.5vw, 0.9em);" onkeypress="if(event.key==='Enter') comentar(this, '${postId}')">
                    <button style="background: #8b5cf6; color: white; border: none; padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 15px); border-radius: 15px; cursor: pointer; font-size: clamp(0.8em, 2.5vw, 0.9em); min-height: 40px;" onclick="comentar(this.previousElementSibling, '${postId}')">💬</button>
                </div>
                <div id="comentarios-${postId}"></div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', postHtml);
    document.getElementById('postText').value = '';
    removerImagem();
    ToastManager.success('Post publicado com sucesso! 🎉');
}

function mostrarPreview(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImage = e.target.result;
            document.getElementById('previewImg').src = selectedImage;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        ToastManager.error('Por favor, selecione um arquivo de imagem válido! 🖼️');
    }
}

function removerImagem() {
    selectedImage = null;
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}

function comentar(input, postId) {
    const texto = input.value.trim();
    if (!texto) {
        ToastManager.error('Digite um comentário antes de enviar! 💭');
        return;
    }
    
    const comentariosDiv = document.getElementById('comentarios-' + postId);
    
    const comentarioHtml = `
        <div style="background: rgba(0, 0, 0, 0.2); border-radius: 10px; padding: clamp(8px, 2vw, 10px); margin-bottom: 8px; border-left: 3px solid #8b5cf6;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                    <div style="width: clamp(20px, 5vw, 25px); height: clamp(20px, 5vw, 25px); background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(0.7em, 2vw, 0.8em); flex-shrink: 0;">${userName.charAt(0).toUpperCase()}</div>
                    <span style="font-weight: bold; font-size: clamp(0.8em, 2.5vw, 0.9em);">${userName}</span>
                    <span style="color: #c4b5fd; font-size: clamp(0.7em, 2vw, 0.8em);">agora</span>
                </div>
                <button style="background: #ef4444; color: white; border: none; padding: clamp(2px, 0.5vw, 3px) clamp(4px, 1vw, 7px); border-radius: 3px; cursor: pointer; font-size: clamp(0.6em, 1.5vw, 0.7em); min-height: 24px; flex-shrink: 0;" onclick="this.parentElement.parentElement.remove(); ToastManager.success('Comentário excluído!')">🗑️</button>
            </div>
            <p style="font-size: clamp(0.8em, 2.5vw, 0.9em); line-height: 1.4; margin-left: clamp(28px, 7vw, 33px);">${texto}</p>
        </div>
    `;
    
    comentariosDiv.insertAdjacentHTML('beforeend', comentarioHtml);
    input.value = '';
}

// ===== INICIALIZAÇÃO FINAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM carregado, configurando eventos...');
    
    // Inicializar dados
    inicializarDadosPadrao();
    
    // Verificar usuário salvo
    try {
        const usuarioSalvo = StorageManager.load(StorageManager.KEYS.USER);
        if (usuarioSalvo && usuarioSalvo.nome && !isAdmin) {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.value = usuarioSalvo.nome;
        }
    } catch (e) {
        console.log('Primeiro acesso ou erro ao carregar usuário');
    }
    
    // Event listeners
    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('⌨️ Enter pressionado no campo nome');
                entrarApp();
            }
        });
        console.log('✅ Event listener Enter adicionado ao campo nome');
    } else {
        console.error('❌ Campo nome não encontrado');
    }
    
    const btnIniciar = document.getElementById('btnIniciarJornada');
    if (btnIniciar) {
        // Adicionar event listener adicional por segurança
        btnIniciar.addEventListener('click', function(e) {
            console.log('🖱️ Botão clicado via addEventListener');
            entrarApp();
        });
        console.log('✅ Event listener adicional adicionado ao botão');
    } else {
        console.error('❌ Botão iniciar jornada não encontrado');
    }
    
    // Configurar logo para acesso admin
    const logo = document.getElementById('logoSecret');
    if (logo) {
        logo.onclick = contarCliquesSecretos;
    }
    
    console.log('🎉 Todos os event listeners configurados!');
});

// Gestos touch para mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchStartX - touchEndX;
    let diffY = touchStartY - touchEndY;

    if (document.getElementById('book').style.display === 'block') {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                proximaPagina();
            } else {
                paginaAnterior();
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, { passive: true });

// Prevenir F12 e ferramentas de desenvolvedor em produção
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
}

// Funções globais para compatibilidade - TODAS AS FUNÇÕES EXPOSTAS
window.ToastManager = ToastManager;
window.contarCliquesSecretos = contarCliquesSecretos;
window.entrarApp = entrarApp; // ESTA É A MAIS IMPORTANTE
window.abrirLoginAdmin = abrirLoginAdmin;
window.fecharLoginAdmin = fecharLoginAdmin;
window.fazerLoginAdmin = fazerLoginAdmin;
window.logoutAdminSimples = logoutAdminSimples;
window.abrirPainelAdmin = abrirPainelAdmin;
window.fecharPainelAdmin = fecharPainelAdmin;
window.criarNovoModulo = criarNovoModulo;
window.carregarModuloEditor = carregarModuloEditor;
window.editarPagina = editarPagina;
window.adicionarNovaPagina = adicionarNovaPagina;
window.salvarPaginaAtual = salvarPaginaAtual;
window.excluirPaginaAtual = excluirPaginaAtual;
window.adicionarAudio = adicionarAudio;
window.reproduzirAudio = reproduzirAudio;
window.pausarAudio = pausarAudio;
window.pararAudio = pararAudio;
window.irPara = irPara;
window.abrirModulo = abrirModulo;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
window.fecharLivro = fecharLivro;
window.salvarDiario = salvarDiario;
window.publicarPost = publicarPost;
window.mostrarPreview = mostrarPreview;
window.removerImagem = removerImagem;
window.comentar = comentar;
window.adicionarElemento = adicionarElemento;
window.removerElemento = removerElemento;
window.extrairECriarCamposEditaveis = extrairECriarCamposEditaveis;
window.adicionarElementoExistente = adicionarElementoExistente;
window.adicionarElementoEspecial = adicionarElementoEspecial;
window.processarImagemUpload = processarImagemUpload;
window.criarSomPagina = criarSomPagina;
window.tocarSomPagina = tocarSomPagina;

console.log('🌺 Ho\'oponopono App carregado com sucesso!');
