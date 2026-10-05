
const URL = 'http://localhost:3001/api';
async function handleResponse(response) {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
             const err = await response.json();
             throw err;
        } else {
             throw { error: response.statusText }; 
        }
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
        return await response.json();
    }
    return null;
}

async function getPublicSummaries() {
    const response = await fetch(`${URL}/summaries`, { credentials: 'include' });
    return handleResponse(response);
}

async function getUserSummaries() {

    const response = await fetch(`${URL}/summaries/my`, { credentials: 'include' });
    return handleResponse(response);
}



async function getSummaryById(id) {
    const response = await fetch(`${URL}/summaries/${id}`, { 
        credentials: 'include' 
    });
    return handleResponse(response);
}


async function login(username, password) {
    const response = await fetch(`${URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
    });
    return handleResponse(response);
}

async function logout() {
    await fetch(`${URL}/sessions/current`, { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
    const response = await fetch(`${URL}/sessions/current`, { credentials: 'include' });
    return handleResponse(response);
}

async function getTemplates(themeId) {
  const response = await fetch(`${URL}/themes/${themeId}/templates`, { credentials: 'include' });
  return handleResponse(response);
}
async function getTemplatePages(templateId) {
  const response = await fetch(`${URL}/templates/${templateId}`, { credentials: 'include' });
  return handleResponse(response);
}



async function createSummary(summaryData, pages) {
    const payload = { ...summaryData, pages };
    const response = await fetch(`${URL}/summaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
    });
    return handleResponse(response);
}



async function updateSummary(id, summaryData, pages) {
    const payload = { ...summaryData, pages };

    const response = await fetch(`${URL}/summaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
    });
    return handleResponse(response);
}

async function deleteSummary(id) {
    const response = await fetch(`${URL}/summaries/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok) return true;
    else {
        const err = await response.json();
        throw err;
    }
}

async function getThemes() {
    const response = await fetch(`${URL}/themes`);
    return handleResponse(response);
}

async function getBackgrounds(themeId) {
    const response = await fetch(`${URL}/backgrounds/${themeId}`, { credentials: 'include' });
    return handleResponse(response);
}

async function getSummaryForPlayer(id) {
    const response = await fetch(`${URL}/player/${id}`);
    return handleResponse(response);
}

const API = { getPublicSummaries, getUserSummaries, getSummaryById, login, logout, getUserInfo, createSummary, updateSummary, deleteSummary, getThemes, getBackgrounds, getSummaryForPlayer,getTemplatePages,getTemplates};
export default API;