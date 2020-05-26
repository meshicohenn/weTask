import React from 'react'

import { save, loadBoard } from '../store/actions/boardActions'
import { connect } from 'react-redux'
import { StatisticsPie } from '../cmps/StatisticsPie';
import { StatisticsBar } from '../cmps/StatisticsBar';
import moment from 'moment'

class BoardStatistics extends React.Component {

    constructor() {
        super();
        this.elStats = React.createRef();
        this.statsTimeOut = null;
    }

    state = {
        board: {},
    }

    componentDidMount() {

        if (this.props.currBoard) {
            this.statsTimeOut = setTimeout(() => {
                
                this.setState({ board: this.props.currBoard });
            }, 250)
        }

    }

    componentDidUpdate(prevProps) {
        if (this.props.currBoard !== prevProps.currBoard) {
            this.setState({ board: this.props.currBoard });
        }
    }

    componentWillUnmount() {
        if(this.statsTimeOut) clearTimeout(this.statsTimeOut);
    }


    handleChange = ({ target }) => {
        const field = target.name
        const value = target.value

        this.setState(prevState => ({ card: { ...prevState.card, [field]: value } }))
    }

    onBackBoard = (ev) => {
        const { boardId } = this.props.match.params
        this.props.history.push(`/boards/${boardId}`)
    }

    getStatsByLabels = (board) => {

        let labels = {};

        board.stacks.forEach((stack) => {
            stack.cards.forEach((card) => {
                card.labels.forEach((label) => {
                    if (labels[label.title]) {
                        labels[label.title].count += 1;
                    } else {
                        labels[label.title] = { count: 1, color: label.color };
                    }
                })

            })
        })
        console.log(labels);
        let labelStatsData = Object.keys(labels).map((labelTitle) => {
            const labelInfo = labels[labelTitle];
            console.log(labelInfo);
            return ({
                id: labelTitle,
                label: labelTitle,
                value: labelInfo.count,
                color: labelInfo.color
            });
        })

        return labelStatsData;
    }

    getStatsByUsers = (board) => {

        let users = {};

        board.stacks.forEach((stack) => {
            stack.cards.forEach((card) => {
                if(card.byMember) {
                    console.log(card.byMember);
                    if (users[card.byMember.fullname]) {
                        users[card.byMember.fullname].tasks += 1;
                        // users[card.byMember.fullname].doneTasks += 1;
                    } else {
                        users[card.byMember.fullname] = { tasks: 1 };
                        // users[card.byMember.fullname] = { tasks: 1, doneTasks: label.color };
                    }
                }
            })
        })
        console.log(users);
        let userStatsData = Object.keys(users).map((fullname) => {
            const userInfo = users[fullname];
            userInfo.doneTasks = (Math.floor(Math.random() * userInfo.tasks))
            console.log(userInfo);
            return ({
                member: fullname,
                Tasks: userInfo.tasks - userInfo.doneTasks,
                'Done Tasks': userInfo.doneTasks,
              });
        })
        console.log(userStatsData);
        return userStatsData;
    }

    getStatsByDueDates = (board) => {

        let workload = { 'On Schedule': 0, Delayed: 0 };
        let cardCount = 0;
        board.stacks.forEach((stack) => {
            cardCount += stack.cards.length;

            stack.cards.forEach((card) => {
                if(card.dueDate != '') {
                    if(+moment(card.dueDate).format('x') > Date.now()) workload['On Schedule'] += 1;
                    else workload.Delayed += 1;
                }

            })
        })
        
        if(!cardCount) return null;

        let dueDatesStatsData = Object.keys(workload).map((type) => {

            // console.log(dueDatesInfo);
            return ({
                id: type,
                label: type,
                value: workload[type],
                color: (type === 'Delayed') ? 'tomato' : 'lightgreen'
            });
        })

        return dueDatesStatsData;
    }

    getBoardStats = (board) => {

        if (!board.stacks) return null;

        let stats;

        let byLabels = this.getStatsByLabels(board);
        let byUsers = this.getStatsByUsers(board);
        let byDueDate = this.getStatsByDueDates(board);

        stats = { byLabels, byUsers, byDueDate };

        return stats;
    }


    render() {

        const { board } = this.state;
        const { } = this;

        console.log(board);
        let boardStats = null;
        if (board) {
            boardStats = this.getBoardStats(board);
            console.log(boardStats);
        }

        return ((!board) ? 'Loading...' :

            <>
                <div className="screen stats" onMouseDown={this.onBackBoard} >

                    <section className="board-statistics modal-container flex column" onMouseDown={(ev) => ev.stopPropagation()}
                        ref={this.elStats}>
                        <header className="board-statistics-header-span flex align-center justify-center">
                            <p className="board-statistics-header">' {board.title} '</p>
                            {/* <p className="secondary">stats</p> */}
                        </header>
                        {(boardStats) ?
                            <section className="board-statistics-content">

                                {(boardStats.byLabels) ?
                                    < div className="stat-item flex column justify-center align-center">
                                        <p className="board-stats-title">Most Popular Labels</p>
                                        <StatisticsPie data={boardStats.byLabels} type="labels" />

                                    </div>
                                    : null
                                }
                                {(boardStats.byUsers) ?
                                    < div className="stat-item flex column justify-center align-center">
                                        <p className="board-stats-title">Weekly Members Workload</p>
                                        <StatisticsBar data={boardStats.byUsers} />

                                    </div>
                                    : null
                                }
                                {(boardStats.byDueDate) ?
                                    < div className="stat-item flex column justify-center align-center">
                                        <p className="board-stats-title">On-Time/Delayed Work</p>
                                        <StatisticsPie data={boardStats.byDueDate} type="dueDate" />

                                    </div>
                                    : null
                                }
                                

                            </section>
                            : null
                        }
                    </section>
                </div>
            </>
        )
    }
}


const mapDispatchToProps = {
    save,
    loadBoard
}
const mapStateToProps = (state) => {
    return {
        currBoard: state.board.currBoard,
        loggedInUser: state.user.loggedInUser
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BoardStatistics);