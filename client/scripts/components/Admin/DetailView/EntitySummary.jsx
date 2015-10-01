import React from 'react/addons';
import {merge} from '../../../merge';
import {COIConstants} from '../../../../../COIConstants';
import {formatDate} from '../../../formatDate';
import {AdminActions} from '../../../actions/AdminActions';
import EntityRelationshipSummary from '../../EntityRelationshipSummary';

export default class EntitySummary extends React.Component {
  constructor() {
    super();

    this.showComments = this.showComments.bind(this);
  }

  showComments() {
    AdminActions.showCommentingPanel(COIConstants.DISCLOSURE_STEP.ENTITIES, this.props.entity.id, 'Entity: ' + this.props.entity.name);
  }

  getQuestionAnswer(questionId, entity, type) {
    let theAnswer = entity.answers.find(answer => {
      return answer.questionId === questionId;
    });
    if (!theAnswer) {
      return '';
    }
    else {
      switch (type) {
        case COIConstants.QUESTION_TYPE.DATE:
          if (isNaN(theAnswer.answer.value)) {
            return theAnswer.answer.value;
          }
          else {
            return formatDate(theAnswer.answer.value);
          }
          break;
        case COIConstants.QUESTION_TYPE.TEXTAREA:
          return (
            <div>
              {theAnswer.answer.value}
            </div>
          );
        case COIConstants.QUESTION_TYPE.MULTISELECT:
          if (Array.isArray(theAnswer.answer.value)) {
            let answers = theAnswer.answer.value.map((answer, index, array) => {
              let answerToShow = answer;
              if (index !== array.length - 1) {
                answerToShow += ', ';
              }
              return (
                <span key={'ans' + questionId + index}>{answerToShow}</span>
              );
            });

            return (
              <div>
                {answers}
              </div>
            );
          }
          else {
            return theAnswer.answer.value;
          }
          break;
        default:
          return theAnswer.answer.value;
      }
    }
  }

  render() {
    let styles = {
      container: {
      },
      entity: {
        borderBottom: '1px solid #999',
        padding: '20px 0'
      },
      lastEntity: {
        padding: '20px 0'
      },
      name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 11
      },
      fieldLabel: {
        fontWeight: 'bold',
        display: 'inline-block'
      },
      fieldValue: {
        marginLeft: 4,
        display: 'inline-block'
      },
      relations: {
        display: 'inline-block',
        width: '60%',
        verticalAlign: 'top'
      },
      left: {
        display: 'inline-block',
        width: '40%',
        verticalAlign: 'top',
        fontSize: 13,
        paddingRight: 4
      },
      commentLink: {
        fontSize: 14,
        cursor: 'pointer',
        margin: '25px 0 34px 0',
        textAlign: 'right'
      },
      relationshipsLabel: {
        fontSize: 15,
        marginBottom: 8
      },
      relationshipSummary: {
        marginBottom: 10
      }
    };

    let fields = this.props.questions.map(question => {
      return (
        <div key={'qa' + question.id} style={{marginBottom: 8}}>
          <span style={styles.fieldLabel}>{question.text}:</span>
          <span style={styles.fieldValue}>{this.getQuestionAnswer(question.id, this.props.entity, question.type)}</span>
        </div>
      );
    });

    let relationships = this.props.entity.relationships.map(relationship => {
      return (
        <EntityRelationshipSummary
          key={'rel' + relationship.id}
          style={styles.relationshipSummary}
          person={relationship.person}
          relationship={relationship.relationship}
          type={relationship.type}
          amount={relationship.amount}
          comment={relationship.comments}
          readonly={true}
        />
      );
    });

    return (
      <div
        style={merge(this.props.isLast ? styles.lastEntity : styles.entity, this.props.style)}
      >
        <div style={styles.name}>{this.props.entity.name}</div>
        <div>
          <span style={styles.left}>
            {fields}
          </span>
          <span style={styles.relations}>
            <div style={styles.relationshipsLabel}>Relationship(s):</div>
            {relationships}

            <div style={styles.commentLink} onClick={this.showComments}>
              <span style={{borderBottom: '1px dotted black', paddingBottom: 3}}>COMMENTS ({this.props.commentCount})</span>
            </div>
          </span>
        </div>
      </div>
    );
  }
}