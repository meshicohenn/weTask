import React from 'react';

import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { loadBoard, save } from '../store/actions/boardActions.js';
import { AddContent } from '../cmps/AddContent.jsx';
import { Link, Route } from 'react-router-dom';
import CardDetails from '../pages/CardDetails';

import { makeId } from '../services/utilService';


const getItems = (count, offset = 0) =>
    Array.from({ length: count }, (v, k) => k).map(k => ({
        id: `item-${k + offset}-${new Date().getTime()}`,
        content: `item ${k + offset}`
    }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    console.log(list);
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    console.log(removed);
    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    console.log(result);
    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    padding: grid,
    width: 250,
    transition: 'ease-in-out 0.15s'
});

class BoardDetails extends React.Component {

    state = {
        currBoard: null,
        data: [
            { name: 'NEVOhadnazer', stack: getItems(5) },
            { name: 'MESHigena', stack: getItems(5, 10) },
        ]
    }

    componentDidMount() {

        const { boardId } = this.props.match.params;
        this.props.loadBoard(boardId);
        console.log(this.props.currBoard);

    }

    componentDidUpdate() {
        if(this.props.currBoard !== this.state.currBoard) {
            const currBoard = this.props.currBoard;
            this.setState({ currBoard });
        }
    }

    onStackAdd = (newStackTitle) => {
        console.log(newStackTitle);
        // this.setState(({ currBoard }) => ({ data: [...data, { name: newStackTitle, stack: [] }] }));
        let currBoard = this.state.currBoard;
        console.log(currBoard);
        currBoard.stacks.push({
            bgColor: "#fefefe",
            cards: [],
            id: makeId(),
            title: newStackTitle,
        });
        console.log(currBoard);
        this.setState({ currBoard }, () => {
            this.props.save(this.state.currBoard);
        });
    }

    onDragEnd = (result) => {
        console.log(result);
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }
        const sIndex = +source.droppableId;
        const dIndex = +destination.droppableId;
        let stacks = this.state.currBoard.stacks;

        if (sIndex === dIndex) {
            const items = reorder(stacks[sIndex].cards, source.index, destination.index);
            const newState = { ...this.state.currBoard };
            newState.stacks[sIndex].cards = items;
            this.setState({ currBoard: newState }, () => {
                this.props.save(this.state.currBoard);
            });

        } else {
            const result = move(stacks[sIndex].cards, stacks[dIndex].cards, source, destination);
            const newState = { ...this.state.currBoard };
            newState.stacks[sIndex].cards = result[sIndex];
            newState.stacks[dIndex].cards = result[dIndex];
            this.setState({ currBoard: newState }, () => {
                this.props.save(this.state.currBoard);
            });
        }
    }

    stacks = () => {
        const board = this.props.currBoard;

        return (
            <span className="stacks-section flex">
                <DragDropContext
                    onDragEnd={this.onDragEnd}
                >
                    {(board.stacks.length) ? board.stacks.map((stack, ind) => (

                        <Droppable key={ind} droppableId={`${ind}`}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                    {...provided.droppableProps}
                                >
                                    <p className="stack-title">{stack.title}</p>
                                    {stack.cards.map((card, index) => (
                                        <Draggable
                                            key={card.id}
                                            draggableId={card.id}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Link to={`/boards/${board._id}/card/${card.id}`}>
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={getItemStyle(
                                                            snapshot.isDragging,
                                                            provided.draggableProps.style
                                                        )}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "space-around"
                                                            }}
                                                        >
                                                            {card.title}
                                                        </div>
                                                    </div>
                                                </Link>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                    )) : null}

                    <AddContent type="stack" onStackAdd={this.onStackAdd} />
                </DragDropContext>
            </span>
        )
    }

    render() {
        console.log(this.props.currBoard);
        const { currBoard } = this.props;

        return (
            <>
                <Route component={CardDetails} path="/boards/:boardId/card/:cardId" />
                <section className="board-content container flex column align-start space-between">

                    {(currBoard) ? this.stacks() : null}

                </section>
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        currBoard: state.board.currBoard
    }
}

const mapDispatchToProps = {

    loadBoard,
    save
}

export default connect(mapStateToProps, mapDispatchToProps)(BoardDetails)
