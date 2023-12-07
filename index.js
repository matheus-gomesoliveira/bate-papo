import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const porta = 3000;
const host = '0.0.0.0';
const listaUSU = [];
const messages = [];

function processaCadastroUsuario(req, res) {
    const dados = req.body;

    let conteudoResposta = '';

    if (!(dados.nome && dados.data && dados.usuario )) {
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
                    <label class="rotul" for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" placeholder="Insira seu nome." value="${dados.nome}" required>
        `;
        if (!dados.nome) {
            conteudoResposta += `
                    <p class="rockDanger">O campo Nome é obrigatório</p>
            `;
        }

        conteudoResposta += `
                    <label class="rotul" for="data">Data de nascimento:</label>
                        <input type="text" id="data" name="data" placeholder="Insira seu aniversario." value="${dados.data}" required>
        `;
        if (!dados.data) {
            conteudoResposta += `
                    <p class="rockDanger">O campo data é obrigatório</p>
            `;
        }
        
        conteudoResposta += `
                    <label class="rotul" for="usuario">Nickname ou Usuario:</label>
                        <input type="text" id="usuario" name="usuario" placeholder="Insira seu nome de usuário." value="${dados.usuario}" required>
        `;   
        if (!dados.usuario) {
            conteudoResposta += `
                    <p class="rockDanger">O campo Nome de Usuário é obrigatório</p>
            `;
        }
        
        conteudoResposta += `
                    <br>
                    <button id="BotCad" type="submit">Cadastrar</button>
    
                </form>
            </div>
        </body>
        </html>
        `;
        
        return res.end(conteudoResposta);

    } else {
        const usu = {
            nome: dados.nome,
            data: dados.data,
            usuario: dados.usuario,
        }

        listaUSU.push(usu);

        conteudoResposta = `
        <!DOCTYPE html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Usuário</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
        </head>
        <body>
            <h1>Usuários Cadastrados</h1>
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Data de aniversario</th>
                        <th>Nome de Usuário</th>
                    </tr>
                </thead>
                <tbody>`;
        
        for (const usu of listaUSU) {
            conteudoResposta += `
                <tr>
                    <td>${usu.nome}</td>
                    <td>${usu.data}</td>
                    <td>${usu.usuario}</td>
                </tr>
                    `;
        }

        conteudoResposta += `
                </tbody>
            </table>
            <a class="btn btn-primary" href="/" role="button">Voltar ao Menu</a>
            <a class="btn btn-outline-info" href="/formulario.html" role="button">Acessar Cadastro</a>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>    
            </body>
            </html>
                `;

        return res.end(conteudoResposta);

    }
}


function autenticar(req, res, next) {
    if (req.session.usuarioAutenticado) {
        next();
    } else {
        res.redirect("/login.html");
    }
}

const app = express();
app.use(cookieParser());

app.use(session({
    secret: "Minh4Chav3S3cr3T4",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
    }
}))

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), './PaginasHTML')));

app.get('/', autenticar, (req, res) => {
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
                <title>Menu do sistema</title>
                
            </head>
            <body>
                <h1>Menu</h1>
                <a href="/formulario.html">Cadastro de Novo Usuario</a>
                <a href="/batepapo.html">Acesso ao bate papo</a>
            </body>
            <footer>
                <p>Ultimo Acesso: ${dataUltimoAcesso}</p>
            </footer>
        </html>        
    `)
});

app.get('/formulario.html', autenticar, (req, res) => {
    res.sendFile(path.join(process.cwd(), './PaginasHTML/formulario.html'));
});

app.post('/formulario.html', autenticar, processaCadastroUsuario);

app.post('/login', (req, res) => {
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    console.log("Usuario:", usuario, "Senha:", senha); 

    if (usuario && senha && usuario === 'Gustavo' && senha === '123') {
        req.session.usuarioAutenticado = true;
        res.redirect('/');
    } else {
        console.log("Login falhou. Usuário ou senha incorretos."); 
        res.end(`
            <!DOCTYPE html>
                <head>
                    <meta charset="UTF-8">
                    <title>Falha no login</title>
                    <link rel="stylesheet" type="text/css" href="errologin.css">
                </head>
                <body>
                    <h1>Usuario ou senha invalidos</h1>
                    <a href="/login.html">Voltar ao login</a>
                </body> 
        `)
    }
});

app.get('/get-usuarios', (req, res) => {
    res.json({ usuarios: listaUSU });
});

function getCurrentTimestamp() {
    return new Date().toLocaleString();
}

app.post('/enviar-mensagem', autenticar, (req, res) => {
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

app.get('/get-mensagens', autenticar, (req, res) => {
    res.json(messages);
});


app.listen(porta, host, () => {
    console.log(`Servidor rodando na url http://localhost:3000`);
});
