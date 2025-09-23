import { Router } from 'express'
import { 
  getMedicamentos,
  getMedicamentoById,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento
} from '../controllers/MedicamentoController'

const router = Router()

router.get('/', getMedicamentos)
router.get('/:id', getMedicamentoById)
router.post('/', createMedicamento)
router.put('/:id', updateMedicamento)
router.delete('/:id', deleteMedicamento)

export default router