document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('n8nForm');
    const submitBtn = document.getElementById('submitBtn');
    const notification = document.getElementById('notification');

    // Substitua esta URL pelo Webhook do seu N8N
    const N8N_WEBHOOK_URL = 'https://n8n-webhook.confortareco.com/webhook/70b18ce7-e172-464f-a253-f918688aa6d8';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpa notificações anteriores
        notification.classList.remove('show', 'success', 'error');

        // Ativa estado de carregamento no botão
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Coleta os dados do formulário
        const formData = new FormData(form);

        // Formata a data para o padrão com fuso horário local (ex: -03:00)
        const now = new Date();
        const offset = -now.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const pad = (num) => String(Math.floor(Math.abs(num))).padStart(2, '0');
        const tzStr = `${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
        const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${String(now.getMilliseconds()).padStart(3, '0')}${tzStr}`;

        // Cria o payload exatamente no formato esperado pelo N8N
        const payload = [
            {
                "Nicho": formData.get('nicho'),
                "submittedAt": localIso,
                "formMode": "test"
            }
        ];

        try {
            // Opcional: Se quiser testar antes de ter a URL real do N8N configurada
            if (N8N_WEBHOOK_URL.includes('seu-n8n.com')) {
                throw new Error('Configure a URL do Webhook do N8N no arquivo script.js');
            }

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer SEU_TOKEN' // Descomente e adicione se usar Bearer Auth no N8N
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar os dados para o servidor.');
            }

            // Sucesso
            showNotification('Sucesso! Seu motor de prospecção foi disparado.', 'success');
            form.reset();

        } catch (error) {
            console.error('Erro na submissão:', error);
            // Mensagem de erro que lida até mesmo com CORS ou bloqueios do navegador
            const errorMessage = error.message.includes('Configure a URL')
                ? error.message
                : 'Não foi possível enviar no momento. Verifique sua conexão ou tente novamente mais tarde.';
            showNotification(errorMessage, 'error');
        } finally {
            // Restaura o botão
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
    }
});
