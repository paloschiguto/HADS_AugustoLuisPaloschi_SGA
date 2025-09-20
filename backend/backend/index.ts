import express from 'express'
import tipoUsuarioRoutes from './src/routes/tipoUsuario.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use('/tipos', tipoUsuarioRoutes)

app.get('/', (req, res) => {
    res.send('API do SGA rodando!')
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})