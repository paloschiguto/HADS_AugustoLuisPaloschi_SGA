import { Router } from 'express'
import { 
  getPacientes, 
  getPacienteById, 
  createPaciente, 
  updatePaciente, 
  deletePaciente 
} from '../controrllers/PacienteController'

const router = Router()

router.get('/', getPacientes)
router.get('/:id', getPacienteById)
router.post('/', createPaciente)
router.put('/:id', updatePaciente)
router.delete('/:id', deletePaciente)

export default router
