const $ = (id) => document.getElementById(id);
const toast = $('toast');
function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }

$('createWish').addEventListener('click', async () => {
  const studentName = $('studentName').value.trim();
  const teacherName = $('teacherName').value.trim();
  const message = $('message').value.trim();
  if (!studentName || !teacherName || !message) return showToast('請把三個欄位都寫好喔 ♡');
  const btn = $('createWish'); btn.disabled = true; btn.textContent = '正在準備祝福…';
  try {
    const res = await fetch('/api/wishes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({studentName, teacherName, message}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    $('wishUrl').value = data.url; $('previewLink').href = data.url;
    $('result').hidden = false;
    $('result').scrollIntoView({behavior:'smooth', block:'center'});
  } catch (e) { showToast('送出失敗，請再試一次。'); }
  finally { btn.disabled = false; btn.textContent = '送出祝福 ♡'; }
});

$('copyLink').addEventListener('click', async () => {
  const url = $('wishUrl').value;
  try { await navigator.clipboard.writeText(url); showToast('連結已複製！'); }
  catch { $('wishUrl').select(); document.execCommand('copy'); showToast('連結已複製！'); }
});

$('shareLink').addEventListener('click', async () => {
  const url = $('wishUrl').value;
  if (navigator.share) {
    try { await navigator.share({title:'給老師的一份心意 ♡', text:'我為你準備了一份教師節小卡，打開看看吧！', url}); } catch {}
  } else {
    try { await navigator.clipboard.writeText(url); showToast('已複製連結，可以貼到 LINE / Messenger 囉！'); }
    catch { showToast('請複製上面的連結分享給老師。'); }
  }
});$('closeResult').addEventListener('click', () => {
  $('result').hidden = true;
});
