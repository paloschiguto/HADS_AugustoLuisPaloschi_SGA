import { Router } from 'express'
import { 
  getMedicamentosAtend,
  getMedicamentoAtendById,
  createMedicamentoAtend,
  updateMedicamentoAtend,
  deleteMedicamentoAtend
} from '../controllers/MedicamentoAtendController'

const router = Router()

router.get('/medicamentos-atend', getMedicamentosAtend)
router.get('/medicamentos-atend/:id', getMedicamentoAtendById)
router.post('/medicamentos-atend', createMedicamentoAtend)
router.put('/medicamentos-atend/:id', updateMedicamentoAtend)
router.delete('/medicamentos-atend/:id', deleteMedicamentoAtend)

export default router