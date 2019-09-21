let hangmanNS = {
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  startWordList: ['HANGMAN', 'GOOGLE', 'MICROSOFT', 'MAGNUS', 'AWKWARD', 'BANJO', 'KIOSK', 'RHYTHMIC', 'ZOMBIE', 'JUKEBOX', 'OXYGEN', 'UNKNOWN', 'WIZARD', 'PUZZLING', 'WITCHCRAFT'],
  correctCharacters: 0,
  lastInput: [],
  failNumber: 0
}
function addLetterBoxes() {
  const box = document.getElementById('letterBoxesContainer')

  while (box.firstChild) {
    box.removeChild(box.firstChild)
  }

  hangmanNS.letters.forEach(function LetterBoxes(letter) {
    const letterBox = document.createElement('input')
    const character = document.createTextNode(letter)

    letterBox.setAttribute('type', 'button')
    letterBox.setAttribute('id', 'letterBox' + letter)
    letterBox.setAttribute('class', 'letterBox')
    letterBox.setAttribute('value', letter)
    letterBox.onclick = e => {
      const pressedLetter = e.target.value
      deactivateLetterBox(pressedLetter)
      checkCharacterWord(pressedLetter)
    }
    letterBox.appendChild(character)
    box.appendChild(letterBox)
  })
}
function fetchWordlist() {
  const context =
    hangmanNS.startWordList[Math.floor(Math.random() * hangmanNS.startWordList.length)]
  fetch('https://api.datamuse.com/words?ml=' + context + '&max=30')
    .then(resp => resp.json())
    .then(data => {
      const wordListUnchecked = data.map(wordObject =>
        wordObject.word.toLocaleUpperCase()
      )
      let wordList = wordListUnchecked.filter(
        word => !/\s/.test(word) && word.length > 4 && word.length < 10
      )
      if (Array.isArray(wordList) && wordList.length === 0) {
        fetchWordlist()
        return
      }
      hangmanNS.startWordList = wordList
      rndWord(wordList)
    })
}
function rndWord(wordList) {
  const word = wordList[Math.floor(Math.random() * wordList.length)]
  if (checkDuplicateWord(word) === false) {
    null
  } else return rndWord()
  sessionStorage.setItem('lastword', word);
  createCharacterList(word)
  return word
}
function checkDuplicateWord(word) {
  if (sessionStorage.getItem('lastword') === word) {
    return true
  } else {
    return false
  }
}
function createCharacterList(word) {
  const guessContainerParent = document.getElementById('guessContainer')
  const characters = Array.from(word)

  while (guessContainerParent.firstChild) {
    guessContainerParent.removeChild(guessContainerParent.firstChild)
  }
  characters.forEach((character, index) => {
    const box = document.getElementById('guessContainer')
    const characterBox = document.createElement('div')
    let content = document.createTextNode('')
    characterBox.setAttribute('class', 'character')
    characterBox.setAttribute('id', 'letter' + index)
    characterBox.setAttribute('value', index)
    characterBox.appendChild(content)
    box.appendChild(characterBox)
  })

}
function checkCharacterWord(pressedLetter) {
  if (sessionStorage.getItem('lastword').includes(pressedLetter) === true) {
    showLetter(pressedLetter)
    if (hangmanNS.correctCharacters === sessionStorage.getItem('lastword').length) {
      alertBox('win')
    }
  } else {
    failCounter()
  }
}
function showLetter(letter) {
  const guessContainerParent = document.getElementById('guessContainer')
  const lastWord = sessionStorage.getItem('lastword').split('')
  let index = lastWord.indexOf(letter)
  let indices = []
  let letterDivNodeList = []
  while (index != -1) {
    indices.push(index);
    index = lastWord.indexOf(letter, index + 1);
  }
  indices.forEach(index => {
    letterDivNodeList.push(guessContainerParent.querySelector(
      'div[id=letter' + index + ']'))
  })
  letterDivNodeList.forEach(letterDivNode => {
    letterDivNode.innerHTML = letter
    hangmanNS.correctCharacters++
  })
}
const lines = ['line1', 'line2', 'line3', 'line4', 'line5', 'head', 'line6', 'line7', 'line8', 'line9', 'line10']
function hideHangman() {
  lines.forEach(function check(line) {
    const lineAtr = document.getElementById(line)
    lineAtr.style.display = 'none'
  })
}
function deactivateLetterBox(pressedLetter) {
  const letterBoxesContainer = document.getElementById('letterBoxesContainer')
  const letterBoxNode = letterBoxesContainer.querySelector(
    'input[value=' + pressedLetter + ']'
  )
  const att = document.createAttribute('disabled')
  letterBoxNode.setAttributeNode(att)
}
function failCounter() {
  const possibleFails =
    document.getElementById('hangmanSVG').childElementCount - 1
  drawHangman()
  if (hangmanNS.failNumber === possibleFails) {
    alertBox('lose')
    return
  }
  hangmanNS.failNumber++
}
function drawHangman() {
  const lineAtr = document.getElementById(lines[hangmanNS.failNumber])
  lineAtr.style.display = 'block'
}
function alertBox(condition) {
  const alertBox = document.getElementById('alertBox')
  const alertHeader = document.getElementById('alertHeaderID')
  const alertBoxWrapper = document.getElementById('alertBoxWrapperID')
  const alertMessage = document.getElementById('alertMessageID')
  const restartGame = document.getElementById('restartGame')

  if (condition === 'lose') {
    alertHeader.classList.remove('alertHeaderWin')
    alertHeader.classList.add('alertHeaderLose')
    restartGame.classList.remove('win')
    restartGame.classList.add('lose')

    alertHeader.innerHTML = 'You lost the Game!'
    alertMessage.innerHTML =
      'Too bad for you... <br /> The correct word was: <br /><br />  ' +
      sessionStorage.getItem('lastword')
  } else {
    alertHeader.classList.remove('alertHeaderLose')
    alertHeader.classList.add('alertHeaderWin')
    restartGame.classList.remove('lose')
    restartGame.classList.add('win')

    alertHeader.innerHTML = 'You won the Game!'
    alertMessage.innerHTML =
      'You are awesome!<br/>To play again, press the Button.'
  }
  document.removeEventListener('keydown', keyboardInput)
  alertBox.style.display = 'block'
  setTimeout(timeout => { alertBoxWrapper.classList.toggle('show') }, 10)
}
function hideAlertBox() {
  const alertBox = document.getElementById('alertBox')
  const alertBoxWrapper = document.getElementById('alertBoxWrapperID')
  alertBoxWrapper.classList.toggle('show')
  alertBox.style.display = 'none'
  document.addEventListener('keydown', keyboardInput)
}
function keyboardInput(input) {
  const keyName = input.key.toLocaleUpperCase()
  konamiCode(keyName)
  if (hangmanNS.letters.includes(keyName)) {
    const letterBox = document.getElementById('letterBox' + keyName)
    if (!letterBox.hasAttribute('disabled')) {
      deactivateLetterBox(keyName)
      checkCharacterWord(keyName)
    }
  }
}
function konamiCode(input) {
  const correctCode = ["ARROWUP", "ARROWUP", "ARROWDOWN", "ARROWDOWN", "ARROWLEFT", "ARROWRIGHT", "ARROWLEFT", "ARROWRIGHT", "B", "A"]
  hangmanNS.lastInput.push(input)
  hangmanNS.lastInput = hangmanNS.lastInput.slice(-10)
  if (JSON.stringify(correctCode) == JSON.stringify(hangmanNS.lastInput)) {
    window.location = 'https://www.youtube.com/embed/DLzxrzFCyOs?autoplay=1'
  }
}
function restartGame() {
  fetchWordlist()
  addLetterBoxes()
  hideHangman()
  hangmanNS.failNumber = 0
  hangmanNS.correctCharacters = 0
  hideAlertBox()
}
window.onload = init => {
  fetchWordlist()
  addLetterBoxes()
  document.addEventListener('keydown', keyboardInput)
}
