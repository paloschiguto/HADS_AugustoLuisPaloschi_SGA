import { Router } from 'express'
import { 
  getAtendimentos,
  getAtendimentoById,
  createAtendimento,
  updateAtendimento,
  deleteAtendimento
} from '../controllers/AtendimentoController'

const router = Router()

router.get('/', getAtendimentos)
router.get('/:id', getAtendimentoById)
router.post('/', createAtendimento)
router.put('/:id', updateAtendimento)
router.delete('/:id', deleteAtendimento)

export default router
