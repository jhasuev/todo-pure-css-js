import FormHTMLTemplate from "./../templates/_form"
import ListHTMLTemplate from "./../templates/_list"
import ListItemHTMLTemplate from "./../templates/_list-item"

const STORAGE_KEY = `TODO-LIST`

export default class Todo {
  constructor(app) {
    this.app = app
    this.init()
  }

  init() {
    this.app = document.querySelector(this.app)
    if (this.app) {
      this.initLayout()
      this.initForm()
      this.initList()
      this.initStorage()
      this.loadList()
      this.addListEvents()
    }
  }

  initLayout() {
    this.app.innerHTML = FormHTMLTemplate + ListHTMLTemplate
  }

  initForm() {
    this.form = this.app.querySelector(".js-form")
    this.field = this.app.querySelector(".js-field")
    this.addBtn = this.app.querySelector(".js-add-btn")

    this.form.addEventListener("submit", (event) => this.onAdd(event))
  }
  
  initList() {
    this.listCard = this.app.querySelector(".js-list-card")
    this.list = this.app.querySelector(".js-list")

    this.listCard.style.display = "none"
  }

  onAdd(event) {
    event.preventDefault()

    const text = this.field.value.trim()
    if (text) {
      this.add(text)
      this.clearFormFields()
    }
  }

  initStorage() {
    this.storage = JSON.parse(localStorage[STORAGE_KEY] || '[]')
  }

  add(text) {
    const id = this.getNextID()
    const data = { id, text, done: false }
    this.storage.unshift(data)

    this.addListItem(data)
    this.save()
  }

  addListItem(data, position = "before") {
    const newListItem = this.fillItem(data, this.getNewListItem())
    this.showListBox()
    
    if (position === 'before') {
      this.list.prepend(newListItem)
    } else {
      this.list.appendChild(newListItem)
    }
  }

  getNextID() {
    return (this.storage.sort((a, b) => b.id - a.id)[0]?.id || 0) + 1
  }

  clearFormFields() {
    this.field.value = ''
  }

  loadList() {
    if (this.storage.length) {
      this.storage.forEach(item => {
        this.addListItem(item, 'after')
      })
    }
  }

  showListBox() {
    this.listCard.style.display = ""
  }

  hideListBox() {
    this.listCard.style.display = "none"
  }

  getNewListItem() {
    const divElement = document.createElement("DIV")
    divElement.innerHTML = ListItemHTMLTemplate

    return {
      todoItem: divElement.firstElementChild,
      checkbox: divElement.querySelector(".js-checkbox"),
      text: divElement.querySelector(".js-text"),
    }
  }

  fillItem(data, { checkbox, todoItem, text }) {
    if (data.done) {
      checkbox.checked = data.done
      todoItem.classList.add("checked")
    }
    todoItem.setAttribute("data-todo-item-id", data.id)
    text.innerText = data.text

    return todoItem
  }

  addListEvents() {
    const onEvent = event => {
      const { target } = event
      
      if (target.classList.contains("js-checkbox") && event.type === "change") {
        this.onChangeCheckbox(target)
        
      } else if (target.classList.contains("js-remove-btn") && event.type === "click") {
        this.onRemoveClick(target)
      }
    }
    
    this.app.addEventListener("change", onEvent)
    this.app.addEventListener("click", onEvent)
  }

  onChangeCheckbox(checkbox) {
    const todoItem = checkbox.closest(".js-todo-item")
    const id = todoItem.getAttribute("data-todo-item-id")
    this.done(+id, checkbox.checked)
  }

  done(id, status) {
    const todoItem = this.getTodoItem(id)
    const todoItemStorage = this.getStorageItem(id)
    todoItemStorage.done = status
    todoItem.classList[status ? "add" : "remove"]("checked")

    this.save()
  }
  
  onRemoveClick(button) {
    const todoItem = button.closest(".js-todo-item")
    const id = todoItem.getAttribute("data-todo-item-id")
    this.remove(+id)
  }

  remove(id) {
    const todoItem = this.getTodoItem(id)
    const todoItemStorageIndex = this.storage.indexOf(this.getStorageItem(id))
    
    todoItem.remove()
    this.storage.splice(todoItemStorageIndex, 1)

    if (!this.storage.length) {
      this.hideListBox()
    }

    this.save()
  }

  getStorageItem(id) {
    return this.storage.find(item => item.id === id)
  }

  getTodoItem(id) {
    return this.app.querySelector(`.js-todo-item[data-todo-item-id="${id}"]`)
  }

  save() {
    localStorage[STORAGE_KEY] = JSON.stringify(this.storage)
  }
}