import { Router } from 'express'
import { getPermissoes } from '../controllers/PermissaoController'

const router = Router()

router.get('/', getPermissoes)

export default router
