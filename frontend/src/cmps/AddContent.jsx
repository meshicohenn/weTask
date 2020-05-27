import React from 'react'
import { Link } from 'react-router-dom'
import { makeId } from '../services/utilService'
import { connect } from 'react-redux'

class AddContent extends React.Component {

    state = {
        isOpen: false,
        title: ''
    };

    addItem = (event) => {
        event.preventDefault();

        if (!event.target) return;
        if (event.target.name.value === '' || event.target.name.value === undefined) return;

        const itemTitle = event.target.name.value;
        const { loggedInUser } = this.props

        switch (this.props.type) {
            case 'stack':
                this.props.currBoard.activities.unshift({ id: makeId(), txt: `added new stack: ${itemTitle}`, createdAt: Date.now(), byMember: loggedInUser })
                this.props.onStackAdd(itemTitle);
                break;
            case 'card':
                this.props.currBoard.activities.unshift({ id: makeId(), txt: `added new card: ${itemTitle}`, createdAt: Date.now(), byMember: loggedInUser })
                const parentId = this.props.itemId;
                this.props.onCardAdd(itemTitle, parentId);
                break;
        }

        this.setState({ isOpen: false, title: '' });
    }

    handleChange = ({ target }) => {

        let title = target.value;

        this.setState({ title });
    }

    toggleOpen = (event) => {
        event.preventDefault();

        this.setState(({ isOpen }) => ({ isOpen: !isOpen }));
    }

    render() {
        const { title, isOpen } = this.state;
        const { type } = this.props;

        return (

            <div className={`add-content-container flex align-start add-${type}`} style={{

                // marginRight: (type === 'stack') ? '16px' : '0',
                padding: (type === 'stack') ? '10px 20px' : '7.5px 15px',
                fontSize: (type === 'stack') ? 16 : 14,
                color: (type === 'stack') ? '#ffffff' : '#888888',
                // background: (type === 'stack') ? 'lightgreen' : 'cornflowerblue',
                minWidth: (type === 'stack') ? 250 : '100%',
                maxWidth: (type === 'stack') ? 250 : '100%',
                borderTopLeftRadius: (type === 'stack') ? 3 : 0,
                borderTopRightRadius: (type === 'stack') ? 3 : 0

            }}>
                {(isOpen)
                    ?
                    <>
                        <form onSubmit={this.addItem} className="add-content flex column align-start">
                            <input name="name" autoComplete="off" onChange={this.handleChange}
                                value={title} placeholder={`Enter ${type} title...`}
                                className={`input ${(type === 'stack') ? 'stack-input' : 'card-input'}`} style={{ padding: '8px 12px' }} autoFocus={true} />
                            <span className="add-content-buttons flex space-between">
                                <button className={`btn btn-${(type === 'stack') ? 'primary' : 'success'} btn-small`}>{`Add ${type}`}</button>
                                <img src={`/assets/img/close${(type === 'stack') ? '-stack' : ''}.png`} onClick={this.toggleOpen} className="close-add-icon" />
                            </span>
                        </form>
                    </>
                    :
                    <>
                        <Link to="#" onClick={this.toggleOpen} className="add-content-title">{`Add ${(type === 'stack') ? 'list' : 'card'}`}</Link>
                    </>
                }
            </div>
        )
    }
};

const mapStateToProps = (state) => {
    return {
        currBoard: state.board.currBoard,
        loggedInUser: state.user.loggedInUser
    }
}

export default connect(mapStateToProps)(AddContent)
