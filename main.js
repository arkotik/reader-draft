function replaceTitles(el) {
  const titles = el.querySelectorAll('title');
  const makeDiv = html => {
    const div = document.createElement('div');
    div.classList.add('section-title');
    div.innerHTML = html;
    return div;
  };
  for (const title of titles) {
    title.replaceWith(makeDiv(title.innerHTML));
  }
}

function replaceEmptyLines(el) {
  el.innerHTML = el.innerHTML.replace(/<\/?empty-line>/gm, '<br>');
}

function calcSizes() {
  const el = document.createElement('p');
  el.style.setProperty('opacity', '0');
  el.style.setProperty('display', 'block');
  el.style.setProperty('width', 'fit-content');
  el.style.setProperty('text-indent', '0');
  document.querySelector('.text').appendChild(el);
  const map = {};
  for (let code = 0; code <= 10000; code++) {
    el.innerText = String.fromCharCode(code);
    map[code] = el.getBoundingClientRect().width;
    // if (code === 128) {
    //   code = 'А'.charCodeAt(0) - 1;
    // }
  }
  el.innerText = String.fromCharCode(5, 5);
  let letterSpacing = el.getBoundingClientRect().width - (2 * map[5]);
  el.innerText = String.fromCharCode(5, 32, 5);
  map[32] = el.getBoundingClientRect().width - (2 * map[5]);
  el.remove();
  return { letterSpacing, map };
}

function calcAbzLength(abz) {
  let length = 0;
  const len = abz.length;
  for (let i = 0; i < len; i++) {
    length += SIZES.map[abz.charCodeAt(i)] + SIZES.letterSpacing;
  }
  return length;
}
