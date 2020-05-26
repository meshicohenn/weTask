import React from 'react'
import { makeId } from '../services/utilService'

export default class CardChecklist extends React.Component {
    state = {
        newTodo: {
            title: '',
            isDone: false
        }
    }

    onEditChecklistTitle = (ev) => {
        let { value } = ev.target;
        this.props.onEditChecklistTitle(this.props.checklist.id, value)
    }

    handleChange = (ev) => {
        let { name, value } = ev.target;
        this.setState(prevState => ({ newTodo: { ...prevState.newTodo, [name]: value } }))
    }

    onAddTodo = (ev) => {
        ev.preventDefault();
        this.props.addTodo(this.props.checklist.id, this.state.newTodo)
        this.setState({ newTodo: { title: '', isDone: false } })
    }

    onUpdateTodo = (ev, todo, click = false) => {
        let { name, value } = ev.target;
        if (click) todo.isDone = !todo.isDone;

        const newTodo = { ...todo, [name]: value }
        this.props.addTodo(this.props.checklist.id, newTodo)
    }

    calculateProgBarWidth = () => {
        let countIsDone = 0;
        this.props.checklist.todos.forEach(todo => {
            if (todo.isDone) countIsDone++;
        })
        if (!this.props.checklist.todos.length) return 0;
        return ((countIsDone / this.props.checklist.todos.length) * 100).toFixed(0);
    }

    calculateProgBarBgc = () => {
        const width = this.calculateProgBarWidth();
        if (width === 100) return '#61bd4f'
        return '#0079bf'
    }

    render() {
        const { title, todos } = this.props.checklist
        const width = this.calculateProgBarWidth();
        const bgc = this.calculateProgBarBgc();
        return (
            <div className="card-checklist-container">
                <div className="card-checklist-title flex align-center">
                    <img src="/assets/img/todos.png" />
                    <input type="text" name="title" className="checklist-title" autoComplete="off" onChange={this.onEditChecklistTitle} value={title} />
                </div>
                <div className="checklist-main">
                    <div className="checklist-progress-bar-container"><span>{`${width}%`}</span>
                        <div className="checklist-progress-bar">
                            <div className="progress-bar" style={{ width: `${width}%`,backgroundColor:`${bgc}` }}>
                            </div>
                        </div>
                    </div>
                    <div className="checklist-todos-container">
                        {todos.map((todo) => <div className="flex align-center todo-item" key={todo.id}>
                            <div className={todo.isDone ? "checkbox done" : "checkbox"} onClick={(event) => this.onUpdateTodo(event, todo, true)}>
                            </div>
                            <input name="title" className={`checklist-title todo-title ${todo.isDone ? 'done-decoration' : 'd'}`}
                                value={todo.title} onChange={(event) => this.onUpdateTodo(event, todo)} />
                        </div>
                        )}
                        <form onSubmit={this.onAddTodo}>
                            <input type="text" name="title" className="checklist-title todo-title add-todo" onChange={this.handleChange} placeholder="Add New Todo" autoComplete="off" value={this.state.newTodo.title} />
                        </form>
                    </div>
                </div>
            </div >
        )
    }
}