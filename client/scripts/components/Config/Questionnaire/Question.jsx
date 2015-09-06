import React from 'react/addons';
import {merge} from '../../../merge';
import {KButton} from '../../KButton';
import Gripper from '../../DynamicIcons/Gripper';
import {DragSource, DropTarget} from 'react-dnd';
import ConfigActions from '../../../actions/ConfigActions';
import NewQuestion from './NewQuestion';

const questionTarget = {
  hover(props, monitor) {
    let itemBeingDragged = monitor.getItem();
    const draggedId = itemBeingDragged.id;
    let xOffset = monitor.getDifferenceFromInitialOffset().x;

    if (itemBeingDragged.isSubQuestion && xOffset < -50) {
      props.makeMainQuestion(draggedId);
    }
    else if (!itemBeingDragged.isSubQuestion && xOffset > 50) {
      props.makeSubQuestion(draggedId);
    }

    if (draggedId !== props.id) {
      if (itemBeingDragged.isSubQuestion) {
        if (props.isSubQuestion) {
          props.subQuestionMoved(draggedId, props.id);
        }
        else {
          props.subQuestionMovedToParent(draggedId, props.id);
        }
      }
      else {
        props.questionMoved(draggedId, props.id);
      }
    }
  }
};

function collectTarget(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const questionSource = {
  beginDrag(props, monitor, component) { // eslint-disable-line no-unused-vars
    return props;
  },
  isDragging() {
    return false;
  },
  endDrag(props, monitor, component) { // eslint-disable-line no-unused-vars
  }
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

class Question extends React.Component {
  constructor() {
    super();

    this.deleteQuestion = this.deleteQuestion.bind(this);
    this.save = this.save.bind(this);
    this.edit = this.edit.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  deleteQuestion() {
    ConfigActions.deleteQuestion(this.props.id);
  }

  save() {
    ConfigActions.saveQuestionEdit(this.props.id);
  }

  edit() {
    ConfigActions.startEditingQuestion(this.props.id);
  }

  cancel() {
    ConfigActions.cancelQuestionEdit(this.props.id);
  }

  getEditState(id) {
    return this.props.appState.questionsBeingEdited[id];
  }

  isOpen(id) {
    return this.getEditState(id) !== undefined;
  }

  render() {
    let styles = {
      container: {
        borderRadius: 5,
        backgroundColor: 'white',
        boxShadow: '0 0 10px #BBB',
        overflow: 'hidden',
        visibility: this.props.isDragging ? 'hidden' : 'visible',
        marginLeft: this.props.isSubQuestion ? 100 : 0,
        transition: 'all .2s ease-in-out'
      },
      content: {
        display: 'inline-block',
        verticalAlign: 'top',
        height: '100%'
      },
      gripper: {
        backgroundColor: this.props.isSubQuestion ? '#F2AA41' : '#048EAF',
        verticalAlign: 'top',
        display: 'inline-block',
        width: 25
      },
      gripperIcon: {
        marginLeft: 5,
        width: 15,
        height: 42,
        color: '#03728C'
      },
      top: {
        padding: 10
      },
      number: {
        fontSize: 34,
        height: '100%',
        verticalAlign: 'top',
        padding: '0px 17px'
      },
      text: {
        overflow: 'hidden',
        height: '3em',
        lineHeight: '1.5em',
        marginTop: 5,
        fontSize: 12,
        verticalAlign: 'top'
      },
      bottom: {
        borderTop: '1px solid #AAA',
        padding: '10px 20px 10px 10px',
        whiteSpace: 'nowrap',
        height: 54
      },
      button: {
        float: 'right',
        marginLeft: 10
      },
      nonFloatButton: {
        marginLeft: 10
      },
      dropdown: {
        marginLeft: 5
      },
      extraSpace: {
        position: 'absolute',
        width: '100%',
        top: this.props.top,
        transition: 'all .2s ease-in-out'
      },
      warning: {
        color: 'red',
        fontSize: 14,
        whiteSpace: 'normal',
        paddingLeft: 10
      }
    };

    let buttons;
    let questionDetails;

    let displayCondition;
    if (this.props.isSubQuestion) {
      displayCondition = (
        <span>
          Display if parent is
          <select style={styles.dropdown}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </span>
      );
    }

    let editState = this.getEditState(this.props.id);
    if (editState) {
      questionDetails = (
        <div className="flexbox row" style={styles.top}>
          <NewQuestion id={this.props.id} question={editState} />
        </div>
      );

      let subQuestionWarning;
      if (editState.showWarning) {
        subQuestionWarning = (
          <div style={styles.warning}>Only Yes/No can have subquestions. All subquestions will be deleted.</div>
        );
      }

      buttons = (
        <div className="flexbox row">
          <div className="fill">
            {subQuestionWarning}
          </div>
          <span>
            <KButton style={styles.nonFloatButton} onClick={this.cancel}>Cancel</KButton>
            <KButton style={styles.nonFloatButton} onClick={this.save}>Save</KButton>
          </span>
        </div>
      );
    }
    else {
      questionDetails = (
        <div className="flexbox row" style={styles.top}>
          <span style={styles.number}>{this.props.number}</span>
          <span className="fill" style={styles.text}>{this.props.text}</span>
        </div>
      );

      buttons = (
        <div>
          {displayCondition}
          <KButton style={styles.button} onClick={this.edit}>Edit</KButton>
          <KButton style={styles.button} onClick={this.deleteQuestion}>Delete</KButton>
        </div>
      );
    }

    return this.props.connectDragSource(
      this.props.connectDropTarget(
        <div style={styles.extraSpace}>
          <div className="flexbox row" style={merge(styles.container, this.props.style)}>
            <span style={styles.gripper}>
              <Gripper style={styles.gripperIcon} />
            </span>
            <span className="fill" style={styles.content}>
              {questionDetails}

              <div style={styles.bottom}>
                {buttons}
              </div>
            </span>
          </div>
        </div>
      )
    );
  }
}

let questionComponent = DragSource('question', questionSource, collectSource)(Question); //eslint-disable-line new-cap
questionComponent = DropTarget('question', questionTarget, collectTarget)(questionComponent); //eslint-disable-line new-cap
export default questionComponent;
