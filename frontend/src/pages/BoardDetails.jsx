import React from 'react';

import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { loadBoard, save } from '../store/actions/boardActions.js';
import { AddContent } from '../cmps/AddContent.jsx';
import { Link, Route } from 'react-router-dom';
import { CardPreview } from '../cmps/CardPreview.jsx';
import { Stack } from '../cmps/Stack.jsx';
import CardDetails from '../pages/CardDetails.jsx';
import { makeId } from '../services/utilService';


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

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    paddingTop: 0,
    // change background colour if dragging
    background: isDragging ? 'lightgreen' : '#ebecf0',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : '#ebecf0',
    padding: 8,

    width: 250,
    transition: 'ease-in-out 0.15s'
});

class BoardDetails extends React.Component {

    state = {
        currBoard: null,
    }

    componentDidMount() {

        const { boardId } = this.props.match.params;
        this.props.loadBoard(boardId);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currBoard !== this.props.currBoard) {
            console.log('BOARD PROPS', this.props.currBoard);
            this.setState({ currBoard: this.props.currBoard }, () => console.log('BOARD STATE', this.state.currBoard));

        }
        // if (this.props.currBoard !== this.state.currBoard) {

        //     const currBoard = this.props.currBoard;
        // }
    }

    onStackAdd = (newStackTitle) => {

        let currBoard = this.state.currBoard;

        currBoard.stacks.push({
            bgColor: "#fefefe",
            cards: [],
            id: makeId(),
            title: newStackTitle,
        });

        this.setState({ currBoard }, () => {
            this.props.save(this.state.currBoard);
        });
    }

    onCardAdd = (newCardTitle, stackId) => {
        console.log(stackId);
        let currBoard = this.state.currBoard;
        let stackIdx = currBoard.stacks.findIndex((stack) => {
            return stackId === stack.id;
        });
        currBoard.stacks[stackIdx].cards.push({
            id: makeId(),
            title: newCardTitle,
            description: "",
            comments: [],
            members: [],
            labels: [],
            byMember: this.props.loggedInUser,
            createdAt: Date.now(),
            dueDate: ''
        });

        console.log(currBoard);

        this.setState({ currBoard }, () => {
            this.props.save(this.state.currBoard);
        });
    }

    onDragEnd = (result) => {

        console.log(result);
        const { source, destination } = result;

        // Dropped outside the list
        if (!destination) {
            return;
        }

        let stacks = this.state.currBoard.stacks;

        // Changed Stacks order
        if ((source.droppableId === destination.droppableId) && source.droppableId === 'board') {
            console.log(stacks);
            const items = reorder(stacks, source.index, destination.index);
            console.log(items);
            const newState = { ...this.state.currBoard };
            newState.stacks = items;
            
            this.setState({ currBoard: newState }, () => {
                this.props.save(newState)
            })
        } else {
            const sIndex = +source.droppableId;
            const dIndex = +destination.droppableId;

            const newState = { ...this.state.currBoard };

            // Changed index in same Stack
            if (sIndex === dIndex) {
                const items = reorder(stacks[sIndex].cards, source.index, destination.index);
                newState.stacks[sIndex].cards = items;

                // Changed Stack
            } else {
                const result = move(stacks[sIndex].cards, stacks[dIndex].cards, source, destination);
                newState.stacks[sIndex].cards = result[sIndex];
                newState.stacks[dIndex].cards = result[dIndex];
            }
            this.setState({ currBoard: newState }, () => {
                this.props.save(this.state.currBoard);
            });
        }
    }

    stacks = () => {
        const board = this.state.currBoard;
        return (
            <span className="stacks-section flex">
                <DragDropContext
                    onDragEnd={this.onDragEnd}
                >
                    <Droppable droppableId="board" isCombineEnabled={false} type="STACK" direction='horizontal'>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                style={{ backgroundColor: snapshot.isDraggingOver ? 'forestgreen' : 'transparent' }}
                                {...provided.droppableProps}
                                className="stacks-content flex "
                            >

                                {(board.stacks.length) ? board.stacks.map((stack, index) => (
                                    <Draggable key={stack.id}
                                        draggableId={stack.id} index={index} type="STACK" >

                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}
                                                className="stack-content flex column"
                                            >

                                                <p className="stack-title flex align-center" {...provided.dragHandleProps} >{stack.title}</p>

                                                <Droppable key={index}
                                                    droppableId={`${index}`} isCombineEnabled={false}
                                                    type="CARD">
                                                    {(provided, snapshot) => (
                                                        <Stack
                                                            innerRef={provided.innerRef}
                                                            style={getListStyle(snapshot.isDraggingOver)}
                                                            provided={provided}
                                                        >

                                                            {stack.cards.map((card, index) => (
                                                                <Draggable
                                                                    key={card.id}
                                                                    draggableId={card.id}
                                                                    index={index}
                                                                    type="CARD"
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <Link to={`/boards/${board._id}/card/${card.id}`}>
                                                                            <CardPreview
                                                                                title={card.title}
                                                                                innerRef={provided.innerRef}
                                                                                provided={provided}

                                                                                style={getItemStyle(
                                                                                    snapshot.isDragging,
                                                                                    provided.draggableProps.style
                                                                                )}
                                                                            >

                                                                            </CardPreview>
                                                                        </Link>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                            <AddContent type="card" onCardAdd={this.onCardAdd} itemId={stack.id} />
                                                        </Stack>
                                                    )}
                                                </Droppable>
                                            </div>
                                        )}
                                    </Draggable>

                                )) : null}

                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <AddContent type="stack" onStackAdd={this.onStackAdd} />
                </DragDropContext>
            </span>
        )
    }

    render() {
        console.log(this.state.currBoard);
        const { currBoard } = this.state;

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
        currBoard: state.board.currBoard,
        loggedInUser: state.user.loggedInUser
    }
}

const mapDispatchToProps = {

    loadBoard,
    save
}

export default connect(mapStateToProps, mapDispatchToProps)(BoardDetails)
