import { Router } from 'express'
import { solicitarRecuperacao, redefinirSenha } from '../controllers/RecuperarSenhaController'

const router = Router()

router.post('/solicitar', solicitarRecuperacao)

router.post('/redefinir', redefinirSenha)

export default router