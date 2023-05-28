import './style.css'

const grid = document.querySelector<HTMLDivElement>('.grid')!

for (let i = 0; i < 200; i++) {
  const block = document.createElement('div')
  block.classList.add('block')
  grid.appendChild(block)
}
for (let i = 0; i < 10; i++) {
  const block = document.createElement('div')
  block.classList.add('taken')
  block.classList.add('block')
  grid.appendChild(block)
}

const miniGrid = document.querySelector<HTMLDivElement>('.mini-grid')!
for (let i = 0; i < 16; i++) {
  const block = document.createElement('div')
  miniGrid.appendChild(block)
}

let squares: HTMLDivElement[] = Array.from(
  document.querySelectorAll('.grid .block')
)
const scoreDisplay = document.querySelector('#score')
const startBtn = document.querySelector('#start-button')
const width = 10
let nextRandom = 0
let timerId: number | undefined = undefined
let score = 0

// the tetrominoes
const lTetromino = [
  [1, width + 1, width * 2 + 1, 2],
  [width, width + 1, width + 2, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2],
  [width, width * 2, width * 2 + 1, width * 2 + 2],
]

const zTetromino = [
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
]

const tTetromino = [
  [1, width, width + 1, width + 2],
  [1, width + 1, width + 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2 + 1],
  [1, width, width + 1, width * 2 + 1],
]

const oTetromino = [
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
]

const iTetromino = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
]

const theTetrominoes = [
  lTetromino,
  zTetromino,
  tTetromino,
  oTetromino,
  iTetromino,
]

let currentPosition = 4
let currentRotation = 0

//randomly select a Tetromino and its first rotation
let random = 0 | (Math.random() * theTetrominoes.length)
let current = theTetrominoes[random][currentRotation]

// draw the first rotation in the first tetromino
function draw() {
  current.forEach((index) => {
    squares[currentPosition + index].classList.add('tetromino')
  })
}

function unDraw() {
  current.forEach((index) => {
    squares[currentPosition + index].classList.remove('tetromino')
  })
}

// assign functions to keyCodes
function control(this: Document, ev: KeyboardEvent) {
  if (ev.keyCode === 37) {
    moveLeft()
  } else if (ev.keyCode === 38) {
    rotate()
  } else if (ev.keyCode === 39) {
    moveRight()
  } else if (ev.keyCode === 40) {
    moveDown()
  }
}

document.addEventListener('keyup', control)

function moveDown() {
  unDraw()
  currentPosition += width
  draw()
  freeze()
}
// clearInterval(timerId)

function freeze() {
  if (
    current.some((index) =>
      squares[currentPosition + index + width].classList.contains('taken')
    )
  ) {
    const randomBackColor = [
      0 | (Math.random() * 255 + 1),
      0 | (Math.random() * 255 + 1),
      0 | (Math.random() * 255 + 1),
    ]
    current.forEach((index) => {
      squares[currentPosition + index].classList.add('taken')
      squares[
        currentPosition + index
      ].style.backgroundColor = `rgba(${randomBackColor.join(',')})`
    })
    // start a new tetromino falling
    random = nextRandom
    nextRandom = 0 | (Math.random() * theTetrominoes.length)
    current = theTetrominoes[random][currentRotation]
    currentPosition = 4
    draw()
    displayShape()
    addScore()
    gameOver()
  }
}

//move the tetromino left, unless is at the edge or there is a blockage
function moveLeft() {
  unDraw()
  const isAtLeftEdge = current.some(
    (index) => !((currentPosition + index) % width)
  )

  if (!isAtLeftEdge) currentPosition -= 1

  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains('taken')
    )
  ) {
    currentPosition += 1
  }

  draw()
}

// move the tetromino right, unless is at the edge or there is a blockage
function moveRight() {
  unDraw()
  const isAtRightEdge = current.some(
    (index) => (currentPosition + index) % width === width - 1
  )

  if (!isAtRightEdge) currentPosition += 1

  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains('taken')
    )
  ) {
    currentPosition -= 1
  }

  draw()
}

function rotate() {
  unDraw()
  currentRotation++
  if (currentRotation === current.length) {
    currentRotation = 0
  }
  current = theTetrominoes[random][currentRotation]
  draw()
}

// show up-next tetromino in min grid display
const displaySquares = document.querySelectorAll('.mini-grid div')
const displayWidth = 4
let displayIndex = 0

const upNextTetrominoes = [
  [1, displayWidth + 1, displayWidth * 2 + 1, 2],
  [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
  [1, displayWidth, displayWidth + 1, displayWidth + 2],
  [0, 1, displayWidth, displayWidth + 1],
  [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
]

// display the shape in the mini-grid display
function displayShape() {
  // remove any trace of a tetromino form the entire grid
  displaySquares.forEach((square) => {
    square.classList.remove('tetromino')
  })

  upNextTetrominoes[nextRandom].forEach((index) =>
    displaySquares[displayIndex + index].classList.add('tetromino')
  )
}

// add functionality to the button
startBtn!.addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = undefined
  } else {
    draw()
    timerId = setInterval(moveDown, 100)
    nextRandom = 0 | (Math.random() * theTetrominoes.length)
    displayShape()
  }
})

// add score
function addScore() {
  for (let i = 0; i < 199; i += width) {
    const row = Array.from({ length: 10 }, (_, index) => i + index)

    if (row.every((index) => squares[index].classList.contains('taken'))) {
      score += 10
      scoreDisplay!.innerHTML = score.toString()
      row.forEach((index) => {
        squares[index].classList.remove('taken')
        squares[index].classList.remove('tetromino')
        squares[index].style.backgroundColor = ''
      })
      const squaresRemoved = squares.splice(i, width)
      squares = squaresRemoved.concat(squares)
      squares.forEach((cell) => grid.appendChild(cell))
    }
  }
}

function gameOver() {
  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains('taken')
    )
  ) {
    scoreDisplay!.innerHTML = 'end'
    clearInterval(timerId)
  }
}
