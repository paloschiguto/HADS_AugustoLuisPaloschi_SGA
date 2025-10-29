import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import tipoUsuarioRoutes from './src/routes/tipoUsuario.routes'
import usuarioRoutes from './src/routes/usuario.routes'
import pacienteRoutes from './src/routes/paciente.routes'
import medicamentoRoutes from './src/routes/medicamento.routes'
import atendimentoRoutes from './src/routes/atendimento.routes'
import medicamentoAtendRoutes from './src/routes/medicamentoAtend.routes'
import loginRoutes from './src/routes/login.routes'
import recuperarSenhaRoutes from './src/routes/recuperarSenha.routes'
import meRoutes from './src/routes/me.routes'
import permissaoRoutes from './src/routes/permissao.routes'
import dashboardRoutes from './src/routes/dashboard.routes'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const api = "SGA"

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.use(`/${api}/tipos`, tipoUsuarioRoutes)
app.use(`/${api}/usuarios`, usuarioRoutes)
app.use(`/${api}/pacientes`, pacienteRoutes)
app.use(`/${api}/medicamentos`, medicamentoRoutes)
app.use(`/${api}/atendimentos`, atendimentoRoutes)
app.use(`/${api}/medicamentosAtend`, medicamentoAtendRoutes)
app.use(`/${api}/login`, loginRoutes)
app.use(`/${api}/redefinirSenha`, recuperarSenhaRoutes)
app.use(`/${api}/me`, meRoutes)
app.use(`/${api}/permissoes`, permissaoRoutes)
app.use(`/${api}/dashboard`, dashboardRoutes)

app.get(`/${api}`, (req, res) => {
    res.send('API do SGA rodando!')
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
