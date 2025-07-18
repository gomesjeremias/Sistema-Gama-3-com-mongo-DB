// auth_new.js - Autenticação usando API com JWT

import * as api from './api.js';

const SESSION_KEY = 'sales_app_session';

export async function login(username, password) {
    try {
        const responseData = await api.login(username, password);
        return responseData;
    } catch (error) {
        console.error('Erro no login:', error);
        return false;
    }
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

export function checkAuth() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
        return false;
    }
    
    try {
        const sessionData = JSON.parse(session);
        
        // Verificar se a sessão ainda é válida (token não expirado)
        if (!sessionData.loggedIn || !sessionData.token) {
            return false;
        }
        
        // Opcional: verificar se o token não expirou
        // Por simplicidade, vamos confiar no servidor para validar o token
        
        return true;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
}

export function signup(username) {
    // Esta função seria para a tela de cadastro
    // Por simplicidade, vamos pular a implementação completa por agora.
    console.log(`Tentativa de cadastro para: ${username}`);
    return false; // Desabilitado por padrão
}

