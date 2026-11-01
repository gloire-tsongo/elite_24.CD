document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const editor = document.querySelector('#content-editor');
  const contentValue = document.querySelector('#content-value');
  const imageInput = document.querySelector('#editor-image-input');
  if (!form || !editor || !contentValue) return;

  const syncContent = () => { contentValue.value = editor.innerHTML; };

  const insertImage = async file => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      window.alert('L’image ne doit pas dépasser 10 Mo.');
      return;
    }
    const data = new FormData();
    data.append('image', file);
    const response = await fetch('/admin/editor-images', { method: 'POST', body: data });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Impossible d’importer l’image.');
    document.execCommand('insertHTML', false, `<img src="${result.url}" alt="" loading="lazy">`);
    syncContent();
    editor.focus();
  };

  document.querySelector('[data-action="insertImage"]')?.addEventListener('click', () => imageInput?.click());
  imageInput?.addEventListener('change', async () => {
    try { await insertImage(imageInput.files[0]); } catch (error) { window.alert(error.message); }
    imageInput.value = '';
  });

  document.querySelectorAll('.toolbar button').forEach(button => {
    button.addEventListener('mousedown', event => event.preventDefault());
  });

  document.querySelectorAll('[data-command]').forEach(button => {
    button.addEventListener('click', () => {
      const command = button.dataset.command;
      const value = button.dataset.value;
      if (command === 'createLink') {
        const url = window.prompt('Adresse du lien');
        if (url) document.execCommand(command, false, url);
      } else {
        document.execCommand(command, false, value || null);
      }
      syncContent();
      editor.focus();
    });
  });

  editor.addEventListener('input', syncContent);
  form.addEventListener('submit', event => {
    syncContent();
    if (!editor.textContent.trim()) {
      event.preventDefault();
      editor.focus();
    }
  });
});