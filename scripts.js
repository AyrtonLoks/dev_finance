const modalOverlayClassList = document.querySelector('.modal-overlay').classList

const Modal = {
    open(){
        modalOverlayClassList.add('active')
    },
    close(){
        modalOverlayClassList.remove('active')
    }
}

// const transactions = [
//     {
//         description: 'Luz',
//         amount: -50054,
//         date: '23/01/2021'
//     },{
//         description: 'Website',
//         amount: 50015,
//         date: '23/01/2021'
//     },{
//         description: 'Internet',
//         amount: -20083,
//         date: '23/01/2021'
//     },{
//         description: 'App',
//         amount: 600073,
//         date: '23/01/2021'
//     }
// ]

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev_finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem(
            "dev.finances:transactions", 
            JSON.stringify(transactions)
        )
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            const amount = Number(transaction.amount)
            if(amount > 0) {
                income += amount
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            const amount = Number(transaction.amount)
            if(amount < 0) {
                expense += amount
            }
        })
        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const table_row = document.createElement('tr')
        table_row.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        table_row.dataset.index = index
        DOM.transactionsContainer.appendChild(table_row)
    },

    removeTransaction(index) {
        Transaction.remove(index)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
        
        const description = transaction.description
        const amount = Utils.formatCurrency(transaction.amount)
        const date = transaction.date
        
        const html = `
        <td class="description">${description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${date}</td>
        <td>
            <img 
                src="./assets/minus.svg" 
                alt="Remover Transação"
                onclick="DOM.removeTransaction(${index})">
        </td>
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('income-display')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expense-display')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('total-display')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(amount) {
        return Number(amount) * 100
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        day = splittedDate[2]
        month = splittedDate[1]
        year = splittedDate[0]
        return `${day}/${month}/${year}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatData() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos!")
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()

            const transaction = Form.formatData()

            Form.saveTransaction(transaction)
            Form.clearFields()

            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()

        App.init()
    }
}

App.init()