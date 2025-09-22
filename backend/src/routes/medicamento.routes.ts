import { Router } from 'express'
import { 
  getMedicamentos,
  getMedicamentoById,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento
} from '../controllers/MedicamentoController'

const router = Router()

router.get('/medicamentos', getMedicamentos)
router.get('/medicamentos/:id', getMedicamentoById)
router.post('/medicamentos', createMedicamento)
router.put('/medicamentos/:id', updateMedicamento)
router.delete('/medicamentos/:id', deleteMedicamento)

export default router