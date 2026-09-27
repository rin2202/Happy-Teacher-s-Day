const id = location.pathname.split('/').filter(Boolean).pop();

const scene = document.querySelector('.scene-wish');
const button = document.getElementById('openButton');
const loading = document.getElementById('loading');

async function loadWish() {
  try {
    const res = await fetch('/api/wishes?id=' + encodeURIComponent(id));

    if (!res.ok) {
      throw new Error('not found');
    }

    const wish = await res.json();

    document.title = `給 ${wish.teacherName} 的教師節祝福`;

    document.getElementById('wishMessage').textContent = wish.message;
    document.getElementById('signature').textContent = `— ${wish.studentName}`;

    loading.textContent = `給 ${wish.teacherName} 的一份心意`;

    button.addEventListener('click', () => {
      scene.classList.add('opened');
    });

  } catch {
    loading.textContent = '這份祝福找不到了，可能連結不正確。';
    button.style.display = 'none';
  }
}

loadWish();
