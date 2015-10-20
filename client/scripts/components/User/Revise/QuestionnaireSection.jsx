import React from 'react/addons';
import {merge} from '../../../merge';
import QuestionToReview from './QuestionToReview';

export default class QuestionnaireSection extends React.Component {
  render() {
    let styles = {
      container: {
        margin: '25px 20px 25px 35px',
        backgroundColor: 'white',
        borderRadius: 5,
        boxShadow: '0 0 10px 2px #DDD',
        overflow: 'hidden'
      },
      title: {
        fontSize: 23,
        padding: '10px 18px',
        borderBottom: '1px solid #DDD',
        backgroundColor: '#0095A0',
        color: 'white'
      },
      body: {
        padding: 23
      }
    };

    let questions = this.props.questions.map((question, index) => {
      return (
        <QuestionToReview
          key={question.id}
          question={question}
          style={{marginBottom: index === this.props.questions.length - 1 ? 0 : 40}}
        />
      );
    });

    return (
      <div className="flexbox column" style={merge(styles.container, this.props.style)}>
        <div style={styles.title}>
          QUESTIONNAIRE
        </div>
        <div className="fill" style={styles.body}>
          {questions}
        </div>
      </div>
    );
  }
}
