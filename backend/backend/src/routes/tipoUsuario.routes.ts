import { Router } from 'express'
import { 
    getTipos, 
    getTipoById, 
    getTipoByDescricao, 
    createTipo, 
    updateTipo, 
    deleteTipo 
} from '../controrllers/TipoUsuarioController'

const router = Router()

router.get('/', getTipos)

router.get('/:id', getTipoById)

router.get('/search/by-descricao', getTipoByDescricao)

router.post('/', createTipo)

router.put('/:id', updateTipo)

router.delete('/:id', deleteTipo)

export default router