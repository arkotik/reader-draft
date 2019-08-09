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

function getCharSize(code, spacing = 0) {
  const char = String.fromCharCode(code);
  const el = document.createElement('p');
  el.style.setProperty('opacity', '0');
  el.style.setProperty('display', 'block');
  el.style.setProperty('width', 'fit-content');
  el.style.setProperty('text-indent', '0');
  document.querySelector('.text').appendChild(el);
  el.innerText = char;
  let size = el.getBoundingClientRect().width;
  if (size === 0) {
    const testChar = String.fromCharCode(5);
    el.innerText = testChar;
    const testSize = el.getBoundingClientRect().width;
    el.innerText = testChar + char + testChar;
    size = el.getBoundingClientRect().width - (2 * (testSize + spacing));
  }
  el.remove();
  return size;
}

function calcSizes() {
  const el = document.createElement('p');
  el.style.setProperty('opacity', '0');
  el.style.setProperty('display', 'block');
  el.style.setProperty('width', 'fit-content');
  el.style.setProperty('text-indent', '0');
  document.querySelector('.text').appendChild(el);
  const map = {};
  for (let code = 0; code <= 1300; code++) {
    el.innerText = String.fromCharCode(code);
    map[code] = el.getBoundingClientRect().width;
    if (code === 128) {
      code = 'А'.charCodeAt(0) - 1;
    }
  }
  el.innerText = String.fromCharCode(5, 5);
  let letterSpacing = el.getBoundingClientRect().width - (2 * map[5]);
  el.innerText = String.fromCharCode(5, 32, 5);
  map[32] = el.getBoundingClientRect().width - (2 * map[5]);
  el.remove();
  return { letterSpacing, map };
}

function calcTextLength(text) {
  let length = 0;
  const len = text.length;
  for (let i = 0; i < len; i++) {
    const code = text.charCodeAt(i);
    if (undefined === SIZES.map[code]) {
      SIZES.map[code] = getCharSize(code, SIZES.letterSpacing);
    }
    length += SIZES.map[code] + SIZES.letterSpacing;
  }
  return length;
}

function calcAbzLines(text, width) {
  const spaceSize = SIZES.map[32];
  const words = text.split(' ');
  const len = words.length;
  let linesCount = 1;
  let lineSize = INDENT_SIZE;
  for (let i = 0; i < len; i++) {
    const wordSize = calcTextLength(words[i]) + spaceSize;
    if (lineSize + wordSize - spaceSize > width) {
      linesCount++;
      lineSize = wordSize;
    } else {
      lineSize += wordSize;
    }
  }
  return linesCount;
}

function splitTextByLines(text, width) {
  const spaceSize = SIZES.map[32];
  const words = text.split(' ');
  const lines = [];
  let line = [];
  let lineSize = INDENT_SIZE;
  for (const word of words) {
    const wordSize = calcTextLength(word) + spaceSize;
    if (lineSize + wordSize - spaceSize > width) {
      lines.push(line.join(' '));
      lineSize = wordSize;
      line = [word];
    } else {
      line.push(word);
      lineSize += wordSize;
    }
  }
  lines.push(line.join(' '));
  return lines;
}

function splitTextToPages(paragraphs, { width, height, interval, lineHeight }) {
  const pages = [];
  let pageHeight = 0;
  let page = [];
  for (const item of paragraphs) {
    const pLines = calcAbzLines(item, width);
    const pHeight = pLines * lineHeight + interval;
    if (pageHeight + pHeight - interval > height) {
      const mainLinesCnt = ~~((height - pageHeight) / lineHeight);
      if (mainLinesCnt) {
        const textLines = splitTextByLines(item, width);
        page.push({ text: textLines.splice(0, mainLinesCnt).join(' ') });
        pages.push(page);
        page = [];
        const restLength = textLines.length;
        if (restLength) {
          pageHeight = restLength * lineHeight + interval;
          page.push({ text: textLines.join(' '), continuation: true });
        }
      } else {
        pages.push(page);
        pageHeight = pHeight;
        page = [{ text: item }];
      }
    } else {
      pageHeight += pHeight;
      page.push({ text: item });
    }
  }
  pages.push(page);
  return pages;
}

function renderPage(page, holder) {
  holder.innerHTML = '';
  for (const item of page) {
    const { text, continuation } = item;
    const p = document.createElement('p');
    continuation && p.classList.add('continuation');
    p.innerText = text;
    holder.appendChild(p);
  }
}