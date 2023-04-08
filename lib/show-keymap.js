'use babel';

const { Disposable, CompositeDisposable } = require('atom');
const fs = require('fs');
const path = require('path');

function addExitButton(x){
  const close = document.createElement('button');
  close.className = 'close';
  close.textContent = '×';
  close.style.cssText = 'font-size: 40px; font-weight: bold; color: #FFFFFF;';
  close.addEventListener('click', () => x.hide());

  const header = document.createElement('div');
  header.className = 'header';
  header.appendChild(close);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.appendChild(header);
  panel.appendChild(x.element);

  return panel;
}

function getKeyStyle(){
  let style = "";
  style += "padding: 2px 8px;";
  style += "background-color: #000000;";
  style += "color: #FFFFFF;";
  style += "border-radius: 4px;";
  style += "font-family: Arial, sans-serif;";
  style += "font-weight: bold;";
  style += "text-transform: uppercase;";
  return style;
}

class MyPanel {
  constructor() {
    const keymapFilePath = path.join(atom.getConfigDirPath(), 'keymap.cson');
    const data = fs.readFileSync(keymapFilePath, 'utf8');
    let lines = data.trim().split('\n');
    lines = lines.filter(line => !line.includes("unset"));
    lines = lines.filter(line => !line.trim().endsWith(":"));
    lines = lines.map(str => str.replace(/'/g, ""));
    lines = lines.map(str => str.replace(/^([^-:]+(-[^-:]+)*)/gi, '<span style="'+getKeyStyle()+'">$&</span>'));

    this.element = document.createElement('div');
    this.element.innerHTML = lines.map(line => `${line}<br>`).join('');
    this.element.style.fontSize = '20px';
    const panel = addExitButton(this);

    this.panel = atom.workspace.addModalPanel({
      item: panel,
      visible: false
    });
  }

  toggle() {
    if (this.panel.isVisible()) this.panel.hide();
    else this.panel.show();
  }

  hide(){
    if (this.panel.isVisible()) this.panel.hide();
  }

  destroy() {
    this.panel.destroy();
  }

  getElement() {
    return this.element;
  }
}

module.exports = {
  subscriptions: null,

  activate() {
    this.panel = new MyPanel();

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'show-keymap:toggle': () => this.panel.toggle(),
        'core:cancel': () => this.panel.hide()
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
    this.panel.destroy();
  }
};
