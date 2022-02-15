const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const Paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')

const MOVIES_PER_PAGE = 12 //畫面顯示 12 筆資料
let pageNumber = 1
const movies = []          // 陣列容器存放 80 個項目
let filteredMovies = []


//卡片模式
function renderMoviesCard(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `  <div class="col-sm-2">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
            data-bs-target="#movie-Modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })

  dataPanel.innerHTML = rawHTML
}

//列表模式
function renderMoviesList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center mb-1">
          <span>${item.title}</span>
          <div>
            <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-Modal"
            data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
      </ul>
    `;
  });

  dataPanel.innerHTML = rawHTML
}

//把資料render進modal函式
function showMovieModal(id) {

  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  //清空頁面，避免殘影
  modalTitle.innerText = ''
  modalImage.innerHTML = ''
  modalDate.innerText = ''
  modalDescription.innerText = ''

  //抓取資料
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release data ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class = "img-fluid">`
  })
}

//我的最愛函式
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//取得預設頁數得12筆電影資料函式
function getMovieByPage(page) {
  // 如果filteredMovies 有東西就給我filteredMovies 否則給我 movies
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//render 分頁函式
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) //計算總頁數
  let rawHTML = ''

  for (page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  Paginator.innerHTML = rawHTML
}

function renderMovie(data) {
  let rawHTML = ''
  if (dataPanel.dataset.display === "card-display") {
    renderMoviesCard(data)
  } else if (dataPanel.dataset.display === "list-display") {
    renderMoviesList(data)
  }
}

//data-display切換顯示方式
function changeDisplayMode(display) {
  if (dataPanel.dataset.display === display) return
  dataPanel.dataset.display = display
}

//監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {

    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')

    modalTitle.innerText = ''
    modalDate.innerText = ''
    modalDescription.innerText = ''
    modalImage.innerHTML = ''

    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽輸入匡函式
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovie(getMovieByPage(pageNumber))
})

//監聽分頁函式
Paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  pageNumber = page
  renderMovie(getMovieByPage(pageNumber))
})

//監聽器卡片及列表圖示
changeMode.addEventListener("click", function onChangeModeClicked(event) {
  if (event.target.matches('#cards')) {
    changeDisplayMode('card-display')
    renderMovie(getMovieByPage(pageNumber))
  } else if (event.target.matches('#list')) {
    console.log(event.target.data)
    changeDisplayMode('list-display')
    renderMovie(getMovieByPage(pageNumber))
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    // 展開運算式 將資料一筆筆放入
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovie(getMovieByPage(1))
  })
  .catch((err) => console.log(err))

