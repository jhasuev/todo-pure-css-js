import FormHTMLTemplate from "./../templates/_form"
import ListHTMLTemplate from "./../templates/_list"
import ListItemHTMLTemplate from "./../templates/_list-item"

export default class Todo {
  constructor(selector) {
    this.selector = selector
    this.init()
  }

  get storageKey() {
    return 'TODO-LIST-FOR_' + this.selector
  }

  init() {
    this.app = document.querySelector(this.selector)
    if (this.app) {
      this.initLayout()
      this.initForm()
      this.initList()
      this.initStorage()
      this.loadList()
      this.addListEvents()

      this.field.focus()
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

    this.hideListCard()
  }

  onAdd(event) {
    event.preventDefault()

    const text = this.field.value.trim()
    if (text) {
      this.add(text)
      this.clearFormFields()
      this.field.focus()
    }
  }

  initStorage() {
    this.storage = JSON.parse(localStorage[this.storageKey] || '[]')
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
    this.showListCard()
    
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
    this.storage.forEach(item => this.addListItem(item, 'after'))
  }

  showListCard() {
    this.listCard.style.display = ""
  }

  hideListCard() {
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
      
      if (event.type === "change" && this.isCheckbox(target)) {
        this.onChangeCheckbox(target)
      } else if (event.type === "click" && this.isRemoveButton(target)) {
        this.onRemoveClick(target)
      }
    }
    
    this.app.addEventListener("change", onEvent)
    this.app.addEventListener("click", onEvent)
  }

  isCheckbox(target) {
    return target.classList.contains("js-checkbox")
  }

  isRemoveButton(target) {
    return target.classList.contains("js-remove-btn")
  }

  onChangeCheckbox(checkbox) {
    this.done(this.getParentItemID(checkbox), checkbox.checked)
  }

  onRemoveClick(button) {
    this.remove(this.getParentItemID(button))
  }

  getParentItemID(element) {
    const todoItem = element.closest(".js-todo-item")
    return +todoItem.getAttribute("data-todo-item-id")
  }

  done(id, status) {
    const todoItem = this.getTodoItem(id)
    const dataItem = this.getStorageItem(id)
    dataItem.done = status
    todoItem.classList[status ? "add" : "remove"]("checked")

    this.save()
  }

  remove(id) {
    const todoItem = this.getTodoItem(id)
    const dataItemIndex = this.storage.indexOf(this.getStorageItem(id))
    
    todoItem.remove()
    this.storage.splice(dataItemIndex, 1)

    if (!this.storage.length) {
      this.hideListCard()
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
    localStorage[this.storageKey] = JSON.stringify(this.storage)
  }
}