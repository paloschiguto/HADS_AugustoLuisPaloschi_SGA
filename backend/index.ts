import express from 'express'
import tipoUsuarioRoutes from './src/routes/tipoUsuario.routes'
import usuarioRoutes from './src/routes/usuario.routes'
import pacienteRoutes from './src/routes/paciente.routes'

const app = express()
const PORT = process.env.PORT || 3000
const api = "SGA"

app.use(express.json())

app.use(`/${api}/tipos`, tipoUsuarioRoutes)
app.use(`/${api}/usuarios`, usuarioRoutes)
app.use(`/${api}/pacientes`, pacienteRoutes)

app.get(`/${api}`, (req, res) => {
    res.send('API do SGA rodando!')
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
