import { Router } from 'express'
import { estatisticasMedico, atendimentosRecentesMedico } from '../controllers/DashboardController'

const router = Router()

router.get('/medico/estatisticas', estatisticasMedico)
router.get('/medico/recentes', atendimentosRecentesMedico)

export default router
