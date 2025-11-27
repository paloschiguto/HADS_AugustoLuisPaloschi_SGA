import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/SGA',
    withCredentials: true
})

export const fetchPacientes = async () => {
    const res = await api.get('/pacientes')
    return res.data
}

export const fetchMedicamentos = async () => {
    const res = await api.get('/medicamentos') 
    return res.data
}

export const fetchAgendaDoDia = async (data) => {
    try {
        const url = data ? `/agenda?data=${data}` : '/agenda'
        const res = await api.get(url)
        return res.data
    } catch (err) {
        console.error('Erro ao buscar agenda:', err)
        throw err
    }
}

export const realizarBaixa = async (itemAgendaId, temperatura) => {
    try {
        const res = await api.post('/agenda/baixa', { itemAgendaId, temperatura })
        return res.data
    } catch (err) {
        console.error('Erro ao realizar baixa:', err)
        throw err
    }
}

export const criarPrescricao = async (dados) => {
    try {
        const res = await api.post('/agenda/prescricoes', dados)
        return res.data
    } catch (err) {
        console.error('Erro ao criar prescrição:', err)
        throw err
    }
}