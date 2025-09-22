import { Router } from 'express'
import { 
  getAtendimentos,
  getAtendimentoById,
  createAtendimento,
  updateAtendimento,
  deleteAtendimento
} from '../controllers/AtendimentoController'

const router = Router()

router.get('/atendimentos', getAtendimentos)
router.get('/atendimentos/:id', getAtendimentoById)
router.post('/atendimentos', createAtendimento)
router.put('/atendimentos/:id', updateAtendimento)
router.delete('/atendimentos/:id', deleteAtendimento)

export default router
