import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const porta = 3000;
const host = '0.0.0.0';
const usuarios = [];
const messages = [];
const usuarioAdmin = {
    nome: "usuario",
    senha: "senha",
}

function cadastrarUsuario(req, res) {
    const {nome, data_nascimento, apelido} = req.body;

    let conteudoResposta = '';

    if (!(nome && data_nascimento && apelido )) {
        conteudoResposta = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="formulario.css">
            <title>Cadastro</title>
        </head>
        <body>
            <div id="caixa">
                <form action="/formulario.html" method="POST">
        
                    <h3>CADASTRO</h3>
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" placeholder="Insira seu nome." value="${nome}" required>
        `;
        if (!nome) {
            conteudoResposta += `
                    <p class="rockDanger">O campo Nome é obrigatório</p>
            `;
        }

        conteudoResposta += `
                    <label for="data_nascimento">Data de nascimento:</label>
                        <input type="text" id="data" name="data_nascimento" placeholder="Insira seu aniversario." value="${data_nascimento}" required>
        `;
        if (!data_nascimento) {
            conteudoResposta += `
                    <p class="rockDanger">O campo data é obrigatório</p>
            `;
        }
        
        conteudoResposta += `
                    <label for="apelido">Nickname ou Usuario:</label>
                        <input type="text" id="apelido" name="apelido" placeholder="Insira seu nome de usuário." value="${apelido}" required>
        `;   
        if (!apelido) {
            conteudoResposta += `
                    <p class="rockDanger">O campo Nome de Usuário é obrigatório</p>
            `;
        }
        
        conteudoResposta += `
                    <br>
                    <button type="submit">Cadastrar</button>
    
                </form>
            </div>
        </body>
        </html>
        `;
        
        return res.status(400).end(conteudoResposta);

    } else {
        const usuario = {
            nome: nome,
            data_nascimento: data_nascimento,
            apelido: apelido,
        }

        usuarios.push(usuario);

        conteudoResposta = `
            <!DOCTYPE html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Usuário</title>
                <link rel="stylesheet" type="text/css" href="tabela.css">
            </head>
            <body>
                <header>
                    <h1>Usuários Cadastrados</h1>
                </header>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Data de aniversario</th>
                            <th>Nome de Usuário</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        for (const usuario of usuarios) {
            conteudoResposta += `
                <tr>
                    <td>${usuario.nome}</td>
                    <td>${usuario.data_nascimento}</td>
                    <td>${usuario.apelido}</td>
                </tr>
                    `;
        }

        conteudoResposta += `
                    </tbody>
                </table>
                <div class="btns">
                    <a class="btn" href="/" role="button">Voltar ao Menu</a>
                    <a class="btn" href="/formulario.html" role="button">Novo Cadastro</a>
                </div>
            </body>
            </html>
                `;

        return res.status(200).end(conteudoResposta);

    }
}

function auth(req, res, next) {
    if (req.session.usuarioAutenticado) {
        next();
    } else {
        res.status(401).redirect("/login.html");
    }
}

function getCurrentTimestamp() {
    return new Date().toLocaleString();
}

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), './public')));
app.use(cookieParser());
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
    }
}))


app.get('/', auth, (req, res) => {
    const dataUltimoAcesso = req.cookies.DataUltimoAcesso;
    const data = new Date();
    res.cookie("DataUltimoAcesso", data.toLocaleString(), {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true    
    });
    return res.end(`
        <!DOCTYPE html>
            <head>
                <meta charset="UTF-8>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" type="text/css" href="menu.css">
                <title>Menu</title>
                
            </head>
            <body>
                <header>
                    <h1>Menu</h1>
                </header>
                <a href="/formulario.html">Cadastro de Novo Usuario</a>
                <a href="/batepapo.html">Acesso ao bate papo</a>
                <a href="/logout">Sair</a>
            </body>
            <footer>
                <p>Ultimo Acesso: ${dataUltimoAcesso}</p>
            </footer>
        </html>        
    `)
});

app.get('/formulario.html', auth, (req, res) => {
    res.sendFile(path.join(process.cwd(), './PaginasHTML/formulario.html'));
});

app.post('/formulario', auth, cadastrarUsuario);

app.post('/login', (req, res) => {
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    if (usuario && senha && usuario === usuarioAdmin.nome && senha === usuarioAdmin.senha) {
        req.session.usuarioAutenticado = true;
        res.redirect('/');
    } else {
        console.log("Login falhou. Usuário ou senha incorretos."); 
        res.end(`
            <!DOCTYPE html>
                <head>
                    <meta charset="UTF-8">
                    <title>Login</title>
                    <link rel="stylesheet" type="text/css" href="errologin.css">
                </head>
                <body>
                    <div class="wrap">
                        <h1>Usuario ou senha invalidos</h1>
                        <a href="/login.html">Voltar ao login</a>
                    </div>
                </body> 
        `)
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao encerrar a sessão:", err);
            return res.status(500).end("Erro ao encerrar a sessão");
        }
        res.status(200).redirect('/login.html');
    });
});

app.get('/get-usuarios', (req, res) => {
    res.json({ usuarios: usuarios });
});


app.post('/enviar-mensagem', auth, (req, res) => {
    const usuario = req.body.usuario;
    const mensagem = req.body.mensagem;

    if (usuario && mensagem) {
        const timestamp = getCurrentTimestamp();
        const novaMensagem = { usuario, mensagem, timestamp };
        messages.push(novaMensagem);
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, error: 'Usuário e mensagem são obrigatórios.' });
    }
});

app.get('/get-mensagens', auth, (req, res) => {
    res.json(messages);
});



app.listen(porta, host, () => {
    console.log(`Servidor rodando na url http://localhost:3000`);
});
