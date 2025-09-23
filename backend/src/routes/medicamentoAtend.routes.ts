import { Router } from 'express'
import { 
  getMedicamentosAtend,
  getMedicamentoAtendById,
  createMedicamentoAtend,
  updateMedicamentoAtend,
  deleteMedicamentoAtend
} from '../controllers/MedicamentoAtendController'

const router = Router()

router.get('/', getMedicamentosAtend)
router.get('/:id', getMedicamentoAtendById)
router.post('/', createMedicamentoAtend)
router.put('/:id', updateMedicamentoAtend)
router.delete('/:id', deleteMedicamentoAtend)

export default router