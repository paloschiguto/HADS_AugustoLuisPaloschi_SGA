import { Router } from 'express'
import { 
  createPrescricao,
  getAgendaDoDia,
  realizarBaixaAgenda
} from '../controllers/AgendaController'

const router = Router()

router.get('/', getAgendaDoDia)

router.post('/prescricoes', createPrescricao)

router.post('/baixa', realizarBaixaAgenda)

export default router