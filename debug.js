const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const L = [];
  const log = m => { process.stdout.write(String(m)+'\n'); L.push(String(m)); };
  page.on('console', m => log('BR:'+m.text()));
  page.on('pageerror', e => log('ERR:'+e.message));
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0');
  try { await page.goto('https://neva-teplohod.ru/',{waitUntil:'networkidle2',timeout:60000}); } catch(e){log('goto:'+e);}
  await new Promise(r=>setTimeout(r,5000));
  const r = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('a,button'))
      .filter(e=>(e.innerText||'').trim().includes('\u041e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443'))
      .map(e=>({tag:e.tagName,href:e.getAttribute('href'),id:e.id,onclick:!!e.onclick,dataB24:e.getAttribute('data-b24-form')}));
    const scripts = Array.from(document.querySelectorAll('script'))
      .filter(s=>s.getAttribute('data-b24-form')||(s.textContent||'').includes('b24form'))
      .map(s=>({db24:s.getAttribute('data-b24-form'),txt:(s.textContent||'').replace(/\n/g,' ').slice(0,400)}));
    return {b24:typeof window.b24form, app:!!(window.b24form&&window.b24form.App), btns, scripts};
  });
  log('b24:'+r.b24+' app:'+r.app);
  log('BTNS:'+JSON.stringify(r.btns,null,2));
  log('SCRIPTS:'+JSON.stringify(r.scripts,null,2));
  fs.writeFileSync('debug2.txt',L.join('\n'));
  await browser.close();
})().catch(e=>{require('fs').writeFileSync('debug2.txt','FATAL:'+e);process.exit(1);});
